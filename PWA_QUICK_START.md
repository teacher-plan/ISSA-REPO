# PWA Quick Start Guide

## ✅ What's Been Set Up

### 1. **PWA Infrastructure**
- ✅ Service Worker for offline support
- ✅ Web App Manifest (PWA metadata)
- ✅ Meta tags for iOS/Android
- ✅ Icon configuration
- ✅ Dark mode support
- ✅ RTL/LTR support

### 2. **Visual Identity System**
- ✅ Complete color palette (primary, accent, semantic)
- ✅ Typography scale (mobile-first)
- ✅ Spacing & rhythm system
- ✅ Shadow system
- ✅ Border radius scale
- ✅ Touch-safe components (44px minimum)

### 3. **Responsive Design**
- ✅ Mobile-first approach
- ✅ Tailwind CSS integration
- ✅ Safe area support (notch, status bar)
- ✅ Breakpoints: sm, md, lg, xl

---

## 🚀 Getting Started

### 1. Generate Icons

First, install `sharp` for image processing:

```bash
npm install --save-dev sharp
```

Then generate icons from the SVG template:

```bash
npm run generate-icons
```

This creates:
- `icon-96.png` (shortcuts)
- `icon-192.png` (app icon)
- `icon-512.png` (splash screen)
- `icon-maskable-192.png` (adaptive icon)
- `icon-maskable-512.png` (adaptive icon)

### 2. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 3. Test PWA Features

**On Desktop (Chrome):**
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. You should see "service-worker.js" registered ✓
4. Check "Offline" to test offline mode
5. See Manifest tab for app metadata

**On iOS (Safari):**
1. Open the site in Safari
2. Tap Share ↗️
3. "Add to Home Screen"
4. Select icon and name
5. App installs to home screen

**On Android (Chrome):**
1. Open the site in Chrome
2. Tap Menu ⋮
3. "Install app" or "Add to Home Screen"
4. Confirm installation
5. App installs as PWA

---

## 🎨 Using the Design System

### Colors

All colors are defined as CSS variables in `app/globals.css`:

```html
<!-- Primary (Dark) -->
<button class="bg-primary-800 text-white">Click me</button>

<!-- Accent (Gold) - For loyalty rewards -->
<button class="bg-accent-500 text-white">Get Reward</button>

<!-- Success (Green) - For points earned -->
<div class="text-success-600">✓ 10 points added</div>

<!-- Warning (Orange) -->
<div class="text-warning-600">⚠️ Low balance</div>

<!-- Error (Red) -->
<div class="text-error-600">✗ Error occurred</div>
```

### Typography

```html
<!-- Large heading -->
<h1 class="text-3xl font-bold">Your Points: 250</h1>

<!-- Section header -->
<h2 class="text-2xl font-bold">Available Rewards</h2>

<!-- Body text -->
<p class="text-base leading-relaxed">Description here...</p>

<!-- Small label -->
<label class="text-sm font-medium">Email</label>
```

### Spacing

```html
<!-- Using the spacing scale -->
<div class="p-4 mb-6">      <!-- 16px padding, 24px bottom margin -->
  <h2 class="mb-2">Title</h2>   <!-- 8px bottom margin -->
  <p class="text-sm">Content</p>
</div>
```

### Touch-Safe Components

```html
<!-- All interactive elements should be at least 44px -->
<button class="min-h-11 px-4 py-3 rounded-lg font-semibold">
  Tap Me
</button>
```

### Cards

```html
<div class="bg-white dark:bg-primary-900 rounded-lg shadow-md p-4 border border-primary-200 dark:border-primary-800">
  <h3 class="text-lg font-semibold mb-2">Card Title</h3>
  <p class="text-sm text-primary-600 dark:text-primary-400">Card content</p>
</div>
```

---

## 📱 Mobile-First Responsive

```html
<!-- Mobile (default) → Desktop (with prefix) -->
<div class="text-lg md:text-xl lg:text-2xl">
  Text size adapts to screen size
</div>

<div class="w-full md:w-1/2 lg:w-1/3">
  Width: 100% on mobile, 50% on tablets, 33% on desktop
</div>

<div class="block md:grid md:grid-cols-2 lg:grid-cols-3">
  Layout: stack on mobile, columns on larger screens
</div>
```

---

## 🌙 Dark Mode

The app automatically supports dark mode:

```html
<!-- Light mode (default) -->
<div class="bg-white text-gray-900">
  Light background with dark text
</div>

<!-- Dark mode (automatic with 'dark:' prefix) -->
<div class="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50">
  Adapts colors based on system preference
</div>
```

Users can toggle dark mode in their OS settings - the app responds automatically.

---

## 🔄 RTL/LTR Support

