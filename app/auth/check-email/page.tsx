export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
        تحقق من بريدك الإلكتروني
      </h1>
      <p className="mt-3 text-sm text-primary-600 dark:text-primary-400">
        أرسلنا رابط تأكيد إلى بريدك الإلكتروني. بعد تفعيل الحساب سجّل الدخول
        لإكمال إعداد محلك.
      </p>
    </div>
  );
}
