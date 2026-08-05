/**
 * Business kinds, in their own module because the designer form (a client
 * component) needs the labels while generate.ts is `server-only` — it holds the
 * Anthropic client. Importing the labels from there would drag the API key into
 * the browser bundle, which is exactly what `server-only` exists to stop.
 */
export type BusinessKind =
  | "cafe"
  | "restaurant"
  | "bakery"
  | "salon"
  | "barber"
  | "laundry"
  | "grocery"
  | "pharmacy"
  | "gym"
  | "carwash"
  | "other";

export const BUSINESS_KIND_LABELS: Record<BusinessKind, string> = {
  cafe: "مقهى",
  restaurant: "مطعم",
  bakery: "مخبز / حلويات",
  salon: "صالون تجميل",
  barber: "حلاق",
  laundry: "مغسلة ملابس",
  grocery: "بقالة / سوبرماركت",
  pharmacy: "صيدلية",
  gym: "نادي رياضي",
  carwash: "غسيل سيارات",
  other: "أخرى",
};

/**
 * What one stamp represents, in the wording the customer's own trade uses —
 * the loyalty card's stamp counter reads "٣/٩ القهوة" for a cafe and
 * "٢/٤ الغسلات" for a laundry rather than one generic word for every trade.
 */
export const BUSINESS_KIND_STAMP_LABEL: Record<BusinessKind, string> = {
  cafe: "القهوة",
  restaurant: "الوجبات",
  bakery: "المشتريات",
  salon: "الجلسات",
  barber: "القصّات",
  laundry: "الغسلات",
  grocery: "المشتريات",
  pharmacy: "الزيارات",
  gym: "الحصص",
  carwash: "الغسلات",
  other: "الزيارات",
};

/**
 * `business_settings.card_business_kind` is a plain `text` column, not a DB
 * enum — the same "parse, don't cast" caution as `card_theme` jsonb applies:
 * a value written by an older schema, or edited by hand, must degrade to a
 * safe fallback rather than crash the icon lookup.
 */
export function isBusinessKind(value: string | null | undefined): value is BusinessKind {
  return !!value && value in BUSINESS_KIND_LABELS;
}
