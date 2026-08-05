"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface ProfileState {
  error: string | null;
  success: boolean;
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!fullName) {
    return { error: "الاسم الكامل مطلوب.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", profile.id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/dashboard/profile");

  return { error: null, success: true };
}
