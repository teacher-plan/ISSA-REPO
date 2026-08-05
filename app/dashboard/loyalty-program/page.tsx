import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getLoyaltyProgram, getOwnedBusiness } from "@/lib/auth/session";
import { LoyaltyProgramForm } from "./form";

export default async function LoyaltyProgramPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const program = await getLoyaltyProgram(business.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-primary-900 dark:text-primary-50">
        برنامج الولاء
      </h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        حدد كيف يكسب عملاؤك النقاط وعدد النقاط المطلوبة للحصول على مكافأة.
      </p>

      <LoyaltyProgramForm program={program} />
    </div>
  );
}
