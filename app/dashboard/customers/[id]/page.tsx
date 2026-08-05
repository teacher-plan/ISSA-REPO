import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getCustomer,
  getCustomerTransactions,
  getLoyaltyProgram,
  getOwnedBusiness,
  getRewards,
  getWalletCard,
} from "@/lib/auth/session";
import { renderCardQrSvg } from "@/lib/wallet/qr";
import { EditCustomerForm } from "./edit-form";
import { AddPointsForm } from "./points-form";
import { RedeemRewardForm } from "./redeem-form";
import { WalletCardStatus } from "./wallet-card-status";

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

  const [transactions, program, rewards, walletCard] = await Promise.all([
    getCustomerTransactions(customer.id),
    getLoyaltyProgram(business.id),
    getRewards(business.id, { activeOnly: true }),
    getWalletCard(business.id, customer.id),
  ]);

  // Rendered here rather than deferred to the public page: this is the
  // moment an owner actually needs the code — right after finding or adding
  // this customer, to hand their card over — not two clicks later.
  const qrSvg = walletCard ? await renderCardQrSvg(walletCard.id) : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/customers"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع لقائمة العملاء
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
          {customer.name}
        </h1>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-xl font-semibold">{customer.total_points}</p>
            <p className="text-xs text-primary-500">نقطة</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{customer.total_visits}</p>
            <p className="text-xs text-primary-500">زيارة</p>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-medium text-primary-500">بطاقة المحفظة</h2>
      <WalletCardStatus customerId={customer.id} walletCard={walletCard} qrSvg={qrSvg} />

      <h2 className="mt-8 text-sm font-medium text-primary-500">تسجيل عملية</h2>
      <AddPointsForm customerId={customer.id} program={program} />

      <h2 className="mt-8 text-sm font-medium text-primary-500">استبدال مكافأة</h2>
      <RedeemRewardForm
        customerId={customer.id}
        rewards={rewards}
        customerPoints={customer.total_points}
      />

      <h2 className="mt-8 text-sm font-medium text-primary-500">بيانات العميل</h2>
      <EditCustomerForm customer={customer} />

      <h2 className="mt-10 text-sm font-medium text-primary-500">سجل العمليات</h2>
      {transactions.length === 0 ? (
        <p className="mt-3 text-sm text-primary-500">لا توجد عمليات بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-primary-200 dark:divide-primary-800">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <span className="font-medium">{TYPE_LABELS[tx.type] ?? tx.type}</span>
                {tx.description && (
                  <span className="mr-2 text-primary-500">— {tx.description}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    tx.type === "redeem" ? "text-error-600" : "text-success-600"
                  }
                >
                  {tx.type === "redeem" ? "-" : "+"}
                  {tx.points}
                </span>
                <span className="text-xs text-primary-500" dir="ltr">
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
