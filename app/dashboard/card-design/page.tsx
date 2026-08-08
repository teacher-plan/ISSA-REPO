import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getBusinessSettings,
  getLoyaltyProgram,
  getOwnedBusiness,
} from "@/lib/auth/session";
import { cardThemeSchema, type CardTheme } from "@/lib/card-design/theme";
import { CardDesigner } from "./designer";

export default async function CardDesignPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const [settings, program] = await Promise.all([
    getBusinessSettings(business.id),
    getLoyaltyProgram(business.id),
  ]);

  // card_theme is jsonb, so the database will hand back whatever was written —
  // including a shape from an older version of the schema. Parse rather than
  // cast, and fall back to the house design if it no longer fits.
  let savedTheme: CardTheme | null = null;
  if (settings?.card_theme) {
    const parsed = cardThemeSchema.safeParse(settings.card_theme);
    savedTheme = parsed.success ? parsed.data : null;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
      <Link href="/dashboard" className="text-sm text-primary-500 underline">
        رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-bold">تصميم بطاقة الولاء</h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        اختر نوع نشاطك ولونك، وسيُصمَّم شكل بطاقتك تلقائيًا. يمكنك إعادة التصميم
        بقدر ما تشاء — لا شيء يصل لعملائك قبل أن تعتمده.
      </p>

      <CardDesigner
        businessName={business.name}
        savedTheme={savedTheme}
        savedKind={settings?.card_business_kind ?? null}
        rewardThreshold={program?.reward_threshold ?? null}
        offerText={program?.offer_text ?? null}
      />
    </div>
  );
}
