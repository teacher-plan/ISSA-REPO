# Digital Loyalty Wallet SaaS

## Technical Architecture Document

### Version 1.0

## 02_Technical_Architecture.md

---

# 1. Architecture Overview

النظام مبني كمنصة SaaS حديثة قابلة للتوسع.

الهدف:

* تشغيل مئات أو آلاف المحلات من نفس النظام.
* عزل بيانات كل محل.
* سرعة عالية على الهاتف.
* سهولة إضافة خصائص مستقبلية.

الهيكل العام:

```text
                    Users

                      |

              Next.js Application

                      |

              Application Layer

          /           |            \

 Authentication   Business Logic   Wallet Service

          |           |             |

          |           |        Wallet Provider API

          |           |             |

       Supabase Database       Apple Wallet
                              Google Wallet

```

---

# 2. Technology Stack

## Frontend

### Framework

**Next.js + TypeScript**

الأسباب:

* أداء عالي.
* SEO ممتاز.
* مناسب لـ SaaS.
* مجتمع ضخم.
* يعمل مع Vercel بسهولة.

---

### UI Framework

**Tailwind CSS**

الاستخدام:

* تصميم سريع.
* Responsive.
* Mobile First.
* سهولة إنشاء Dashboard.

---

### Component Library

اختياري:

* Shadcn UI

لاستخدام:

* Buttons.
* Tables.
* Dialogs.
* Forms.
* Cards.

---

# 3. Backend

## Backend Platform

### Supabase

سيتم استخدام:

## Authentication

لإدارة:

* تسجيل الدخول.
* كلمات المرور.
* الجلسات.
* إعادة تعيين كلمة المرور.

---

## PostgreSQL Database

لتخزين:

* المحلات.
* العملاء.
* النقاط.
* الموظفين.
* الاشتراكات.

---

## Storage

لتخزين:

* شعارات المحلات.
* صور المكافآت.
* الملفات.

---

## Edge Functions

لاستخدامها في:

* عمليات حساسة.
* التكامل مع Wallet API.
* المهام الخلفية.

---

# 4. Hosting

## Vercel

مسؤول عن:

* استضافة الموقع.
* نشر التحديثات.
* CDN.
* الأداء العالمي.

---

# 5. Project Structure

الهيكل المقترح:

```text
digital-loyalty-saas/

│

├── app/

│   ├── dashboard/

│   ├── customers/

│   ├── rewards/

│   ├── employees/

│   ├── settings/

│   ├── wallet/

│   └── auth/

│

├── components/

│   ├── ui/

│   ├── dashboard/

│   ├── wallet/

│   └── forms/

│

├── lib/

│   ├── supabase/

│   ├── auth/

│   ├── wallet/

│   └── permissions/

│

├── services/

│   ├── wallet-service/

│   ├── customer-service/

│   └── loyalty-service/

│

├── database/

│

└── types/

```

---

# 6. Multi Tenant Architecture

هذه أهم نقطة في المشروع.

النظام يخدم عدة شركات.

مثال:

```text
Database

Businesses

    |
    |
    +---- Coffee Shop

    |
    +---- Restaurant

    |
    +---- Salon

```

كل سجل مرتبط بـ:

```text
business_id
```

مثال:

جدول العملاء:

```text
customers

id
business_id
name
phone
points
```

---

## عزل البيانات

يتم استخدام:

## Supabase Row Level Security (RLS)

مثال:

المحل A:

```text
business_id = 001
```

لا يستطيع رؤية:

```text
business_id = 002
```

حتى لو حاول الوصول مباشرة.

---

# 7. Authentication Flow

## تسجيل صاحب محل

```text
User Signup

↓

Create Auth Account

↓

Create Business Profile

↓

Assign Owner Role

↓

Open Dashboard

```

---

## تسجيل الموظف

```text
Owner Creates Employee

↓

Send Invitation

↓

Employee Creates Account

↓

Role = Employee

```

---

# 8. Roles & Permissions

نظام الصلاحيات:

```text
ADMIN

FULL ACCESS


BUSINESS_OWNER

Business Data
Customers
Rewards
Employees


EMPLOYEE

Customers
Points
Redeem


CUSTOMER

Own Card Only

```

---

# 9. Wallet Architecture

## القرار المعتمد

لن يتم إنشاء:

* Apple Certificates
* Pass Signing
* Google JWT Logic

يدويًا.

---

سيتم استخدام:

Wallet Provider Service.

---

## Wallet Service Layer

المسار:

```text
User Action

↓

Application

↓

Wallet Service

↓

External Provider

↓

Apple Wallet / Google Wallet

```

---

# 10. Wallet Service Responsibilities

مسؤول عن:

## Create Card

إنشاء بطاقة جديدة.

---

## Update Card

تحديث:

* النقاط.
* المكافآت.
* البيانات.

---

## Revoke Card

إلغاء بطاقة.

---

## Sync Status

معرفة حالة البطاقة.

---

# 11. Wallet Provider Abstraction

يجب ألا يكون النظام مرتبطًا بمزود واحد.

مثال:

```typescript
interface WalletProvider {

 createCard()

 updateCard()

 deleteCard()

}

```

ثم:

```text
PassKit Provider

WalletPass Provider

PassSlot Provider

```

يمكن تغيير أي واحد بدون تعديل النظام الأساسي.

---

# 12. Performance Requirements

النظام يجب أن يكون:

## Mobile First

يعمل بكفاءة على:

* iPhone.
* Android.
* Tablets.

---

## Loading

الصفحات الأساسية:

أقل من 2 ثانية.

---

## Dashboard

يستخدم:

* Pagination.
* Lazy Loading.
* Optimized Queries.

---

# 13. Future Scaling

التصميم يسمح بإضافة:

* WhatsApp Notifications.
* AI Marketing Assistant.
* Customer Segmentation.
* Multiple Branches.
* Franchise Management.
* Advanced Analytics.
