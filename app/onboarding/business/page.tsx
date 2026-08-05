import { redirect } from "next/navigation";
import { getCurrentUser, getOwnedBusiness } from "@/lib/auth/session";
import { BusinessOnboardingForm } from "./form";

export default async function BusinessOnboardingPage() {
  const { profile } = await getCurrentUser();

  if (!profile) {
    redirect("/auth/login");
  }
  if (profile.role !== "business_owner") {
    redirect("/dashboard");
  }

  const existing = await getOwnedBusiness(profile.id);
  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
        بيانات المحل
      </h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        خطوة أخيرة قبل فتح لوحة التحكم.
      </p>
      <BusinessOnboardingForm />
    </div>
  );
}
