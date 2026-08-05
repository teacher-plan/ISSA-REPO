"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { PlanName, SubscriptionStatus } from "@/types/database";

export interface SubscriptionAdminState {
  error: string | null;
  success: boolean;
}

export async function updateBusinessSubscription(
  businessId: string,
  _prevState: SubscriptionAdminState,
  formData: FormData
): Promise<SubscriptionAdminState> {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const planName = String(formData.get("plan_name") ?? "") as PlanName;
  const status = String(formData.get("status") ?? "") as SubscriptionStatus;
  const endDate = String(formData.get("end_date") ?? "").trim() || null;

  if (!["starter", "professional", "enterprise"].includes(planName)) {
    return { error: "خطة غير صحيحة.", success: false };
  }
  if (!["trial", "active", "expired", "cancelled"].includes(status)) {
    return { error: "حالة غير صحيحة.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ plan_name: planName, status, end_date: endDate })
    .eq("business_id", businessId);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/admin/businesses");

  return { error: null, success: true };
}
