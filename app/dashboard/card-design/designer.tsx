"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoyaltyCardVisual } from "@/components/brand/loyalty-card";
import { BUSINESS_KIND_LABELS } from "@/lib/card-design/kinds";
import type { CardTheme } from "@/lib/card-design/theme";
import {
  generateDesign,
  saveDesign,
  type DesignState,
  type SaveState,
} from "./actions";

const initialDesign: DesignState = {
  error: null,
  warnings: [],
  theme: null,
  kind: null,
};
const initialSave: SaveState = { error: null, success: false };

export function CardDesigner({
  businessName,
  savedTheme,
  savedKind,
  rewardThreshold,
  nextHref,
}: {
  businessName: string;
  savedTheme: CardTheme | null;
  savedKind: string | null;
  rewardThreshold: number | null;
  /** Onboarding only: where "متابعة" goes once a design is adopted. Omitted
   * on the regular dashboard page, where adopting a design is a standalone
   * action with nowhere further to go. */
  nextHref?: string;
}) {
  const [design, generateAction, generating] = useActionState(
    generateDesign,
    initialDesign
  );
  const [save, saveAction, saving] = useActionState(saveDesign, initialSave);

  // The freshly generated design wins the preview; otherwise show what is
  // already live, so the page always previews something real.
  const previewTheme = design.theme ?? savedTheme;
  const previewKind = design.kind ?? savedKind;
  const isDraft = design.theme !== null;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <form action={generateAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kind" className="text-sm font-medium">
            نوع النشاط
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={savedKind ?? "cafe"}
            className="min-h-touch rounded-lg border border-primary-300 px-3 py-2.5 text-base dark:border-primary-700 dark:bg-primary-900"
          >
            {Object.entries(BUSINESS_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="brand_color" className="text-sm font-medium">
            لون علامتك التجارية <span className="text-primary-400">(اختياري)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              id="brand_color"
              name="brand_color"
              type="color"
              defaultValue="#1f2937"
              className="min-h-touch h-11 w-16 cursor-pointer rounded-lg border border-primary-300 dark:border-primary-700"
            />
            <p className="text-xs text-primary-500">
              اتركه كما هو إن لم يكن لديك لون محدد.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium">
            ملاحظات <span className="text-primary-400">(اختياري)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={400}
            placeholder="مثال: أجواء المحل خشبية ودافئة، نريد شيئًا هادئًا."
            className="rounded-lg border border-primary-300 px-3 py-2.5 text-base dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        <button
          type="submit"
          disabled={generating}
          className="min-h-touch w-full rounded-xl bg-brand-800 px-5 py-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {generating
            ? "جاري التصميم..."
            : savedTheme
              ? "صمّم من جديد"
              : "صمّم بطاقتي"}
        </button>

        {design.error && (
          <p
            role="alert"
            className="rounded-lg border-r-4 border-error-500 bg-error-50 p-3 text-sm text-error-800"
          >
            {design.error}
          </p>
        )}

        {design.warnings.map((w) => (
          <p
            key={w}
            role="status"
            className="rounded-lg border-r-4 border-warning-500 bg-warning-50 p-3 text-sm text-warning-800"
          >
            {w}
          </p>
        ))}
      </form>

      <div>
        <p className="text-sm font-medium text-primary-500">
          {isDraft ? "معاينة (لم تُحفظ بعد)" : savedTheme ? "التصميم الحالي" : "الشكل الافتراضي"}
        </p>

        <LoyaltyCardVisual
          className="mt-3 min-h-[440px]"
          businessName={businessName}
          holderName="سارة المعمري"
          points={7}
          threshold={rewardThreshold ?? 10}
          theme={previewTheme}
          kind={previewKind}
        />

        <p className="mt-3 text-xs text-primary-500">
          هذه معاينة ببيانات تجريبية — بطاقة كل عميل تعرض اسمه ورصيده الحقيقي.
        </p>

        {isDraft && design.theme && (
          <form action={saveAction} className="mt-5">
            <input type="hidden" name="theme" value={JSON.stringify(design.theme)} />
            <input type="hidden" name="kind" value={design.kind ?? ""} />
            <button
              type="submit"
              disabled={saving}
              className="min-h-touch w-full rounded-xl bg-accent-500 px-5 py-4 text-base font-bold text-primary-900 disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "اعتمد هذا التصميم"}
            </button>
            {save.error && (
              <p role="alert" className="mt-2 text-sm text-error-600">
                {save.error}
              </p>
            )}
          </form>
        )}

        {save.success && !isDraft && (
          <div className="mt-4 rounded-lg border-r-4 border-success-500 bg-success-50 p-3">
            <p role="status" className="text-sm text-success-800">
              تم اعتماد التصميم — سيظهر على بطاقات عملائك.
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
      </div>
    </div>
  );
}
