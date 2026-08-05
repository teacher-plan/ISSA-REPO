import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Business,
  BusinessSettings,
  LoyaltyProgram,
  Profile,
} from "@/types/database";

export async function getCurrentUser(): Promise<{
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  return { profile: profile ?? null };
}

export async function getOwnedBusiness(
  profileId: string
): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", profileId)
    .maybeSingle();

  return data ?? null;
}

export async function getBusinessStats(businessId: string): Promise<{
  customerCount: number;
  pointsDistributed: number;
}> {
  const supabase = await createClient();

  const [{ count: customerCount }, { data: earnTx }] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("transactions")
      .select("points")
      .eq("business_id", businessId)
      .eq("type", "earn"),
  ]);

  const pointsDistributed = (earnTx ?? []).reduce(
    (sum, tx) => sum + tx.points,
    0
  );

  return { customerCount: customerCount ?? 0, pointsDistributed };
}

export async function getLoyaltyProgram(
  businessId: string
): Promise<LoyaltyProgram | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle();

  return data ?? null;
}

export async function getBusinessSettings(
  businessId: string
): Promise<BusinessSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  return data ?? null;
}
