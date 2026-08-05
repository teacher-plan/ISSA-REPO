import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getCustomer,
  getCustomerTransactions,
  getLoyaltyProgram,
  getOwnedBusiness,
  getRewards,
} from "@/lib/auth/session";
import { EditCustomerForm } from "./edit-form";
import { AddPointsForm } from "./points-form";
import { RedeemRewardForm } from "./redeem-form";

const TYPE_LABELS: Record<string, string> = {
  earn: "إضافة",
  redeem: "استبدال",
  adjustment: "تعديل",
  refund: "استرجاع",
};

export default async function CustomerProfilePage({
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

  const customer = await getCustomer(business.id, id);
  if (!customer) {
    redirect("/dashboard/customers");
  }

  const [transactions, program, rewards] = await Promise.all([
    getCustomerTransactions(customer.id),
    getLoyaltyProgram(business.id),
    getRewards(business.id, { activeOnly: true }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/customers"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع لقائمة العملاء
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {customer.name}
        </h1>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-xl font-semibold">{customer.total_points}</p>
            <p className="text-xs text-zinc-500">نقطة</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{customer.total_visits}</p>
            <p className="text-xs text-zinc-500">زيارة</p>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-medium text-zinc-500">تسجيل عملية</h2>
      <AddPointsForm customerId={customer.id} program={program} />

      <h2 className="mt-8 text-sm font-medium text-zinc-500">استبدال مكافأة</h2>
      <RedeemRewardForm
        customerId={customer.id}
        rewards={rewards}
        customerPoints={customer.total_points}
      />

      <h2 className="mt-8 text-sm font-medium text-zinc-500">بيانات العميل</h2>
      <EditCustomerForm customer={customer} />

      <h2 className="mt-10 text-sm font-medium text-zinc-500">سجل العمليات</h2>
      {transactions.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">لا توجد عمليات بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <span className="font-medium">{TYPE_LABELS[tx.type] ?? tx.type}</span>
                {tx.description && (
                  <span className="mr-2 text-zinc-500">— {tx.description}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    tx.type === "redeem" ? "text-red-600" : "text-emerald-600"
                  }
                >
                  {tx.type === "redeem" ? "-" : "+"}
                  {tx.points}
                </span>
                <span className="text-xs text-zinc-500" dir="ltr">
                  {new Date(tx.created_at).toLocaleString("ar")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
