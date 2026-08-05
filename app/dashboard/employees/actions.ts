"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";

export interface EmployeeFormState {
  error: string | null;
  success: boolean;
}

async function requireOwnerBusiness() {
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

  return business;
}

export async function createEmployee(
  _prevState: EmployeeFormState,
  formData: FormData
): Promise<EmployeeFormState> {
  const business = await requireOwnerBusiness();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const addPoints = formData.get("add_points") === "on";
  const redeemRewards = formData.get("redeem_rewards") === "on";
  const manageCustomers = formData.get("manage_customers") === "on";

  if (!fullName || !email || !password) {
    return { error: "الاسم والبريد وكلمة المرور مطلوبة.", success: false };
  }
  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل.", success: false };
  }

  const serviceClient = createServiceClient();

  const { data: authData, error: authError } =
    await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "employee" },
    });

  if (authError || !authData.user) {
    const message = authError?.message.includes("already been registered")
      ? "يوجد حساب مسجّل بهذا البريد مسبقًا."
      : authError?.message ?? "تعذّر إنشاء الحساب.";
    return { error: message, success: false };
  }

  // handle_new_user() (0001_init.sql) already created the profiles row from
  // the auth user's metadata — fetch it to link the employees row. Must use
  // the service client: profiles RLS is `auth_id = auth.uid()`, so the
  // owner's own session can never see another user's profile row, even one
  // they just created via the Admin API.
  const { data: profile } = await createServiceClient()
    .from("profiles")
    .select("id")
    .eq("auth_id", authData.user.id)
    .single();

  if (!profile) {
    return { error: "تعذّر ربط الحساب بالموظف.", success: false };
  }

  const supabase = await createClient();

  const { error: employeeError } = await supabase.from("employees").insert({
    business_id: business.id,
    profile_id: profile.id,
    permissions: {
      add_points: addPoints,
      redeem_rewards: redeemRewards,
      manage_customers: manageCustomers,
    },
  });

  if (employeeError) {
    // Roll back the auth user so a failed employee row doesn't leave an
    // orphaned, unusable login behind.
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    return { error: employeeError.message, success: false };
  }

  revalidatePath("/dashboard/employees");

  return { error: null, success: true };
}

export async function setEmployeeStatus(
  employeeId: string,
  status: "active" | "suspended"
): Promise<void> {
  const business = await requireOwnerBusiness();

  const supabase = await createClient();
  await supabase
    .from("employees")
    .update({ status })
    .eq("id", employeeId)
    .eq("business_id", business.id);

  revalidatePath("/dashboard/employees");
}
