import type { Metadata, Viewport } from "next";
import {
  El_Messiri,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans_Arabic,
  Tajawal,
} from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";

// Geist ships no Arabic glyphs, so every Arabic string in the UI was falling
// back to whatever the OS picked. IBM_Plex_Sans_Arabic carries the Arabic
// range and is listed ahead of Geist in --font-sans (see globals.css).
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Loaded only for the loyalty pass (see --font-card-display/--font-card-body
// in globals.css) — a business's shop name reads better in a display face
// than the app chrome does, so this stays scoped to the card rather than
// replacing --font-sans everywhere.
const cardDisplay = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["arabic"],
  weight: ["500", "700"],
});

const cardBody = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Digital Loyalty Wallet | برنامج الولاء الرقمي",
  description: "برنامج ولاء رقمي متقدم داخل Apple Wallet و Google Wallet لمحلك",
  keywords: "برنامج ولاء, نقاط, مكافآت, محفظة رقمية, loyalty",
  applicationName: "Digital Loyalty Wallet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loyalty Wallet",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Fills the area behind the notch / home indicator so the PWA looks native;
  // globals.css then pads the body back with env(safe-area-inset-*).
  viewportFit: "cover",
  // Deliberately NOT setting userScalable: false — blocking pinch-zoom locks
  // out anyone who needs to magnify the screen.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#052622" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${arabic.variable} ${geistSans.variable} ${geistMono.variable} ${cardDisplay.variable} ${cardBody.variable} h-full antialiased`}
    >
      {/* No manual <head>: the metadata/viewport exports above already emit the
          manifest link, icons, theme-color and apple-web-app tags. */}
      <body className="min-h-screen flex flex-col">
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
