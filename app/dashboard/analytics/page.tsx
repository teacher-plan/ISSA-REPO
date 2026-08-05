import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getCustomerGrowth,
  getOwnedBusiness,
  getReturnRate,
  getTopCustomers,
  getTopRewards,
} from "@/lib/auth/session";

export default async function AnalyticsPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const [topCustomers, topRewards, growth, returnRate] = await Promise.all([
    getTopCustomers(business.id),
    getTopRewards(business.id),
    getCustomerGrowth(business.id),
    getReturnRate(business.id),
  ]);

  const maxGrowth = Math.max(1, ...growth.map((w) => w.new_customers));

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        التحليلات
      </h1>

      <div className="mt-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">معدل العودة</p>
        <p className="mt-1 text-3xl font-semibold">{returnRate}%</p>
        <p className="mt-1 text-xs text-zinc-500">
          نسبة العملاء الذين زاروا أكثر من مرة
        </p>
      </div>

      <h2 className="mt-10 text-sm font-medium text-zinc-500">نمو العملاء (آخر 8 أسابيع)</h2>
      <div className="mt-3 flex items-end gap-2" style={{ height: "120px" }}>
        {growth.map((week) => (
          <div key={week.week_start} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-zinc-900 dark:bg-zinc-50"
              style={{
                height: `${Math.max(4, Math.round((week.new_customers / maxGrowth) * 100))}px`,
              }}
              title={`${week.new_customers} عميل جديد`}
            />
            <span className="text-[10px] text-zinc-500">{week.new_customers}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-medium text-zinc-500">أكثر العملاء نشاطًا</h2>
      {topCustomers.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">لا يوجد عملاء بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {topCustomers.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
              <Link
                href={`/dashboard/customers/${c.id}`}
                className="hover:underline"
              >
                {c.name}
              </Link>
              <span className="text-zinc-500">
                {c.total_visits} زيارة · {c.total_points} نقطة
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-sm font-medium text-zinc-500">أكثر المكافآت استخدامًا</h2>
      {topRewards.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">لا توجد عمليات استبدال بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {topRewards.map((r) => (
            <li key={r.reward_id} className="flex items-center justify-between py-2.5 text-sm">
              <Link
                href={`/dashboard/rewards/${r.reward_id}`}
                className="hover:underline"
              >
                {r.reward_name}
              </Link>
              <span className="text-zinc-500">{r.redemption_count} استبدال</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
