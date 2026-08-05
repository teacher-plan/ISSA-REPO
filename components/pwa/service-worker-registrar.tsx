"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker.
 *
 * This runs from an effect rather than a `dangerouslySetInnerHTML` <script> in
 * the layout so the registration is skipped during SSR and does not need an
 * inline-script CSP exemption.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      // A failed registration costs offline support, nothing more — the app
      // still works, so this must never surface as an error to the user.
      console.warn("Service worker registration failed:", err);
    });
  }, []);

  return null;
}
