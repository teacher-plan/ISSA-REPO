import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  created: "جاري تحضير البطاقة...",
  generating: "جاري إصدار البطاقة...",
  syncing: "جاري تحديث البطاقة...",
  failed: "تعذّر إصدار البطاقة حاليًا، حاول لاحقًا.",
};

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_public_card", { p_wallet_card_id: id })
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const card = data;
  const progress =
    card.reward_threshold && card.reward_threshold > 0
      ? Math.min(100, Math.round((card.current_points / card.reward_threshold) * 100))
      : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 py-12 text-center">
      {card.business_logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.business_logo_url}
          alt={card.business_name}
          className="h-16 w-16 rounded-full object-cover"
        />
      )}

      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {card.business_name}
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        بطاقة ولاء {card.customer_name}
      </p>

      <div className="mt-8 w-full rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-4xl font-bold" style={{ color: card.primary_color }}>
          {card.current_points}
        </p>
        <p className="mt-1 text-sm text-zinc-500">نقطة</p>

        {progress !== null && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: card.primary_color }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {card.current_points} / {card.reward_threshold} نقطة للمكافأة
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        {card.wallet_url_apple && (
          <a
            href={card.wallet_url_apple}
            className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
          >
            إضافة إلى Apple Wallet
          </a>
        )}
        {card.wallet_url_google && (
          <a
            href={card.wallet_url_google}
            className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            إضافة إلى Google Wallet
          </a>
        )}
        {!card.wallet_url_apple && !card.wallet_url_google && (
          <p className="text-sm text-zinc-500">
            {STATUS_LABELS[card.sync_status] ?? "البطاقة غير متاحة حاليًا."}
          </p>
        )}
      </div>
    </div>
  );
}
