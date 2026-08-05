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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
