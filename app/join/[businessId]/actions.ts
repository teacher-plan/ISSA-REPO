"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface JoinState {
  error: string | null;
}

const KNOWN_PREFIX =
  /^(invalid_input|business_not_found|subscription_inactive|customer_limit_reached):\s*/;

export async function joinBusiness(
  businessId: string,
  _prevState: JoinState,
  formData: FormData
): Promise<JoinState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) {
    return { error: "الاسم ورقم الهاتف مطلوبان." };
  }

  // No session on this path — the visitor is an anonymous customer, not a
  // logged-in owner or employee. public_join_business() is what makes this
  // safe: it is the only thing granted to the anon role, re-validates the
  // business exists, and re-checks the same plan-limit/subscription trigger
  // an owner-created customer goes through.
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("public_join_business", {
      p_business_id: businessId,
      p_name: name,
      p_phone: phone,
    })
    .maybeSingle();

  if (error) {
    const message = KNOWN_PREFIX.test(error.message)
      ? error.message.replace(KNOWN_PREFIX, "")
      : "تعذّر إتمام الانضمام. حاول مرة أخرى.";
    return { error: message };
  }

  if (!data?.wallet_card_id) {
    return { error: "تعذّر إتمام الانضمام. حاول مرة أخرى." };
  }

  redirect(`/c/${data.wallet_card_id}`);
}
