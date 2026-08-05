# 🎟️ Digital Loyalty Wallet SaaS

**برنامج ولاء رقمي متكامل** لمحلات البيع بالتجزئة في منطقة الخليج.

---

## ✨ المميزات الرئيسية

### 🏪 لصاحب المحل
- ✅ إنشاء برنامج ولاء مخصص
- ✅ إدارة النقاط والمكافآت
- ✅ تتبع العملاء والإحصائيات
- ✅ إدارة الموظفين (إضافة، تعليق، صلاحيات)
- ✅ لوحة تحكم شاملة
- ✅ دعم خطط الاشتراك (starter, professional, enterprise)

### 👥 للموظف
- ✅ البحث عن العملاء
- ✅ إضافة نقاط
- ✅ استرجاع المكافآت
- ✅ إضافة عملاء جدد
- ✅ واجهة بسيطة وسريعة

### 📱 للعميل
- ✅ بطاقة ولاء رقمية في المحفظة
- ✅ تتبع النقاط الحالية
- ✅ عرض المكافآت المتاحة
- ✅ بدون تطبيق إضافي (PWA)

---

## 🚀 ابدأ الآن

### المتطلبات
- Node.js 18+
- npm أو yarn
- Supabase account

### التثبيت

```bash
# استنساخ المشروع
git clone <repository-url>
cd issa-repo

# تثبيت الحزم
npm install

# نسخ متغيرات البيئة
cp .env.example .env.local
# حرر .env.local وأضف بيانات Supabase الخاصة بك

# تشغيل خادم التطوير
npm run dev
```

زيارة `http://localhost:3000`

---

## 📋 المراحل المنجزة

| المرحلة | الحالة | الوصف |
|--------|--------|-------|
| 1️⃣ | ✅ | المصادقة و إدارة الملفات الشخصية |
| 2️⃣ | ✅ | لوحة تحكم صاحب المحل (dashboard) |
| 3️⃣ | ✅ | محرك النقاط والمكافآت |
| 4️⃣ | ✅ | إدارة العملاء |
| 5️⃣ | ✅ | إدارة المكافآت |
| 6️⃣ | ✅ | تكامل المحفظة الرقمية (Wallet) |
| 7️⃣ | ✅ | الاشتراكات و خطط الدفع |
| 8️⃣ | ✅ | الإحصائيات والتحليلات |
| 8.5 | ✅ | حسابات الموظفين (Employees) مع الصلاحيات |
| 9️⃣ | 🔄 | معالجة الدفع الفعلية (Stripe) |

---

## 🏗️ المعمارية

```
┌─────────────────────────────────────┐
│         Next.js 16 App Router       │
├─────────────────────────────────────┤
│  React 19 + TypeScript + Tailwind   │
├─────────────────────────────────────┤
│     Supabase (Postgres + Auth)      │
├─────────────────────────────────────┤
│ Row Level Security (RLS) Policies   │
└─────────────────────────────────────┘
```

### المكونات الأساسية

- **الواجهة الأمامية**: React + Next.js App Router
- **التصميم**: Tailwind CSS v4
- **الخادم**: Next.js Server Actions
- **قاعدة البيانات**: PostgreSQL (عبر Supabase)
- **المصادقة**: Supabase Auth
- **الأمان**: Row Level Security (RLS)

---

## 📁 هيكل المشروع

