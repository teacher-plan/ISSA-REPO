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
