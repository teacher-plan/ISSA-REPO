import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Business,
  BusinessSettings,
  CustomerGrowthWeek,
  Customer,
  Employee,
  LoyaltyProgram,
  Profile,
  Reward,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  TopReward,
  Transaction,
  WalletCard,
  WalletProviderSettings,
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

export async function getBusinessById(
  businessId: string
): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();

  return data ?? null;
}

export async function getBusinessStats(businessId: string): Promise<{
  customerCount: number;
  pointsDistributed: number;
  rewardsRedeemedCount: number;
  activeWalletCardCount: number;
}> {
  const supabase = await createClient();

  const [
    { count: customerCount },
    { data: earnTx },
    { count: rewardsRedeemedCount },
    { count: activeWalletCardCount },
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
    supabase
      .from("wallet_cards")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .in("sync_status", ["active", "updated"]),
  ]);

  const pointsDistributed = (earnTx ?? []).reduce(
    (sum, tx) => sum + tx.points,
    0
  );

  return {
    customerCount: customerCount ?? 0,
    pointsDistributed,
    rewardsRedeemedCount: rewardsRedeemedCount ?? 0,
    activeWalletCardCount: activeWalletCardCount ?? 0,
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

export async function getWalletCard(
  businessId: string,
  customerId: string
): Promise<WalletCard | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallet_cards")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .maybeSingle();

  return data ?? null;
}

export async function getActiveWalletProviderSettings(): Promise<WalletProviderSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallet_provider_settings")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  return data ?? null;
}

export async function getSubscription(
  businessId: string
): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  return data ?? null;
}

export async function getEffectiveSubscriptionStatus(
  businessId: string
): Promise<SubscriptionStatus | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_effective_subscription_status", {
    p_business_id: businessId,
  });

  return data ?? null;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_omr", { ascending: true });

  return data ?? [];
}

export async function getAllBusinessesWithSubscriptions(): Promise<
  Array<Business & { subscription: Subscription | null }>
> {
  const supabase = await createClient();
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (!businesses) return [];

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .in(
      "business_id",
      businesses.map((b) => b.id)
    );

  const byBusinessId = new Map(
    (subscriptions ?? []).map((s) => [s.business_id, s])
  );

  return businesses.map((b) => ({
    ...b,
    subscription: byBusinessId.get(b.id) ?? null,
  }));
}

export async function getTopCustomers(
  businessId: string,
  limit = 5
): Promise<Customer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("total_visits", { ascending: false })
    .order("total_points", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getTopRewards(
  businessId: string,
  limit = 5
): Promise<TopReward[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_top_rewards", {
    p_business_id: businessId,
    p_limit: limit,
  });

  return data ?? [];
}

export async function getCustomerGrowth(
  businessId: string,
  weeks = 8
): Promise<CustomerGrowthWeek[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_customer_growth", {
    p_business_id: businessId,
    p_weeks: weeks,
  });

  return data ?? [];
}

export async function getReturnRate(businessId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_return_rate", {
    p_business_id: businessId,
  });

  return data ?? 0;
}

export async function getEmployees(businessId: string): Promise<
  Array<Employee & { profile: Pick<Profile, "full_name" | "email"> | null }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("*, profile:profiles(full_name, email)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as Array<
    Employee & { profile: Pick<Profile, "full_name" | "email"> | null }
  >;
}

export async function getEmployeeRecord(
  profileId: string
): Promise<Employee | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  return data ?? null;
}

export async function getBusinessForEmployee(
  profileId: string
): Promise<{ business: Business; employee: Employee } | null> {
  const employee = await getEmployeeRecord(profileId);
  if (!employee) return null;

  const business = await getBusinessById(employee.business_id);
  if (!business) return null;

  return { business, employee };
}
