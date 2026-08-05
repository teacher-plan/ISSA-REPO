import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { GoogleWalletProvider } from "./providers/google";
import { PassKitProvider } from "./providers/passkit";
import type { WalletProvider } from "./types";
import type { WalletProviderSettings } from "@/types/database";

/**
 * Reads wallet_provider_settings via the service-role client, not the
 * request-scoped one — this is called from lib/wallet/sync.ts inside
 * business_owner server actions, and the table's RLS intentionally
 * restricts direct reads to admin (see lib/supabase/service.ts).
 */
export async function getActiveProviderSettings(): Promise<WalletProviderSettings | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("wallet_provider_settings")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  return data ?? null;
}

export function instantiateProvider(
  settings: WalletProviderSettings
): WalletProvider {
  switch (settings.provider_name) {
    case "passkit":
      return new PassKitProvider(settings.api_key, settings.api_secret);
    // Google reuses the same two columns: api_key holds the Issuer ID, and
    // api_secret the service-account JSON. Adding provider-specific columns
    // would mean a schema change per provider, which is exactly what the
    // WalletProvider interface exists to avoid.
    case "google":
      return new GoogleWalletProvider(settings.api_key, settings.api_secret);
    default:
      throw new Error(`Unknown wallet provider: ${settings.provider_name}`);
  }
}

export async function getActiveProvider(): Promise<WalletProvider | null> {
  const settings = await getActiveProviderSettings();
  if (!settings) return null;
  return instantiateProvider(settings);
}
