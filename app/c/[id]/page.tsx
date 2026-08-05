import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renderCardQrSvg } from "@/lib/wallet/qr";

const STATUS_LABELS: Record<string, string> = {
  created: "جاري تحضير إضافة البطاقة إلى المحفظة...",
  generating: "جاري إصدار البطاقة...",
  syncing: "جاري تحديث البطاقة...",
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
  // The code the employee scans at the counter. Rendered here — not only on
  // the wallet pass — so the loop works on any phone, before a wallet
  // provider is configured and for customers who never add the pass.
  const qrSvg = await renderCardQrSvg(id);
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

      <div className="mt-6 w-full rounded-2xl bg-white p-4 shadow-md">
        <div
          className="mx-auto w-full max-w-[240px] [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="mt-3 text-xs text-primary-500">
          اعرض هذا الرمز للموظف عند الشراء
        </p>
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
          // Deliberately understated. Before the QR existed, no wallet URL
          // meant the card was unusable, so this said "couldn't issue the
          // card". Now the QR above is the thing that actually earns points —
          // adding it to a wallet is a convenience — so a sync failure must
          // not read as though the card is broken.
          <p className="text-xs text-primary-400">
            {card.sync_status === "failed"
              ? "إضافة البطاقة إلى المحفظة غير متاحة حاليًا — الرمز أعلاه يعمل كالمعتاد."
              : (STATUS_LABELS[card.sync_status] ?? "")}
          </p>
        )}
      </div>
    </div>
  );
}
