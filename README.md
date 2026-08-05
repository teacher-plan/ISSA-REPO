# Digital Loyalty Wallet SaaS

منصة SaaS متعددة المستأجرين تتيح لأصحاب المحلات إنشاء برنامج ولاء رقمي
لعملائهم، ببطاقة ولاء داخل Apple Wallet و Google Wallet — بدون تطبيق خاص.

المواصفة الكاملة للمنتج والتقنية موجودة في
[`docs/loyalty-wallet-saas/`](./docs/loyalty-wallet-saas/README.md).

هذا التنفيذ الحالي يغطي **المرحلة 1** فقط من خارطة الطريق: المصادقة، الأدوار
(admin / business_owner / employee / customer)، وإنشاء المحل. بقية المراحل
(العملاء، محرك النقاط، المكافآت، تكامل المحفظة، الاشتراكات) ستُبنى لاحقًا.

## البدء

```bash
npm install
cp .env.example .env.local   # املأ بيانات مشروع Supabase
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

قبل التشغيل، طبّق `database/migrations/0001_init.sql` على مشروع Supabase
(SQL editor أو `supabase db push`).

## الأوامر

- `npm run dev` — تشغيل خادم التطوير (Turbopack)
- `npm run build` — بناء الإنتاج
- `npm run lint` — ESLint
- `npm start` — تشغيل بناء الإنتاج

## التقنيات

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(Postgres + Auth + RLS)

تفاصيل أكثر (البنية، الأدوار، حماية المسارات) في [`AGENTS.md`](./AGENTS.md).
