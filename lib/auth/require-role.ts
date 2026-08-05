import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { redirectPathForProfile } from "@/lib/auth/redirect-for-role";
import type { Profile, UserRole } from "@/types/database";

export async function requireRole(...roles: UserRole[]): Promise<Profile> {
  const { profile } = await getCurrentUser();

  if (!profile) {
    redirect("/auth/login");
  }
  if (!roles.includes(profile.role)) {
    redirect(await redirectPathForProfile(profile));
  }

  return profile;
}
