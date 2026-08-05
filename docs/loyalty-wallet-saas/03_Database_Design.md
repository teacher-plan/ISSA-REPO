# Digital Loyalty Wallet SaaS

## Database Design Document

### Version 1.0

## 03_Database_Design.md

---

# 1. Database Overview

قاعدة البيانات مبنية باستخدام:

**PostgreSQL (Supabase)**

التصميم يعتمد على:

* Multi-Tenant Architecture.
* Relational Database.
* Row Level Security.
* UUID Primary Keys.
* Audit Tracking.

---

# 2. Database Principles

## كل البيانات مرتبطة بالمحل

أي جدول خاص بالمستخدمين أو العملاء أو العمليات يجب أن يحتوي على:

```sql
business_id
```

حتى نضمن:

* عزل البيانات.
* سهولة التقارير.
* التوسع مستقبلاً.

---

# 3. Entity Relationship Overview

العلاقات الأساسية:

```
Users

 |

Businesses

 |

 +----------------+
 |                |
Customers     Employees

 |

Loyalty Cards

 |

Transactions

 |

Rewards

```

---

# 4. Tables

---

# Table 1: profiles

## الوصف

يمثل جميع مستخدمي النظام.

يشمل:

* Admin.
* Owner.
* Employee.
* Customer.

---

Schema:

```sql
profiles

id UUID PRIMARY KEY

auth_id UUID

full_name TEXT

email TEXT

phone TEXT

role TEXT

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Role Values

```text
admin

business_owner

employee

customer
```

---

# Table 2: businesses

## الوصف

يمثل المحلات المشتركة في النظام.

---

Schema:

```sql
businesses

id UUID PRIMARY KEY

owner_id UUID

name TEXT

logo_url TEXT

phone TEXT

email TEXT

address TEXT

country TEXT

currency TEXT

status TEXT

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Status

```text
active

trial

suspended

expired
```

---

# Table 3: business_settings

## الوصف

إعدادات تخص كل محل.

---

Schema:

```sql
business_settings

id UUID

business_id UUID

primary_color TEXT

secondary_color TEXT

language TEXT

timezone TEXT

created_at TIMESTAMP
```

---

# Table 4: loyalty_programs

## الوصف

برنامج الولاء الذي يحدده المحل.

---

Schema:

```sql
loyalty_programs

id UUID

business_id UUID

name TEXT

description TEXT

earning_type TEXT

points_per_visit INTEGER

points_per_amount NUMERIC

reward_threshold INTEGER

is_active BOOLEAN

created_at TIMESTAMP
```

---

## Examples

نظام الزيارات:

```text
earning_type:

visit

10 visits = reward
```

---

نظام المشتريات:

```text
earning_type:

amount

1 point = 1 OMR
```

---

# Table 5: customers

## الوصف

عملاء المحل.

---

Schema:

```sql
customers

id UUID

business_id UUID

name TEXT

phone TEXT

email TEXT

birth_date DATE

total_points INTEGER

total_visits INTEGER

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

ملاحظات:

* رقم الهاتف هو المعرف الأساسي للعميل داخل المحل.
* يمكن للعميل أن يكون لديه بطاقات مختلفة في محلات مختلفة.

---

# Table 6: loyalty_cards

## الوصف

البطاقة الرقمية الخاصة بالعميل.

---

Schema:

```sql
loyalty_cards

id UUID

business_id UUID

customer_id UUID

card_number TEXT

current_points INTEGER

status TEXT

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

Status:

```text
active

blocked

expired
```

---

# Table 7: wallet_cards

## الوصف

ربط البطاقة مع Apple Wallet / Google Wallet.

---

Schema:

```sql
wallet_cards

id UUID

loyalty_card_id UUID

customer_id UUID

business_id UUID

provider_name TEXT

external_card_id TEXT

wallet_url TEXT

platform TEXT

sync_status TEXT

last_synced TIMESTAMP

created_at TIMESTAMP
```

---

Platform:

```text
apple

google
```

---

Provider:

```text
passkit

walletpass

passslot
```

---

# Table 8: rewards

## الوصف

المكافآت.

---

Schema:

```sql
rewards

id UUID

business_id UUID

name TEXT

description TEXT

image_url TEXT

points_required INTEGER

quantity INTEGER

is_active BOOLEAN

created_at TIMESTAMP
```

---

Examples:

```text
Free Coffee

100 points

```

---

# Table 9: transactions

## الوصف

سجل كل حركة نقاط.

مهم جدًا للتقارير ومنع التلاعب.

---

Schema:

```sql
transactions

id UUID

business_id UUID

customer_id UUID

employee_id UUID

type TEXT

points INTEGER

description TEXT

created_at TIMESTAMP
```

---

Type:

```text
earn

redeem

adjustment

refund
```

---

Example:

```text
Customer bought coffee

+1 point

```

---

# Table 10: employees

## الوصف

موظفو المحل.

---

Schema:

```sql
employees

id UUID

business_id UUID

profile_id UUID

permissions JSONB

status TEXT

created_at TIMESTAMP
```

---

Permissions Example:

```json
{
"add_points": true,
"redeem_rewards": true,
"manage_customers": false
}
```

---

# Table 11: subscriptions

## الوصف

اشتراكات المحلات.

---

Schema:

```sql
subscriptions

id UUID

business_id UUID

plan_name TEXT

status TEXT

start_date DATE

end_date DATE

created_at TIMESTAMP
```

---

Plans:

```text
starter

professional

enterprise
```

---

# Table 12: wallet_provider_settings

## الوصف

إعدادات مزود Wallet.

---

Schema:

```sql
wallet_provider_settings

id UUID

provider_name TEXT

api_key TEXT

api_secret TEXT

status BOOLEAN

created_at TIMESTAMP
```

---

ملاحظة أمنية:

يجب تشفير:

* API Keys.
* Secrets.

---

# Table 13: audit_logs

## الوصف

تسجيل العمليات الحساسة.

---

Schema:

```sql
audit_logs

id UUID

business_id UUID

user_id UUID

action TEXT

metadata JSONB

created_at TIMESTAMP
```

---

أمثلة:

```text
Employee added points

Owner changed reward

Admin suspended account
```

---

# 5. Database Indexes

لتحسين الأداء:

## Customers

```sql
INDEX business_id

INDEX phone
```

---

## Transactions

```sql
INDEX customer_id

INDEX created_at
```

---

## Wallet Cards

```sql
INDEX external_card_id
```

---

# 6. Row Level Security (RLS)

## الهدف

منع أي محل من رؤية بيانات محل آخر.

---

مثال:

عند طلب العملاء:

```sql
SELECT *

FROM customers
```

النظام يتحقق:

```sql
customer.business_id =
current_user.business_id
```

---

# 7. Backup Strategy

يجب تفعيل:

* Supabase Automated Backups.
* Daily Database Backup.
* Point in Time Recovery عند التوسع.

---

# 8. Future Database Extensions

مستقبلاً يمكن إضافة:

## Branches

لدعم السلاسل التجارية:

```
Business

 |

Branches

 |

Employees

```

---

## Campaigns

للتسويق:

```
Campaigns

 |

Customers

```

---

## Analytics Events

لتتبع:

* الزيارات.
* المبيعات.
* سلوك العملاء.
