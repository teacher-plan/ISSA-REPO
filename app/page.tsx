import Link from "next/link";
import { Wordmark } from "@/components/brand/brand-mark";
import { LoyaltyCardVisual } from "@/components/brand/loyalty-card";

/**
 * The landing page commits to the brand green in both colour schemes.
 * Everywhere else follows the viewer's theme, but this is the one surface
 * whose job is to state what the brand looks like, and a hero that changes
 * character between light and dark states nothing.
 */
export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-brand-900 text-white">
      {/* Warm glow behind the card — the gold reads as light rather than paint. */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #d7a34c 0%, transparent 70%)" }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Wordmark />
        <Link
          href="/auth/login"
          className="min-h-touch flex items-center rounded-full px-4 text-sm font-medium text-white/80 hover:text-white"
        >
          تسجيل الدخول
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/15 px-4 py-1.5 text-xs font-semibold text-accent-300 ring-1 ring-accent-500/30">
            بدون تطبيق يحمّله العميل
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl">
            خلّ عميلك
            <span className="text-accent-400"> يرجع لك</span>
            <br />
            مرة بعد مرة
          </h1>

          <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-white/70 lg:mx-0">
            بطاقة ولاء رقمية في جوال عميلك. يعرض الرمز، الموظف يمسحه، والنقطة
            تنسجل في ثانية.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/auth/register"
              className="min-h-touch flex items-center justify-center rounded-full bg-accent-500 px-8 text-base font-bold text-brand-900 shadow-gold transition-colors hover:bg-accent-400"
            >
              ابدأ مجانًا 14 يوم
            </Link>
            <Link
              href="/auth/login"
              className="min-h-touch flex items-center justify-center rounded-full px-8 text-base font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
            >
              عندي حساب
            </Link>
          </div>

          {/* Latin numerals throughout. The product's own numbers — points,
              balances — come out of the database as Latin digits, so writing
              the marketing copy in Arabic-Indic would put two numeral systems
              inside one brand. */}
          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center lg:text-right">
            {[
              ["ثانية", "لتسجيل النقطة"],
              ["0", "تطبيقات على العميل"],
              ["14", "يوم تجربة مجانية"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-black text-accent-400">{value}</dt>
                <dd className="mt-1 text-xs text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The motif, shown doing its job rather than as decoration. */}
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="rotate-[-3deg] transition-transform hover:rotate-0">
            <LoyaltyCardVisual
              className="min-h-[420px]"
              businessName="بن سيرا للقهوة"
              holderName="سارة المعمري"
              points={7}
              threshold={10}
              kind="cafe"
            />
          </div>
          <p className="mt-6 text-center text-sm text-white/50">
            هكذا يراها عميلك على جواله
          </p>
        </div>
      </div>
    </main>
  );
}
