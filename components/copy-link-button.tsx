"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard access can fail (permissions, non-secure context) —
          // the link is already shown as plain, selectable text below this
          // button, so the owner can still copy it manually.
        }
      }}
      className="min-h-touch rounded-full border border-primary-300 px-4 text-sm font-medium hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-primary-900"
    >
      {copied ? "تم النسخ ✓" : "نسخ الرابط"}
    </button>
  );
}
