import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getCustomers, getOwnedBusiness } from "@/lib/auth/session";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const { q } = await searchParams;
  const customers = await getCustomers(business.id, q);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
          العملاء
        </h1>
        <Link
          href="/dashboard/customers/new"
          className="rounded-full bg-primary-900 px-4 py-2 text-sm font-medium min-h-touch text-white hover:bg-primary-700 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
        >
          + إضافة عميل
        </Link>
      </div>

      <form className="mt-6" action="/dashboard/customers" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          className="w-full rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </form>

      {customers.length === 0 ? (
        <p className="mt-10 text-sm text-primary-500">
          {q ? "لا توجد نتائج مطابقة." : "لا يوجد عملاء بعد. أضف أول عميل."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-primary-200 dark:divide-primary-800">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="flex items-center justify-between py-3 hover:bg-primary-50 dark:hover:bg-primary-900"
              >
                <div>
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-primary-500" dir="ltr">
                    {customer.phone}
                  </p>
                </div>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {customer.total_points} نقطة
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
