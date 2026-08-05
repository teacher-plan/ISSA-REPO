"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCustomer, getOwnedBusiness } from "@/lib/auth/session";
import type { TransactionType } from "@/types/database";

export interface CustomerActionState {
  error: string | null;
  success: boolean;
}

async function requireOwnerAndCustomer(customerId: string) {
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

  const customer = await getCustomer(business.id, customerId);
  if (!customer) {
    redirect("/dashboard/customers");
  }

  return { business, customer };
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const { business } = await requireOwnerAndCustomer(customerId);

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const birthDate = String(formData.get("birth_date") ?? "").trim() || null;

  if (!name || !phone) {
    return { error: "الاسم ورقم الهاتف مطلوبان.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({ name, phone, email, birth_date: birthDate })
    .eq("id", customerId)
    .eq("business_id", business.id);

  if (error) {
    const message = error.code === "23505"
      ? "يوجد عميل آخر مسجّل بهذا الرقم."
      : error.message;
    return { error: message, success: false };
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath("/dashboard/customers");

  return { error: null, success: true };
}

export async function addPointsTransaction(
  customerId: string,
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const { business } = await requireOwnerAndCustomer(customerId);

  const type = String(formData.get("type") ?? "earn") as TransactionType;
  const points = Number(formData.get("points") ?? 0);
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!["earn", "redeem", "adjustment", "refund"].includes(type)) {
    return { error: "نوع العملية غير صحيح.", success: false };
  }
  if (!Number.isFinite(points) || points <= 0) {
    return { error: "عدد النقاط يجب أن يكون أكبر من صفر.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_points_transaction", {
    p_business_id: business.id,
    p_customer_id: customerId,
    p_type: type,
    p_points: points,
    p_description: description,
  });

  if (error) {
    const message = error.message.includes("throttled")
      ? "تم تسجيل عملية مماثلة قبل قليل، الرجاء الانتظار ثم المحاولة مرة أخرى."
      : error.message;
    return { error: message, success: false };
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

export async function redeemRewardForCustomer(
  customerId: string,
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const { business } = await requireOwnerAndCustomer(customerId);

  const rewardId = String(formData.get("reward_id") ?? "");
  if (!rewardId) {
    return { error: "اختر مكافأة.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_reward", {
    p_business_id: business.id,
    p_customer_id: customerId,
    p_reward_id: rewardId,
  });

  if (error) {
    const message = error.message.includes("throttled")
      ? "تم تسجيل عملية مماثلة قبل قليل، الرجاء الانتظار ثم المحاولة مرة أخرى."
      : error.message.includes("not enough points")
        ? "لا يملك العميل نقاطًا كافية لهذه المكافأة."
        : error.message.includes("out of stock")
          ? "المكافأة غير متوفرة حاليًا."
          : error.message;
    return { error: message, success: false };
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath("/dashboard/rewards");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
