import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight">
        اجعل عملاءك يعودون مرة أخرى مع بطاقة ولاء رقمية داخل محفظة الهاتف
      </h1>
      <p className="max-w-md text-lg leading-8 text-primary-600 dark:text-primary-400">
        منصة ولاء رقمي لأصحاب المحلات — بطاقات Apple Wallet و Google Wallet
        بدون تطبيق خاص.
      </p>
      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
        <Link
          href="/auth/register"
          className="flex h-12 items-center justify-center rounded-full bg-primary-900 px-6 text-white transition-colors hover:bg-primary-700 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
        >
          ابدأ تجربة مجانية
        </Link>
        <Link
          href="/auth/login"
          className="flex h-12 items-center justify-center rounded-full border border-primary-300 px-6 transition-colors hover:bg-primary-100 dark:border-primary-700 dark:hover:bg-primary-800"
        >
          تسجيل الدخول
        </Link>
      </div>
    </main>
  );
}
