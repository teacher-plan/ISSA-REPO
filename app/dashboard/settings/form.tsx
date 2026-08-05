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
