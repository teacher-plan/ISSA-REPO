"use client";

import { useActionState } from "react";
import { joinBusiness, type JoinState } from "./actions";

const initialState: JoinState = { error: null };

export function JoinForm({ businessId }: { businessId: string }) {
  const joinWithId = joinBusiness.bind(null, businessId);
  const [state, formAction, pending] = useActionState(joinWithId, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          اسمك
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          رقم جوالك
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        />
      </div>

      {state.error && (
        <p className="text-sm text-error-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-brand-800 px-5 py-3 text-base font-semibold min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
      >
        {pending ? "جاري الانضمام..." : "انضم واحصل على بطاقتك"}
      </button>
    </form>
  );
}
