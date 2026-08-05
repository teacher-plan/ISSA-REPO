"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness, getReward } from "@/lib/auth/session";

export interface RewardActionState {
  error: string | null;
  success: boolean;
}

async function requireOwnerAndReward(rewardId: string) {
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

  const reward = await getReward(business.id, rewardId);
  if (!reward) {
    redirect("/dashboard/rewards");
  }

  return { business, reward };
}

export async function updateReward(
  rewardId: string,
  _prevState: RewardActionState,
  formData: FormData
): Promise<RewardActionState> {
  const { business } = await requireOwnerAndReward(rewardId);

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const pointsRequired = Number(formData.get("points_required") ?? 0);
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  const isActive = formData.get("is_active") === "on";

  if (!name) {
    return { error: "اسم المكافأة مطلوب.", success: false };
  }
  if (!Number.isFinite(pointsRequired) || pointsRequired <= 0) {
    return { error: "عدد النقاط المطلوبة يجب أن يكون أكبر من صفر.", success: false };
  }
  if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) {
    return { error: "الكمية يجب أن تكون صفر أو أكبر.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("rewards")
    .update({
      name,
      description,
      image_url: imageUrl,
      points_required: pointsRequired,
      quantity,
      is_active: isActive,
    })
    .eq("id", rewardId)
    .eq("business_id", business.id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath(`/dashboard/rewards/${rewardId}`);
  revalidatePath("/dashboard/rewards");

  return { error: null, success: true };
}

export async function deleteReward(rewardId: string): Promise<void> {
  const { business } = await requireOwnerAndReward(rewardId);

  const supabase = await createClient();
  await supabase
    .from("rewards")
    .delete()
    .eq("id", rewardId)
    .eq("business_id", business.id);

  revalidatePath("/dashboard/rewards");
  redirect("/dashboard/rewards");
}
