import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getBusinessSettings, getOwnedBusiness } from "@/lib/auth/session";
import { BusinessSettingsForm } from "./form";

export default async function BusinessSettingsPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const settings = await getBusinessSettings(business.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        إعدادات المحل
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        عدّل بيانات محلك ومظهر بطاقة الولاء.
      </p>

      <BusinessSettingsForm business={business} settings={settings} />
    </div>
  );
}
