import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client — bypasses RLS entirely, and unlocks the Auth Admin
 * API (createUser/deleteUser etc., which no anon/authenticated key can
 * call). Never import this outside a narrow, specific server-only need
 * (never in a page/component, never exposed to the browser). Current uses:
 *
 * - lib/wallet/provider-registry.ts: reads wallet_provider_settings, whose
 *   RLS restricts reads to admin, from inside a business_owner's server
 *   action (which legitimately needs the platform-wide provider config
 *   without being able to read the table directly and leak the API secret).
 * - app/dashboard/employees/actions.ts: auth.admin.createUser() /
 *   deleteUser() to provision/remove an employee's login — regular signUp()
 *   would create a session for the new user and log the owner out of
 *   their own; only the Admin API can create another user's account
 *   without doing that.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
