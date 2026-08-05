"use client";

import { useActionState } from "react";
import { redeemRewardAsEmployee, type EmployeeActionState } from "./actions";
import type { Reward } from "@/types/database";

const initialState: EmployeeActionState = { error: null, success: false };

export function EmployeeRedeemRewardForm({
  customerId,
  rewards,
  customerPoints,
}: {
  customerId: string;
  rewards: Reward[];
  customerPoints: number;
}) {
  const redeemWithId = redeemRewardAsEmployee.bind(null, customerId);
  const [state, formAction, pending] = useActionState(
    redeemWithId,
    initialState
  );

  const activeRewards = rewards.filter((r) => r.is_active);

  if (activeRewards.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-500">لا توجد مكافآت مفعّلة حاليًا.</p>
    );
  }

  return (
    <form action={formAction} className="mt-3 flex items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reward_id" className="text-sm font-medium">
          المكافأة
        </label>
        <select
          id="reward_id"
          name="reward_id"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {activeRewards.map((reward) => {
            const disabled =
              customerPoints < reward.points_required ||
              (reward.quantity !== null && reward.quantity <= 0);
            return (
              <option key={reward.id} value={reward.id} disabled={disabled}>
                {reward.name} — {reward.points_required} نقطة
                {disabled ? " (غير متاح)" : ""}
              </option>
            );
          })}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "جاري الاستبدال..." : "استبدال"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600" role="status">
          تم الاستبدال.
        </p>
      )}
    </form>
  );
}
