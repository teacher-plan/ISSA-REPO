import "server-only";
import { getOwnedBusiness } from "@/lib/auth/session";
import type { Profile } from "@/types/database";

export async function redirectPathForProfile(profile: Profile) {
  switch (profile.role) {
    case "admin":
      return "/admin";
    case "business_owner": {
      const business = await getOwnedBusiness(profile.id);
      return business ? "/dashboard" : "/onboarding/business";
    }
    case "employee":
      return "/employee";
    case "customer":
    default:
      return "/dashboard";
  }
}
