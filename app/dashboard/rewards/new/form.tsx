"use client";

import { useActionState } from "react";
import { createReward, type RewardFormState } from "../actions";

const initialState: RewardFormState = { error: null, rewardId: null };

export function NewRewardForm() {
  const [state, formAction, pending] = useActionState(
    createReward,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          اسم المكافأة
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="مثال: قهوة مجانية"
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
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
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="image_url" className="text-sm font-medium">
          رابط الصورة
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://..."
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="points_required" className="text-sm font-medium">
            النقاط المطلوبة
          </label>
          <input
            id="points_required"
            name="points_required"
            type="number"
            min={1}
            required
            defaultValue={10}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="quantity" className="text-sm font-medium">
            الكمية (اتركه فارغًا لغير محدود)
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-primary-900 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
      >
        {pending ? "جاري الإضافة..." : "إضافة المكافأة"}
      </button>
    </form>
  );
}
