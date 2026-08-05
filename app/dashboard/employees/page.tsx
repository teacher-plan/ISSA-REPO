import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getEmployees, getOwnedBusiness } from "@/lib/auth/session";
import { setEmployeeStatus } from "./actions";
import { NewEmployeeForm } from "./form";

export default async function EmployeesPage() {
  const profile = await requireRole("business_owner");

  const business = await getOwnedBusiness(profile.id);
  if (!business) {
    redirect("/onboarding/business");
  }

  const employees = await getEmployees(business.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-primary-900 dark:text-primary-50">
        الموظفون
      </h1>

      {employees.length === 0 ? (
        <p className="mt-6 text-sm text-primary-500">لا يوجد موظفون بعد.</p>
      ) : (
        <ul className="mt-6 divide-y divide-primary-200 dark:divide-primary-800">
          {employees.map((emp) => (
            <li key={emp.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{emp.profile?.full_name}</p>
                <p className="text-xs text-primary-500" dir="ltr">
                  {emp.profile?.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${emp.status === "active" ? "text-success-600" : "text-primary-500"}`}
                >
                  {emp.status === "active" ? "نشط" : "موقوف"}
                </span>
                <form
                  action={setEmployeeStatus.bind(
                    null,
                    emp.id,
                    emp.status === "active" ? "suspended" : "active"
                  )}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-primary-300 px-3 py-1 text-xs hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-primary-900"
                  >
                    {emp.status === "active" ? "إيقاف" : "تفعيل"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-sm font-medium text-primary-500">إضافة موظف جديد</h2>
      <NewEmployeeForm />
    </div>
  );
}
