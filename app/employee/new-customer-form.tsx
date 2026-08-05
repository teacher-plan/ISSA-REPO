"use client";

import { useActionState } from "react";
import { createCustomerAsEmployee, type CreateCustomerState } from "./actions";

const initialState: CreateCustomerState = { error: null, customerId: null };

export function EmployeeNewCustomerForm({ defaultPhone }: { defaultPhone: string }) {
  const [state, formAction, pending] = useActionState(
    createCustomerAsEmployee,
    initialState
  );

  if (state.customerId) {
    return (
      <p className="mt-3 text-sm text-success-600" role="status">
        تمت إضافة العميل. ابحث برقم هاتفه لتسجيل نقاطه.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          اسم العميل
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>
      <input type="hidden" name="phone" value={defaultPhone} />
      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
      >
        {pending ? "جاري الإضافة..." : "إضافة العميل"}
      </button>
    </form>
  );
}
