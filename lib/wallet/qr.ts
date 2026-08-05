import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

const QR_OPTIONS = {
  type: "svg" as const,
  errorCorrectionLevel: "M" as const,
  margin: 1,
  width: 320,
  color: { dark: "#000000", light: "#ffffff" },
};

/**
 * Renders the card's scan code as an inline SVG string.
 *
 * SVG rather than a PNG data URI because this is displayed on a phone held up
 * to a camera: it stays sharp at any size, and a crisp code is the difference
 * between a scan that lands first try and one the employee has to retry.
 *
 * Error-correction level M tolerates a cracked screen or a fingerprint over
 * part of the code while keeping the modules large enough to read at arm's
 * length. Level H would survive more damage but packs the modules tighter,
 * which reads worse on a small display.
 */
export async function renderCardQrSvg(walletCardId: string): Promise<string> {
  return QRCode.toString(walletCardId, QR_OPTIONS);
}

/**
 * Resolves the site's own base URL for building absolute links.
 *
 * NEXT_PUBLIC_APP_URL wins when set — it's the right override for a
 * deployment sitting behind a CDN or a custom domain the request headers
 * wouldn't reveal. But when it is *not* set (easy to forget on a new Vercel
 * project, and exactly what happened here: a join QR that silently encoded
 * "http://localhost:3000" and failed on every phone that scanned it), this
 * falls back to the incoming request's own Host header instead of a
 * hardcoded localhost guess — so the QR is correct on whatever domain is
 * actually serving the page, configured or not.
 */
async function resolveBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured;

  const h = await headers();
  const host = h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

/**
 * The absolute join URL for a business. Callers needing both the QR *and*
 * the plain-text link (every page that shows this does) should call this
 * once and pass the same string into renderQrSvg() below, rather than each
 * resolving the base URL independently — two resolutions can only drift
 * apart, never provide any benefit over one.
 */
export async function getJoinUrl(businessId: string): Promise<string> {
  const base = await resolveBaseUrl();
  return `${base}/join/${businessId}`;
}

/** Renders arbitrary text (typically a URL from getJoinUrl()) as an inline SVG code. */
export async function renderQrSvg(content: string): Promise<string> {
  return QRCode.toString(content, QR_OPTIONS);
}
