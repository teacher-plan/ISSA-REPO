import { DARK_INK, DEFAULT_THEME, sanitizeTheme, type CardTheme } from "@/lib/card-design/theme";
import { BUSINESS_KIND_STAMP_LABEL, isBusinessKind, type BusinessKind } from "@/lib/card-design/kinds";

/** Repeating textures, kept subtle enough not to compete with the balance. */
function patternStyle(
  pattern: CardTheme["pattern"],
  ink: string
): React.CSSProperties {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(${ink} 1.5px, transparent 1.5px)`,
        backgroundSize: "14px 14px",
      };
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${ink} 0 1px, transparent 1px 9px)`,
      };
    case "arcs":
      return {
        backgroundImage: `repeating-radial-gradient(circle at 0% 100%, transparent 0 18px, ${ink} 18px 19px)`,
      };
    default:
      return {};
  }
}

/**
 * One glyph per trade, drawn in the same monoline language as the rest of
 * the product's icons (see the dashboard section cards) so a stamp reads as
 * part of the same system rather than a different illustration style bolted
 * on. Centered inside the stamp vessel in place of repeating the shop's name
 * ten times, which is what a literal "print the logo on every cup" reading
 * of a real stamp card would otherwise produce.
 */
const STAMP_GLYPHS: Record<BusinessKind, React.ReactNode> = {
  cafe: (
    <>
      <path d="M4 8h13l-1 8.5a2 2 0 0 1-2 1.8H7a2 2 0 0 1-2-1.8L4 8z" />
      <path d="M6 8V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    </>
  ),
  restaurant: (
    <>
      <path d="M6 3v6a1.5 1.5 0 0 0 3 0V3M7.5 9V21" />
      <path d="M16.5 3c-1.2 1.6-1.2 5 0 6.4S17.7 13 16.5 13v8" />
    </>
  ),
  bakery: <path d="M3 14c1-6 6-10 12-9 4 .7 6 4 5 7-1 2.5-4 3-6 1.5-1.5-1-3.5-1-5 .5-1.5 1.5-4.5 2-6 0z" />,
  salon: (
    <>
      <circle cx="6" cy="6" r="2.3" />
      <circle cx="6" cy="17" r="2.3" />
      <path d="M8 7.5 18 18M8 15.5 18 5" />
    </>
  ),
  barber: (
    <>
      <path d="M4 4h15v3H4z" />
      <path d="M6 7v12M9.5 7v9M13 7v12M16.5 7v9" />
    </>
  ),
  laundry: (
    <>
      <path d="M11.5 3.5a1.7 1.7 0 1 1 1.7 1.7c0 .8-.6 1.1-1.1 1.4" />
      <path d="M12 6.9 3 12.4h18z" />
      <path d="M4.5 12.4h15" />
    </>
  ),
  grocery: (
    <>
      <path d="M4 9h15l-1.4 8.4a2 2 0 0 1-2 1.6H7.3a2 2 0 0 1-2-1.6L4 9z" />
      <path d="M7.5 9 9.5 4.5M15.5 9 13.5 4.5" />
    </>
  ),
  pharmacy: <path d="M12 5v13M5.5 11.5h13" />,
  gym: <path d="M4 9v6M20 9v6M2 10.5v3M22 10.5v3M6 12h12" />,
  carwash: <path d="M12 3s6 7.2 6 11.2A6 6 0 1 1 6 14.2C6 10.2 12 3 12 3z" />,
  other: (
    <path d="M12 4.5 14 9l5 .5-3.7 3.4 1 4.9L12 15.3 7.7 17.8l1-4.9L5 9.5 10 9Z" />
  ),
};

/** One collectible stamp: a vessel that stands for "one of this trade's unit" — a
 * cup, a wash, a session — filled in once earned and dimmed while still to come.
 * The lid+body silhouette is shared across every trade; only the glyph at its
 * centre changes, which is what makes the same vessel usable for a laundry as
 * for a cafe without hand-drawing ten different container shapes. */
