import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  getBusinessById,
  getEmployeeRecord,
  getLoyaltyProgram,
} from "@/lib/auth/session";
import { QrScanner } from "./qr-scanner";

export default async function EmployeeScanPage() {
  const profile = await requireRole("employee");

  // Same ordering as /employee: read the employee's own row first (its RLS
  // policy is not status-gated) so a suspended account is reported as
  // suspended rather than as "no employee record".
  const employee = await getEmployeeRecord(profile.id);
  if (!employee) {
    redirect("/auth/login");
  }
  if (employee.status !== "active") {
    redirect("/employee");
  }

  const business = await getBusinessById(employee.business_id);
  if (!business) {
    redirect("/auth/login");
  }

  const program = await getLoyaltyProgram(business.id);
  const defaultPoints =
    program?.earning_type === "visit" ? program.points_per_visit : 1;

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <Link href="/employee" className="text-sm text-primary-500 underline">
        رجوع
      </Link>

      <h1 className="mt-4 text-2xl font-bold">مسح بطاقة العميل</h1>
      <p className="mt-1 text-sm text-primary-500">{business.name}</p>

      <QrScanner
        defaultPoints={defaultPoints}
        canAddPoints={employee.permissions.add_points}
      />
    </div>
  );
}
