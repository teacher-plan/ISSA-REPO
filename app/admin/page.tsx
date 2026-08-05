import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AdminPage() {
  const profile = await requireRole("admin");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-xl font-semibold">
        لوحة تحكم المنصة — {profile.full_name || profile.email}
      </h1>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/admin/businesses"
          className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          المحلات والاشتراكات
        </Link>
        <Link
          href="/admin/wallet-provider"
          className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          مزوّد المحفظة الرقمية
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
