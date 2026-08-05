import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getBusinessById,
  getSubscription,
  getSubscriptionPlans,
} from "@/lib/auth/session";
import { SubscriptionAdminForm } from "./form";

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const business = await getBusinessById(id);
  if (!business) {
    redirect("/admin/businesses");
  }

  const [subscription, plans] = await Promise.all([
    getSubscription(business.id),
    getSubscriptionPlans(),
  ]);

  if (!subscription) {
    redirect("/admin/businesses");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin/businesses"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع لقائمة المحلات
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {business.name}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">إدارة الاشتراك يدويًا (إلى حين تفعيل الفوترة الفعلية).</p>

      <SubscriptionAdminForm
        businessId={business.id}
        subscription={subscription}
        plans={plans}
      />
    </div>
  );
}
