/**
 * The brand mark — a vector redraw of the app icon.
 *
 * Same composition as public/icon-master.png (gold card, crown, three stars,
 * enclosing ring on a deep-green tile) so the header mark and the home-screen
 * icon read as one thing. Vector rather than the PNG because this renders at
 * 20px in page headers, where a downscaled raster goes muddy.
 *
 * Colours are the ones sampled from the artwork: tile #093832, card #d7a34c.
 */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bm-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b4038" />
          <stop offset="1" stopColor="#062b26" />
        </linearGradient>
        <linearGradient id="bm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6bd6c" />
          <stop offset="1" stopColor="#c8933f" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="118" fill="url(#bm-tile)" />

      {/* Enclosing ring, broken where the cards overlap it. */}
      <circle
        cx="256"
        cy="256"
        r="150"
        fill="none"
        stroke="#d7a34c"
        strokeWidth="17"
      />

      {/* Three stars across the top. */}
      <g fill="#d7a34c">
        <path d="M256 118 l13 32 34 3 -26 22 8 34 -29 -19 -29 19 8 -34 -26 -22 34 -3 Z" />
        <path d="M190 140 l9 22 24 2 -18 15 6 24 -21 -14 -21 14 6 -24 -18 -15 24 -2 Z" />
        <path d="M322 140 l9 22 24 2 -18 15 6 24 -21 -14 -21 14 6 -24 -18 -15 24 -2 Z" />
      </g>

      {/* Back card, peeking out behind. */}
      <rect
        x="130"
        y="212"
        width="272"
        height="182"
        rx="26"
        fill="#b8853a"
        transform="rotate(-4 266 303)"
      />

      {/* Front card with its magnetic stripe. */}
      <g transform="rotate(-2 250 296)">
        <rect x="106" y="200" width="288" height="192" rx="28" fill="url(#bm-gold)" />
        <rect x="106" y="238" width="288" height="30" fill="#093832" />
        {/* Crown, cut out of the card face in the tile colour. */}
        <path
          d="M186 348 l-12 -48 30 20 26 -36 26 36 30 -20 -12 48 Z"
          fill="#093832"
        />
        <circle cx="174" cy="292" r="11" fill="#093832" />
        <circle cx="256" cy="282" r="11" fill="#093832" />
        <circle cx="338" cy="292" r="11" fill="#093832" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className="h-9 w-9 shrink-0" />
      <span className="text-lg font-bold tracking-tight">
        بطاقة<span className="text-accent-400">ولاء</span>
      </span>
    </span>
  );
}
