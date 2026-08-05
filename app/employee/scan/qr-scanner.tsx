"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  awardPointsByScan,
  resolveScannedCard,
  type ScannedCard,
} from "../actions";

/**
 * Chrome/Android ships a native barcode reader; Safari does not. We feature-
 * detect it and fall back to jsQR, which decodes canvas pixels in JS — slower,
 * but it is the only path that works on iPhone.
 */
type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
};
declare global {
  var BarcodeDetector:
    | (new (options?: { formats?: string[] }) => BarcodeDetectorLike)
    | undefined;
}

type Phase = "idle" | "starting" | "scanning" | "found" | "done";

export function QrScanner({
  defaultPoints,
  canAddPoints,
}: {
  defaultPoints: number;
  canAddPoints: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  // Guards the detect loop: without it, a code sitting in frame fires the
  // server action on every animation frame.
  const busyRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<ScannedCard | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [points, setPoints] = useState(defaultPoints);
  const [result, setResult] = useState<{ awarded: number; newTotal: number } | null>(null);
  const [pending, setPending] = useState(false);
  const [manual, setManual] = useState("");

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Releasing the camera on unmount matters more than usual here: the phone
  // keeps the lens (and its indicator light) active otherwise.
  useEffect(() => stopCamera, [stopCamera]);

  const lookup = useCallback(
    async (raw: string) => {
      if (busyRef.current) return;
      busyRef.current = true;

      stopCamera();
      const res = await resolveScannedCard(raw);

      if (res.error || !res.card) {
        setError(res.error ?? "بطاقة غير معروفة.");
        setPhase("idle");
        busyRef.current = false;
        return;
      }

      setCard(res.card);
      setToken(raw);
      setPhase("found");
      busyRef.current = false;
    },
    [stopCamera]
  );

  const start = useCallback(async () => {
    setError(null);
    setResult(null);
    setCard(null);
    setPhase("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("المتصفح لا يدعم الكاميرا. استخدم البحث بالرقم بالأسفل.");
      setPhase("idle");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError"
          ? "لم يُسمح باستخدام الكاميرا. فعّل الإذن من إعدادات المتصفح، أو ابحث بالرقم بالأسفل."
          : name === "NotFoundError"
            ? "لا توجد كاميرا في هذا الجهاز. استخدم البحث بالرقم بالأسفل."
            : "تعذّر تشغيل الكاميرا. تأكد أن الموقع يعمل عبر HTTPS."
      );
      setPhase("idle");
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    // iOS refuses to play an inline video without both of these.
    video.setAttribute("playsinline", "true");
    video.muted = true;
    await video.play().catch(() => undefined);
    setPhase("scanning");

    const native =
      typeof globalThis.BarcodeDetector === "function"
        ? new globalThis.BarcodeDetector({ formats: ["qr_code"] })
        : null;

    // Only pulled in when the native detector is missing — jsQR is ~40KB and
    // most Android scans never need it.
    const jsQR = native ? null : (await import("jsqr")).default;

    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      try {
        if (native) {
          const codes = await native.detect(videoRef.current);
          if (codes.length > 0) {
            void lookup(codes[0].rawValue);
            return;
          }
        } else if (jsQR) {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d", { willReadFrequently: true });
          if (canvas && ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(image.data, image.width, image.height);
            if (code?.data) {
              void lookup(code.data);
              return;
            }
          }
        }
      } catch {
        // A single failed frame is normal (autofocus, motion blur) — keep going.
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [lookup]);

  const confirm = useCallback(async () => {
    if (!token) return;
    setPending(true);
    setError(null);

    const res = await awardPointsByScan(token, points);
    setPending(false);

    if (res.error || res.awarded === null || res.newTotal === null) {
      setError(res.error ?? "تعذّر تسجيل النقاط.");
      return;
    }

    setResult({ awarded: res.awarded, newTotal: res.newTotal });
    setPhase("done");
  }, [token, points]);

  const reset = useCallback(() => {
    stopCamera();
    setPhase("idle");
    setCard(null);
    setToken(null);
    setResult(null);
    setError(null);
    setManual("");
    setPoints(defaultPoints);
  }, [stopCamera, defaultPoints]);

  const scanning = phase === "scanning";
  const showEntry = phase === "idle" || phase === "starting" || scanning;

  return (
    <div className="mt-6">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border-r-4 border-error-500 bg-error-50 p-3 text-sm text-error-800"
        >
          {error}
        </p>
      )}

      {/* The camera is a panel inside the page, not a takeover. It stays
          mounted across phases — remounting it makes the browser re-acquire
          the camera and re-prompt on some devices — and the manual lookup
          below stays reachable the whole time, because a scan that will not
          focus is exactly when the employee needs the other path. */}
      <div className={scanning ? "block" : "hidden"}>
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />

          <span className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" />
            جاري المسح...
          </span>

          {/* Corner brackets — they tell the employee where to aim without
              boxing the frame in a way that hides the subject. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-52 w-52">
              {[
                "right-0 top-0 border-l-0 border-b-0",
                "left-0 top-0 border-r-0 border-b-0",
                "right-0 bottom-0 border-l-0 border-t-0",
                "left-0 bottom-0 border-r-0 border-t-0",
              ].map((pos) => (
                <span
                  key={pos}
                  className={`absolute h-9 w-9 rounded-sm border-[3px] border-accent-400 ${pos}`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="min-h-touch mt-3 w-full rounded-xl bg-error-600 px-5 py-3.5 text-base font-bold text-white"
        >
          إيقاف المسح
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {!scanning && (phase === "idle" || phase === "starting") && (
        <button
          type="button"
          onClick={start}
          disabled={phase === "starting"}
          className="min-h-touch w-full rounded-xl bg-brand-800 px-5 py-4 text-base font-bold text-white disabled:opacity-50"
        >
          {phase === "starting" ? "جاري تشغيل الكاميرا..." : "امسح رمز البطاقة"}
        </button>
      )}

      {/* Manual lookup, always available alongside the camera. */}
      {showEntry && (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-primary-200 dark:bg-primary-800" />
            <span className="text-xs font-medium text-primary-500">أو</span>
            <span className="h-px flex-1 bg-primary-200 dark:bg-primary-800" />
          </div>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (manual.trim()) void lookup(manual.trim());
            }}
          >
            <input
              type="text"
              inputMode="text"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="ألصق رمز البطاقة"
              dir="ltr"
              className="min-h-touch flex-1 rounded-lg border border-primary-300 px-3 py-2.5 text-base dark:border-primary-700 dark:bg-primary-900"
            />
            <button
              type="submit"
              className="min-h-touch rounded-lg bg-brand-800 px-5 text-sm font-bold text-white"
            >
              بحث
            </button>
          </form>
        </div>
      )}

      {phase === "found" && card && (
        <div className="rounded-xl border border-primary-200 p-4 dark:border-primary-700">
          <p className="text-lg font-bold">{card.customerName}</p>
          <p className="text-xs text-primary-500" dir="ltr">
            {card.customerPhone}
          </p>
          <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
            {card.totalPoints} نقطة · {card.totalVisits} زيارة
          </p>

          {canAddPoints ? (
            <>
              <label htmlFor="scan-points" className="mt-4 block text-sm font-medium">
                عدد النقاط
              </label>
              <input
                id="scan-points"
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="min-h-touch mt-1 w-full rounded-lg border border-primary-300 px-3 py-2.5 text-base dark:border-primary-700 dark:bg-primary-900"
              />
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="min-h-touch mt-3 w-full rounded-xl bg-accent-500 px-5 py-4 text-base font-bold text-brand-900 disabled:opacity-50"
              >
                {pending ? "جاري التسجيل..." : `أضف ${points} نقطة`}
              </button>
            </>
          ) : (
            <p className="mt-4 text-sm text-primary-500">
              لا تملك صلاحية إضافة النقاط.
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            className="min-h-touch mt-2 w-full rounded-xl border border-primary-300 px-5 py-3 text-sm font-medium"
          >
            إلغاء
          </button>
        </div>
      )}

      {phase === "done" && result && card && (
        <div className="rounded-xl border-r-4 border-success-500 bg-success-50 p-4 text-center">
          <p className="text-3xl font-black text-success-700">+{result.awarded}</p>
          <p className="mt-1 text-sm text-success-700">
            {card.customerName} — الرصيد الآن {result.newTotal} نقطة
          </p>
          <button
            type="button"
            onClick={start}
            className="min-h-touch mt-4 w-full rounded-xl bg-brand-800 px-5 py-4 text-base font-bold text-white"
          >
            امسح بطاقة أخرى
          </button>
        </div>
      )}
    </div>
  );
}
