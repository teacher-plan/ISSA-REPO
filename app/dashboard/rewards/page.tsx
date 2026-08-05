import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getOwnedBusiness, getRewards } from "@/lib/auth/session";

export default async function RewardsPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const rewards = await getRewards(business.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
          المكافآت
        </h1>
        <Link
          href="/dashboard/rewards/new"
          className="rounded-full bg-primary-900 px-4 py-2 text-sm font-medium min-h-touch text-white hover:bg-primary-700 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
        >
          + إضافة مكافأة
        </Link>
      </div>

      {rewards.length === 0 ? (
        <p className="mt-10 text-sm text-primary-500">
          لا توجد مكافآت بعد. أضف أول مكافأة ليتمكن العملاء من استبدال نقاطهم.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-primary-200 dark:divide-primary-800">
          {rewards.map((reward) => (
            <li key={reward.id}>
              <Link
                href={`/dashboard/rewards/${reward.id}`}
                className="flex items-center justify-between py-3 hover:bg-primary-50 dark:hover:bg-primary-900"
              >
                <div>
                  <p className="text-sm font-medium">
                    {reward.name}
                    {!reward.is_active && (
                      <span className="mr-2 text-xs text-primary-400">(غير مفعّلة)</span>
                    )}
                  </p>
                  {reward.description && (
                    <p className="text-xs text-primary-500">{reward.description}</p>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {reward.points_required} نقطة
                  </p>
                  {reward.quantity !== null && (
                    <p className="text-xs text-primary-500">متبقي: {reward.quantity}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
