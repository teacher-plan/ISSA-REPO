import { z } from "zod";

/**
 * The generated card identity.
 *
 * Deliberately a small set of *constrained* values rather than free-form SVG or
 * an image. A model asked for raw artwork produces something different every
 * run, can bury the balance under decoration, and gives Google Wallet nothing
 * it can use — the Wallet pass takes a single `hexBackgroundColor`. A structured
 * theme renders identically in the web card and the wallet pass, and the points
 * and stamp row stay exactly where the customer expects them.
 */
export const cardThemeSchema = z.object({
  backgroundFrom: z
    .string()
    .describe("Gradient start colour as a 6-digit hex, e.g. #7C3AED"),
  backgroundTo: z
    .string()
    .describe("Gradient end colour as a 6-digit hex. Should differ from the start."),
  accent: z
    .string()
    .describe("Hex colour for the filled stamp dots and highlights."),
  textOn: z
    .enum(["light", "dark"])
    .describe(
      "Whether text on this background should be light or dark. Pick whichever is readable."
    ),
  pattern: z
    .enum(["none", "dots", "diagonal", "arcs"])
    .describe("A subtle background texture. Use 'none' unless it suits the trade."),
  tagline: z
    .string()
    .describe("A short Arabic line for the card, at most 4 words. No emoji."),
});

export type CardTheme = z.infer<typeof cardThemeSchema>;

/**
 * The house design, used when no theme is set and as the fallback for a
 * generated one that cannot be made readable.
 *
 * `textOn` is "dark" and that is not a style preference: white on this gold
 * measures 1.67:1 at the light end of the gradient — below WCAG AA (4.5:1) and
 * below even the 3:1 large-text floor. Dark ink measures 5.60:1 at the worst
 * stop. The card shipped with white text until a contrast sweep caught it.
 */
export const DEFAULT_THEME: CardTheme = {
  backgroundFrom: "#ddb05d",
  backgroundTo: "#b8853a",
  accent: "#093832",
  textOn: "dark",
  pattern: "none",
  tagline: "",
};

/**
 * The ink used when a theme calls for dark text.
 *
 * The brand green rather than a neutral near-black: on the gold card it
 * measures 5.69:1, and it is the same pairing the app icon uses — a green
 * crown on a gold card face.
 */
export const DARK_INK = "#093832";

const HEX = /^#[0-9a-f]{6}$/i;

function toRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const channels = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG contrast ratio between two colours, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Repairs a generated theme so the card is always readable.
 *
 * The model picks colours, and a model that picks a pale gradient and then says
 * `textOn: "light"` produces a card whose balance cannot be read — a failure the
 * customer meets at the counter, not one we can catch by eye during review. So
 * the text colour is *recomputed* from the actual background rather than
 * trusted, and a gradient whose midpoint fails WCAG AA (4.5:1) against both
 * white and black is rejected outright in favour of the house gold.
 *
 * Malformed hex is treated the same way: fall back, don't render a broken card.
 */
export function sanitizeTheme(theme: CardTheme): {
  theme: CardTheme;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!HEX.test(theme.backgroundFrom) || !HEX.test(theme.backgroundTo) || !HEX.test(theme.accent)) {
    return {
      theme: { ...DEFAULT_THEME, tagline: theme.tagline },
      warnings: ["لون غير صالح في التصميم المُولَّد — تم استخدام التصميم الافتراضي."],
    };
  }

  // Sample across the gradient, not just its midpoint. Text runs the height of
  // the card, and a steep gradient (near-black to near-white) has a perfectly
  // average midpoint while one end is unreadable — checking the middle alone
  // certifies exactly the cards that fail worst in the hand.
  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) =>
    mixHex(theme.backgroundFrom, theme.backgroundTo, t)
  );

  // Score each ink by its *worst* stop: a text colour is only as good as the
  // least readable place it appears.
  const worstOnWhite = Math.min(...stops.map((s) => contrastRatio(s, "#ffffff")));
  const worstOnBlack = Math.min(...stops.map((s) => contrastRatio(s, "#000000")));
  const best = Math.max(worstOnWhite, worstOnBlack);

  // WCAG AA for body text. Note that for any *single* colour one of white or
  // black always clears this (the two conditions cannot both fail), so this
  // branch fires only for gradients too wide for one ink to cover — which is
  // precisely the case worth rejecting.
  if (best < 4.5) {
    return {
      theme: { ...DEFAULT_THEME, tagline: theme.tagline },
      warnings: [
        "تدرّج الألوان واسع جدًا ولا يمكن قراءة الرصيد عليه بلون واحد — تم استخدام التصميم الافتراضي.",
      ],
    };
  }

  const readable: CardTheme["textOn"] = worstOnWhite >= worstOnBlack ? "light" : "dark";
  if (readable !== theme.textOn) {
    warnings.push("تم تصحيح لون النص ليكون مقروءًا على الخلفية.");
  }

  return { theme: { ...theme, textOn: readable }, warnings };
}

/** Linear blend of two hex colours, used to sample the gradient's midpoint. */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  const to2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${to2(ar + (br - ar) * t)}${to2(ag + (bg - ag) * t)}${to2(ab + (bb - ab) * t)}`;
}
