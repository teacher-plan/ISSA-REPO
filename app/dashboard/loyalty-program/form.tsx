"use client";

import Link from "next/link";
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
  const [pointsPerAmount, setPointsPerAmount] = useState(
    program?.points_per_amount ?? 1
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reward_threshold" className="text-sm font-medium">
          كم نقطة يحتاجها العميل ليرى بطاقته ممتلئة؟
        </label>
        <input
          id="reward_threshold"
          name="reward_threshold"
          type="number"
          min={1}
          required
          defaultValue={program?.reward_threshold ?? 10}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
        <p className="text-xs text-primary-500">
          هذا الرقم يحدد شكل شبكة الأختام على بطاقة عميلك فقط. المكافأة
          الفعلية التي يستبدلها (مثل قهوة مجانية) وسعرها بالنقاط تُنشأ
          بشكل منفصل من{" "}
          <Link href="/dashboard/rewards" className="underline">
            قسم المكافآت
          </Link>
          .
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-success-600" role="status">
          تم الحفظ بنجاح.
        </p>
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
