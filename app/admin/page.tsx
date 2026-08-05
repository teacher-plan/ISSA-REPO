import { requireRole } from "@/lib/auth/require-role";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AdminPage() {
  const profile = await requireRole("admin");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-xl font-semibold">
        لوحة تحكم المنصة — {profile.full_name || profile.email}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        إدارة المحلات والاشتراكات ومزودي المحفظة ستُضاف في مراحل لاحقة.
      </p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
