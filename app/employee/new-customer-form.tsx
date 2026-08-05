"use client";

import { useActionState } from "react";
import { createCustomerAsEmployee, type CreateCustomerState } from "./actions";

const initialState: CreateCustomerState = {
  error: null,
  customerId: null,
  qrSvg: null,
  cardUrl: null,
};

export function EmployeeNewCustomerForm({ defaultPhone }: { defaultPhone: string }) {
  const [state, formAction, pending] = useActionState(
    createCustomerAsEmployee,
    initialState
  );

  // This is the moment the employee actually hands the customer their card —
  // everything before this point was just data entry. Without the code
  // rendered right here, "تمت الإضافة" is a dead end: the employee has no
  // way to get the customer's own card in front of them.
  if (state.customerId) {
    return (
      <div className="mt-3 rounded-xl border border-primary-200 p-4 dark:border-primary-800">
        <p className="text-sm font-medium text-success-600" role="status">
          تمت إضافة العميل — امسح هذا الرمز بجواله لإضافة البطاقة
        </p>
        {state.qrSvg ? (
          <div
            className="mx-auto mt-3 w-full max-w-[200px] rounded-lg bg-white p-3 [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: state.qrSvg }}
          />
        ) : (
          <p className="mt-2 text-xs text-primary-500">
            جاري تحضير البطاقة — حدّث الصفحة بعد لحظات إن لم يظهر الرمز.
          </p>
        )}
        <p className="mt-3 text-xs text-primary-500">
          يمكنك أيضًا البحث برقم هاتفه لتسجيل نقاطه مباشرة.
        </p>
      </div>
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
