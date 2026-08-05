"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { instantiateProvider } from "@/lib/wallet/provider-registry";
import type { WalletProviderName } from "@/types/database";

export interface WalletProviderState {
  error: string | null;
  success: boolean;
  testResult: { ok: boolean; message: string } | null;
}

async function requireAdmin() {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }
  return profile;
}

export async function saveWalletProvider(
  _prevState: WalletProviderState,
  formData: FormData
): Promise<WalletProviderState> {
  await requireAdmin();

  const providerName = String(
    formData.get("provider_name") ?? "passkit"
  ) as WalletProviderName;
  const apiKey = String(formData.get("api_key") ?? "").trim();
  const apiSecret = String(formData.get("api_secret") ?? "").trim();

  if (!apiKey || !apiSecret) {
    return {
      error: "مفتاح API والسر مطلوبان.",
      success: false,
      testResult: null,
    };
  }

  const supabase = await createClient();

  // Only one active provider at a time — deactivate any existing before
  // inserting the new one (see wallet_provider_settings_one_active index).
  await supabase
    .from("wallet_provider_settings")
    .update({ is_active: false })
    .eq("is_active", true);

  const { error } = await supabase.from("wallet_provider_settings").insert({
    provider_name: providerName,
    api_key: apiKey,
    api_secret: apiSecret,
    is_active: true,
  });

  if (error) {
    return { error: error.message, success: false, testResult: null };
  }

  revalidatePath("/admin/wallet-provider");

  return { error: null, success: true, testResult: null };
}

export async function testWalletConnection(
  _prevState: WalletProviderState,
  _formData: FormData
): Promise<WalletProviderState> {
  await requireAdmin();

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("wallet_provider_settings")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (!settings) {
    return {
      error: null,
      success: false,
      testResult: { ok: false, message: "لا يوجد مزوّد مُفعّل حاليًا." },
    };
  }

  try {
    const provider = instantiateProvider(settings);
    const result = await provider.testConnection();
    return { error: null, success: false, testResult: result };
  } catch (err) {
    return {
      error: null,
      success: false,
      testResult: {
        ok: false,
        message: err instanceof Error ? err.message : "فشل الاتصال.",
      },
    };
  }
}

export async function deactivateWalletProvider(): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  await supabase
    .from("wallet_provider_settings")
    .update({ is_active: false })
    .eq("is_active", true);

  revalidatePath("/admin/wallet-provider");
}
