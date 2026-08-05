"use client";

import { useActionState } from "react";
import { addPointsTransaction, type CustomerActionState } from "./actions";
import type { LoyaltyProgram } from "@/types/database";

const initialState: CustomerActionState = { error: null, success: false };

export function AddPointsForm({
  customerId,
  program,
}: {
  customerId: string;
  program: LoyaltyProgram | null;
}) {
  const addWithId = addPointsTransaction.bind(null, customerId);
  const [state, formAction, pending] = useActionState(addWithId, initialState);

  const defaultPoints =
    program?.earning_type === "visit" ? program.points_per_visit : 1;

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 rounded-lg border border-primary-200 p-4 dark:border-primary-800">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm font-medium">
            نوع العملية
          </label>
          <select
            id="type"
            name="type"
            defaultValue="earn"
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          >
            <option value="earn">إضافة نقاط (زيارة/شراء)</option>
            <option value="redeem">استبدال نقاط</option>
            <option value="adjustment">تعديل يدوي</option>
            <option value="refund">استرجاع</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="points" className="text-sm font-medium">
            عدد النقاط
          </label>
          <input
            id="points"
            name="points"
            type="number"
            min={1}
            required
            defaultValue={defaultPoints}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          ملاحظة (اختياري)
        </label>
        <input
          id="description"
          name="description"
          type="text"
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
          تم تسجيل العملية بنجاح.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary-900 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
      >
        {pending ? "جاري التسجيل..." : "تسجيل العملية"}
      </button>
    </form>
  );
}
