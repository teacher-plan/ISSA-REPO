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
  className = "",
}: {
  businessName: string;
  holderName?: string;
  points: number;
  threshold?: number | null;
  className?: string;
}) {
  const total = threshold && threshold > 0 ? threshold : null;
  // Stamps are capped at 10 dots: past that the row stops reading as a glance
  // and turns into a counting exercise.
  const dots = total ? Math.min(total, 10) : 0;
  const filled = total ? Math.round((Math.min(points, total) / total) * dots) : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-card bg-gradient-to-br from-accent-400 to-accent-600 p-6 shadow-gold ${className}`}
    >
      {/* Diagonal gloss — the same highlight as the brand mark. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3 opacity-15"
        style={{
          background:
            "linear-gradient(160deg, #fff 0%, #fff 38%, transparent 39%)",
        }}
      />

      <div className="relative">
        <p className="text-sm font-medium text-white/80">{businessName}</p>
        {holderName && (
          <p className="mt-0.5 text-lg font-bold text-white">{holderName}</p>
        )}

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-black leading-none text-white tabular-nums">
            {points}
          </span>
          <span className="text-sm font-medium text-white/80">نقطة</span>
        </div>

        {total && (
          <>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {Array.from({ length: dots }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < filled
                      ? "h-3 w-3 rounded-full bg-white"
                      : "h-3 w-3 rounded-full border-2 border-white/60"
                  }
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-medium text-white/85">
              {points >= total
                ? "مكافأتك جاهزة 🎉"
                : `${total - points} نقطة تفصلك عن المكافأة`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
