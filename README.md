# TechStore 🛒

متجر إلكتروني متخصص في بيع الأجهزة الإلكترونية، مبني بـ React + Supabase + Stripe.

## الميزات

- 🏠 **تصفح المنتجات** — عرض المنتجات مع تصنيفات وبحث
- ❤️ **المفضلة** — حفظ المنتجات للمفضلة
- 🛒 **سلة التسوق** — إضافة وإدارة المنتجات في السلة
- 💳 **دفع آمن** — تكامل مع Stripe Checkout
- 📦 **الطلبات** — متابعة حالة الطلبات
- ⭐ **التقييمات** — تقييم المنتجات وكتابة مراجعات
- 👑 **لوحة تحكم المشرف** — إدارة المنتجات، الطلبات، وإحصائيات المبيعات

## التشغيل محلياً

```bash
# 1. تثبيت الاعتماديات
npm install
cd server && npm install && cd ..

# 2. إعداد البيئة
# انسخ .env.example إلى .env واملأ المتغيرات

# 3. تشغيل الخادم الخلفي (نافذة)
cd server && npm start

# 4. تشغيل الواجهة الأمامية (نافذة أخرى)
npm run dev
```

## التقنيات

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Express.js + Stripe API
- **Database:** Supabase (PostgreSQL)
- **State:** Zustand
- **Payments:** Stripe Checkout
