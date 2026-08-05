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
  trial: "text-accent-600",
  active: "text-success-600",
  expired: "text-error-600",
  cancelled: "text-primary-500",
};

/**
 * Whole days remaining in a trial, floored at 0.
 *
 * Lives outside the component because react-hooks/purity forbids calling
 * Date.now() in a render body. This page is an async Server Component that
 * runs once per request, so reading the clock is safe here — but keeping it in
 * a plain helper documents that and keeps the rule honest for the components
 * where it genuinely matters.
 */
function trialDaysLeft(endDate: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / msPerDay));
}

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
      ? trialDaysLeft(subscription.end_date)
      : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-primary-900 dark:text-primary-50">
        الاشتراك
      </h1>

      {subscription && currentPlan ? (
        <div className="mt-6 rounded-lg border border-primary-200 p-5 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium">{currentPlan.display_name}</p>
            <span className={STATUS_COLORS[effectiveStatus ?? ""] ?? ""}>
              {STATUS_LABELS[effectiveStatus ?? ""] ?? effectiveStatus}
            </span>
          </div>

          {daysLeft !== null && (
            <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
              {daysLeft > 0
                ? `تنتهي الفترة التجريبية بعد ${daysLeft} يوم.`
                : "انتهت الفترة التجريبية."}
            </p>
          )}

          {effectiveStatus === "expired" && (
            <p className="mt-2 text-sm text-error-600">
              انتهى اشتراكك. تواصل معنا للترقية والمتابعة في استخدام المنصة.
            </p>
          )}

          <div className="mt-4">
            <p className="text-sm text-primary-600 dark:text-primary-400">
              العملاء: {stats.customerCount} /{" "}
              {currentPlan.customer_limit ?? "غير محدود"}
            </p>
            {currentPlan.customer_limit && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary-200 dark:bg-primary-800">
                <div
                  className="h-full rounded-full bg-primary-900 dark:bg-primary-50"
                  style={{
                    width: `${Math.min(100, Math.round((stats.customerCount / currentPlan.customer_limit) * 100))}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-primary-500">لا يوجد اشتراك مسجّل.</p>
      )}

      <h2 className="mt-10 text-sm font-medium text-primary-500">الخطط المتاحة</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.plan_name}
            className={`rounded-lg border p-4 ${
              plan.plan_name === subscription?.plan_name
                ? "border-primary-900 dark:border-primary-50"
                : "border-primary-200 dark:border-primary-800"
            }`}
          >
            <p className="font-medium">{plan.display_name}</p>
            <p className="mt-1 text-2xl font-semibold">
              {plan.price_omr} <span className="text-sm font-normal">ر.ع/شهر</span>
            </p>
            <p className="mt-2 text-xs text-primary-500">
              حتى {plan.customer_limit ?? "غير محدود"} عميل
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-primary-500">
        للترقية أو تغيير الخطة، تواصل مع فريق الدعم.
      </p>
    </div>
  );
}