```
/app
├── page.tsx                    # الصفحة الرئيسية
├── auth/
│   ├── register/              # تسجيل المالك
│   ├── login/                 # الدخول
│   └── check-email/           # تأكيد البريد
├── onboarding/
│   └── business/              # إعداد المحل (أول دخول)
├── dashboard/                 # لوحة تحكم المالك
│   ├── loyalty-program/       # إنشاء برنامج الولاء
│   ├── rewards/               # إدارة المكافآت
│   ├── customers/             # إدارة العملاء
│   ├── employees/             # إدارة الموظفين
│   ├── settings/              # إعدادات المحل
│   ├── subscription/          # خطط الاشتراك
│   ├── analytics/             # الإحصائيات
│   └── quick-add/             # إضافة نقاط سريعة (وضع موظف)
├── employee/                  # واجهة الموظف
├── admin/                     # لوحة تحكم المشرف
│   ├── wallet-provider/       # إعدادات المحفظة
│   └── businesses/            # إدارة المحلات
└── c/[id]/                    # صفحة البطاقة العامة (بدون تسجيل دخول)

/lib
├── auth/
│   ├── session.ts             # قراءة بيانات المستخدم
│   ├── require-role.ts        # حماية الصفحات
│   └── redirect-for-role.ts   # إعادة التوجيه
├── supabase/
│   ├── client.ts              # عميل Supabase (متصفح)
│   ├── server.ts              # عميل Supabase (خادم)
│   └── service.ts             # عميل service role (بدون RLS)
└── wallet/
    ├── types.ts               # واجهات المحفظة
    ├── provider-registry.ts   # اختيار مزود المحفظة
    ├── sync.ts                # مزامنة البطاقات
    └── providers/
        └── passkit.ts         # محول PassKit

/database/migrations
├── 0001_init.sql              # الملفات الشخصية والمحلات
├── 0002_business_settings.sql # إعدادات المحل
├── 0003_loyalty_engine.sql    # محرك النقاط
├── 0004_rewards.sql           # المكافآت
├── 0005_wallet_integration.sql# تكامل المحفظة
├── 0006_subscriptions.sql     # الاشتراكات
├── 0007_analytics.sql         # الإحصائيات
├── 0008_employees.sql         # حسابات الموظفين
├── 0009_fix_employee_rls_recursion.sql  # إصلاح RLS
└── 0010_fix_profiles_employee_visibility.sql

/public
├── manifest.json              # PWA metadata
├── service-worker.js          # دعم العمل بلا إنترنت
├── offline.html               # صفحة بدون إنترنت
└── icon.svg                   # أيقونة التطبيق
```

---

## 🎨 نظام الهوية البصرية

### الألوان الأساسية
- **Primary (أسود-رمادي)**: #1f2937 - الأزرار والعناوين
- **Accent (ذهبي)**: #f59e0b - المكافآت والنقاط
- **Success (أخضر)**: #10b981 - النقاط المكتسبة
- **Warning (برتقالي)**: #f97316 - تنبيهات
- **Error (أحمر)**: #ef4444 - الأخطاء

### الخطوط
- **العنوان الكبير (h1)**: 1.875rem، Bold
- **العنوان الثانوي (h2)**: 1.5rem، Bold
- **النص الأساسي (body)**: 1rem، Normal
- **النص الصغير (small)**: 0.875rem، Normal

### التباعد
- Mobile-first approach
- Spacing scale: xs, sm, md, lg, xl, 2xl
- Touch targets: 44px minimum

**تفاصيل كاملة في:** `VISUAL_IDENTITY.md`

---

## 📱 PWA (تطبيق ويب تقدمي)

التطبيق هو PWA كامل:
- ✅ قابل للتثبيت على الهاتف
- ✅ يعمل بدون إنترنت
- ✅ أيقونة على الشاشة الرئيسية
- ✅ دعم dark mode
- ✅ دعم RTL/LTR كامل

### التثبيت على الهاتف

**iPhone (Safari):**
1. Share ↗️
2. "Add to Home Screen"
3. اختر الأيقونة والاسم

**Android (Chrome):**
1. Menu ⋮
2. "Install app"
3. تأكيد التثبيت

**تفاصيل كاملة في:** `PWA_QUICK_START.md`

---

## 🔐 الأمان

### Row Level Security (RLS)
- كل صاحب محل يرى فقط بيانات محله
- الموظفون يرون بيانات محلهم فقط
- العملاء يرون بيانتهم فقط

### المصادقة
- Supabase Auth (OAuth + Email)
- Session-based cookies
- Token refresh automatic

### معايير الأمان
- ✅ HTTPS required
- ✅ Passwords hashed
- ✅ RLS policies on all tables
- ✅ Service role separated
- ✅ No secrets in client-side

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية

**profiles**
- معرّف المستخدم والمعلومات الشخصية
- الدور (admin, business_owner, employee, customer)

**businesses**
- بيانات المحل
- الألوان والإعدادات
- معرّف برنامج PassKit

