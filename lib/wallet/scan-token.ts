const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Pulls the wallet_cards id out of a scanned QR payload.
 *
 * The same card is reachable three ways depending on where the QR was
 * generated, and all of them must scan identically at the counter:
 *
 *   - a bare id — what the wallet pass barcode carries
 *   - a /c/<id> URL — the public card page, shared as a link
 *   - a full https://host/c/<id> URL — the same page printed or forwarded
 *
 * Returns null for anything else, so a random QR on a product wrapper fails
 * fast with "unknown code" instead of reaching the database.
 */
export function parseScanToken(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  const match = text.match(UUID_RE);
  if (!match) return null;

  // A URL must actually be a card link — a UUID appearing anywhere else in a
  // scanned string is a coincidence, not a card.
  if (/^https?:\/\//i.test(text) || text.startsWith("/")) {
    return /\/c\/[0-9a-f-]{36}/i.test(text) ? match[0].toLowerCase() : null;
  }

  // A bare payload must be the id and nothing else.
  return text.length === 36 ? match[0].toLowerCase() : null;
}
