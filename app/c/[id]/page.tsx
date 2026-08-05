import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renderCardQrSvg } from "@/lib/wallet/qr";
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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-6">
      {/* One pass, filling the phone — the shape a customer already recognises
          from the passes in their wallet. The code lives inside it rather than
          in a second box below, so at the counter they hold up one thing. */}
      <LoyaltyCardVisual
        className="min-h-[76vh]"
        theme={theme}
        businessName={card.business_name}
        logoUrl={card.business_logo_url}
        holderName={card.customer_name}
        points={card.current_points}
        threshold={card.reward_threshold}
        kind={card.card_business_kind}
        qrSvg={qrSvg}
      />

      <div className="mt-5 flex w-full flex-col gap-3 text-center">
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
            className="rounded-full bg-brand-800 px-5 py-3 text-sm font-medium text-white dark:bg-brand-100 dark:text-brand-900"
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