**customers**
- بيانات العملاء
- إجمالي النقاط والزيارات

**loyalty_programs**
- قواعد كسب النقاط
- عتبة المكافآت

**rewards**
- المكافآت المتاحة
- عدد النقاط المطلوب
- الكمية المتاحة

**transactions**
- سجل كل العمليات
- كسب النقاط واسترجاع المكافآت

**employees**
- حسابات الموظفين
- الصلاحيات (add_points, redeem_rewards, manage_customers)

**wallet_cards**
- بطاقات المحفظة الرقمية
- حالة المزامنة مع PassKit

---

## 🔄 سير العمل

### 1. تسجيل المالك
```
مالك → يملأ البيانات → Supabase creates profile + business
→ يتم توجيهه لإعداد المحل
```

### 2. إنشاء برنامج الولاء
```
المالك → يضع قواعد النقاط → حفظ في loyalty_programs
```

### 3. إضافة عميل
```
موظف/مالك → يدخل بيانات العميل → ينشئ customer + wallet_card
→ مزامنة مع PassKit (إذا كان مفعل)
```

### 4. إضافة نقطة
```
موظف → يبحث عن عميل → يضيف نقطة
→ record_points_transaction() in database
→ wallet_card sync (if configured)
```

### 5. استرجاع مكافأة
```
موظف → يختار مكافأة → redeem_reward() in database
→ تخفيض النقاط وتحديث الرصيد
```

---

## 🚀 النشر (Deployment)

### على Vercel

```bash
# Push to git
git push origin main

# Vercel auto-deploys
# Set environment variables in Vercel dashboard

# أو استخدم:
npm install -g vercel
vercel
```

### Build للإنتاج

```bash
# Build
npm run build

# Test locally
npm start

# Deploy
# استخدم Vercel / Firebase / Netlify
```

---

## 📊 المقاييس

**بعد النشر، تتبع:**
- عدد المحلات المشتركة
- عدد العملاء النشطين
- إجمالي النقاط المكتسبة
- معدل استخدام المكافآت
- رضا المستخدمين

---

## 📚 الوثائق الإضافية

| الملف | الوصف |
|------|--------|
| **PWA_SETUP.md** | تفاصيل إعداد التطبيق الويب التقدمي |
| **PWA_QUICK_START.md** | دليل سريع للبدء |
| **VISUAL_IDENTITY.md** | نظام الهوية البصرية الكامل |
| **QR_WALLET_IMPLEMENTATION.md** | خطة تنفيذ محفظة QR |
| **AGENTS.md** | معمارية النظام والدروس المستفادة |

---

## 🆘 استكشاف الأخطاء

### Service Worker لا يعمل؟
```bash
# مسح الـ cache
DevTools → Application → Clear storage
→ Unregister service workers
→ Hard refresh (Ctrl+Shift+R)
```

### الأيقونات لا تظهر؟
```bash
# توليد الأيقونات
npm install --save-dev sharp
npm run generate-icons
```

### المصادقة لا تعمل؟
- تحقق من `.env.local` يحتوي على بيانات Supabase الصحيحة
- تأكد من تشغيل migrations في Supabase

---

## 🤝 المساهمة

### إضافة ميزة جديدة
1. Create branch: `git checkout -b feature/my-feature`
2. Commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/my-feature`
4. Open Pull Request

### الالتزام بـ Code Style
- استخدم Eslint: `npm run lint`
- اتبع نسق الملفات الموجود
- أضف تعليقات للكود المعقد

---

## 📝 الترخيص

هذا المشروع خاص (Private).

---

## 📞 التواصل

للأسئلة أو الاقتراحات:
- أرسل رسالة للفريق
- أو افتح issue

---

## ✅ التالي

**الخطوات القادمة:**
1. ✅ تكامل المحفظة الرقمية (PWA)
2. 🔄 معالجة الدفع (Stripe integration)
3. 🔄 ماسحة QR للموظفين
4. 🔄 تطبيق موبايل أصلي (اختياري)
5. 📋 اختبارات شاملة
6. 🚀 النشر على الإنتاج

---

**تم البناء بـ ❤️ لسوق الخليج**

