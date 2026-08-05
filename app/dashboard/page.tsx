import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getOwnedBusiness } from "@/lib/auth/session";
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
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    );
  }

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

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
        <LogoutButton />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="العملاء" value="0" />
        <StatCard label="النقاط الموزعة" value="0" />
        <StatCard label="المكافآت المستبدلة" value="0" />
        <StatCard label="بطاقات المحفظة النشطة" value="0" />
      </div>

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-500">
        إدارة العملاء وبرنامج الولاء والموظفين ستُضاف في المراحل القادمة.
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
