import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getOwnedBusiness, getReward } from "@/lib/auth/session";
import { EditRewardForm } from "./form";

export default async function RewardEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireRole("business_owner");
  const { id } = await params;

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const reward = await getReward(business.id, id);
  if (!reward) {
    redirect("/dashboard/rewards");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/rewards"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع لقائمة المكافآت
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-primary-900 dark:text-primary-50">
        {reward.name}
      </h1>

      <EditRewardForm reward={reward} />
    </div>
  );
}
