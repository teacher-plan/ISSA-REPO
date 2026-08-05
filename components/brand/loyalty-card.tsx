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

/**
 * The gold card motif, rendered large.
 *
 * This is the identity's signature object: the same shape as the brand mark,
 * blown up to hero size and filled with the customer's actual balance. It
 * carries the gold gradient, the diagonal gloss, and the stamp row, so a
 * customer recognises the thing in their hand as the thing on the sign.
 */
export function LoyaltyCardVisual({
  businessName,
  holderName,
  points,
  threshold,
  theme,
  className = "",
}: {
  businessName: string;
  holderName?: string;
  points: number;
  threshold?: number | null;
  /** The shop's generated identity. Omitted → the platform's house gold. */
  theme?: CardTheme | null;
  className?: string;
}) {
  // Colours come from the database, so they are inline styles rather than
  // Tailwind classes — a class name built at runtime is not in the source at
  // build time and Tailwind never generates it.
  // No theme still means DEFAULT_THEME, not "improvise" — that is what carries
  // the dark-ink-on-gold decision (white measures 2.27:1 on this gradient) to
  // every un-themed card.
  const t = sanitizeTheme(theme ?? DEFAULT_THEME).theme;
  const dark = t.textOn === "dark";
  const ink = dark ? DARK_INK : "#ffffff";
  const dot = t.accent;
  const total = threshold && threshold > 0 ? threshold : null;
  // Stamps are capped at 10 dots: past that the row stops reading as a glance
  // and turns into a counting exercise.
  const dots = total ? Math.min(total, 10) : 0;
  const filled = total ? Math.round((Math.min(points, total) / total) * dots) : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-card p-6 shadow-gold ${className}`}
      style={{
        background: `linear-gradient(135deg, ${t.backgroundFrom}, ${t.backgroundTo})`,
      }}
    >
      {t.pattern !== "none" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={patternStyle(t.pattern, ink)}
        />
      )}

      {/* Diagonal gloss — the same highlight as the brand mark. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          opacity: dark ? 0.28 : 0.15,
          background:
            "linear-gradient(160deg, #fff 0%, #fff 38%, transparent 39%)",
        }}
      />

      <div className="relative" style={{ color: ink }}>
        <p className="text-sm font-medium" style={{ opacity: 0.8 }}>
          {businessName}
        </p>
        {holderName && <p className="mt-0.5 text-lg font-bold">{holderName}</p>}

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-black leading-none tabular-nums">
            {points}
          </span>
          <span className="text-sm font-medium" style={{ opacity: 0.8 }}>
            نقطة
          </span>
        </div>

        {total && (
          <>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {Array.from({ length: dots }).map((_, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full"
                  style={
                    i < filled
                      ? { backgroundColor: dot }
                      : { border: `2px solid ${dot}`, opacity: 0.6 }
                  }
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-medium" style={{ opacity: 0.85 }}>
              {points >= total
                ? "مكافأتك جاهزة 🎉"
                : `${total - points} نقطة تفصلك عن المكافأة`}
            </p>
          </>
        )}

        {t.tagline && (
          <p className="mt-4 text-xs font-medium" style={{ opacity: 0.7 }}>
            {t.tagline}
          </p>
        )}
      </div>
    </div>
  );
}
