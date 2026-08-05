"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForEmployee, getCurrentUser } from "@/lib/auth/session";

export interface EmployeeActionState {
  error: string | null;
  success: boolean;
}

async function requireActiveEmployee() {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "employee") {
    redirect("/dashboard");
  }

  const record = await getBusinessForEmployee(profile.id);
  if (!record || record.employee.status !== "active") {
    redirect("/auth/login");
  }

  return record;
}

export async function addPointsAsEmployee(
  customerId: string,
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.add_points) {
    return { error: "لا تملك صلاحية إضافة النقاط.", success: false };
  }

  const points = Number(formData.get("points") ?? 0);
  if (!Number.isFinite(points) || points <= 0) {
    return { error: "عدد النقاط يجب أن يكون أكبر من صفر.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_points_transaction", {
    p_business_id: business.id,
    p_customer_id: customerId,
    p_type: "earn",
    p_points: points,
  });

  if (error) {
    const message = error.message.includes("throttled")
      ? "تم تسجيل عملية مماثلة قبل قليل، الرجاء الانتظار ثم المحاولة مرة أخرى."
      : error.message;
    return { error: message, success: false };
  }

  revalidatePath("/employee");

  return { error: null, success: true };
}

export interface CreateCustomerState {
  error: string | null;
  customerId: string | null;
}

export async function createCustomerAsEmployee(
  _prevState: CreateCustomerState,
  formData: FormData
): Promise<CreateCustomerState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.manage_customers) {
    return { error: "لا تملك صلاحية إضافة عملاء.", customerId: null };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) {
    return { error: "الاسم ورقم الهاتف مطلوبان.", customerId: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({ business_id: business.id, name, phone })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505"
      ? "يوجد عميل مسجّل بهذا الرقم مسبقًا."
      : error.message.replace(/^(subscription_inactive|customer_limit_reached):\s*/, "");
    return { error: message, customerId: null };
  }

  revalidatePath("/employee");

  return { error: null, customerId: data.id };
}

export async function redeemRewardAsEmployee(
  customerId: string,
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.redeem_rewards) {
    return { error: "لا تملك صلاحية استبدال المكافآت.", success: false };
  }

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

  revalidatePath("/employee");

  return { error: null, success: true };
}
