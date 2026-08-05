import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getOwnedBusiness } from "@/lib/auth/session";
import { NewRewardForm } from "./form";

export default async function NewRewardPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/rewards"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع لقائمة المكافآت
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        إضافة مكافأة جديدة
      </h1>

      <NewRewardForm />
    </div>
  );
}
