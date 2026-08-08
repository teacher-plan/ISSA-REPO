import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";
import { getJoinUrl, renderQrSvg } from "@/lib/wallet/qr";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DownloadQrButton } from "@/components/download-qr-button";

export default async function OnboardingJoinQrPage() {
  const { profile } = await getCurrentUser();
  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "business_owner") {
    redirect("/dashboard");
  }

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const joinUrl = await getJoinUrl(business.id);
  const qrSvg = await renderQrSvg(joinUrl);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium text-accent-600">الخطوة ٤ من ٤</p>
      <h1 className="mt-1 text-2xl font-bold">رمز انضمام عملائك</h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        اطبع هذا الرمز وضعه عند الكاشير. أي عميل يمسحه بكاميرا جواله يحصل
        على بطاقة ولاء في محفظته مباشرة — دون أن تُدخل بياناته يدويًا.
      </p>

      <div className="mt-6 rounded-xl border border-primary-200 p-5 dark:border-primary-800">
        <div
          className="mx-auto w-full max-w-[220px] [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p dir="ltr" className="mt-4 break-all text-center text-xs text-primary-500">
          {joinUrl}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <CopyLinkButton url={joinUrl} />
          <DownloadQrButton svg={qrSvg} filename={`رمز-انضمام-${business.name}.png`} />
        </div>
      </div>

      <p className="mt-4 text-xs text-primary-500">
        عميل يعود إليك برقم هاتفه نفسه يُتعرَّف عليه تلقائيًا — لن يُنشئ له
        هذا الرمز بطاقة مكرَّرة. ستجد هذا الرمز مجددًا لاحقًا من صفحة إعدادات
        المحل.
      </p>

      <Link
        href="/dashboard"
        className="mt-6 min-h-touch flex items-center justify-center rounded-full bg-brand-800 px-5 text-base font-semibold text-white hover:bg-brand-900"
      >
        الذهاب إلى لوحة التحكم
      </Link>
    </div>
  );
}
