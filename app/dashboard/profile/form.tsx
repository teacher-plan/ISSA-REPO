"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "./actions";
import type { Profile } from "@/types/database";

const initialState: ProfileState = { error: null, success: false };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          الاسم الكامل
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={profile.full_name}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          disabled
          value={profile.email}
          className="rounded-md border border-primary-300 bg-primary-100 px-3 py-2 text-sm text-primary-500 dark:border-primary-700 dark:bg-primary-800"
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
          defaultValue={profile.phone ?? ""}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
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
        {pending ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </form>
  );
}
