"use client";

import { useActionState } from "react";
import {
  updateBusinessSubscription,
  type SubscriptionAdminState,
} from "./actions";
import type { PlanName, Subscription, SubscriptionPlan } from "@/types/database";

const initialState: SubscriptionAdminState = { error: null, success: false };

export function SubscriptionAdminForm({
  businessId,
  subscription,
  plans,
}: {
  businessId: string;
  subscription: Subscription;
  plans: SubscriptionPlan[];
}) {
  const updateWithId = updateBusinessSubscription.bind(null, businessId);
  const [state, formAction, pending] = useActionState(
    updateWithId,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="plan_name" className="text-sm font-medium">
          الخطة
        </label>
        <select
          id="plan_name"
          name="plan_name"
          defaultValue={subscription.plan_name}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        >
          {plans.map((plan) => (
            <option key={plan.plan_name} value={plan.plan_name as PlanName}>
              {plan.display_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium">
          الحالة
        </label>
        <select
          id="status"
          name="status"
          defaultValue={subscription.status}
          className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
        >
          <option value="trial">تجريبي</option>
          <option value="active">نشط</option>
          <option value="expired">منتهي</option>
          <option value="cancelled">ملغى</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="end_date" className="text-sm font-medium">
          تاريخ الانتهاء
        </label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          defaultValue={subscription.end_date ?? ""}
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
        className="mt-2 w-fit rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-brand-900 disabled:opacity-50 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-brand-200"
      >
        {pending ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
