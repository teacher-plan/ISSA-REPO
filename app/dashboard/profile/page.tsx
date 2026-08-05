import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { ProfileForm } from "./form";

export default async function ProfilePage() {
  const profile = await requireRole(
    "admin",
    "business_owner",
    "employee",
    "customer"
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع للوحة التحكم
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        الملف الشخصي
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        إدارة بيانات حسابك.
      </p>

      <ProfileForm profile={profile} />
    </div>
  );
}
