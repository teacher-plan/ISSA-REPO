"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerOwner, type RegisterState } from "./actions";

const initialState: RegisterState = { error: null };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerOwner,
    initialState
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">
        إنشاء حساب صاحب محل
      </h1>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        ابدأ تجربتك المجانية وأنشئ برنامج الولاء الرقمي لمحلك.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="full_name" className="text-sm font-medium">
            الاسم الكامل
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        {state.error && (
          <p className="text-sm text-error-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
        >
          {pending ? "جاري الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>

      <p className="mt-6 text-sm text-primary-600 dark:text-primary-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/auth/login" className="font-medium underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
