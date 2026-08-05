import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Business, Profile } from "@/types/database";

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
