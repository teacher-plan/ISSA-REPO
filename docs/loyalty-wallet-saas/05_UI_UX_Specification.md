# Digital Loyalty Wallet SaaS

## UI/UX Specification Document

### Version 1.0

## 05_UI_UX_Specification.md

---

# 1. Design Philosophy

هدف التصميم:

إنشاء منصة تبدو كمنتج SaaS عالمي، سهلة الاستخدام حتى لأصحاب المحلات غير التقنيين.

المبادئ الأساسية:

* Mobile First.
* سرعة الوصول للمعلومة.
* أقل عدد نقرات.
* واجهة بسيطة للموظفين.
* واجهة احترافية للإدارة.
* دعم اللغة العربية والإنجليزية.

---

# 2. Design System

## Visual Style

التصميم:

* نظيف.
* حديث.
* احترافي.
* قريب من أنظمة SaaS مثل:

  * Stripe Dashboard.
  * Shopify Admin.
  * Square.

---

# 3. Layout Structure

## Desktop

```text
+--------------------------------+

Sidebar        Main Content

Menu           Dashboard

               Tables

               Charts


+--------------------------------+

```

---

## Mobile

```text
+----------------+

Header

Content


Bottom Navigation


+----------------+

```

---

# 4. Landing Page

## الهدف

تحويل الزائر إلى عميل.

---

## Sections

---

# Hero Section

العنوان:

مثال:

> اجعل عملاءك يعودون مرة أخرى مع بطاقة ولاء رقمية داخل Wallet الهاتف

---

المكونات:

* عنوان رئيسي.
* وصف مختصر.
* زر تجربة مجانية.
* صورة توضيحية للبطاقة.

---

# Features Section

بطاقات:

## Digital Wallet Cards

بطاقات داخل:

* Apple Wallet.
* Google Wallet.

---

## Customer Management

إدارة العملاء والنقاط.

---

## Analytics

معرفة أكثر العملاء تفاعلاً.

---

# Pricing Section

مثال:

Starter

Professional

Enterprise

---

# 5. Authentication Pages

## Login

العناصر:

* Email.
* Password.
* Remember me.
* Forgot password.

---

## Register

الحقول:

* Name.
* Email.
* Password.
* Business Name.

---

# 6. Main Dashboard

## الهدف

إعطاء صورة سريعة عن أداء المحل.

---

## Top Cards

### Total Customers

مثال:

```text
1,245
Customers
```

---

### Points Distributed

```text
15,420
Points
```

---

### Rewards Redeemed

```text
340
Rewards
```

---

### Active Wallet Cards

```text
980
Cards
```

---

# 7. Dashboard Charts

## Customer Growth

رسم:

عدد العملاء خلال الأشهر.

---

## Loyalty Activity

يعرض:

* النقاط المكتسبة.
* النقاط المستخدمة.

---

## Top Customers

جدول:

| العميل | النقاط |
| ------ | ------ |
| أحمد   | 500    |
| خالد   | 420    |

---

# 8. Customers Page

## الهدف

إدارة العملاء.

---

## Components

### Search Bar

بحث:

* الاسم.
* الهاتف.
* رقم البطاقة.

---

### Customers Table

الأعمدة:

```
Name

Phone

Points

Visits

Wallet Status

Actions

```

---

# Customer Profile Page

عند فتح العميل:

---

## Header

يظهر:

* الاسم.
* الصورة.
* رقم العضوية.

---

## Loyalty Card Preview

تصميم البطاقة:

```
------------------

Coffee House

Ahmed


Points:

7 / 10


Next Reward:

Free Coffee


[QR]

------------------

```

---

## Activity History

جدول:

```
Date

Action

Points

Employee

```

---

# 9. Loyalty Program Page

## Setup Wizard

صفحة إعداد البرنامج.

---

## Step 1

نوع النظام:

Cards:

```
Visit Based

Purchase Based

Custom
```

---

## Step 2

النقاط:

```
Points Required:

10

```

---

## Step 3

المكافأة:

```
Reward Name

Image

Description

```

---

# 10. Rewards Page

## عرض المكافآت

Cards:

```
+----------------+

☕

Free Coffee


100 Points


Edit

+----------------+

```

---

# 11. Employees Page

## Employee List

يعرض:

```
Name

Role

Status

Last Login

Actions

```

---

## Add Employee Modal

الحقول:

* Name.
* Email.
* Permissions.

---

# 12. Permissions UI

واجهة اختيار الصلاحيات:

```
Employee Permissions


☑ Add Points

☑ Redeem Rewards

☐ Edit Customers

☐ Manage Settings

```

---

# 13. Wallet Management Page

## الهدف

إدارة البطاقات الرقمية.

---

يعرض:

```
Total Wallet Cards

Apple Wallet

Google Wallet

Failed Sync

```

---

## Card Status

الحالات:

```
Active

Pending

Failed

Expired

```

---

# 14. Customer Wallet Page

هذه أهم صفحة للعميل.

يجب أن تكون بسيطة جدًا.

---

## Mobile View

```
+--------------------+

Logo


Store Name


Ahmed


★★★★★★☆☆☆☆

6/10


Next Reward:

Free Coffee



[Add to Apple Wallet]


[Add to Google Wallet]


QR Code


+--------------------+

```

---

# 15. Employee Quick Mode

للموظف الذي يستخدم الهاتف.

واجهة مختلفة:

أهم شيء السرعة.

---

الشاشة الرئيسية:

```
Search Customer


[ + Add Customer ]


Recent Customers

```

---

بعد اختيار العميل:

```
Ahmed

7 Points


+ Add Point


Redeem Reward

```

---

# 16. Admin Panel UI

لصاحب المنصة.

---

Sections:

```
Businesses

Subscriptions

Users

Wallet Providers

System Logs

Analytics

```

---

# 17. Responsive Requirements

يجب اختبار:

## الهواتف

* iPhone.
* Android.

---

## Tablets

* iPad.

---

## Desktop

* 1366px.
* 1920px.

---

# 18. Accessibility

يجب مراعاة:

* وضوح النصوص.
* حجم الأزرار.
* Keyboard Navigation.
* Contrast مناسب.

---

# 19. Animation

استخدام حركات بسيطة:

* Loading states.
* Card transitions.
* Success animations.

بدون مبالغة للحفاظ على السرعة.

---

# 20. UI Components Required

يجب بناء Components قابلة لإعادة الاستخدام:

```
Button

Input

Modal

Table

Card

Badge

Dropdown

Toast

Chart

WalletCard

QRCode

```
