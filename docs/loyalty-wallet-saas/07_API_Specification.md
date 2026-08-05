# Digital Loyalty Wallet SaaS

## API Specification Document

### Version 1.0

## 07_API_Specification.md

---

# 1. API Overview

هذا الملف يحدد واجهات الاتصال بين أجزاء النظام.

الهدف:

* تنظيم التواصل بين Frontend وBackend.
* فصل منطق العمل عن الواجهة.
* تسهيل إضافة تطبيقات مستقبلية.

مثلاً:

مستقبلاً يمكن إضافة:

* تطبيق جوال.
* تطبيق POS.
* تطبيق موظفين.

بدون تغيير النظام الأساسي.

---

# 2. API Architecture

البنية:

```text
Frontend (Next.js)

        |

        |

API Layer

        |

        |

Business Logic Services

        |

        |

Supabase Database

        |

        |

External Services

(Wallet Provider / Email / Payments)

```

---

# 3. Authentication API

## 3.1 Register User

### Endpoint

```http
POST /api/auth/register
```

---

## Request

```json
{
"name": "Ahmed",
"email": "ahmed@example.com",
"password": "password123",
"business_name": "Coffee House"
}
```

---

## Response

```json
{
"success": true,
"user_id": "uuid",
"business_id": "uuid"
}
```

---

# 3.2 Login

### Endpoint

```http
POST /api/auth/login
```

---

Request:

```json
{
"email": "user@email.com",
"password": "******"
}
```

---

Response:

```json
{
"token": "jwt_token",
"user":{
"id":"uuid",
"role":"owner"
}
}
```

---

# 3.3 Reset Password

```http
POST /api/auth/reset-password
```

---

# 4. Business APIs

---

# 4.1 Get Business Profile

```http
GET /api/business/profile
```

---

Response:

```json
{
"name":"Coffee House",
"logo":"logo.png",
"currency":"OMR"
}
```

---

# 4.2 Update Business

```http
PUT /api/business/profile
```

---

Request:

```json
{
"name":"New Name",
"logo":"url"
}
```

---

# 5. Customer APIs

---

# 5.1 Create Customer

```http
POST /api/customers
```

---

Request:

```json
{
"name":"Ahmed",
"phone":"99999999",
"email":"email@test.com"
}
```

---

Backend Actions:

1. Create customer.
2. Create loyalty card.
3. Create wallet card.
4. Return wallet links.

---

Response:

```json
{
"customer_id":"uuid",
"card_id":"uuid",
"apple_wallet_url":"url",
"google_wallet_url":"url"
}
```

---

# 5.2 Get Customers

```http
GET /api/customers
```

---

Query:

```text
?page=1
&search=Ahmed
```

---

Response:

```json
{
"customers":[
{
"name":"Ahmed",
"points":20
}
]
}
```

---

# 5.3 Get Customer Details

```http
GET /api/customers/{id}
```

---

Response:

```json
{
"name":"Ahmed",
"points":20,
"transactions":[]
}
```

---

# 5.4 Update Customer

```http
PUT /api/customers/{id}
```

---

# 5.5 Delete Customer

```http
DELETE /api/customers/{id}
```

---

# 6. Loyalty APIs

---

# 6.1 Create Loyalty Program

```http
POST /api/loyalty/program
```

---

Request:

```json
{
"type":"visit",
"points_required":10
}
```

---

# 6.2 Get Loyalty Program

```http
GET /api/loyalty/program
```

---

# 6.3 Update Program

```http
PUT /api/loyalty/program
```

---

# 7. Points Management APIs

---

# 7.1 Add Points

Endpoint:

```http
POST /api/points/add
```

---

Request:

```json
{
"customer_id":"uuid",
"points":1,
"description":"Purchase"
}
```

---

Backend Process:

```text
Validate Employee Permission

↓

Create Transaction

↓

Update Customer Points

↓

Update Wallet Card

↓

Return Result

```

---

Response:

```json
{
"success":true,
"new_balance":21
}
```

---

# 7.2 Remove Points

```http
POST /api/points/remove
```

---

# 7.3 Adjust Points

للمدير فقط:

```http
POST /api/points/adjust
```

---

# 8. Rewards APIs

---

# 8.1 Create Reward

```http
POST /api/rewards
```

---

Request:

```json
{
"name":"Free Coffee",
"points_required":10
}
```

---

# 8.2 List Rewards

```http
GET /api/rewards
```

---

# 8.3 Redeem Reward

```http
POST /api/rewards/redeem
```

---

Request:

```json
{
"customer_id":"uuid",
"reward_id":"uuid"
}
```

---

Process:

```text
Check Points

↓

Create Transaction

↓

Deduct Points

↓

Update Wallet

```

---

# 9. Wallet APIs

---

# 9.1 Create Wallet Card

```http
POST /api/wallet/create
```

---

Request:

```json
{
"customer_id":"uuid"
}
```

---

Response:

```json
{
"apple_wallet":"url",
"google_wallet":"url"
}
```

---

# 9.2 Update Wallet Card

```http
POST /api/wallet/update
```

---

Request:

```json
{
"customer_id":"uuid",
"points":25
}
```

---

---

# 9.3 Wallet Status

```http
GET /api/wallet/status/{id}
```

---

Response:

```json
{
"status":"active",
"last_sync":"date"
}
```

---

# 10. Employee APIs

---

# 10.1 Create Employee

```http
POST /api/employees
```

---

Request:

```json
{
"name":"Ali",
"email":"ali@test.com",
"permissions":{
"add_points":true
}
}
```

---

# 10.2 Update Permissions

```http
PUT /api/employees/{id}/permissions
```

---

# 10.3 Remove Employee

```http
DELETE /api/employees/{id}
```

---

# 11. Subscription APIs

---

# Get Current Plan

```http
GET /api/subscription
```

---

# Upgrade Plan

```http
POST /api/subscription/upgrade
```

---

# 12. Admin APIs

---

# List Businesses

```http
GET /api/admin/businesses
```

---

# Suspend Business

```http
POST /api/admin/businesses/{id}/suspend
```

---

# System Analytics

```http
GET /api/admin/analytics
```

---

# 13. Webhooks

النظام يجب أن يدعم Webhooks من الخدمات الخارجية.

مثال:

Wallet Provider:

```text
Card Updated

↓

Webhook

↓

Update Database

```

---

# 14. API Security Rules

كل API يجب أن يتحقق من:

## Authentication

هل المستخدم مسجل؟

---

## Authorization

هل لديه صلاحية؟

---

## Tenant Isolation

هل يملك هذا الـ business_id؟

---

## Rate Limiting

منع:

* الطلبات الكثيرة.
* إساءة الاستخدام.

---

# 15. Error Format

كل الأخطاء بنفس الشكل:

```json
{
"success":false,
"error":{
"code":"UNAUTHORIZED",
"message":"Access denied"
}
}
```

---

# 16. Logging

كل عملية مهمة تسجل:

```json
{
"user_id":"uuid",
"action":"ADD_POINTS",
"time":"date"
}
```

---

# 17. API Documentation

يجب إنشاء:

* Swagger / OpenAPI Documentation.

حتى يمكن:

* اختبار الـ APIs.
* تطوير تطبيقات مستقبلية.
