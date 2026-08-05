"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getLoyaltyProgram, getOwnedBusiness } from "@/lib/auth/session";
import type { EarningType } from "@/types/database";

export interface LoyaltyProgramState {
  error: string | null;
  success: boolean;
}

export async function saveLoyaltyProgram(
  _prevState: LoyaltyProgramState,
  formData: FormData
): Promise<LoyaltyProgramState> {
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
  const description = String(formData.get("description") ?? "").trim() || null;
  const earningType = String(formData.get("earning_type") ?? "visit") as EarningType;
  const pointsPerVisit = Number(formData.get("points_per_visit") ?? 1);
  const pointsPerAmount = Number(formData.get("points_per_amount") ?? 1);
  const rewardThreshold = Number(formData.get("reward_threshold") ?? 10);

  if (!name) {
    return { error: "اسم برنامج الولاء مطلوب.", success: false };
  }
  if (!["visit", "amount"].includes(earningType)) {
    return { error: "نوع الاحتساب غير صحيح.", success: false };
  }
  if (rewardThreshold < 1) {
    return { error: "حد المكافأة يجب أن يكون أكبر من صفر.", success: false };
  }

  const supabase = await createClient();
  const existing = await getLoyaltyProgram(business.id);

  const payload = {
    business_id: business.id,
    name,
    description,
    earning_type: earningType,
    points_per_visit: pointsPerVisit,
    points_per_amount: pointsPerAmount,
    reward_threshold: rewardThreshold,
    is_active: true,
  };

  const { error } = existing
    ? await supabase
        .from("loyalty_programs")
        .update(payload)
        .eq("id", existing.id)
    : await supabase.from("loyalty_programs").insert(payload);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/dashboard/loyalty-program");

  return { error: null, success: true };
}
