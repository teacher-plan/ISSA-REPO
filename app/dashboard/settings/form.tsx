"use client";

import { useActionState, useState } from "react";
import {
  updateBusinessSettings,
  type BusinessSettingsState,
} from "./actions";
import type { Business, BusinessSettings, WalletProviderName } from "@/types/database";

const initialState: BusinessSettingsState = { error: null, success: false };

const VALIDITY_PRESETS = [3, 6, 12, 24];

function validityToPreset(months: number | null): string {
  if (months === null) return "none";
  if (VALIDITY_PRESETS.includes(months)) return String(months);
  return "custom";
}

export function BusinessSettingsForm({
  business,
  settings,
  activeWalletProvider,
}: {
  business: Business;
  settings: BusinessSettings | null;
  /** Which provider the platform admin has switched on, or null if none yet.
   * Drives which of the two ID fields below is even shown — before this,
   * the form showed both PassKit and Google fields unconditionally, with no
   * way for an owner to tell which one (if either) actually did anything. */
  activeWalletProvider: WalletProviderName | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateBusinessSettings,
    initialState
  );

  const [validityPreset, setValidityPreset] = useState(() =>
    validityToPreset(settings?.card_validity_months ?? null)
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          اسم المحل
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={business.name}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="logo_url" className="text-sm font-medium">
          رابط الشعار
        </label>
        <input
          id="logo_url"
          name="logo_url"
          type="url"
          defaultValue={business.logo_url ?? ""}
          placeholder="https://..."
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          رقم الهاتف
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={business.phone ?? ""}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium">
          العنوان
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={business.address ?? ""}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="primary_color" className="text-sm font-medium">
            اللون الأساسي
          </label>
          <input
            id="primary_color"
            name="primary_color"
            type="color"
            defaultValue={settings?.primary_color ?? "#18181b"}
            className="h-10 w-full rounded-md border border-primary-300 dark:border-primary-700"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="secondary_color" className="text-sm font-medium">
            اللون الثانوي
          </label>
          <input
            id="secondary_color"
            name="secondary_color"
            type="color"
            defaultValue={settings?.secondary_color ?? "#f4f4f5"}
            className="h-10 w-full rounded-md border border-primary-300 dark:border-primary-700"
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1.5 rounded-xl border border-primary-200 p-4 dark:border-primary-800">
        <label htmlFor="card_validity_preset" className="text-sm font-medium">
          مدة صلاحية بطاقة العميل
        </label>
        <select
          id="card_validity_preset"
          name="card_validity_preset"
          value={validityPreset}
          onChange={(e) => setValidityPreset(e.target.value)}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        >
          <option value="none">بلا انتهاء</option>
          <option value="3">3 أشهر</option>
          <option value="6">6 أشهر</option>
          <option value="12">12 شهرًا</option>
          <option value="24">24 شهرًا</option>
          <option value="custom">مدة مخصصة</option>
        </select>

        {validityPreset === "custom" && (
          <input
            name="card_validity_custom_months"
            type="number"
            min={1}
            defaultValue={
              settings?.card_validity_months &&
              !VALIDITY_PRESETS.includes(settings.card_validity_months)
                ? settings.card_validity_months
                : ""
            }
            placeholder="عدد الأشهر"
            className="mt-1 rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        )}

        <p className="text-xs text-primary-500">
          تُحسب الصلاحية لكل بطاقة من تاريخ إصدارها لعميلها، وليس من تاريخ
          تغييرك لهذا الإعداد — تعديله هنا لا يغيّر صلاحية بطاقات صادرة
          مسبقًا. بعد الانتهاء تتوقف بطاقة العميل عن كسب نقاط جديدة، مع بقاء
          حقه في استبدال أي مكافأة سبق أن استحقها. يمكنك تجديد بطاقة عميل
          بعينه لاحقًا من صفحته.
        </p>
      </div>

      <h2 className="mt-4 text-sm font-medium text-primary-500">
        ربط البطاقة بمحفظة آبل وجوجل
      </h2>

      {activeWalletProvider === null && (
        <p className="-mt-2 rounded-lg border-r-4 border-primary-300 bg-primary-50 p-3 text-xs text-primary-600 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-400">
          لم تُفعّل المنصة مزوّد محفظة رقمية بعد — لا حاجة لفعل أي شيء هنا
          الآن. سيظهر لك حقل التعبئة المطلوب تلقائيًا حين يصبح جاهزًا، وحتى
          ذلك الحين تعمل بطاقة عميلك برمز المسح وحده (القسم التالي).
        </p>
      )}

      {activeWalletProvider === "passkit" && (
        <>
          <p className="-mt-2 text-xs text-primary-500">
            صمّم شكل بطاقتك مرة واحدة في حساب PassKit الخاص بك (المزوّد الذي
            تستخدمه المنصة حاليًا)، ثم الصق هنا المعرّفين اللذين يعطيك
            إياهما ذلك الحساب. بدونهما لن تصل بطاقات عملائك إلى Apple/Google
            Wallet — لكن تسجيل النقاط عبر رمز المسح يبقى يعمل بدون هذه
            الخطوة.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="passkit_program_id" className="text-sm font-medium">
                معرّف البرنامج <span className="text-primary-400">(Program ID)</span>
              </label>
              <input
                id="passkit_program_id"
                name="passkit_program_id"
                type="text"
                dir="ltr"
                defaultValue={settings?.passkit_program_id ?? ""}
                className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="passkit_tier_id" className="text-sm font-medium">
                معرّف الفئة <span className="text-primary-400">(Tier ID)</span>
              </label>
              <input
                id="passkit_tier_id"
                name="passkit_tier_id"
                type="text"
                dir="ltr"
                defaultValue={settings?.passkit_tier_id ?? ""}
                className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
              />
            </div>
          </div>
        </>
      )}

      {activeWalletProvider === "google" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="google_wallet_class_id" className="text-sm font-medium">
            معرّف بطاقتك في Google Wallet
          </label>
          <p className="text-xs text-primary-500">
            أنشئ فئة الولاء (LoyaltyClass) الخاصة بمحلك من حساب Google Wallet
            الخاص بك، والصق معرّفها هنا. بدونه لن تصل بطاقات عملائك إلى
            Google Wallet — لكن تسجيل النقاط عبر رمز المسح يبقى يعمل بدون
            هذه الخطوة.
          </p>
          <input
            id="google_wallet_class_id"
            name="google_wallet_class_id"
            type="text"
            dir="ltr"
            placeholder="3388000000022xxxxxx.my-shop-loyalty"
            defaultValue={settings?.google_wallet_class_id ?? ""}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>
      )}

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
        {pending ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </form>
  );
}
