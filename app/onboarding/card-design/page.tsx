import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getBusinessSettings, getLoyaltyProgram, getOwnedBusiness } from "@/lib/auth/session";
import { cardThemeSchema, type CardTheme } from "@/lib/card-design/theme";
import { CardDesigner } from "@/app/dashboard/card-design/designer";

export default async function OnboardingCardDesignPage() {
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

  const [settings, program] = await Promise.all([
    getBusinessSettings(business.id),
    getLoyaltyProgram(business.id),
  ]);

  let savedTheme: CardTheme | null = null;
  if (settings?.card_theme) {
    const parsed = cardThemeSchema.safeParse(settings.card_theme);
    savedTheme = parsed.success ? parsed.data : null;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-accent-600">الخطوة ٢ من ٣</p>
      <h1 className="mt-1 text-2xl font-bold">صمّم بطاقة الولاء</h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        هذا الشكل الذي سيراه عملاؤك على بطاقاتهم. اختر نوع نشاطك وسيُصمَّم
        تلقائيًا، أو تخطَّ هذه الخطوة الآن واستخدم الشكل الافتراضي — يمكنك
        تعديله لاحقًا من لوحة التحكم في أي وقت.
      </p>

      <CardDesigner
        businessName={business.name}
        savedTheme={savedTheme}
        savedKind={settings?.card_business_kind ?? null}
        rewardThreshold={program?.reward_threshold ?? null}
        nextHref="/onboarding/join-qr"
      />

      <Link
        href="/onboarding/join-qr"
        className="mt-6 inline-block text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        تخطَّ الآن، استخدم الشكل الافتراضي ←
      </Link>
    </div>
  );
}
