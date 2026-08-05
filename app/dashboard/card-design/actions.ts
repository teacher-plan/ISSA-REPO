"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";
import { generateCardTheme } from "@/lib/card-design/generate";
import { BUSINESS_KIND_LABELS, type BusinessKind } from "@/lib/card-design/kinds";
import { cardThemeSchema, sanitizeTheme, type CardTheme } from "@/lib/card-design/theme";

async function requireOwnedBusiness() {
  const { profile } = await getCurrentUser();
  if (!profile) redirect("/auth/login");
  if (profile.role !== "business_owner") redirect("/dashboard");

  const business = await getOwnedBusiness(profile.id);
  if (!business) redirect("/onboarding/business");

  return business;
}

export interface DesignState {
  error: string | null;
  warnings: string[];
  theme: CardTheme | null;
  kind: BusinessKind | null;
}

export async function generateDesign(
  _prevState: DesignState,
  formData: FormData
): Promise<DesignState> {
  const business = await requireOwnedBusiness();

  const kind = String(formData.get("kind") ?? "") as BusinessKind;
  if (!(kind in BUSINESS_KIND_LABELS)) {
    return { error: "اختر نوع النشاط.", warnings: [], theme: null, kind: null };
  }

  const brandColor = String(formData.get("brand_color") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 400) || null;

  const result = await generateCardTheme({
    businessName: business.name,
    kind,
    brandColor,
    notes,
  });

  if (!result.ok) {
    return { error: result.error, warnings: [], theme: null, kind };
  }

  // Not persisted yet — the owner previews first and saves explicitly, so a
  // design they dislike never reaches a customer's card.
  return { error: null, warnings: result.warnings, theme: result.theme, kind };
}

export interface SaveState {
  error: string | null;
  success: boolean;
}

export async function saveDesign(
  _prevState: SaveState,
  formData: FormData
): Promise<SaveState> {
  const business = await requireOwnedBusiness();

  const raw = String(formData.get("theme") ?? "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "تعذّر قراءة التصميم.", success: false };
  }

  // Re-validate server-side. The theme travels through a hidden form field, so
  // the browser could post anything — schema first, then the readability repair
  // that guarantees the balance stays legible.
  const check = cardThemeSchema.safeParse(parsed);
  if (!check.success) {
    return { error: "التصميم غير صالح.", success: false };
  }
  const { theme } = sanitizeTheme(check.data);

  const kind = String(formData.get("kind") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase.from("business_settings").upsert(
    {
      business_id: business.id,
      card_theme: theme,
      card_business_kind: kind,
      card_theme_generated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" }
  );

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/dashboard/card-design");

  return { error: null, success: true };
}

export async function clearDesign(): Promise<void> {
  const business = await requireOwnedBusiness();

  const supabase = await createClient();
  await supabase
    .from("business_settings")
    .update({ card_theme: null, card_theme_generated_at: null })
    .eq("business_id", business.id);

  revalidatePath("/dashboard/card-design");
}
