import Link from "next/link";
import { LoginForm } from "./form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
        تسجيل الدخول
      </h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        سجّل الدخول لإدارة محلك وعملائك.
      </p>

      <LoginForm next={next} />

      <p className="mt-6 text-sm text-primary-600 dark:text-primary-400">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-medium underline">
          إنشاء حساب صاحب محل
        </Link>
      </p>
    </div>
  );
}
