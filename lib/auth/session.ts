import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Business,
  BusinessSettings,
  Customer,
  LoyaltyProgram,
  Profile,
  Reward,
  Transaction,
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
  rewardsRedeemedCount: number;
}> {
  const supabase = await createClient();

  const [
    { count: customerCount },
    { data: earnTx },
    { count: rewardsRedeemedCount },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("transactions")
      .select("points")
      .eq("business_id", businessId)
      .eq("type", "earn"),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .not("reward_id", "is", null),
  ]);

  const pointsDistributed = (earnTx ?? []).reduce(
    (sum, tx) => sum + tx.points,
    0
  );

  return {
    customerCount: customerCount ?? 0,
    pointsDistributed,
    rewardsRedeemedCount: rewardsRedeemedCount ?? 0,
  };
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

export async function getCustomers(
  businessId: string,
  search?: string
): Promise<Customer[]> {
  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (search) {
    const safe = search.replace(/[,()%*]/g, "");
    query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getCustomerByPhone(
  businessId: string,
  phone: string
): Promise<Customer | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("phone", phone)
    .maybeSingle();

  return data ?? null;
}

export async function getCustomer(
  businessId: string,
  customerId: string
): Promise<Customer | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("id", customerId)
    .maybeSingle();

  return data ?? null;
}

export async function getCustomerTransactions(
  customerId: string
): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getRewards(
  businessId: string,
  { activeOnly = false }: { activeOnly?: boolean } = {}
): Promise<Reward[]> {
  const supabase = await createClient();
  let query = supabase
    .from("rewards")
    .select("*")
    .eq("business_id", businessId)
    .order("points_required", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getReward(
  businessId: string,
  rewardId: string
): Promise<Reward | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rewards")
    .select("*")
    .eq("business_id", businessId)
    .eq("id", rewardId)
    .maybeSingle();

  return data ?? null;
}
