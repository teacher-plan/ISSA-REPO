import "server-only";
import QRCode from "qrcode";

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
  return QRCode.toString(walletCardId, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
