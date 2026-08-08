import { redirect } from "next/navigation";
import { getCurrentUser, getLoyaltyProgram, getOwnedBusiness } from "@/lib/auth/session";
import { LoyaltyProgramForm } from "@/app/dashboard/loyalty-program/form";

export default async function OnboardingOfferPage() {
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

  const program = await getLoyaltyProgram(business.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-accent-600">الخطوة ٢ من ٤</p>
      <h1 className="mt-1 text-2xl font-bold">حدّد عرضك</h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        قبل تصميم البطاقة، حدّد ما يحصل عليه عميلك بالضبط — بطاقة بلا عرض
        واضح تصل عميلك فارغة من المعنى. هذه الخطوة لا يمكن تخطّيها؛ يمكنك
        تعديل عرضك لاحقًا في أي وقت من لوحة التحكم.
      </p>

      <LoyaltyProgramForm program={program} nextHref="/onboarding/card-design" />
    </div>
  );
}
