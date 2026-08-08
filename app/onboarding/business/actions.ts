"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";

export interface BusinessOnboardingState {
  error: string | null;
}

export async function createBusiness(
  _prevState: BusinessOnboardingState,
  formData: FormData
): Promise<BusinessOnboardingState> {
  const { profile } = await getCurrentUser();

  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "business_owner") {
    redirect("/dashboard");
  }

  const existing = await getOwnedBusiness(profile.id);
  if (existing) {
    redirect("/dashboard");
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;

  if (!name) {
    return { error: "اسم المحل مطلوب." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("businesses").insert({
    owner_id: profile.id,
    name,
    phone,
    country,
    email: profile.email,
  });

  if (error) {
    return { error: error.message };
  }

  // The offer, then card design, then the shop's join QR, are the next
  // onboarding steps — not optional dashboard sections a new owner has to
  // discover on their own.
  redirect("/onboarding/offer");
}
