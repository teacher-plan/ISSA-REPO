"use client";

import { useActionState } from "react";
import { deleteReward, updateReward, type RewardActionState } from "./actions";
import type { Reward } from "@/types/database";

const initialState: RewardActionState = { error: null, success: false };

export function EditRewardForm({ reward }: { reward: Reward }) {
  const updateWithId = updateReward.bind(null, reward.id);
  const [state, formAction, pending] = useActionState(
    updateWithId,
    initialState
  );

  return (
    <>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            اسم المكافأة
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={reward.name}
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
            defaultValue={reward.description ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
            defaultValue={reward.image_url ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
              defaultValue={reward.points_required}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
              defaultValue={reward.quantity ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={reward.is_active}
            className="h-4 w-4"
          />
          مفعّلة (تظهر للاستبدال)
        </label>

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
          {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>

      <form action={deleteReward.bind(null, reward.id)} className="mt-4">
        <button
          type="submit"
          className="text-sm text-red-600 underline hover:text-red-700"
        >
          حذف المكافأة
        </button>
      </form>
    </>
  );
}
