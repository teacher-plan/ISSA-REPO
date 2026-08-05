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
  created_at: string;
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
    };
    Views: Record<string, never>;
    Functions: {
      record_points_transaction: {
        Args: {
          p_business_id: string;
          p_customer_id: string;
          p_type: TransactionType;
          p_points: number;
          p_description?: string | null;
        };
        Returns: Transaction;
      };
    };
  };
};