The entire app is RTL-optimized:

```html
<!-- Automatically uses RTL for Arabic -->
<html lang="ar" dir="rtl">

<!-- Text alignment, margins, padding all flip automatically -->
<div class="text-right pr-4">Content</div>
```

All components automatically adjust for RTL.

---

## 🔒 Security & Performance

### Caching Strategy
- **Stale While Revalidate**: Service worker serves cached content while fetching fresh data
- **Offline Fallback**: Shows offline.html when no internet
- **Auto Cache Update**: Service worker updates cache in background

### Asset Optimization
- Images: SVG icons (scalable)
- Fonts: System fonts (fast loading)
- CSS: Tailwind + purged (only used classes)
- JS: Minified in production

---

## 📋 File Structure

```
/public
├── manifest.json          # PWA metadata (app name, icons, shortcuts)
├── service-worker.js      # Offline support & caching
├── offline.html           # Fallback page when offline
├── icon.svg              # Source icon (edit this)
├── icon-96.png           # Small icon (shortcuts)
├── icon-192.png          # Main app icon
├── icon-512.png          # Splash screen icon
├── icon-maskable-*.png   # Adaptive icons for Android

/app
├── layout.tsx            # Root layout with PWA meta tags
├── globals.css           # Design system (colors, typography, spacing)
├── page.tsx              # Landing page
├── auth/                 # Authentication pages
├── dashboard/            # Owner dashboard
├── employee/             # Employee interface
├── admin/                # Admin panel
└── c/                    # Public wallet card pages

(no tailwind.config.ts — Tailwind v4 is CSS-first; tokens live in the
                          @theme block inside app/globals.css)
```

---

## 🎯 Customization

### Change Brand Colors

Edit `app/globals.css` - find `:root` section:

```css
:root {
  --color-primary: #1f2937;     /* Dark slate */
  --color-accent: #f59e0b;      /* Gold */
  --color-success: #10b981;     /* Green */
  /* ... etc */
}
```

> **Tailwind v4 note:** tokens must sit inside the `@theme` block. A value
> declared in a plain `:root` block is a valid CSS variable but generates **no**
> utility class — `bg-primary-800` would silently produce nothing. There is no
> `tailwind.config.ts` in this project; v4 ignores it unless loaded with an
> explicit `@config` directive.

### Change App Name & Description

Edit `app/layout.tsx` metadata:

```ts
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
};
```

Edit `public/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "Short Name",
  "description": "Description here"
}
```

### Change App Icon

1. Create a new SVG or PNG
2. Replace `public/icon.svg`
3. Run `npm run generate-icons`
4. Icons will be regenerated automatically

---

## ✨ Next Steps

1. **Generate Icons**
   ```bash
   npm install --save-dev sharp
   npm run generate-icons
   ```

2. **Customize Brand Colors** (optional)
   - Edit the `@theme` block in `app/globals.css`
   - Change primary color from #1f2937 to your brand color

3. **Update Content**
   - Update app name in `layout.tsx`
   - Update `manifest.json` with your details
   - Customize `icon.svg` with your brand

4. **Test on Devices**
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Install app

5. **Deploy**
   - Build: `npm run build`
   - Start: `npm start`
   - Deploy to hosting (Vercel, etc.)

---

## 🆘 Troubleshooting

### Service Worker not registering?
- Check browser console for errors
- Clear cache: DevTools → Application → Clear storage → Unregister service workers
- Hard refresh: Cmd/Ctrl + Shift + R

### Icons not showing?
- Make sure icons exist in `public/`
- Clear browser cache
- Check `manifest.json` paths are correct
- Run `npm run generate-icons` again

### Dark mode not working?
- Check OS settings (not browser settings)
- CSS uses `@media (prefers-color-scheme: dark)`
- Ensure dark: prefixes are used in HTML

### App won't install?
- Must be HTTPS (localhost works for testing)
- Service worker must be registered
- Manifest.json must be valid
- Icons must exist and be correct size

---

## 📚 Resources

- **PWA Docs**: https://web.dev/progressive-web-apps/
- **Web App Manifest**: https://web.dev/web-app-manifest/
- **Service Workers**: https://web.dev/service-workers/
- **Tailwind CSS**: https://tailwindcss.com/
- **Next.js**: https://nextjs.org/docs

---

## 📝 Documentation Files

- **PWA_SETUP.md** - Detailed PWA configuration
- **VISUAL_IDENTITY.md** - Complete design system guide
- **PWA_QUICK_START.md** - This file
- **AGENTS.md** - System architecture & lessons learned

---

**Ready to go! 🚀**

Start dev server and test the PWA on your phone!

```bash
npm run dev
```

