"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";

export interface RewardFormState {
  error: string | null;
  rewardId: string | null;
}

export async function createReward(
  _prevState: RewardFormState,
  formData: FormData
): Promise<RewardFormState> {
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
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const pointsRequired = Number(formData.get("points_required") ?? 0);
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;

  if (!name) {
    return { error: "اسم المكافأة مطلوب.", rewardId: null };
  }
  if (!Number.isFinite(pointsRequired) || pointsRequired <= 0) {
    return { error: "عدد النقاط المطلوبة يجب أن يكون أكبر من صفر.", rewardId: null };
  }
  if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) {
    return { error: "الكمية يجب أن تكون صفر أو أكبر.", rewardId: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rewards")
    .insert({
      business_id: business.id,
      name,
      description,
      image_url: imageUrl,
      points_required: pointsRequired,
      quantity,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, rewardId: null };
  }

  revalidatePath("/dashboard/rewards");
  redirect(`/dashboard/rewards/${data.id}`);
}