function Stamp({
  filled,
  kind,
  ink,
}: {
  filled: boolean;
  kind: BusinessKind;
  ink: string;
}) {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden="true">
      <path
        d="M 18,22 C 18,17 22,15 50,15 C 78,15 82,17 82,22 L 80,27 C 80,28 78,29 50,29 C 22,29 20,28 20,27 Z M 24,15 C 24,11 30,10 50,10 C 70,10 76,11 76,15 Z"
        fill={filled ? "#211d17" : "rgba(255,255,255,0.14)"}
      />
      <path
        d="M 22,30 L 78,30 L 70,110 C 69,114 65,116 50,116 C 35,116 31,114 30,110 Z"
        fill={filled ? "url(#stampVesselFilled)" : "url(#stampVesselEmpty)"}
        stroke={filled ? "none" : "rgba(255,255,255,0.3)"}
        strokeWidth={filled ? 0 : 1.5}
      />
      <g
        transform="translate(27 46) scale(1.9)"
        fill="none"
        stroke={filled ? ink : "rgba(255,255,255,0.55)"}
        strokeWidth={filled ? 1.7 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {STAMP_GLYPHS[kind]}
      </g>
    </svg>
  );
}

/** The reward itself, shown as its own ticket rather than counted as a stamp —
 * dim until the balance actually clears the threshold, then lit. */
function RewardTicket({ ready }: { ready: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="-rotate-[13deg] rounded border px-2 py-1 text-[9px] font-extrabold tracking-wide"
        style={
          ready
            ? {
                background: "rgba(24,90,54,0.55)",
                borderColor: "rgba(255,255,255,0.5)",
                borderStyle: "dashed",
                color: "#8fe3ae",
                boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
              }
            : {
                background: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.25)",
                borderStyle: "dashed",
                color: "rgba(255,255,255,0.45)",
              }
        }
      >
        مجانًا
      </div>
    </div>
  );
}

/**
 * The loyalty pass, shaped like the wallet passes customers already carry:
 * a tall panel that fills the phone, not a landscape credit card.
 *
 * Structurally it is two layers, not one flat gradient: an outer shell that
 * carries the business's actual theme colour (the thing sanitizeTheme()
 * guarantees is readable), and an inset glass panel — backdrop-blur over a
 * translucent tint — that holds all the content. The glass floats over the
 * shell's own gradient the way a real frosted-glass pass floats over
 * whatever is behind it; there is no photograph to blur here, so the shell's
 * brand gradient plays that role instead.
 */
