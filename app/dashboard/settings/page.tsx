import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getActiveWalletProviderSettings,
  getBusinessSettings,
  getOwnedBusiness,
} from "@/lib/auth/session";
import { BusinessSettingsForm } from "./form";

export default async function BusinessSettingsPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const [settings, activeProvider] = await Promise.all([
    getBusinessSettings(business.id),
    getActiveWalletProviderSettings(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-primary-900 dark:text-primary-50">
        إعدادات المحل
      </h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        عدّل بيانات محلك ومظهر بطاقة الولاء.
      </p>

      <BusinessSettingsForm
        business={business}
        settings={settings}
        activeWalletProvider={activeProvider?.provider_name ?? null}
      />
    </div>
  );
}
