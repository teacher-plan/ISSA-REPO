export type UserRole = "admin" | "business_owner" | "employee" | "customer";

export type BusinessStatus = "active" | "trial" | "suspended" | "expired";

export type Profile = {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  currency: string;
  status: BusinessStatus;
  created_at: string;
  updated_at: string;
};

export type BusinessSettings = {
  id: string;
  business_id: string;
  primary_color: string;
  secondary_color: string;
  language: string;
  timezone: string;
  passkit_program_id: string | null;
  passkit_tier_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EarningType = "visit" | "amount";

export type LoyaltyProgram = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  earning_type: EarningType;
  points_per_visit: number;
  points_per_amount: number;
  reward_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  total_points: number;
  total_visits: number;
  created_at: string;
  updated_at: string;
};

export type LoyaltyCardStatus = "active" | "blocked" | "expired";

export type LoyaltyCard = {
  id: string;
  business_id: string;
  customer_id: string;
  card_number: string;
  current_points: number;
  status: LoyaltyCardStatus;
  created_at: string;
  updated_at: string;
};

export type TransactionType = "earn" | "redeem" | "adjustment" | "refund";

export type Transaction = {
  id: string;
  business_id: string;
  customer_id: string;
  employee_id: string | null;
  type: TransactionType;
  points: number;
  description: string | null;
  reward_id: string | null;
  created_at: string;
};

export type Reward = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_required: number;
  quantity: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WalletProviderName = "passkit";

export type WalletProviderSettings = {
  id: string;
  provider_name: WalletProviderName;
  api_key: string;
  api_secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WalletPlatform = "apple" | "google" | "both";

export type WalletCardSyncStatus =
  | "created"
  | "generating"
  | "active"
  | "syncing"
  | "updated"
  | "failed";

export type WalletCard = {
  id: string;
  business_id: string;
  customer_id: string;
  provider_name: string | null;
  external_card_id: string | null;
  wallet_url_apple: string | null;
  wallet_url_google: string | null;
  platform: WalletPlatform | null;
  sync_status: WalletCardSyncStatus;
  last_error: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicCard = {
  business_name: string;
  business_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  customer_name: string;
  current_points: number;
  reward_threshold: number | null;
  wallet_url_apple: string | null;
  wallet_url_google: string | null;
  sync_status: WalletCardSyncStatus;
};

/**
 * Row shape of resolve_wallet_card() — what an employee learns from scanning
 * the QR on a customer's wallet pass. Returns 0 rows when the card belongs to
 * another business, so an unauthorised scan is indistinguishable from an
 * unknown code.
 */
export type ResolvedWalletCard = {
  wallet_card_id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  total_points: number;
  total_visits: number;
  reward_threshold: number | null;
};

export type PlanName = "starter" | "professional" | "enterprise";

export type SubscriptionPlan = {
  plan_name: PlanName;
  display_name: string;
  price_omr: number;
  customer_limit: number | null;
  trial_days: number;
  created_at: string;
  updated_at: string;
};

export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

export type Subscription = {
  id: string;
  business_id: string;
  plan_name: PlanName;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TopReward = {
  reward_id: string;
  reward_name: string;
  redemption_count: number;
};

export type CustomerGrowthWeek = {
  week_start: string;
  new_customers: number;
};

export type EmployeeStatus = "active" | "suspended";

export type EmployeePermissions = {
  add_points: boolean;
  redeem_rewards: boolean;
  manage_customers: boolean;
};

export type Employee = {
  id: string;
  business_id: string;
  profile_id: string;
  permissions: EmployeePermissions;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> &
          Pick<Profile, "auth_id" | "full_name" | "email" | "role">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      businesses: {
        Row: Business;
        Insert: Partial<Business> & Pick<Business, "owner_id" | "name">;
        Update: Partial<Business>;
        Relationships: [];
      };
      business_settings: {
        Row: BusinessSettings;
        Insert: Partial<BusinessSettings> &
          Pick<BusinessSettings, "business_id">;
        Update: Partial<BusinessSettings>;
        Relationships: [];
      };
      loyalty_programs: {
        Row: LoyaltyProgram;
        Insert: Partial<LoyaltyProgram> &
          Pick<LoyaltyProgram, "business_id" | "name">;
        Update: Partial<LoyaltyProgram>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer> &
          Pick<Customer, "business_id" | "name" | "phone">;
        Update: Partial<Customer>;
        Relationships: [];
      };
      loyalty_cards: {
        Row: LoyaltyCard;
        Insert: Partial<LoyaltyCard> &
          Pick<LoyaltyCard, "business_id" | "customer_id">;
        Update: Partial<LoyaltyCard>;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction> &
          Pick<Transaction, "business_id" | "customer_id" | "type" | "points">;
        Update: Partial<Transaction>;
        Relationships: [];
      };
      rewards: {
        Row: Reward;
        Insert: Partial<Reward> &
          Pick<Reward, "business_id" | "name" | "points_required">;
        Update: Partial<Reward>;
        Relationships: [];
      };
      wallet_provider_settings: {
        Row: WalletProviderSettings;
        Insert: Partial<WalletProviderSettings> &
          Pick<WalletProviderSettings, "provider_name" | "api_key" | "api_secret">;
        Update: Partial<WalletProviderSettings>;
        Relationships: [];
      };
      wallet_cards: {
        Row: WalletCard;
        Insert: Partial<WalletCard> &
          Pick<WalletCard, "business_id" | "customer_id">;
        Update: Partial<WalletCard>;
        Relationships: [];
      };
      employees: {
        Row: Employee;
        Insert: Partial<Employee> & Pick<Employee, "business_id" | "profile_id">;
        Update: Partial<Employee>;
        Relationships: [];
      };
      subscription_plans: {
        Row: SubscriptionPlan;
        Insert: Partial<SubscriptionPlan> & Pick<SubscriptionPlan, "plan_name" | "display_name">;
        Update: Partial<SubscriptionPlan>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & Pick<Subscription, "business_id" | "plan_name">;
        Update: Partial<Subscription>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_effective_subscription_status: {
        Args: { p_business_id: string };
        Returns: SubscriptionStatus;
      };
      record_points_transaction: {
        Args: {
          p_business_id: string;
          p_customer_id: string;
          p_type: TransactionType;
          p_points: number;
          p_description?: string | null;
          p_reward_id?: string | null;
        };
        Returns: Transaction;
      };
      redeem_reward: {
        Args: {
          p_business_id: string;
          p_customer_id: string;
          p_reward_id: string;
        };
        Returns: Transaction;
      };
      get_public_card: {
        Args: { p_wallet_card_id: string };
        Returns: PublicCard[];
      };
      resolve_wallet_card: {
        Args: { p_wallet_card_id: string };
        Returns: ResolvedWalletCard[];
      };
      get_top_rewards: {
        Args: { p_business_id: string; p_limit?: number };
        Returns: TopReward[];
      };
      get_customer_growth: {
        Args: { p_business_id: string; p_weeks?: number };
        Returns: CustomerGrowthWeek[];
      };
      get_return_rate: {
        Args: { p_business_id: string };
        Returns: number;
      };
    };
  };
};
