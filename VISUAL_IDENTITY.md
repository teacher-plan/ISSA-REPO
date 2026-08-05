# Visual Identity & Design Guidelines

## Brand Overview

**Digital Loyalty Wallet** - برنامج ولاء رقمي حديث وسهل الاستخدام لمحلات البيع بالتجزئة في منطقة الخليج.

### Core Values (Reflected in Design)
- 🔒 **Secure** - ألوان داكنة وموثوقة (Primary)
- 💰 **Rewarding** - ذهبي وأحمر (Accent for loyalty points)
- 📱 **Mobile-First** - تصميم بسيط وسريع
- 🌍 **Accessible** - دعم RTL/LTR، dark mode

---

## Color System

### 1. Primary Brand Color: Dark Slate
| Shade | Hex | Use Case |
|-------|-----|----------|
| 50 | #f9fafb | Light backgrounds |
| 100 | #f3f4f6 | Input backgrounds |
| 200 | #e5e7eb | Card borders |
| 300 | #d1d5db | Disabled states |
| 400 | #9ca3af | Secondary text |
| 500 | #6b7280 | Tertiary text |
| 600 | #4b5563 | Labels, icons |
| **700** | **#374151** | Secondary buttons |
| **800** | **#1f2937** | **Primary buttons, headers** |
| **900** | **#111827** | **Deep backgrounds** |

**Usage:**
```html
<!-- Header -->
<header class="bg-primary-800 text-white"></header>

<!-- Button (Primary) -->
<button class="bg-primary-800 hover:bg-primary-900"></button>

<!-- Text (Secondary) -->
<p class="text-primary-700"></p>
```

---

### 2. Accent Color: Gold/Amber
برنامج الولاء = ذهبي (للمكافآت والنقاط)

| Shade | Hex | Use Case |
|-------|-----|----------|
| 50 | #fffbeb | Highlight backgrounds |
| 100 | #fef3c7 | Light accents |
| 200 | #fde68a | Info backgrounds |
| 300 | #fcd34d | Badge backgrounds |
| 400 | #fbbf24 | Light CTA backgrounds |
| **500** | **#f59e0b** | **Primary CTA, badges** |
| **600** | **#d97706** | **Hover states** |
| 700 | #b45309 | Active states |
| 800 | #92400e | Dark accents |

**Usage:**
```html
<!-- Earn Points Button -->
<button class="bg-accent-500 hover:bg-accent-600 text-white">
  + 10 نقاط
</button>

<!-- Reward Badge -->
<span class="bg-accent-100 text-accent-800 px-3 py-1 rounded-full">
  مكافأة متاحة
</span>

<!-- Points Display -->
<div class="text-accent-600 text-3xl font-bold">250</div>
```

---

### 3. Semantic Colors

#### Success (Green) - Points Earned ✓
```css
--color-success: #10b981;
--color-success-50: #ecfdf5;
--color-success-100: #d1fae5;
--color-success-500: #10b981;
--color-success-600: #059669;
```

**Usage:**
```html
<div class="bg-success-50 border-l-4 border-success-500 p-4">
  ✓ تمت إضافة 10 نقاط بنجاح
</div>
```

#### Warning (Orange) - Low Balance ⚠️
```css
--color-warning: #f97316;
--color-warning-500: #f97316;
--color-warning-600: #ea580c;
```

**Usage:**
```html
<div class="bg-warning-50 text-warning-800">
  ⚠️ رصيدك قليل (5 نقاط متبقية)
</div>
```

#### Error (Red) - Failed Operations ✗
```css
--color-error: #ef4444;
--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;
```

**Usage:**
```html
<div class="bg-error-50 text-error-800">
  ✗ فشل تسجيل النقطة، حاول مرة أخرى
</div>
```

#### Neutral (Gray) - UI Elements
```css
--color-neutral-50: #ffffff (nearly)
--color-neutral-100: #f9fafb
--color-neutral-900: #111827
```

---

## Typography System

