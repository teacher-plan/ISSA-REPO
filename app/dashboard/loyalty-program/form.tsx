"use client";

import { useActionState, useState } from "react";
import { saveLoyaltyProgram, type LoyaltyProgramState } from "./actions";
import type { EarningType, LoyaltyProgram } from "@/types/database";

const initialState: LoyaltyProgramState = { error: null, success: false };

export function LoyaltyProgramForm({
  program,
}: {
  program: LoyaltyProgram | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveLoyaltyProgram,
    initialState
  );
  const [earningType, setEarningType] = useState<EarningType>(
    program?.earning_type ?? "visit"
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          اسم البرنامج
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={program?.name ?? ""}
          placeholder="مثال: برنامج ولاء القهوة"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          الوصف
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={program?.description ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="earning_type" className="text-sm font-medium">
          طريقة احتساب النقاط
        </label>
        <select
          id="earning_type"
          name="earning_type"
          value={earningType}
          onChange={(e) => setEarningType(e.target.value as EarningType)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="visit">حسب الزيارة</option>
          <option value="amount">حسب المبلغ المدفوع</option>
        </select>
      </div>

      {earningType === "visit" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="points_per_visit" className="text-sm font-medium">
            نقاط لكل زيارة
          </label>
          <input
            id="points_per_visit"
            name="points_per_visit"
            type="number"
            min={1}
            defaultValue={program?.points_per_visit ?? 1}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="points_per_amount" className="text-sm font-medium">
            نقطة لكل وحدة عملة
          </label>
          <input
            id="points_per_amount"
            name="points_per_amount"
            type="number"
            min={0.1}
            step={0.1}
            defaultValue={program?.points_per_amount ?? 1}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reward_threshold" className="text-sm font-medium">
          عدد النقاط المطلوبة للمكافأة
        </label>
        <input
          id="reward_threshold"
          name="reward_threshold"
          type="number"
          min={1}
          required
          defaultValue={program?.reward_threshold ?? 10}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600" role="status">
          تم الحفظ بنجاح.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "جاري الحفظ..." : "حفظ برنامج الولاء"}
      </button>
    </form>
  );
}
