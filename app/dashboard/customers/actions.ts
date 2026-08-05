"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";

export interface CustomerFormState {
  error: string | null;
  customerId: string | null;
}

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
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
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const birthDate = String(formData.get("birth_date") ?? "").trim() || null;

  if (!name || !phone) {
    return { error: "الاسم ورقم الهاتف مطلوبان.", customerId: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({ business_id: business.id, name, phone, email, birth_date: birthDate })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505"
      ? "يوجد عميل مسجّل بهذا الرقم مسبقًا."
      : error.message;
    return { error: message, customerId: null };
  }

  revalidatePath("/dashboard/customers");
  redirect(`/dashboard/customers/${data.id}`);
}
