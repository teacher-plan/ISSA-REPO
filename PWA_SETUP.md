# PWA Setup & Visual Identity

## PWA Configuration Complete ✅

التطبيق الآن مجهز كـ Progressive Web App (PWA) قابل للتثبيت على جميع الأجهزة.

### Features Configured:

#### 1. **Service Worker**
- ✅ Offline support
- ✅ Cache management
- ✅ Asset caching
- File: `public/service-worker.js`

#### 2. **Web App Manifest**
- ✅ App metadata
- ✅ Icons configuration (multiple sizes)
- ✅ Shortcuts for employee/dashboard
- ✅ Screenshots for app stores
- File: `public/manifest.json`

#### 3. **Meta Tags**
- ✅ Apple Web App capable
- ✅ Status bar styling
- ✅ Theme colors
- ✅ Viewport configuration
- Location: `app/layout.tsx`

#### 4. **Icons**
الأيقونات المطلوبة في `/public`:
```
- icon-192.png (192x192)
- icon-512.png (512x512)
- icon-maskable-192.png (192x192 - for maskable support)
- icon-maskable-512.png (512x512 - for maskable support)
- icon-96.png (96x96 - shortcuts)
- screenshot-540x720.png (narrow/mobile)
- screenshot-1280x720.png (wide/desktop)
```

### Generating Icons from SVG:

**Using Node.js + sharp (recommended):**
```bash
npm install --save-dev sharp

# Create generate-icons.js
const sharp = require('sharp');

const sizes = [96, 192, 512];
for (const size of sizes) {
  sharp('public/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
}

# Run it
node generate-icons.js
```

**Or use online tools:**
- https://convertio.co/svg-png/
- https://cloudconvert.com/svg-to-png
- https://zamzar.com/convert/svg-to-png/

---

## Visual Identity System 🎨

### Color Palette

#### Primary (Dark Slate - Brand Base)
- 800: `#1f2937` - Main button, headers
- 900: `#111827` - Deep backgrounds
- 700: `#374151` - Secondary text
- 600: `#4b5563` - Borders

#### Accent (Gold/Amber - Loyalty/Rewards)
- 500: `#f59e0b` - Primary accent, CTAs
- 600: `#d97706` - Hover state
- 400: `#fbbf24` - Light backgrounds

#### Semantic Colors
- **Success** (Green): `#10b981` - Points earned
- **Warning** (Orange): `#f97316` - Low balance
- **Error** (Red): `#ef4444` - Failed operations
- **Neutral** (Gray): Scale for UI elements

### Typography

**Font Stack:** `Geist Sans` (system fallback)

**Sizes (Mobile-First):**
- h1: 1.875rem (30px) - Page titles
- h2: 1.5rem (24px) - Section headers
- h3: 1.25rem (20px) - Subsections
- p/body: 1rem (16px) - Main content
- small: 0.875rem (14px) - Labels, help text

**Line Heights:**
- Headings: 1.2-1.4
- Body: 1.6
- Form labels: 1.5

### Spacing System

**Mobile-First Spacing:**
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Corner Radius

- sm: 6px - Small inputs
- md: 8px - Medium components
- lg: 12px - Cards, modals
- xl: 16px - Large cards
- full: 9999px - Pills, circles

### Touch Targets

**Minimum Size:** 44x44px (11mm²)
- Buttons: `min-h-11 min-w-11` (Tailwind)
- Touch-safe class: `.touch-safe`

### Responsive Breakpoints

**Mobile-First Approach:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Usage Examples

**Button Primary:**
```html
<button class="bg-primary-800 hover:bg-primary-900 text-white px-4 py-3 rounded-lg font-semibold min-h-11">
  إضافة نقطة
</button>
```

**Button Accent (Rewards):**
```html
<button class="bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 rounded-lg font-semibold">
  استرجاع المكافأة
</button>
```

**Card:**
```html
<div class="bg-white dark:bg-primary-900 rounded-lg shadow-md p-4">
  <!-- Content -->
</div>
```

**Success Alert:**
```html
<div class="bg-success-50 border-r-4 border-success-500 p-4 rounded">
  ✓ تم إضافة النقطة بنجاح
</div>
```

**Points Display:**
```html
<div class="text-center">
  <p class="text-success-600 text-4xl font-bold">150</p>
  <p class="text-gray-600 text-sm">نقطة</p>
</div>
```

---

## Dark Mode Support

التطبيق يدعم dark mode تلقائياً عبر:
- `prefers-color-scheme` media query
- Tailwind dark mode: `dark:` prefix

الألوان تتكيف تلقائياً:
```html
<div class="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50">
  <!-- Content -->
</div>
```

---

## Installation Instructions for Users

### iOS (Apple)
1. فتح الموقع في Safari
2. اضغط Share (مشاركة) ↗️
3. "Add to Home Screen" (إضافة إلى الشاشة الرئيسية)
4. تأكيد الاسم والأيقونة

### Android
1. فتح الموقع في Chrome
2. اضغط ⋮ (قائمة)
3. "Install app" أو "Add to Home Screen"
4. تأكيد التثبيت

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome (Android) | ✅ | Full PWA support |
| Firefox (Android) | ✅ | PWA support |
| Safari (iOS) | ✅ | Home screen only |
| Samsung Internet | ✅ | Full PWA support |
| Edge | ✅ | Full PWA support |

---

## Testing PWA Locally

```bash
# Build the project
npm run build

# Start production server
npm start

# Open in browser
# http://localhost:3000

# Test offline: DevTools → Network → Offline
```

---

## File Locations

```
/public
├── manifest.json           # PWA metadata
├── service-worker.js       # Offline support
├── offline.html           # Offline fallback
├── icon.svg               # Source icon
├── icon-192.png           # App icon
├── icon-512.png           # App icon
├── icon-96.png            # Shortcut icon
└── screenshot-*.png       # App store screenshots

/app
├── layout.tsx             # PWA meta tags + design system
├── globals.css            # Color palette + typography
```

---

## Next Steps

1. **Generate PNG Icons** من `icon.svg`
2. **Update Screenshots** للـ app stores
3. **Test on Real Devices** (iOS + Android)
4. **Monitor Analytics** لاستخدام PWA feature

---

## Design System Tokens

جميع الألوان والأحجام موجودة في CSS custom properties:
```css
--color-primary-800
--color-accent-500
--spacing-md
--radius-lg
--shadow-lg
```

استخدمها مباشرة أو عبر Tailwind classes.
