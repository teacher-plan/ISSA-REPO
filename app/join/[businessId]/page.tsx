import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cardThemeSchema, DARK_INK, DEFAULT_THEME, sanitizeTheme } from "@/lib/card-design/theme";
import { JoinForm } from "./form";

export default async function JoinBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_public_business", { p_business_id: businessId })
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const business = data;
  const parsedTheme = business.card_theme
    ? cardThemeSchema.safeParse(business.card_theme)
    : null;
  const theme = sanitizeTheme(parsedTheme?.success ? parsedTheme.data : DEFAULT_THEME).theme;
  const dark = theme.textOn === "dark";
  const ink = dark ? DARK_INK : "#ffffff";

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-4 py-6">
      {/* Same gradient the customer will see on their own card in a moment —
          the join page and the card it leads to should read as one thing. */}
      <div
        className="flex flex-col items-center gap-3 rounded-card px-6 py-10 text-center shadow-gold"
        style={{
          background: `linear-gradient(160deg, ${theme.backgroundFrom}, ${theme.backgroundTo})`,
          color: ink,
        }}
      >
        {business.business_logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.business_logo_url}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover"
          />
        )}
        <p className="text-xl font-black">{business.business_name}</p>
        <p className="text-sm" style={{ opacity: 0.85 }}>
          انضم لبرنامج الولاء واحصل على بطاقتك الرقمية الآن
        </p>
      </div>

      <JoinForm businessId={businessId} />

      <p className="mt-6 text-center text-xs text-primary-400">
        بطاقتك ستُضاف إلى محفظة جوالك، وتُستخدم لتسجيل نقاطك عند كل زيارة.
      </p>
    </div>
  );
}
