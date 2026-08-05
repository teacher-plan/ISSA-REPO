import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getCustomerByPhone,
  getLoyaltyProgram,
  getOwnedBusiness,
  getRewards,
} from "@/lib/auth/session";
import { AddPointsForm } from "../customers/[id]/points-form";
import { RedeemRewardForm } from "../customers/[id]/redeem-form";

export default async function QuickAddPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const { phone } = await searchParams;
  const customer = phone ? await getCustomerByPhone(business.id, phone) : null;
  const program = await getLoyaltyProgram(business.id);
  const rewards = customer
    ? await getRewards(business.id, { activeOnly: true })
    : [];

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        وضع الموظف السريع
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        ابحث برقم هاتف العميل لإضافة نقاط بسرعة.
      </p>

      <form className="mt-6 flex gap-2" action="/dashboard/quick-add" method="get">
        <input
          type="tel"
          name="phone"
          defaultValue={phone ?? ""}
          required
          placeholder="رقم الهاتف"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          بحث
        </button>
      </form>

      {phone && !customer && (
        <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <p>لا يوجد عميل بهذا الرقم.</p>
          <Link
            href={`/dashboard/customers/new?phone=${encodeURIComponent(phone)}`}
            className="mt-2 inline-block font-medium underline"
          >
            إضافة عميل جديد بهذا الرقم
          </Link>
        </div>
      )}

      {customer && (
        <div className="mt-6">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div>
              <p className="font-medium">{customer.name}</p>
              <p className="text-xs text-zinc-500" dir="ltr">
                {customer.phone}
              </p>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {customer.total_points} نقطة
            </p>
          </div>

          <AddPointsForm customerId={customer.id} program={program} />

          <h2 className="mt-6 text-sm font-medium text-zinc-500">استبدال مكافأة</h2>
          <RedeemRewardForm
            customerId={customer.id}
            rewards={rewards}
            customerPoints={customer.total_points}
          />

          <Link
            href={`/dashboard/customers/${customer.id}`}
            className="mt-4 inline-block text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            عرض الملف الكامل وسجل العمليات
          </Link>
        </div>
      )}
    </div>
  );
}
