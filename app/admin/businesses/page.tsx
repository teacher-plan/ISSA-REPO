import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getAllBusinessesWithSubscriptions } from "@/lib/auth/session";

const STATUS_LABELS: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  expired: "منتهي",
  cancelled: "ملغى",
};

export default async function AdminBusinessesPage() {
  await requireRole("admin");

  const businesses = await getAllBusinessesWithSubscriptions();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/admin"
        className="text-sm text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
      >
        ← رجوع للوحة تحكم المنصة
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-primary-900 dark:text-primary-50">
        المحلات والاشتراكات
      </h1>

      {businesses.length === 0 ? (
        <p className="mt-6 text-sm text-primary-500">لا توجد محلات بعد.</p>
      ) : (
        <ul className="mt-6 divide-y divide-primary-200 dark:divide-primary-800">
          {businesses.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/businesses/${b.id}`}
                className="flex items-center justify-between py-3 hover:bg-primary-50 dark:hover:bg-primary-900"
              >
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-primary-500">
                    {b.subscription?.plan_name ?? "—"}
                  </p>
                </div>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {STATUS_LABELS[b.subscription?.status ?? ""] ?? "—"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