### Font Stack
```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 
  'Segoe UI', 'Helvetica Neue', sans-serif;
```

### Sizes & Usage

| Level | Size | Weight | Line Height | Use Case |
|-------|------|--------|------------|----------|
| **h1** | 1.875rem (30px) | 700 bold | 1.2 | Page titles, hero sections |
| **h2** | 1.5rem (24px) | 700 bold | 1.3 | Section headers |
| **h3** | 1.25rem (20px) | 600 semibold | 1.4 | Subsection headers |
| **p/body** | 1rem (16px) | 400 normal | 1.6 | Main content |
| **small** | 0.875rem (14px) | 400 normal | 1.5 | Labels, help text, captions |
| **xs** | 0.75rem (12px) | 400 normal | 1rem | Very small labels |

### Examples

```html
<!-- Page Title -->
<h1 class="text-3xl font-bold">نقاطك: 250 نقطة</h1>

<!-- Section Header -->
<h2 class="text-2xl font-bold text-primary-900">الكاشيات المتاحة</h2>

<!-- Subsection -->
<h3 class="text-xl font-semibold">قهوة مجانية</h3>

<!-- Body Text -->
<p class="text-base leading-relaxed">
  اختر المكافأة التي تريدها واضغط على زر الاستدعاء
</p>

<!-- Label -->
<label class="text-sm font-medium text-primary-700">البريد الإلكتروني</label>

<!-- Helper Text -->
<small class="text-xs text-primary-500">أدخل بريدك الصحيح</small>
```

---

## Spacing & Rhythm

**Spacing Scale (Mobile-First):**
```css
--spacing-xs: 0.25rem (4px)   /* Micro spacing */
--spacing-sm: 0.5rem (8px)    /* Small gaps */
--spacing-md: 1rem (16px)     /* Default padding */
--spacing-lg: 1.5rem (24px)   /* Section margins */
--spacing-xl: 2rem (32px)     /* Large spacing */
--spacing-2xl: 3rem (48px)    /* Extra large */
```

### Applied Rules

**Buttons & Form Elements:**
- Padding: `px-4 py-3` (16px horizontal, 12px vertical)
- Min height: `min-h-11` (44px) for touch
- Border radius: `rounded-lg` (12px)

**Cards:**
- Padding: `p-4 md:p-6` (16px on mobile, 24px on desktop)
- Border radius: `rounded-lg` (12px)
- Margin bottom: `mb-4` (16px)

**Sections:**
- Margin top/bottom: `my-6` (24px)
- Padding top/bottom: `py-6` (24px)

---

## Border Radius

| Type | Pixels | Use Case |
|------|--------|----------|
| **sm** | 6px | Small inputs, subtle rounded |
| **md** | 8px | Medium buttons, inputs |
| **lg** | 12px | **Cards, modals, buttons** |
| **xl** | 16px | Large cards, hero sections |
| **full** | 9999px | Pills, circles, avatars |

---

## Shadow System

| Level | CSS | Use Case |
|-------|-----|----------|
| **sm** | `0 1px 2px 0 rgba(0,0,0,0.05)` | Subtle hover states |
| **md** | `0 4px 6px -1px rgba(0,0,0,0.1)` | **Cards, buttons** |
| **lg** | `0 10px 15px -3px rgba(0,0,0,0.1)` | Floating modals |
| **xl** | `0 20px 25px -5px rgba(0,0,0,0.1)` | Hero overlays |

---

## Component Patterns

### Button Variants

**Primary (Dark):**
```html
<button class="bg-primary-800 hover:bg-primary-900 text-white px-4 py-3 rounded-lg font-semibold min-h-11">
  أضف نقطة
</button>
```

**Accent (Gold - Rewards):**
```html
<button class="bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 rounded-lg font-semibold">
  استرجع المكافأة
</button>
```

**Secondary (Outlined):**
```html
<button class="border-2 border-primary-800 text-primary-800 hover:bg-primary-50 px-4 py-3 rounded-lg font-semibold">
  إلغاء
</button>
```

