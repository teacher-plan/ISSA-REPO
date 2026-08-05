import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getActiveWalletProviderSettings,
  getBusinessSettings,
  getOwnedBusiness,
} from "@/lib/auth/session";
import { getJoinUrl, renderQrSvg } from "@/lib/wallet/qr";
import { CopyLinkButton } from "@/components/copy-link-button";
import { BusinessSettingsForm } from "./form";

export default async function BusinessSettingsPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const [settings, activeProvider, joinUrl] = await Promise.all([
    getBusinessSettings(business.id),
    getActiveWalletProviderSettings(),
    getJoinUrl(business.id),
  ]);
  const qrSvg = await renderQrSvg(joinUrl);

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

      <h2 className="mt-8 text-sm font-medium text-primary-500">
        رمز انضمام العملاء
      </h2>
      <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-primary-200 p-5 dark:border-primary-800 sm:flex-row sm:items-start">
        <div
          className="w-full max-w-[140px] shrink-0 [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="text-center sm:text-right">
          <p className="text-sm text-primary-600 dark:text-primary-400">
            الرمز نفسه الذي عرضناه لك عند إنشاء الحساب — ضعه عند الكاشير،
            وأي عميل يمسحه يحصل على بطاقة ولاء في محفظته مباشرة.
          </p>
          <p dir="ltr" className="mt-2 break-all text-xs text-primary-500">
            {joinUrl}
          </p>
          <div className="mt-3">
            <CopyLinkButton url={joinUrl} />
          </div>
        </div>
      </div>

      <BusinessSettingsForm
        business={business}
        settings={settings}
        activeWalletProvider={activeProvider?.provider_name ?? null}
      />
    </div>
  );
}
