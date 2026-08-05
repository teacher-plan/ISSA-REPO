import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getBusinessById,
  getCustomerByPhone,
  getEmployeeRecord,
  getLoyaltyProgram,
  getRewards,
} from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { EmployeeAddPointsForm } from "./points-form";
import { EmployeeRedeemRewardForm } from "./redeem-form";
import { EmployeeNewCustomerForm } from "./new-customer-form";

export default async function EmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const profile = await requireRole("employee");

  // getEmployeeRecord() relies on employees_select_self RLS (profile_id =
  // me), which is NOT status-gated, so this resolves even for a suspended
  // employee. Checking status here first — before touching any
  // business-scoped table — matters because current_employee_business_id()
  // (used by businesses/customers/etc RLS) intentionally requires
  // status = 'active', so a suspended employee querying those tables gets
  // nothing back and must not be misread as "no employee record at all".
  const employee = await getEmployeeRecord(profile.id);
  if (!employee) {
    redirect("/auth/login");
  }

  if (employee.status !== "active") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">تم إيقاف حسابك</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          تواصل مع صاحب المحل لإعادة تفعيل حسابك.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    );
  }

  const business = await getBusinessById(employee.business_id);
  if (!business) {
    redirect("/auth/login");
  }

  const { phone } = await searchParams;
  const [customer, program, rewards] = await Promise.all([
    phone ? getCustomerByPhone(business.id, phone) : Promise.resolve(null),
    getLoyaltyProgram(business.id),
    getRewards(business.id, { activeOnly: true }),
  ]);

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{business.name}</h1>
          <p className="text-sm text-zinc-500">
            مرحبًا {profile.full_name || profile.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      {employee.permissions.add_points && (
        <Link
          href="/employee/scan"
          className="min-h-touch mt-6 flex w-full items-center justify-center rounded-xl bg-primary-800 px-5 py-4 text-base font-semibold text-white"
        >
          مسح رمز البطاقة
        </Link>
      )}

      <p className="mt-4 text-center text-xs text-primary-500">
        أو ابحث برقم الهاتف
      </p>

      <form className="mt-2 flex gap-2" action="/employee" method="get">
        <input
          type="tel"
          name="phone"
          defaultValue={phone ?? ""}
          required
          placeholder="رقم هاتف العميل"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          بحث
        </button>
      </form>

      {phone && !customer && (
        <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <p>لا يوجد عميل بهذا الرقم.</p>
          {employee.permissions.manage_customers ? (
            <EmployeeNewCustomerForm defaultPhone={phone} />
          ) : (
            <p className="mt-2 text-xs text-zinc-500">
              تواصل مع صاحب المحل لإضافة هذا العميل.
            </p>
          )}
        </div>
      )}

      {customer && (
        <div className="mt-6">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="font-medium">{customer.name}</p>
            <p className="text-xs text-zinc-500" dir="ltr">
              {customer.phone}
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {customer.total_points} نقطة · {customer.total_visits} زيارة
            </p>
          </div>

          {employee.permissions.add_points && (
            <EmployeeAddPointsForm customerId={customer.id} program={program} />
          )}

          {employee.permissions.redeem_rewards && (
            <EmployeeRedeemRewardForm
              customerId={customer.id}
              rewards={rewards}
              customerPoints={customer.total_points}
            />
          )}
        </div>
      )}
    </div>
  );
}
