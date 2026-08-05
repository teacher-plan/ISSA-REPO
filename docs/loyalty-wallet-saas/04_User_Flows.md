# Digital Loyalty Wallet SaaS

## User Flows Document

### Version 1.0

## 04_User_Flows.md

---

# 1. Overview

هذا الملف يشرح جميع رحلات المستخدمين داخل النظام.

الهدف:

تحديد كيف ينتقل المستخدم داخل المنصة، وما الذي يحدث خلف الكواليس في كل خطوة.

المستخدمون:

1. Platform Admin
2. Business Owner
3. Employee
4. Customer

---

# 2. Business Owner Journey

## 2.1 التسجيل وإنشاء الحساب

### السيناريو

صاحب المحل يدخل الموقع.

---

Flow:

```text
Landing Page

↓

Click "Start Free Trial"

↓

Create Account

↓

Verify Email

↓

Create Business Profile

↓

Enter Store Information

↓

Open Dashboard

```

---

البيانات المطلوبة:

* اسم صاحب الحساب.
* البريد الإلكتروني.
* كلمة المرور.
* اسم المحل.
* رقم الهاتف.
* الدولة.
* نوع النشاط.

---

# 2.2 إعداد برنامج الولاء

بعد دخول لوحة التحكم:

يظهر Wizard للإعداد.

---

## Step 1

بيانات المحل:

```text
Business Name

Logo

Colors

Contact Info

```

---

## Step 2

اختيار نوع الولاء:

الخيار الأول:

### زيارة

مثال:

```text
كل زيارة = نقطة

10 نقاط = مكافأة
```

---

الخيار الثاني:

### قيمة الشراء

مثال:

```text
كل 1 ريال = نقطة

100 نقطة = خصم
```

---

## Step 3

إنشاء المكافأة:

يدخل:

```text
Reward Name

Description

Required Points

Image

```

مثال:

```text
قهوة مجانية

10 نقاط
```

---

## Step 4

تفعيل النظام:

```text
Activate Loyalty Program

↓

Generate Customer Card System
```

---

# 3. Customer Creation Flow

## الطريقة الأولى: الموظف ينشئ العميل

```text
Customer visits store

↓

Employee opens POS Dashboard

↓

Click Add Customer

↓

Enter:

Name

Phone

Email(optional)

↓

Create Customer

↓

Generate Loyalty Card

```

---

بعد الإنشاء:

النظام:

1. ينشئ بطاقة داخل قاعدة البيانات.
2. ينشئ Wallet Card.
3. يرسل رابط الإضافة للمحفظة.

---

# 4. Wallet Card Flow

## Customer receives card

العميل يحصل على:

زر:

```text
Add to Wallet
```

---

إذا كان iPhone:

```text
Open Apple Wallet

↓

Add Pass

↓

Card Saved
```

---

إذا كان Android:

```text
Open Google Wallet

↓

Save Pass

↓

Card Saved
```

---

إذا فشل:

يظهر:

```text
Open Digital Card Instead
```

بطاقة ويب احتياطية.

---

# 5. Employee Daily Workflow

## تسجيل زيارة العميل

السيناريو:

عميل يشتري.

---

الموظف:

```text
Open Dashboard

↓

Search Customer

↓

Open Card

↓

Add Point

↓

Confirm

```

---

النظام:

```text
Create Transaction

↓

Update Customer Points

↓

Update Wallet Card

↓

Send Wallet Update

```

---

# 6. Redeem Reward Flow

عندما يصل العميل للنقاط المطلوبة:

مثال:

```text
10 / 10 Points
```

---

الموظف:

```text
Open Customer Card

↓

Select Reward

↓

Redeem

↓

Confirm

```

---

النظام:

```text
Create Redeem Transaction

↓

Subtract Points

↓

Update Wallet

↓

Store History

```

---

# 7. Customer Experience Flow

## Customer opens Wallet

يرى:

```text
--------------------------------

Coffee House

محمد أحمد


Points

★★★★★★☆☆☆☆

6 / 10


Next Reward:

Free Coffee


QR Code


--------------------------------

```

---

# 8. Customer Without Wallet App

إذا لم يضف البطاقة:

يمكنه استخدام:

```text
loyalty.com/card/xxxx
```

---

الصفحة تحتوي:

* النقاط.
* المكافآت.
* QR.
* زر إضافة للمحفظة.

---

# 9. Employee Invitation Flow

صاحب المحل يضيف موظف:

```text
Owner Dashboard

↓

Employees

↓

Add Employee

↓

Enter Email

↓

Send Invitation

```

---

الموظف:

```text
Receive Email

↓

Create Password

↓

Access Employee Dashboard

```

---

# 10. Subscription Flow

## Trial

```text
Business Created

↓

14 Days Trial

↓

Full Access

```

---

بعد انتهاء التجربة:

```text
Subscription Expired

↓

Limited Access

↓

Upgrade Plan

```

---

# 11. Admin Flow

## Create Business

Admin:

```text
Admin Dashboard

↓

Businesses

↓

Create Business

↓

Assign Owner

↓

Activate Account

```

---

# 12. Error Handling Flows

---

## Wallet Creation Failed

السيناريو:

مزود Wallet لا يستجيب.

النظام:

```text
Create Card Failed

↓

Save Error Log

↓

Retry Automatically

↓

Notify Admin if Failed
```

---

## Duplicate Customer

إذا حاول الموظف إضافة رقم موجود:

النظام:

```text
Customer Exists

↓

Show Existing Card

↓

Ask:

Add Points?

```

---

## Employee Unauthorized Action

مثال:

موظف يحاول تغيير الإعدادات.

النظام:

```text
Permission Check

↓

Access Denied

↓

Log Attempt
```

---

# 13. Notification Flow (Future)

مستقبلاً:

عند:

* إضافة نقاط.
* وصول مكافأة.
* عرض جديد.

النظام:

```text
Event Trigger

↓

Notification Service

↓

Wallet Update

↓

Push Notification
```

---

# 14. Complete Daily Example

مثال:

مقهى يستخدم النظام.

```text
8:00 AM

Customer Ahmed arrives


Employee searches phone number


Customer card appears


Employee adds +1 point


Database updates


Wallet updates automatically


Ahmed sees:

7 / 10 points

```

---

# 15. Main UX Principles

النظام يجب أن يكون:

* أقل عدد خطوات ممكن.
* الموظف يستطيع إنهاء العملية خلال 5 ثوانٍ.
* العميل لا يحتاج تحميل تطبيق.
* كل شيء يعمل من الهاتف.
