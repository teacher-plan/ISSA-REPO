"use client";

import { useActionState } from "react";
import { addPointsAsEmployee, type EmployeeActionState } from "./actions";
import type { LoyaltyProgram } from "@/types/database";

const initialState: EmployeeActionState = { error: null, success: false };

export function EmployeeAddPointsForm({
  customerId,
  program,
}: {
  customerId: string;
  program: LoyaltyProgram | null;
}) {
  const addWithId = addPointsAsEmployee.bind(null, customerId);
  const [state, formAction, pending] = useActionState(addWithId, initialState);

  const defaultPoints =
    program?.earning_type === "visit" ? program.points_per_visit : 1;

  return (
    <form action={formAction} className="mt-3 flex items-end gap-2">
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
          className="w-24 rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary-900 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
      >
        {pending ? "جاري الإضافة..." : "إضافة نقاط"}
      </button>
      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-success-600" role="status">
          تمت الإضافة.
        </p>
      )}
    </form>
  );
}
