"use client";

import { useActionState, useState } from "react";
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

  // The two credential columns mean different things per provider, so the
  // labels and input types switch with the selection rather than asking an
  // admin to guess that "API Secret" means a JSON key file.
  const [provider, setProvider] = useState<"passkit" | "google">("passkit");
  const isGoogle = provider === "google";

  return (
    <div className="mt-8 flex flex-col gap-8">
      {settings && (
        <div className="rounded-lg border border-primary-200 p-4 text-sm dark:border-primary-800">
          <p>
            المزوّد المُفعّل حاليًا: <strong>{settings.provider_name}</strong>
          </p>
          <p className="mt-1 text-primary-500" dir="ltr">
            API Key: {settings.api_key.slice(0, 4)}••••••••
          </p>
          <form action={deactivateWalletProvider} className="mt-3">
            <button
              type="submit"
              className="text-sm text-error-600 underline hover:text-error-700"
            >
              إيقاف هذا المزوّد
            </button>
          </form>
        </div>
      )}

      <form action={saveAction} className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-primary-500">
          {settings ? "تغيير المزوّد" : "إعداد مزوّد جديد"}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="provider_name" className="text-sm font-medium">
            المزوّد
          </label>
          <select
            id="provider_name"
            name="provider_name"
            value={provider}
            onChange={(e) => setProvider(e.target.value as "passkit" | "google")}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          >
            <option value="passkit">PassKit (Apple + Google)</option>
            <option value="google">Google Wallet (مباشر)</option>
          </select>
          <p className="text-xs text-primary-500">
            {isGoogle
              ? "مجاني — يحتاج حساب Issuer من Google Pay & Wallet Console فقط، بدون رسوم سنوية."
              : "يتطلب حساب مطور Apple ($99/سنة) بالإضافة إلى اشتراك PassKit."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="api_key" className="text-sm font-medium">
            {isGoogle ? "Issuer ID" : "API Key"}
          </label>
          <input
            id="api_key"
            name="api_key"
            type="text"
            required
            dir="ltr"
            placeholder={isGoogle ? "3388000000022xxxxxx" : undefined}
            className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="api_secret" className="text-sm font-medium">
            {isGoogle ? "Service Account JSON" : "API Secret"}
          </label>
          {isGoogle ? (
            <textarea
              id="api_secret"
              name="api_secret"
              required
              dir="ltr"
              rows={6}
              placeholder={'{\n  "client_email": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----..."\n}'}
              className="rounded-md border border-primary-300 px-3 py-2 font-mono text-xs dark:border-primary-700 dark:bg-primary-900"
            />
          ) : (
            <input
              id="api_secret"
              name="api_secret"
              type="password"
              required
              dir="ltr"
              className="rounded-md border border-primary-300 px-3 py-2.5 text-base min-h-touch dark:border-primary-700 dark:bg-primary-900"
            />
          )}
          {isGoogle && (
            <p className="text-xs text-primary-500">
              الصق محتوى ملف مفتاح حساب الخدمة كاملًا كما نزّلته من Google Cloud.
            </p>
          )}
        </div>

        {saveState.error && (
          <p className="text-sm text-error-600" role="alert">
            {saveState.error}
          </p>
        )}
        {saveState.success && (
          <p className="text-sm text-success-600" role="status">
            تم حفظ إعدادات المزوّد.
          </p>
        )}

        <button
          type="submit"
          disabled={savePending}
          className="rounded-full bg-primary-900 px-5 py-2.5 text-sm font-medium min-h-touch text-white transition-colors hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-50 dark:text-primary-900 dark:hover:bg-primary-200"
        >
          {savePending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>

      {settings && (
        <form action={testAction} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-primary-500">اختبار الاتصال</h2>
          {testState.testResult && (
            <p
              className={`text-sm ${testState.testResult.ok ? "text-success-600" : "text-error-600"}`}
              role="status"
            >
              {testState.testResult.message}
            </p>
          )}
          <button
            type="submit"
            disabled={testPending}
            className="w-fit rounded-full border border-primary-300 px-5 py-2.5 text-sm font-medium min-h-touch hover:bg-primary-50 disabled:opacity-50 dark:border-primary-700 dark:hover:bg-primary-900"
          >
            {testPending ? "جاري الاختبار..." : "اختبار الاتصال"}
          </button>
        </form>
      )}
    </div>
  );
}
