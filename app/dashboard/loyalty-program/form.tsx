"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { saveLoyaltyProgram, type LoyaltyProgramState } from "./actions";
import {
  generateOfferText,
  REWARD_TYPE_LABELS,
  REWARD_VALUE_LABELS,
  REWARD_VALUE_PLACEHOLDERS,
} from "@/lib/loyalty/offer";
import type { EarningType, LoyaltyProgram, RewardType } from "@/types/database";

const initialState: LoyaltyProgramState = { error: null, success: false };

export function LoyaltyProgramForm({
  program,
  nextHref,
}: {
  program: LoyaltyProgram | null;
  /** Onboarding only: where "متابعة" goes once the offer is saved. */
  nextHref?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveLoyaltyProgram,
    initialState
  );
  const [earningType, setEarningType] = useState<EarningType>(
    program?.earning_type ?? "visit"
  );
  const [pointsPerAmount, setPointsPerAmount] = useState(
    program?.points_per_amount ?? 1
  );

  const [rewardThreshold, setRewardThreshold] = useState(
    program?.reward_threshold ?? 9
  );
  const [rewardType, setRewardType] = useState<RewardType>(
    program?.reward_type ?? "free_item"
  );
  const [rewardValue, setRewardValue] = useState(program?.reward_value ?? "");
  const [offerText, setOfferText] = useState(program?.offer_text ?? "");
  // Once the owner types into the offer-text field directly, stop
  // overwriting it every time they change the threshold or value — a
  // generated starting point should not fight a deliberate edit.
  const [offerTextTouched, setOfferTextTouched] = useState(false);

  const generatedOfferText = useMemo(() => {
    if (rewardType === "custom") return null;
    return generateOfferText(rewardThreshold, rewardType, rewardValue);
  }, [rewardThreshold, rewardType, rewardValue]);

  const displayedOfferText =
    rewardType !== "custom" && !offerTextTouched
      ? (generatedOfferText ?? "")
      : offerText;

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
          defaultValue={program?.description ?? ""}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
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
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        >
          <option value="visit">نقطة ثابتة عند كل زيارة</option>
          <option value="amount">نقاط تتناسب مع المبلغ المدفوع</option>
        </select>
        <p className="text-xs text-primary-500">
          هذا يحدد فقط متى يحصل العميل على نقاط — اختر الطريقة الأقرب لكيف
          تُسجَّل مبيعاتك عندك.
        </p>
      </div>

      {earningType === "visit" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="points_per_visit" className="text-sm font-medium">
            كم نقطة يأخذها العميل في كل زيارة؟
          </label>
          <input
            id="points_per_visit"
            name="points_per_visit"
            type="number"
            min={1}
            defaultValue={program?.points_per_visit ?? 1}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="points_per_amount" className="text-sm font-medium">
            كم نقطة مقابل كل ١ ريال؟
          </label>
          <input
            id="points_per_amount"
            name="points_per_amount"
            type="number"
            min={0.1}
            step={0.1}
            value={pointsPerAmount}
            onChange={(e) => setPointsPerAmount(Number(e.target.value) || 0)}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
          <p className="text-xs text-primary-500">
            يعني: لو دفع عميلك ١٠٠ ريال، سيحصل على{" "}
            <span className="font-semibold text-primary-700 dark:text-primary-300">
              {Math.round(pointsPerAmount * 100 * 10) / 10}
            </span>{" "}
            نقطة.
          </p>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-4 rounded-xl border border-accent-300 bg-accent-50 p-4 dark:border-accent-800 dark:bg-accent-950/20">
        <p className="text-sm font-semibold text-accent-800 dark:text-accent-300">
          عرض البطاقة — ما يراه عميلك
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reward_threshold" className="text-sm font-medium">
            كم مرة يحتاج العميل أن يشتري ليستحق الجائزة؟
          </label>
          <input
            id="reward_threshold"
            name="reward_threshold"
            type="number"
            min={1}
            required
            value={rewardThreshold}
            onChange={(e) => setRewardThreshold(Number(e.target.value) || 1)}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reward_type" className="text-sm font-medium">
            نوع الجائزة
          </label>
          <select
            id="reward_type"
            name="reward_type"
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value as RewardType)}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          >
            {Object.entries(REWARD_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {rewardType !== "custom" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reward_value" className="text-sm font-medium">
              {REWARD_VALUE_LABELS[rewardType]}
            </label>
            <input
              id="reward_value"
              name="reward_value"
              type="text"
              required
              value={rewardValue}
              onChange={(e) => setRewardValue(e.target.value)}
              placeholder={REWARD_VALUE_PLACEHOLDERS[rewardType]}
              className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="offer_text" className="text-sm font-medium">
            النص الذي يظهر على البطاقة
          </label>
          <input
            id="offer_text"
            name="offer_text"
            type="text"
            required
            maxLength={60}
            value={displayedOfferText}
            onChange={(e) => {
              setOfferText(e.target.value);
              setOfferTextTouched(true);
            }}
            className="rounded-md border border-accent-400 bg-white px-3 py-2.5 text-base min-h-touch font-medium dark:border-accent-700 dark:bg-primary-900"
          />
          <p className="text-xs text-primary-500">
            {rewardType === "custom"
              ? "اكتب العرض بصيغتك الخاصة."
              : "تولَّد تلقائيًا من الحقول أعلاه، ويمكنك تعديلها."}
          </p>
        </div>
      </div>

      <p className="text-xs text-primary-500">
        عدد المرات أعلاه يحدد أيضًا شكل شبكة الأختام على البطاقة. مكافآت
        أخرى قابلة للاستبدال بأسعار نقاط منفصلة تُنشأ من{" "}
        <Link href="/dashboard/rewards" className="underline">
          قسم المكافآت
        </Link>
        .
      </p>

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}

      {state.success && (
        <div className="rounded-lg border-r-4 border-success-500 bg-success-50 p-3">
          <p role="status" className="text-sm text-success-800">
            تم الحفظ بنجاح.
          </p>
          {nextHref && (
            <Link
              href={nextHref}
              className="mt-3 inline-flex min-h-touch items-center rounded-full bg-brand-800 px-5 text-sm font-semibold text-white hover:bg-brand-900"
            >
              متابعة ←
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
      >
        {pending ? "جاري الحفظ..." : "حفظ برنامج الولاء"}
      </button>
    </form>
  );
}