**Danger (Red):**
```html
<button class="bg-error-500 hover:bg-error-600 text-white px-4 py-3 rounded-lg font-semibold">
  حذف
</button>
```

### Card Component

```html
<div class="bg-white dark:bg-primary-900 rounded-lg shadow-md p-4 border border-primary-200 dark:border-primary-800">
  <h3 class="text-lg font-semibold text-primary-900 mb-2">عنوان البطاقة</h3>
  <p class="text-sm text-primary-600 dark:text-primary-400">
    محتوى البطاقة
  </p>
</div>
```

### Alert Components

**Success:**
```html
<div class="bg-success-50 border-r-4 border-success-500 p-4 rounded-md">
  <p class="text-success-800 font-semibold">✓ تم بنجاح</p>
  <p class="text-success-700 text-sm">الرسالة التفصيلية هنا</p>
</div>
```

**Warning:**
```html
<div class="bg-warning-50 border-r-4 border-warning-500 p-4 rounded-md">
  <p class="text-warning-800 font-semibold">⚠️ تنبيه</p>
  <p class="text-warning-700 text-sm">الرسالة التفصيلية هنا</p>
</div>
```

**Error:**
```html
<div class="bg-error-50 border-r-4 border-error-500 p-4 rounded-md">
  <p class="text-error-800 font-semibold">✗ خطأ</p>
  <p class="text-error-700 text-sm">الرسالة التفصيلية هنا</p>
</div>
```

---

## Mobile-First Breakpoints

```css
/* Mobile (0-640px) - Default */
.text-lg

/* Small Screens (640px+) */
@media (min-width: 640px)
  sm:text-xl

/* Medium Screens (768px+) */
@media (min-width: 768px)
  md:text-2xl

/* Large Screens (1024px+) */
@media (min-width: 1024px)
  lg:text-3xl
```

### Common Pattern
```html
<div class="w-full md:w-1/2 lg:w-1/3 p-4 md:p-6">
  <!-- Content -->
</div>
```

---

## Dark Mode

الموقع يدعم dark mode تلقائياً:

```html
<!-- Light mode (default) -->
<div class="bg-white text-gray-900">

<!-- Dark mode (with 'dark:' prefix) -->
<div class="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50">
```

الألوان تتكيف تلقائياً حسب `prefers-color-scheme`.

---

## Touch Optimization

**Minimum Touch Target:** 44px × 44px (11mm²)

```html
<!-- Safe button -->
<button class="min-h-11 min-w-11 px-4 py-3">
  اضغط هنا
</button>

<!-- Utility class -->
<button class="touch-safe">
  اضغط
</button>
```

---

## RTL/LTR Support

التطبيق مدعوم 100% للعربية:
- Text alignment تلقائي (RTL)
- Margins & padding تنقلب تلقائياً
- Icons توجهها يُحفظ

```html
<!-- Automatic RTL support -->
<div dir="rtl" class="text-right pr-4">
  <!-- Content automatically aligns right -->
</div>
```

---

## Usage in Code

**Always use:**
- Tailwind utility classes
- CSS custom properties
- Design tokens from `globals.css`

**Never:**
- Hardcode hex colors
- Use arbitrary colors
- Break the spacing scale

**Good:**
```html
<button class="bg-primary-800 hover:bg-primary-900 text-white px-4 py-3 rounded-lg">
```

**Bad:**
```html
<button style="background-color: #1f2937; padding: 13px 14px;">
```

---

## Accessibility

- ✅ Color contrast ratios: 4.5:1 minimum
- ✅ Focus states: Always visible
- ✅ Touch targets: 44px minimum
- ✅ Font sizes: 16px minimum
- ✅ RTL/LTR: Full support

---

## Next Steps

1. ✅ Color system defined
2. ✅ Typography scale set
3. ✅ Spacing rhythm established
4. 📋 Apply to existing components
5. 📋 Update dashboard pages
6. 📋 Test on real devices

