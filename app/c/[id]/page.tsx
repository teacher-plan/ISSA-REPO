import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renderCardQrSvg } from "@/lib/wallet/qr";
import { BrandMark } from "@/components/brand/brand-mark";
import { LoyaltyCardVisual } from "@/components/brand/loyalty-card";
import { cardThemeSchema } from "@/lib/card-design/theme";

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

  // jsonb round-trips as whatever was stored, so parse rather than cast — a
  // theme written by an older schema version must degrade to the house design,
  // not render a broken card.
  const parsedTheme = card.card_theme
    ? cardThemeSchema.safeParse(card.card_theme)
    : null;
  const theme = parsedTheme?.success ? parsedTheme.data : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <div className="flex items-center gap-3">
        {card.business_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.business_logo_url}
            alt=""
            className="h-11 w-11 rounded-full object-cover ring-1 ring-hairline"
          />
        ) : (
          <BrandMark className="h-11 w-11" />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold">{card.business_name}</h1>
          <p className="text-xs text-primary-500">بطاقة ولاء</p>
        </div>
      </div>

      {/* The card the whole identity is built around. It stays gold rather
          than taking the shop's own colour: this is the platform's mark, and
          a customer who carries three of these should recognise all three. */}
      <LoyaltyCardVisual
        className="mt-5"
        theme={theme}
        businessName={card.business_name}
        holderName={card.customer_name}
        points={card.current_points}
        threshold={card.reward_threshold}
      />

      {/* No separate progress bar here. The stamp row on the card already
          shows the same thing, and a second meter in the shop's own colour
          (which defaults to near-black) sat under the gold card looking like
          it belonged to a different page. */}

      {/* White plate regardless of theme: a QR inverted for dark mode is
          unreliable to scan, and this is the one element that must work. */}
      <div className="mt-6 rounded-card bg-white p-5 shadow-card">
        <div
          className="mx-auto w-full max-w-[230px] [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="mt-3 text-center text-xs font-medium text-primary-600">
          اعرض هذا الرمز للموظف عند الشراء
        </p>
      </div>

      <div className="mt-6 flex w-full flex-col gap-3 text-center">
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
            className="rounded-full bg-primary-900 px-5 py-3 text-sm font-medium text-white dark:bg-primary-50 dark:text-primary-900"
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
