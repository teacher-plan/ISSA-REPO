"use client";

import { useActionState } from "react";
import { createEmployee, type EmployeeFormState } from "./actions";

const initialState: EmployeeFormState = { error: null, success: false };

export function NewEmployeeForm() {
  const [state, formAction, pending] = useActionState(
    createEmployee,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 rounded-lg border border-primary-200 p-4 dark:border-primary-800">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          الاسم الكامل
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
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
          dir="ltr"
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          كلمة مرور مؤقتة
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          dir="ltr"
          placeholder="8 أحرف على الأقل"
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
        <p className="text-xs text-primary-500">
          أعطِ هذه الكلمة للموظف مباشرة ليسجّل دخوله بها.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">الصلاحيات</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="add_points" defaultChecked className="h-4 w-4" />
          إضافة نقاط للعملاء
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="redeem_rewards" defaultChecked className="h-4 w-4" />
          استبدال المكافآت
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="manage_customers" className="h-4 w-4" />
          إدارة بيانات العملاء
        </label>
      </fieldset>

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-success-600" role="status">
          تم إنشاء حساب الموظف بنجاح.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
      >
        {pending ? "جاري الإنشاء..." : "إضافة موظف"}
      </button>
    </form>
  );
}
