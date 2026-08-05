import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveWalletProviderSettings } from "@/lib/auth/session";
import { WalletProviderForm } from "./form";

export default async function WalletProviderPage() {
  await requireRole("admin");

  const settings = await getActiveWalletProviderSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin"
        className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← رجوع للوحة تحكم المنصة
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        مزوّد المحفظة الرقمية
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        إعداد مزوّد Apple Wallet / Google Wallet المستخدم لإصدار بطاقات الولاء
        لجميع المحلات على المنصة.
      </p>

      <WalletProviderForm settings={settings} />
    </div>
  );
}
