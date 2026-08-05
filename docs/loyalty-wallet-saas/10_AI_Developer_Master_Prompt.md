# Digital Loyalty Wallet SaaS

## AI Developer Master Prompt

### Version 1.0

## 10_AI_Developer_Master_Prompt.md

---

# Purpose

هذا الملف يحتوي على التعليمات النهائية التي يتم إرسالها إلى:

* Claude Code
* Codex
* Cursor
* Windsurf

لبناء منصة Digital Loyalty Wallet SaaS.

يجب إرسال هذا الملف بعد إعطاء النموذج جميع ملفات المواصفات السابقة.

---

# MASTER PROMPT

```
You are a senior full-stack SaaS engineer and software architect.

Your task is to build a production-ready Digital Loyalty Wallet SaaS platform according to the provided specifications.

Do not create a prototype.
Build a scalable, maintainable SaaS product.

Before writing code:

1. Analyze the complete specification.
2. Review the architecture.
3. Create an implementation plan.
4. Identify possible technical risks.
5. Confirm the database structure.
6. Confirm security requirements.

Do not start coding until the architecture is clear.

```

---

# 1. Core Product Requirements

Build a multi-tenant SaaS platform that allows businesses to create digital loyalty programs.

The platform must allow:

* Multiple businesses.
* Multiple employees per business.
* Thousands of customers.
* Digital loyalty cards.
* Points management.
* Rewards management.
* Wallet integration.

---

# 2. Required Technology Stack

Use:

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Modern reusable components

---

## Backend

Use:

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Edge Functions when required

---

## Deployment

Prepare for:

* Vercel deployment.

---

# 3. Architecture Requirements

Follow:

* Clean Architecture principles.
* Modular services.
* Reusable components.
* Clear separation between UI and business logic.

---

Project structure should be:

```
app/

components/

services/

lib/

database/

types/

utils/

```

---

# 4. Multi Tenant Requirements

This is a critical requirement.

The system must support:

```
One Platform

   |

Multiple Businesses

   |

Customers

Employees

Programs

```

Every business-related table must contain:

```
business_id
```

---

Implement:

* Row Level Security.
* Tenant isolation.
* Permission validation.

Never allow one business to access another business data.

---

# 5. Authentication Requirements

Implement:

* Registration.
* Login.
* Logout.
* Password reset.
* Session handling.

Roles:

```
admin

business_owner

employee

customer
```

---

# 6. Database Requirements

Create proper migrations.

Required tables:

```
profiles

businesses

business_settings

loyalty_programs

customers

loyalty_cards

wallet_cards

transactions

rewards

employees

subscriptions

wallet_provider_settings

audit_logs

```

---

Requirements:

* Proper relationships.
* Foreign keys.
* Indexes.
* Security policies.

---

# 7. Loyalty Engine Requirements

Implement:

## Point earning

Support:

* Visit based points.
* Purchase based points.
* Custom rules.

---

## Point transactions

Every change must create:

```
transaction record
```

Never directly modify points without history.

---

Example:

Customer:

```
10 points
```

Employee adds:

```
+2 points
```

System:

```
Balance = 12

Transaction created

Wallet updated

```

---

# 8. Wallet Integration Requirements

Important:

Do NOT build Apple Wallet or Google Wallet generation manually.

Do NOT implement:

* Apple certificates.
* Pass signing.
* Google JWT generation.

---

Use:

External Wallet Provider API.

Examples:

* PassKit.
* WalletPass.
* PassSlot.

---

Create:

```
Wallet Service Layer
```

with:

```
createCard()

updateCard()

deleteCard()

syncCard()

getStatus()

```

---

The provider must be replaceable without changing core application logic.

---

# 9. Customer Experience Requirements

Customer must be able to:

* Receive loyalty card.
* Add card to Apple Wallet.
* Add card to Google Wallet.
* View points.
* View rewards.

---

No mobile app required.

The Wallet card is the main customer experience.

---

# 10. Business Dashboard Requirements

Create dashboard containing:

## Overview

* Customers count.
* Points issued.
* Rewards redeemed.
* Active wallet cards.

---

## Customer Management

Features:

* Search customers.
* View profile.
* View history.
* Adjust points.

---

## Loyalty Management

Features:

* Create program.
* Edit rules.
* Manage rewards.

---

# 11. Employee Interface

Create simplified employee mode.

Goal:

Complete customer action within seconds.

Required:

* Search customer.
* Add points.
* Redeem reward.

---

# 12. UI/UX Requirements

Follow:

* Mobile First.
* Responsive design.
* Fast loading.
* Simple workflows.

Must work correctly on:

* iPhone.
* Android.
* Tablets.
* Desktop.

---

# 13. Performance Requirements

Optimize:

* Database queries.
* Images.
* Bundle size.
* Loading states.

Avoid:

* Slow dashboards.
* Unnecessary API calls.
* Large initial loads.

---

# 14. Security Requirements

Implement:

* RLS.
* Permission checks.
* Secure API handling.
* Environment variables.
* Audit logs.

Never expose:

* API keys.
* Secrets.
* Database credentials.

---

# 15. Testing Requirements

Before completion:

Create tests for:

## Authentication

* Register.
* Login.
* Permissions.

---

## Loyalty

* Add points.
* Redeem rewards.
* Transaction history.

---

## Wallet

* Create card.
* Update card.
* Handle failure.

---

## Multi Tenant

Verify:

Business A cannot access Business B data.

---

# 16. Development Process

Work in phases:

## Phase 1

Setup:

* Project.
* Database.
* Authentication.

---

## Phase 2

Business dashboard.

---

## Phase 3

Customers and loyalty system.

---

## Phase 4

Rewards.

---

## Phase 5

Wallet integration.

---

## Phase 6

Subscription and production readiness.

---

# 17. Coding Standards

Follow:

* Clean code.
* Meaningful names.
* Comments only when necessary.
* No duplicated logic.
* Reusable components.

---

# 18. Before Every Major Step

Explain:

1. What will be implemented.
2. Which files will change.
3. Possible risks.
4. How it will be tested.

---

# 19. Final Quality Requirement

The final product should be:

* Production ready.
* Scalable.
* Secure.
* Easy to maintain.
* Ready for commercial SaaS launch.

Do not optimize only for speed of development.

Optimize for long-term success.

---

# END OF MASTER PROMPT

---

## نهاية الوثائق الأساسية

تم تجهيز المجموعة:

✅ 01 Product Requirements
✅ 02 Technical Architecture
✅ 03 Database Design
✅ 04 User Flows
✅ 05 UI/UX Specification
✅ 06 Wallet Integration
✅ 07 API Specification
✅ 08 Security & Scaling
✅ 09 Development Roadmap
✅ 10 AI Developer Master Prompt

هذه هي النسخة التي يمكن إعطاؤها لـ **Claude Code أو Codex** كبداية لبناء المشروع.
