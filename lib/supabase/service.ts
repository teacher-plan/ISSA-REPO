import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client — bypasses RLS entirely. Never import this outside a
 * narrow, specific server-only need (never in a page/component, never
 * exposed to the browser). Currently used only by
 * lib/wallet/provider-registry.ts to read wallet_provider_settings: that
 * table's RLS restricts reads to the admin role, but the wallet sync itself
 * runs inside a business_owner's server action and legitimately needs the
 * platform-wide provider config without being able to read the table
 * directly (which would leak the API secret to any authenticated browser
 * session via supabase-js).
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
