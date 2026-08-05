import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getBusinessStats,
  getEffectiveSubscriptionStatus,
  getOwnedBusiness,
} from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  expired: "منتهي",
  cancelled: "ملغى",
};

export default async function DashboardPage() {
  const profile = await requireRole("business_owner", "customer");

  if (profile.role === "customer") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">
          مرحبًا {profile.full_name || profile.email}
        </h1>
        <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
          بطاقة الولاء الرقمية الخاصة بك ستظهر هنا قريبًا.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="text-sm underline hover:text-primary-700 dark:hover:text-primary-300"
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

  const [stats, subscriptionStatus] = await Promise.all([
    getBusinessStats(business.id),
    getEffectiveSubscriptionStatus(business.id),
  ]);

  const statusLabel =
    SUBSCRIPTION_STATUS_LABELS[subscriptionStatus ?? ""] ?? "—";

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-primary-900 dark:text-primary-50">
            {business.name}
          </h1>
          <p className="mt-1 text-sm text-primary-500">
            الاشتراك: <span className="font-medium">{statusLabel}</span>
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="العملاء"
          value={String(stats.customerCount)}
          href="/dashboard/customers"
        />
        <StatCard
          label="النقاط الموزعة"
          value={String(stats.pointsDistributed)}
          accent
        />
        <StatCard
          label="المكافآت المستبدلة"
          value={String(stats.rewardsRedeemedCount)}
          href="/dashboard/rewards"
        />
        <StatCard
          label="بطاقات المحفظة"
          value={String(stats.activeWalletCardCount)}
        />
      </div>

      {/* The nav used to be nine inline links in one flex row, which collapsed
          into an unreadable pile on a phone. Tiles wrap, stay above the 44px
          tap minimum, and put the two counter-side actions first — those are
          what an owner opens mid-shift. */}
      <nav className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <NavTile href="/dashboard/quick-add" label="إضافة نقاط سريعة" primary />
        <NavTile href="/dashboard/customers" label="العملاء" primary />
        <NavTile href="/dashboard/rewards" label="المكافآت" />
        <NavTile href="/dashboard/card-design" label="تصميم البطاقة" />
        <NavTile href="/dashboard/loyalty-program" label="برنامج الولاء" />
        <NavTile href="/dashboard/employees" label="الموظفون" />
        <NavTile href="/dashboard/analytics" label="التحليلات" />
        <NavTile href="/dashboard/subscription" label="الاشتراك" />
        <NavTile href="/dashboard/settings" label="إعدادات المحل" />
        <NavTile href="/dashboard/profile" label="الملف الشخصي" />
      </nav>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <div className="h-full rounded-xl border border-primary-200 p-4 dark:border-primary-800">
      <p
        className={`text-2xl font-bold ${accent ? "text-accent-600" : "text-primary-900 dark:text-primary-50"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-primary-500">{label}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function NavTile({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`min-h-touch flex items-center justify-center rounded-xl px-4 py-4 text-center text-sm font-medium ${
        primary
          ? "bg-brand-800 text-white hover:bg-brand-900"
          : "border border-primary-200 hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-900"
      }`}
    >
      {label}
    </Link>
  );
}
