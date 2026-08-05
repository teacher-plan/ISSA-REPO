import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getBusinessStats, getOwnedBusiness } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const profile = await requireRole("business_owner", "customer");

  if (profile.role === "customer") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">
          مرحبًا {profile.full_name || profile.email}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          بطاقة الولاء الرقمية الخاصة بك ستظهر هنا قريبًا.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            الملف الشخصي
          </Link>
          <LogoutButton />
        </div>
      </div>
    );
  }

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const stats = await getBusinessStats(business.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {business.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            حالة الاشتراك: {business.status}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/customers"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            العملاء
          </Link>
          <Link
            href="/dashboard/quick-add"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            إضافة نقاط سريعة
          </Link>
          <Link
            href="/dashboard/loyalty-program"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            برنامج الولاء
          </Link>
          <Link
            href="/dashboard/rewards"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            المكافآت
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            إعدادات المحل
          </Link>
          <Link
            href="/dashboard/profile"
            className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            الملف الشخصي
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/dashboard/customers">
          <StatCard label="العملاء" value={String(stats.customerCount)} />
        </Link>
        <StatCard
          label="النقاط الموزعة"
          value={String(stats.pointsDistributed)}
        />
        <Link href="/dashboard/rewards">
          <StatCard
            label="المكافآت المستبدلة"
            value={String(stats.rewardsRedeemedCount)}
          />
        </Link>
        <StatCard
          label="بطاقات المحفظة النشطة"
          value={String(stats.activeWalletCardCount)}
        />
      </div>

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-500">
        الموظفون والاشتراكات ستُضاف في المراحل القادمة.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