export function LoyaltyCardVisual({
  businessName,
  logoUrl,
  holderName,
  points,
  threshold,
  theme,
  kind,
  /** Inline SVG for the scannable code. Omitted → the pass renders without it. */
  qrSvg,
  className = "",
}: {
  businessName: string;
  logoUrl?: string | null;
  holderName?: string;
  points: number;
  threshold?: number | null;
  theme?: CardTheme | null;
  kind?: string | null;
  qrSvg?: string | null;
  className?: string;
}) {
  // Colours come from the database, so they are inline styles rather than
  // Tailwind classes — a class name built at runtime is not in the source at
  // build time and Tailwind never generates it. No theme still means
  // DEFAULT_THEME, which is what carries the dark-ink-on-gold decision
  // (white measures 2.27:1 on this gradient) to every un-themed pass.
  const t = sanitizeTheme(theme ?? DEFAULT_THEME).theme;
  const dark = t.textOn === "dark";
  const ink = dark ? DARK_INK : "#ffffff";
  const safeKind: BusinessKind = isBusinessKind(kind) ? kind : "other";
  const stampLabel = BUSINESS_KIND_STAMP_LABEL[safeKind];

  const total = threshold && threshold > 0 ? threshold : null;
  // The grid caps at 10 cells and always reserves the last one for the
  // reward ticket, so a threshold of 9 reads as "9 stamps, then it's free"
  // the way a physical stamp card does, rather than as a 9-slot progress bar
  // with the reward implied nowhere.
  const slotsTotal = total ? Math.min(total, 10) : 0;
  const regularSlots = Math.max(slotsTotal - 1, 0);
  const filledRegular = total
    ? Math.round((Math.min(points, total) / total) * regularSlots)
    : 0;
  const earnedForDisplay = total ? Math.min(points, total) : 0;
  const rewardReady = total ? points >= total : false;

  // Glass tint pushes contrast in whichever direction the ink needs: a light
  // wash under dark ink, a dark wash under light ink. It is not re-verified
  // against sanitizeTheme()'s 4.5:1 guarantee stop-by-stop — at these low
  // opacities over an already-passing gradient it holds in practice, the same
  // way the reference build's own tint was never run through a checker either.
  const glassBg = dark ? "rgba(255,255,255,0.32)" : "rgba(9,20,18,0.34)";
  const glassBorder = dark ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.16)";

  return (
    <div
      className={`relative overflow-hidden rounded-card shadow-gold ${className}`}
      style={{ background: `linear-gradient(160deg, ${t.backgroundFrom}, ${t.backgroundTo})` }}
    >
      {t.pattern !== "none" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={patternStyle(t.pattern, ink)}
        />
      )}

      {/* Shared gradient defs for every stamp's vessel — one instance per
          card is enough since the gradients are identical across stamps and
          only one card renders per page in this app. */}
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="stampVesselFilled" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dedad4" />
            <stop offset="35%" stopColor="#f7f5f0" />
            <stop offset="70%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cfcac2" />
          </linearGradient>
          <linearGradient id="stampVesselEmpty" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="font-card-body absolute inset-3 flex flex-col overflow-hidden rounded-[1.1rem] px-5 py-6 backdrop-blur-xl backdrop-saturate-150"
        style={{
          background: glassBg,
          border: `1px solid ${glassBorder}`,
          color: dark ? ink : "#ffffff",
        }}
      >
        {/* Header: the shop's own identity, plus whose card this is. The name
            is set in a display face (--font-card-display) — a shop's own
            name reads better in something with character than in the app's
            neutral UI face, which the rest of the pass keeps. */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            )}
            <p className="font-card-display truncate text-lg font-bold tracking-tight">
              {businessName}
            </p>
          </div>
          {holderName && (
            <div className="shrink-0 text-left">
              <p
                className="text-[8px] font-bold uppercase tracking-widest"
                style={{ opacity: 0.7 }}
              >
                الاسم
              </p>
              <p className="truncate text-sm font-semibold">{holderName}</p>
            </div>
          )}
        </div>

        {total ? (
          <>
            {/* The stamp grid — the part a customer actually reads. */}
            <div className="mt-6 grid grid-cols-5 gap-2.5">
              {Array.from({ length: regularSlots }).map((_, i) => (
                <div key={i} className="aspect-square">
                  <Stamp filled={i < filledRegular} kind={safeKind} ink={ink} />
                </div>
              ))}
              {slotsTotal > 0 && (
                <div className="aspect-square">
                  <RewardTicket ready={rewardReady} />
                </div>
              )}
            </div>

            <div className="mt-auto flex items-end justify-between pt-6">
              <div>
                <p
                  className="text-[8px] font-bold uppercase tracking-widest"
                  style={{ opacity: 0.72 }}
                >
                  {stampLabel}
                </p>
                <p className="mt-0.5 text-2xl font-extrabold leading-none tabular-nums">
                  {earnedForDisplay}/{total}
                </p>
              </div>
              <div className="text-left">
                <p
                  className="text-[8px] font-bold uppercase tracking-widest"
                  style={{ opacity: 0.72 }}
                >
                  النقاط
                </p>
                <p className="mt-0.5 text-2xl font-extrabold leading-none tabular-nums">
                  {points}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8">
            <p
              className="text-[8px] font-bold uppercase tracking-widest"
              style={{ opacity: 0.72 }}
            >
              رصيدك
            </p>
            <p className="mt-1 text-5xl font-black leading-none tabular-nums">
              {points}
            </p>
            <p className="mt-1 text-sm" style={{ opacity: 0.75 }}>
              نقطة
            </p>
          </div>
        )}

        {t.tagline && (
          <p className="mt-4 text-xs font-medium" style={{ opacity: 0.75 }}>
            {t.tagline}
          </p>
        )}

        {/* The code sits inside the pass, on a white plate regardless of the
            theme: a code inverted to match a dark background is unreliable to
            scan, and this is the one element that must work every time. */}
        {qrSvg && (
          <div className={total ? "mt-5" : "mt-auto pt-5"}>
            <div className="rounded-xl bg-white px-4 py-3">
              <div
                className="mx-auto w-full max-w-[170px] [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-primary-500">
                امسح لتسجيل النقاط
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
