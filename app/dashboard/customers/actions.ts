"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";
import { syncWalletCard } from "@/lib/wallet/sync";

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
      : error.message.replace(/^(subscription_inactive|customer_limit_reached):\s*/, "");
    return { error: message, customerId: null };
  }

  revalidatePath("/dashboard/customers");

  // The on_customer_created trigger already provisioned a wallet_cards row
  // in 'created' state; attempt an immediate sync so the Add-to-Wallet link
  // is ready without the owner needing a manual retry (best-effort — never
  // blocks customer creation on a wallet-provider failure).
  await syncWalletCard(business.id, data.id);

  redirect(`/dashboard/customers/${data.id}`);
}
