"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForEmployee, getCurrentUser, getWalletCard } from "@/lib/auth/session";
import { parseScanToken } from "@/lib/wallet/scan-token";
import { renderCardQrSvg } from "@/lib/wallet/qr";

export interface EmployeeActionState {
  error: string | null;
  success: boolean;
}

async function requireActiveEmployee() {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "employee") {
    redirect("/dashboard");
  }

  const record = await getBusinessForEmployee(profile.id);
  if (!record || record.employee.status !== "active") {
    redirect("/auth/login");
  }

  return record;
}

export async function addPointsAsEmployee(
  customerId: string,
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.add_points) {
    return { error: "لا تملك صلاحية إضافة النقاط.", success: false };
  }

  const points = Number(formData.get("points") ?? 0);
  if (!Number.isFinite(points) || points <= 0) {
    return { error: "عدد النقاط يجب أن يكون أكبر من صفر.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_points_transaction", {
    p_business_id: business.id,
    p_customer_id: customerId,
    p_type: "earn",
    p_points: points,
  });

  if (error) {
    const message = error.message.includes("card_expired:")
      ? error.message.replace(/^card_expired:\s*/, "")
      : error.message.includes("throttled")
        ? "تم تسجيل عملية مماثلة قبل قليل، الرجاء الانتظار ثم المحاولة مرة أخرى."
        : error.message;
    return { error: message, success: false };
  }

  revalidatePath("/employee");

  return { error: null, success: true };
}

export interface ScannedCard {
  walletCardId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalPoints: number;
  totalVisits: number;
  rewardThreshold: number | null;
}

export interface ScanState {
  error: string | null;
  card: ScannedCard | null;
}

/**
 * Turns a scanned QR payload into the customer behind it.
 *
 * resolve_wallet_card() returns no rows both for an unknown code and for a
 * card belonging to another business, and this deliberately reports the same
 * message for each — otherwise an employee could probe which UUIDs are live
 * cards at a competing shop.
 */
export async function resolveScannedCard(rawToken: string): Promise<ScanState> {
  await requireActiveEmployee();

  const token = parseScanToken(rawToken);
  if (!token) {
    return { error: "الرمز غير صالح.", card: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("resolve_wallet_card", { p_wallet_card_id: token })
    .maybeSingle();

  if (error) {
    return { error: error.message, card: null };
  }
  if (!data) {
    return { error: "بطاقة غير معروفة أو ليست لهذا المحل.", card: null };
  }

  return {
    error: null,
    card: {
      walletCardId: data.wallet_card_id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      totalPoints: data.total_points,
      totalVisits: data.total_visits,
      rewardThreshold: data.reward_threshold,
    },
  };
}

export interface ScanEarnState {
  error: string | null;
  awarded: number | null;
  newTotal: number | null;
}

/**
 * The whole point of the scanner: resolve the code and award points in one
 * round trip, so the employee taps once.
 *
 * The card is re-resolved server-side rather than trusting a customerId sent
 * from the browser — the client could otherwise post any id it liked.
 */
export async function awardPointsByScan(
  rawToken: string,
  points: number
): Promise<ScanEarnState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.add_points) {
    return { error: "لا تملك صلاحية إضافة النقاط.", awarded: null, newTotal: null };
  }

  if (!Number.isFinite(points) || points <= 0) {
    return { error: "عدد النقاط يجب أن يكون أكبر من صفر.", awarded: null, newTotal: null };
  }

  const resolved = await resolveScannedCard(rawToken);
  if (resolved.error || !resolved.card) {
    return { error: resolved.error ?? "بطاقة غير معروفة.", awarded: null, newTotal: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_points_transaction", {
    p_business_id: business.id,
    p_customer_id: resolved.card.customerId,
    p_type: "earn",
    p_points: points,
    p_description: "مسح رمز البطاقة",
  });

  if (error) {
    const message = error.message.includes("card_expired:")
      ? error.message.replace(/^card_expired:\s*/, "")
      : error.message.includes("throttled")
        ? "تم تسجيل نقاط لهذا العميل قبل قليل. انتظر قليلًا ثم أعد المسح."
        : error.message;
    return { error: message, awarded: null, newTotal: null };
  }

  revalidatePath("/employee");

  return {
    error: null,
    awarded: points,
    newTotal: resolved.card.totalPoints + points,
  };
}

export interface CreateCustomerState {
  error: string | null;
  customerId: string | null;
  /** The new customer's own scan code, so the employee can hand it over on
   * the spot — without this, adding a customer left the employee with
   * nothing to actually give them. Null only if the wallet card row (auto-
   * provisioned by the on_customer_created trigger) hasn't landed yet. */
  qrSvg: string | null;
  cardUrl: string | null;
}

export async function createCustomerAsEmployee(
  _prevState: CreateCustomerState,
  formData: FormData
): Promise<CreateCustomerState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.manage_customers) {
    return { error: "لا تملك صلاحية إضافة عملاء.", customerId: null, qrSvg: null, cardUrl: null };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) {
    return { error: "الاسم ورقم الهاتف مطلوبان.", customerId: null, qrSvg: null, cardUrl: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({ business_id: business.id, name, phone })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505"
      ? "يوجد عميل مسجّل بهذا الرقم مسبقًا."
      : error.message.replace(/^(subscription_inactive|customer_limit_reached):\s*/, "");
    return { error: message, customerId: null, qrSvg: null, cardUrl: null };
  }

  revalidatePath("/employee");

  // The on_customer_created trigger provisions the wallet_cards row in the
  // same transaction as the insert above, so it is already there to read.
  const walletCard = await getWalletCard(business.id, data.id);
  const qrSvg = walletCard ? await renderCardQrSvg(walletCard.id) : null;
  const cardUrl = walletCard ? `/c/${walletCard.id}` : null;

  return { error: null, customerId: data.id, qrSvg, cardUrl };
}

export async function redeemRewardAsEmployee(
  customerId: string,
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const { business, employee } = await requireActiveEmployee();

  if (!employee.permissions.redeem_rewards) {
    return { error: "لا تملك صلاحية استبدال المكافآت.", success: false };
  }

  const rewardId = String(formData.get("reward_id") ?? "");
  if (!rewardId) {
    return { error: "اختر مكافأة.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_reward", {
    p_business_id: business.id,
    p_customer_id: customerId,
    p_reward_id: rewardId,
  });

  if (error) {
    const message = error.message.includes("throttled")
      ? "تم تسجيل عملية مماثلة قبل قليل، الرجاء الانتظار ثم المحاولة مرة أخرى."
      : error.message.includes("not enough points")
        ? "لا يملك العميل نقاطًا كافية لهذه المكافأة."
        : error.message.includes("out of stock")
          ? "المكافأة غير متوفرة حاليًا."
          : error.message;
    return { error: message, success: false };
  }

  revalidatePath("/employee");

  return { error: null, success: true };
}
