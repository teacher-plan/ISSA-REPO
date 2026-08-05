"use client";

import { useActionState } from "react";
import { redeemRewardForCustomer, type CustomerActionState } from "./actions";
import type { Reward } from "@/types/database";

const initialState: CustomerActionState = { error: null, success: false };

export function RedeemRewardForm({
  customerId,
  rewards,
  customerPoints,
}: {
  customerId: string;
  rewards: Reward[];
  customerPoints: number;
}) {
  const redeemWithId = redeemRewardForCustomer.bind(null, customerId);
  const [state, formAction, pending] = useActionState(
    redeemWithId,
    initialState
  );

  const activeRewards = rewards.filter((r) => r.is_active);

  if (activeRewards.length === 0) {
    return (
      <p className="mt-3 text-sm text-primary-500">
        لا توجد مكافآت مفعّلة حاليًا.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-col gap-3 rounded-lg border border-primary-200 p-4 dark:border-primary-800"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reward_id" className="text-sm font-medium">
          اختر مكافأة
        </label>
        <select
          id="reward_id"
          name="reward_id"
          required
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
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

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-success-600" role="status">
          تم استبدال المكافأة بنجاح.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
      >
        {pending ? "جاري الاستبدال..." : "استبدال المكافأة"}
      </button>
    </form>
  );
}
