"use client";

import { useActionState } from "react";
import {
  deactivateWalletProvider,
  saveWalletProvider,
  testWalletConnection,
  type WalletProviderState,
} from "./actions";
import type { WalletProviderSettings } from "@/types/database";

const initialState: WalletProviderState = {
  error: null,
  success: false,
  testResult: null,
};

export function WalletProviderForm({
  settings,
}: {
  settings: WalletProviderSettings | null;
}) {
  const [saveState, saveAction, savePending] = useActionState(
    saveWalletProvider,
    initialState
  );
  const [testState, testAction, testPending] = useActionState(
    testWalletConnection,
    initialState
  );

  return (
    <div className="mt-8 flex flex-col gap-8">
      {settings && (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <p>
            المزوّد المُفعّل حاليًا: <strong>{settings.provider_name}</strong>
          </p>
          <p className="mt-1 text-zinc-500" dir="ltr">
            API Key: {settings.api_key.slice(0, 4)}••••••••
          </p>
          <form action={deactivateWalletProvider} className="mt-3">
            <button
              type="submit"
              className="text-sm text-red-600 underline hover:text-red-700"
            >
              إيقاف هذا المزوّد
            </button>
          </form>
        </div>
      )}

      <form action={saveAction} className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500">
          {settings ? "تغيير المزوّد" : "إعداد مزوّد جديد"}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="provider_name" className="text-sm font-medium">
            المزوّد
          </label>
          <select
            id="provider_name"
            name="provider_name"
            defaultValue="passkit"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="passkit">PassKit</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="api_key" className="text-sm font-medium">
            API Key
          </label>
          <input
            id="api_key"
            name="api_key"
            type="text"
            required
            dir="ltr"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="api_secret" className="text-sm font-medium">
            API Secret
          </label>
          <input
            id="api_secret"
            name="api_secret"
            type="password"
            required
            dir="ltr"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {saveState.error && (
          <p className="text-sm text-red-600" role="alert">
            {saveState.error}
          </p>
        )}
        {saveState.success && (
          <p className="text-sm text-emerald-600" role="status">
            تم حفظ إعدادات المزوّد.
          </p>
        )}

        <button
          type="submit"
          disabled={savePending}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {savePending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>

      {settings && (
        <form action={testAction} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-zinc-500">اختبار الاتصال</h2>
          {testState.testResult && (
            <p
              className={`text-sm ${testState.testResult.ok ? "text-emerald-600" : "text-red-600"}`}
              role="status"
            >
              {testState.testResult.message}
            </p>
          )}
          <button
            type="submit"
            disabled={testPending}
            className="w-fit rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {testPending ? "جاري الاختبار..." : "اختبار الاتصال"}
          </button>
        </form>
      )}
    </div>
  );
}
