"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getLoyaltyProgram, getOwnedBusiness } from "@/lib/auth/session";
import { generateOfferText, validateOfferText } from "@/lib/loyalty/offer";
import type { EarningType, RewardType } from "@/types/database";

const REWARD_TYPES: RewardType[] = [
  "free_item",
  "percent_discount",
  "fixed_discount",
  "free_service",
  "custom",
];

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
  const rewardType = String(formData.get("reward_type") ?? "free_item") as RewardType;
  const rewardValue = String(formData.get("reward_value") ?? "").trim() || null;
  const offerTextInput = String(formData.get("offer_text") ?? "").trim();

  if (!name) {
    return { error: "اسم برنامج الولاء مطلوب.", success: false };
  }
  if (!["visit", "amount"].includes(earningType)) {
    return { error: "نوع الاحتساب غير صحيح.", success: false };
  }
  if (rewardThreshold < 1) {
    return { error: "حد المكافأة يجب أن يكون أكبر من صفر.", success: false };
  }
  if (!REWARD_TYPES.includes(rewardType)) {
    return { error: "نوع الجائزة غير صحيح.", success: false };
  }
  if (rewardType !== "custom" && !rewardValue) {
    return { error: "قيمة الجائزة مطلوبة.", success: false };
  }

  // The client sends whatever it last rendered in the offer-text field —
  // re-derive it server-side for non-custom types instead of trusting that
  // value, the same "never trust a hidden/generated field, recompute it"
  // rule the card-theme save action already follows. Only "custom" has no
  // formula to recompute from, so the typed text is authoritative there.
  const offerText =
    rewardType === "custom"
      ? offerTextInput
      : generateOfferText(rewardThreshold, rewardType, rewardValue ?? "");

  const offerTextError = validateOfferText(offerText);
  if (offerTextError) {
    return { error: offerTextError, success: false };
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
    reward_type: rewardType,
    reward_value: rewardValue,
    offer_text: offerText,
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
  revalidatePath("/onboarding/offer");

  return { error: null, success: true };
}
