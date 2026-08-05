"use client";

import { useActionState } from "react";
import { createCustomer, type CustomerFormState } from "../actions";

const initialState: CustomerFormState = { error: null, customerId: null };

export function NewCustomerForm({
  defaultPhone,
}: {
  defaultPhone?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createCustomer,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          الاسم
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          رقم الهاتف
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={defaultPhone ?? ""}
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
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="birth_date" className="text-sm font-medium">
          تاريخ الميلاد
        </label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
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
        {pending ? "جاري الإضافة..." : "إضافة العميل"}
      </button>
    </form>
  );
}
