/**
 * The brand mark: a loyalty card with a star and a row of collected stamps.
 *
 * The same rounded-rectangle-plus-gold-gradient shape recurs as the hero card
 * on the landing page, the points tile in the dashboard, and the app icon —
 * that repetition is what makes the identity read as one thing rather than as
 * a colour scheme.
 *
 * Drawn as flat paths with no text, so it survives being rendered at 20px in a
 * page header.
 */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="bm-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="112" fill="url(#bm-bg)" />
      <rect x="86" y="146" width="340" height="220" rx="28" fill="url(#bm-card)" />
      <path d="M86 214 L426 146 v44 L86 258 Z" fill="#fff" opacity="0.14" />
      <path
        d="M256 196 l19 47 51 4 -39 33 12 50 -43 -27 -43 27 12 -50 -39 -33 51 -4 Z"
        fill="#fff"
        opacity="0.95"
      />
      <circle cx="176" cy="326" r="15" fill="#fff" opacity="0.95" />
      <circle cx="216" cy="326" r="15" fill="#fff" opacity="0.95" />
      <circle cx="256" cy="326" r="15" fill="#fff" opacity="0.95" />
      <circle cx="296" cy="326" r="15" fill="none" stroke="#fff" strokeWidth="4" opacity="0.55" />
      <circle cx="336" cy="326" r="15" fill="none" stroke="#fff" strokeWidth="4" opacity="0.55" />
      <rect x="196" y="404" width="120" height="14" rx="7" fill="#f59e0b" opacity="0.85" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className="h-9 w-9 shrink-0" />
      <span className="text-lg font-bold tracking-tight">
        بطاقة<span className="text-accent-500">ولاء</span>
      </span>
    </span>
  );
}
