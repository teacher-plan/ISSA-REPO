"use client";

import { useState } from "react";

/**
 * Converts the server-rendered QR (an SVG string, sharp at any size but not
 * something you can print or drop into WhatsApp directly) into a PNG a
 * business owner can actually save and use. The conversion happens entirely
 * client-side via a throwaway <img>/<canvas> pair — no server round trip
 * needed since the SVG markup is already in hand.
 */
export function DownloadQrButton({
  svg,
  filename,
}: {
  svg: string;
  filename: string;
}) {
  const [error, setError] = useState(false);

  // The caller builds this out of the shop's own name, which is free text —
  // a slash or a colon in it would be read as a path separator rather than
  // part of the name. Arabic letters are left alone; only the characters
  // filesystems actually reject are replaced.
  const safeFilename = filename.replace(/[\\/:*?"<>|]/g, "-");

  const handleDownload = () => {
    setError(false);
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Upscaled well past the SVG's own 320px so the PNG still looks sharp
      // printed at poster size, not just on a phone screen.
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError(true);
        URL.revokeObjectURL(svgUrl);
        return;
      }

      // A white backing sheet regardless of what the SVG paints — a QR on a
      // transparent PNG can vanish into a dark chat background or a colored
      // print template, and this is the one image that has to keep scanning.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };
    img.onerror = () => {
      setError(true);
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleDownload}
        className="min-h-touch rounded-full border border-primary-300 px-4 text-sm font-medium hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-primary-900"
      >
        تحميل الرمز كصورة
      </button>
      {error && (
        <p role="alert" className="text-xs text-error-600">
          تعذّر تحميل الصورة. حاول مرة أخرى.
        </p>
      )}
    </div>
  );
}
