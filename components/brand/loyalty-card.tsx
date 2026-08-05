import { DARK_INK, DEFAULT_THEME, sanitizeTheme, type CardTheme } from "@/lib/card-design/theme";

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

/** One collectible stamp. Filled once earned, outlined while still to come. */
function Stamp({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10.5"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.6"
        opacity={filled ? 1 : 0.45}
      />
      {filled && (
        <path
          d="M12 6.4 l1.7 3.9 4.2 .4 -3.2 2.8 1 4.1 -3.7 -2.3 -3.7 2.3 1 -4.1 -3.2 -2.8 4.2 -.4 Z"
          fill="#fff"
          opacity="0.9"
        />
      )}
    </svg>
  );
}

/**
 * The loyalty pass, shaped like the wallet passes customers already carry:
 * a tall panel that fills the phone, not a landscape credit card.
 *
 * The layout mirrors what a customer expects to find on a pass — shop name at
 * the top, a stamp grid they can read at a glance, the number still owed, and
 * the scannable code at the bottom. Keeping the code *inside* the pass rather
 * than in a separate box below matters: at the counter the customer holds up
 * one thing, and the employee scans the bottom of it.
 */
export function LoyaltyCardVisual({
  businessName,
  logoUrl,
  holderName,
  points,
  threshold,
  theme,
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
  const stampColor = t.accent;

  const total = threshold && threshold > 0 ? threshold : null;
  // Capped at 10: past that the grid stops reading at a glance and becomes a
  // counting exercise. Laid out five per row, as physical stamp cards are.
  const slots = total ? Math.min(total, 10) : 0;
  const filled = total ? Math.round((Math.min(points, total) / total) * slots) : 0;
  const remaining = total ? Math.max(0, total - points) : null;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-card shadow-gold ${className}`}
      style={{
        background: `linear-gradient(160deg, ${t.backgroundFrom}, ${t.backgroundTo})`,
        color: ink,
      }}
    >
      {t.pattern !== "none" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={patternStyle(t.pattern, ink)}
        />
      )}

      <div className="relative flex flex-1 flex-col px-6 pb-6 pt-7">
        {/* Header: the shop, as it appears on a real pass. */}
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-black tracking-tight">
              {businessName}
            </p>
            {holderName && (
              <p className="truncate text-xs" style={{ opacity: 0.75 }}>
                {holderName}
              </p>
            )}
          </div>
        </div>

        {total ? (
          <>
            {/* The stamp grid — the part a customer actually reads. */}
            <div className="mt-7 grid grid-cols-5 gap-3">
              {Array.from({ length: slots }).map((_, i) => (
                <div key={i} className="aspect-square">
                  <Stamp filled={i < filled} color={stampColor} />
                </div>
              ))}
            </div>

            <p
              className="mt-7 text-[11px] font-bold uppercase tracking-wider"
              style={{ opacity: 0.7 }}
            >
              {remaining === 0 ? "مكافأتك جاهزة" : "نقاط متبقية للمكافأة"}
            </p>
            <p className="mt-1 text-4xl font-black leading-none tabular-nums">
              {remaining === 0 ? "🎉" : remaining}
            </p>
          </>
        ) : (
          <>
            <p
              className="mt-8 text-[11px] font-bold uppercase tracking-wider"
              style={{ opacity: 0.7 }}
            >
              رصيدك
            </p>
            <p className="mt-1 text-5xl font-black leading-none tabular-nums">
              {points}
            </p>
            <p className="mt-1 text-sm" style={{ opacity: 0.75 }}>
              نقطة
            </p>
          </>
        )}

        {t.tagline && (
          <p className="mt-4 text-xs font-medium" style={{ opacity: 0.7 }}>
            {t.tagline}
          </p>
        )}

        {/* The code sits inside the pass, on a white plate regardless of the
            theme: a code inverted to match a dark background is unreliable to
            scan, and this is the one element that must work every time. */}
        {qrSvg && (
          <div className="mt-auto pt-7">
            <div className="rounded-xl bg-white px-4 py-3">
              <div
                className="mx-auto w-full max-w-[190px] [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="mt-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-primary-500">
                امسح لتسجيل النقاط
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
