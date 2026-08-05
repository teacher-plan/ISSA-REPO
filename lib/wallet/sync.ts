import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getActiveProviderSettings, instantiateProvider } from "./provider-registry";
import type { WalletCardData } from "./types";

/**
 * Best-effort sync of one customer's wallet card with the active provider.
 * Called after customer creation and after any point-balance change
 * (06_Wallet_Integration.md section 10). Never throws — callers (server
 * actions) should not fail the user-facing operation just because the
 * wallet provider is unreachable or unconfigured; the failure is recorded
 * on the wallet_cards row instead (section 12's simplified retry: a manual
 * "sync again" action rather than a background job queue, since this stack
 * has no persistent worker).
 */
export async function syncWalletCard(
  businessId: string,
  customerId: string
): Promise<void> {
  const supabase = await createClient();

  const { data: walletCard } = await supabase
    .from("wallet_cards")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!walletCard) return;

  const settingsRow = await getActiveProviderSettings();
  if (!settingsRow) {
    await supabase
      .from("wallet_cards")
      .update({
        sync_status: "failed",
        last_error: "لا يوجد مزوّد محفظة مُفعّل حاليًا.",
      })
      .eq("id", walletCard.id);
    return;
  }
  const provider = instantiateProvider(settingsRow);

  const [{ data: customer }, { data: business }, { data: settings }, { data: program }] =
    await Promise.all([
      supabase.from("customers").select("*").eq("id", customerId).single(),
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase
        .from("business_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("loyalty_programs")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (!customer || !business) return;

  await supabase
    .from("wallet_cards")
    .update({ sync_status: "syncing" })
    .eq("id", walletCard.id);

  const cardData: WalletCardData = {
    walletCardId: walletCard.id,
    business: {
      name: business.name,
      logoUrl: business.logo_url,
      primaryColor: settings?.primary_color ?? "#18181b",
      secondaryColor: settings?.secondary_color ?? "#f4f4f5",
    },
    customer: {
      id: customer.id,
      name: customer.name,
      memberId: customer.id,
    },
    loyalty: {
      points: customer.total_points,
      rewardThreshold: program?.reward_threshold ?? null,
    },
    walletTemplate: {
      programId: settings?.passkit_program_id ?? null,
      tierId: settings?.passkit_tier_id ?? null,
      googleClassId: settings?.google_wallet_class_id ?? null,
    },
  };

  // Each provider needs a different template id, so the "not set up yet"
  // check has to be per-provider — a Google-only shop has no PassKit Program
  // ID and must not be told to go enter one.
  const missingTemplate =
    settingsRow.provider_name === "google"
      ? !cardData.walletTemplate.googleClassId &&
        "لم يتم ربط قالب Google Wallet لهذا المحل بعد. أدخل Class ID في إعدادات المحل."
      : (!cardData.walletTemplate.programId || !cardData.walletTemplate.tierId) &&
        "لم يتم ربط قالب PassKit لهذا المحل بعد. أدخل Program ID وTier ID في إعدادات المحل.";

  if (missingTemplate) {
    await supabase
      .from("wallet_cards")
      .update({ sync_status: "failed", last_error: missingTemplate })
      .eq("id", walletCard.id);
    return;
  }

  try {
    const result = walletCard.external_card_id
      ? await provider.updateCard(walletCard.external_card_id, cardData)
      : await provider.createCard(cardData);

    await supabase
      .from("wallet_cards")
      .update({
        provider_name: settingsRow.provider_name,
        external_card_id: result.externalCardId,
        wallet_url_apple: result.walletUrlApple,
        wallet_url_google: result.walletUrlGoogle,
        platform: result.platform,
        sync_status: walletCard.external_card_id ? "updated" : "active",
        last_error: null,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", walletCard.id);
  } catch (err) {
    await supabase
      .from("wallet_cards")
      .update({
        sync_status: "failed",
        last_error: err instanceof Error ? err.message : "فشل الاتصال بمزوّد المحفظة.",
      })
      .eq("id", walletCard.id);
  }
}
