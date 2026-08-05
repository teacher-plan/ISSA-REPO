import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getBusinessStats,
  getEffectiveSubscriptionStatus,
  getOwnedBusiness,
  getSubscription,
  getSubscriptionPlans,
} from "@/lib/auth/session";

const STATUS_LABELS: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  expired: "منتهي",
  cancelled: "ملغى",
};

const STATUS_COLORS: Record<string, string> = {
  trial: "text-amber-600",
  active: "text-emerald-600",
  expired: "text-red-600",
  cancelled: "text-zinc-500",
};

export default async function SubscriptionPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const [subscription, effectiveStatus, plans, stats] = await Promise.all([
    getSubscription(business.id),
    getEffectiveSubscriptionStatus(business.id),
    getSubscriptionPlans(),
    getBusinessStats(business.id),
  ]);

  const currentPlan = plans.find((p) => p.plan_name === subscription?.plan_name);
  const daysLeft =
    subscription?.end_date && effectiveStatus === "trial"
      ? Math.max(
          0,
          Math.ceil(
            (new Date(subscription.end_date).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        الاشتراك
      </h1>

      {subscription && currentPlan ? (
        <div className="mt-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium">{currentPlan.display_name}</p>
            <span className={STATUS_COLORS[effectiveStatus ?? ""] ?? ""}>
              {STATUS_LABELS[effectiveStatus ?? ""] ?? effectiveStatus}
            </span>
          </div>

          {daysLeft !== null && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {daysLeft > 0
                ? `تنتهي الفترة التجريبية بعد ${daysLeft} يوم.`
                : "انتهت الفترة التجريبية."}
            </p>
          )}

          {effectiveStatus === "expired" && (
            <p className="mt-2 text-sm text-red-600">
              انتهى اشتراكك. تواصل معنا للترقية والمتابعة في استخدام المنصة.
            </p>
          )}

          <div className="mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              العملاء: {stats.customerCount} /{" "}
              {currentPlan.customer_limit ?? "غير محدود"}
            </p>
            {currentPlan.customer_limit && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                  style={{
                    width: `${Math.min(100, Math.round((stats.customerCount / currentPlan.customer_limit) * 100))}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-zinc-500">لا يوجد اشتراك مسجّل.</p>
      )}

      <h2 className="mt-10 text-sm font-medium text-zinc-500">الخطط المتاحة</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.plan_name}
            className={`rounded-lg border p-4 ${
              plan.plan_name === subscription?.plan_name
                ? "border-zinc-900 dark:border-zinc-50"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <p className="font-medium">{plan.display_name}</p>
            <p className="mt-1 text-2xl font-semibold">
              {plan.price_omr} <span className="text-sm font-normal">ر.ع/شهر</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              حتى {plan.customer_limit ?? "غير محدود"} عميل
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        للترقية أو تغيير الخطة، تواصل مع فريق الدعم.
      </p>
    </div>
  );
}
