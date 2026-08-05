import { requireRole } from "@/lib/auth/require-role";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function EmployeePage() {
  const profile = await requireRole("employee");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-xl font-semibold">
        مرحبًا {profile.full_name || profile.email}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        وضع الموظف السريع (البحث عن عميل، إضافة نقاط، استبدال مكافأة) سيُضاف
        في المرحلة 4.
      </p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
