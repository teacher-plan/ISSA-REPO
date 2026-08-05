import { resyncWalletCard } from "./actions";
import type { WalletCard } from "@/types/database";

const STATUS_LABELS: Record<string, string> = {
  created: "لم تُصدر بعد",
  generating: "جاري الإصدار...",
  active: "نشطة",
  syncing: "جاري التحديث...",
  updated: "محدّثة",
  failed: "فشل الإصدار",
};

const STATUS_COLORS: Record<string, string> = {
  created: "text-zinc-500",
  generating: "text-amber-600",
  active: "text-emerald-600",
  syncing: "text-amber-600",
  updated: "text-emerald-600",
  failed: "text-red-600",
};

export function WalletCardStatus({
  customerId,
  walletCard,
}: {
  customerId: string;
  walletCard: WalletCard | null;
}) {
  if (!walletCard) return null;

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <p>
        حالة بطاقة المحفظة:{" "}
        <span className={STATUS_COLORS[walletCard.sync_status]}>
          {STATUS_LABELS[walletCard.sync_status] ?? walletCard.sync_status}
        </span>
      </p>

      {walletCard.last_error && (
        <p className="mt-1 text-xs text-red-600">{walletCard.last_error}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={`/c/${walletCard.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          فتح صفحة البطاقة العامة
        </a>

        <form action={resyncWalletCard.bind(null, customerId)}>
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            إعادة المزامنة
          </button>
        </form>
      </div>
    </div>
  );
}
