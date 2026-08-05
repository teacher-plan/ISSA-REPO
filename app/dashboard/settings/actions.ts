"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";

export interface BusinessSettingsState {
  error: string | null;
  success: boolean;
}

export async function updateBusinessSettings(
  _prevState: BusinessSettingsState,
  formData: FormData
): Promise<BusinessSettingsState> {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "business_owner") {
    redirect("/dashboard");
  }

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const name = String(formData.get("name") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const primaryColor = String(formData.get("primary_color") ?? "#18181b");
  const secondaryColor = String(formData.get("secondary_color") ?? "#f4f4f5");
  const passkitProgramId = String(formData.get("passkit_program_id") ?? "").trim() || null;
  const passkitTierId = String(formData.get("passkit_tier_id") ?? "").trim() || null;

  if (!name) {
    return { error: "اسم المحل مطلوب.", success: false };
  }

  const supabase = await createClient();

  const { error: businessError } = await supabase
    .from("businesses")
    .update({
      name,
      logo_url: logoUrl,
      phone,
      address,
      country,
    })
    .eq("id", business.id);

  if (businessError) {
    return { error: businessError.message, success: false };
  }

  const { error: settingsError } = await supabase
    .from("business_settings")
    .upsert(
      {
        business_id: business.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        passkit_program_id: passkitProgramId,
        passkit_tier_id: passkitTierId,
      },
      { onConflict: "business_id" }
    );

  if (settingsError) {
    return { error: settingsError.message, success: false };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
