"use client";

import { useActionState } from "react";
import { updateCustomer, type CustomerActionState } from "./actions";
import type { Customer } from "@/types/database";

const initialState: CustomerActionState = { error: null, success: false };

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const updateWithId = updateCustomer.bind(null, customer.id);
  const [state, formAction, pending] = useActionState(
    updateWithId,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          الاسم
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={customer.name}
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
          defaultValue={customer.phone}
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
          defaultValue={customer.email ?? ""}
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
          defaultValue={customer.birth_date ?? ""}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-success-600" role="status">
          تم الحفظ بنجاح.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-primary-900 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
      >
        {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}
