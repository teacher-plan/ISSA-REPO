"use client";

import { useActionState } from "react";
import {
  updateBusinessSettings,
  type BusinessSettingsState,
} from "./actions";
import type { Business, BusinessSettings } from "@/types/database";

const initialState: BusinessSettingsState = { error: null, success: false };

export function BusinessSettingsForm({
  business,
  settings,
}: {
  business: Business;
  settings: BusinessSettings | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateBusinessSettings,
    initialState
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="country" className="text-sm font-medium">
          الدولة
        </label>
        <input
          id="country"
          name="country"
          type="text"
          defaultValue={business.country ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
            className="h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700"
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
            className="h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700"
          />
        </div>
      </div>

      <h2 className="mt-4 text-sm font-medium text-zinc-500">
        قالب المحفظة الرقمية (PassKit)
      </h2>
      <p className="-mt-2 text-xs text-zinc-500">
        بعد تصميم بطاقتك في لوحة PassKit، أدخل معرّف البرنامج (Program) والفئة
        (Tier) هنا لتفعيل إصدار البطاقات لعملائك.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="passkit_program_id" className="text-sm font-medium">
            PassKit Program ID
          </label>
          <input
            id="passkit_program_id"
            name="passkit_program_id"
            type="text"
            dir="ltr"
            defaultValue={settings?.passkit_program_id ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="passkit_tier_id" className="text-sm font-medium">
            PassKit Tier ID
          </label>
          <input
            id="passkit_tier_id"
            name="passkit_tier_id"
            type="text"
            dir="ltr"
            defaultValue={settings?.passkit_tier_id ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="google_wallet_class_id" className="text-sm font-medium">
          Google Wallet Class ID
        </label>
        <p className="text-xs text-zinc-500">
          إن كانت المنصة تستخدم Google Wallet مباشرة، أدخل معرّف الـ LoyaltyClass
          الخاص بمحلك بدل حقول PassKit أعلاه.
        </p>
        <input
          id="google_wallet_class_id"
          name="google_wallet_class_id"
          type="text"
          dir="ltr"
          placeholder="3388000000022xxxxxx.my-shop-loyalty"
          defaultValue={settings?.google_wallet_class_id ?? ""}
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
        {pending ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </form>
  );
}
