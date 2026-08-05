# Digital Loyalty Wallet SaaS

## Wallet Integration Specification

### Version 1.0

## 06_Wallet_Integration.md

---

# 1. Overview

هذا الملف يشرح طريقة دمج بطاقات الولاء الرقمية مع:

* Apple Wallet
* Google Wallet

داخل منصة SaaS.

---

# 2. Architecture Decision

## القرار الأساسي

**لن يتم بناء نظام إصدار البطاقات من الصفر.**

لن نقوم بإنشاء:

* Apple Pass Certificates.
* Pass Signing Logic.
* Google Wallet JWT Generation.
* إدارة مفاتيح التشفير يدويًا.

---

## السبب

هذه العمليات تحتاج:

* إدارة شهادات.
* تحديثات مستمرة.
* معرفة عميقة ببروتوكولات Apple وGoogle.
* صيانة أمنية.

---

## الحل

استخدام مزود Wallet API خارجي.

أمثلة:

* PassKit.
* WalletPass.
* PassSlot.
* أو أي Provider يدعم Apple Wallet وGoogle Wallet.

---

# 3. Wallet Service Layer

يجب إنشاء طبقة مستقلة داخل النظام:

```text
Application Backend

        |

        |

Wallet Service Layer

        |

        |

Wallet Provider API

        |

        +----------------+

        |                |

 Apple Wallet      Google Wallet

```

---

# 4. لماذا نستخدم Abstraction Layer؟

حتى لا يصبح النظام مرتبطًا بمزود واحد.

مثال:

اليوم:

```text
PassKit
```

غدًا:

```text
WalletPass
```

لا نحتاج تغيير النظام.

فقط نغير:

```text
Provider Implementation
```

---

# 5. Wallet Service Interface

مثال منطقي:

```typescript
interface WalletProvider {

createCard()

updateCard()

deleteCard()

getStatus()

sendNotification()

}

```

---

# 6. Card Creation Flow

## عند إنشاء عميل جديد

العملية:

```text
Employee creates customer

        |

Create Loyalty Card

        |

Wallet Service Trigger

        |

Send Customer Data

        |

Wallet Provider API

        |

Generate Wallet Pass

        |

Return Wallet URL

        |

Save URL in Database

        |

Show Add To Wallet Button

```

---

# 7. Data Sent To Wallet Provider

يتم إرسال:

## Business Data

```json
{
"name": "Coffee House",
"logo": "logo.png",
"color": "#000000"
}
```

---

## Customer Data

```json
{
"name": "Ahmed",
"member_id": "10025"
}
```

---

## Loyalty Data

```json
{
"points": 5,
"reward": "Free Coffee"
}
```

---

# 8. Apple Wallet Flow

## iPhone User

الرحلة:

```text
Customer clicks:

Add To Apple Wallet

        |

Provider generates Pass

        |

iOS opens Wallet

        |

Customer clicks Add

        |

Card saved

```

---

# 9. Google Wallet Flow

## Android User

الرحلة:

```text
Customer clicks:

Add To Google Wallet

        |

Provider generates Pass

        |

Google Wallet Opens

        |

Save Card

```

---

# 10. Updating Points

أهم وظيفة.

مثال:

قبل:

```text
Points: 6/10
```

الموظف يضيف نقطة.

---

Flow:

```text
Employee adds point

        |

Create Transaction

        |

Update Customer Points

        |

Trigger Wallet Update

        |

Provider API

        |

Update Pass

        |

Customer sees new points

```

---

# 11. Real-Time Update Strategy

لا نعتمد على تحديث الصفحة.

نستخدم:

## Event Based System

مثال:

```text
Point Added Event

        |

Wallet Update Event

        |

Sync Pass

```

---

# 12. Failed Update Handling

احتمالات الفشل:

* Provider unavailable.
* Network error.
* Invalid card.

---

الحل:

نظام Retry:

```text
Update Failed

        |

Save Error

        |

Retry After 5 Minutes

        |

Retry 3 Times

        |

Notify Admin

```

---

# 13. Wallet Card States

جدول الحالة:

```text
CREATED

↓

GENERATING

↓

ACTIVE

↓

SYNCING

↓

UPDATED

↓

FAILED

```

---

# 14. Database Integration

جدول:

## wallet_cards

```sql
id

business_id

customer_id

loyalty_card_id

provider_name

external_card_id

wallet_url

platform

status

last_sync

```

---

# 15. QR Code Usage

كل بطاقة تحتوي QR.

الاستخدامات:

* التعرف على العميل.
* فتح البطاقة.
* البحث السريع.

---

QR يحتوي:

ليس بيانات العميل مباشرة.

بل:

```text
Secure Token

Example:

loyalty.com/card/a82jd92

```

---

# 16. Security Requirements

## ممنوع:

تخزين:

* بيانات حساسة داخل QR.
* API Keys في Frontend.

---

## يجب:

استخدام:

* Environment Variables.
* Server Side Calls.
* Encryption.

---

# 17. Wallet Provider Configuration

في لوحة Admin:

صفحة:

```text
Wallet Providers

```

تحتوي:

```text
Provider Name

API Key

API Secret

Status

Test Connection

```

---

# 18. Provider Testing

يجب وجود زر:

```text
Test Wallet Connection
```

يقوم بـ:

* إرسال طلب تجريبي.
* التأكد من نجاح المصادقة.
* تسجيل النتيجة.

---

# 19. Future Features

يمكن إضافة:

## Push Notifications

مثال:

"لقد حصلت على نقطة جديدة"

---

## Marketing Messages

مثال:

"خصم 20% هذا الأسبوع"

---

## Location Based Offers

عندما يكون العميل قريبًا من المحل.

---

# 20. Final Wallet Requirements For Developer

يجب على المطور:

* عدم بناء Apple Pass Generator يدويًا.
* عدم تخزين شهادات Apple داخل المشروع.
* استخدام Wallet Provider API.
* بناء Wallet Service مستقل.
* جعل تغيير المزود مستقبلاً ممكنًا.
* اختبار Apple Wallet وGoogle Wallet على أجهزة حقيقية.
