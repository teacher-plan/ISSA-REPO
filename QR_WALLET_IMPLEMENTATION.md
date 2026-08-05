# QR Wallet Implementation Plan

## ✅ Final Decision Summary

**السيناريو المختار:**
- ❌ ~~PassKit integration~~ (too complex)
- ❌ ~~NFC cards with HCE~~ (requires app on customer phone)
- ✅ **QR Code Loyalty Wallet** (simplest & best)
- ✅ **Earn points by QR scan** (employee scans customer's wallet)

---

## 🎯 End-to-End Flow

### 1. First Visit (Customer)

```
Customer visits shop → Scans QR code (with phone camera)
    ↓
Opens loyalty wallet setup page
    ↓
Enters name + phone (optional)
    ↓
"Add to Apple Wallet / Google Wallet" button
    ↓
Wallet saves loyalty card with unique QR code
```

### 2. Points Transaction (Employee)

```
Customer wants to earn points
    ↓
Customer opens Wallet app → Shows loyalty card
    ↓
Card displays:
  - Shop logo & name
  - Current points
  - QR code (unique customer ID)
    ↓
Employee scans QR with phone camera or reader
    ↓
App sends: { customer_qr_id, points_earned }
    ↓
Server updates database:
  - customers.total_points += points_earned
  - transactions.insert (record)
    ↓
Employee confirms on screen: ✓ 10 points added
```

### 3. Redeem Reward (Employee)

```
Same as earning points, but for redemption:
  - Scan customer's QR
  - Select reward
  - Deduct points
  - Update Wallet
```

---

## 🏗️ Technical Architecture

### Database Schema (Already Exists)

```sql
-- Customers
customers {
  id UUID PRIMARY KEY
  business_id UUID (FK)
  name TEXT
  phone TEXT
  total_points INT
}

-- Loyalty Program
loyalty_programs {
  business_id UUID PRIMARY KEY (FK)
  points_per_visit INT
  reward_threshold INT
}

-- Transactions (Points Log)
transactions {
  id UUID PRIMARY KEY
  customer_id UUID (FK)
  business_id UUID (FK)
  points_change INT
  type ENUM ('earn', 'redeem', 'adjustment')
  timestamp TIMESTAMP
}

-- Wallet Cards (NEW)
wallet_cards {
  id UUID PRIMARY KEY          -- QR code ID (unique token)
  customer_id UUID (FK)
  business_id UUID (FK)
  qr_code_url TEXT            -- Generated QR code
  sync_status ENUM ('pending', 'synced', 'failed')
  created_at TIMESTAMP
}
```

### API Endpoints (NEW)

```
POST /api/loyalty/qr/init
  Input: { name?, phone? }
  Output: { customer_id, qr_code_id, qr_image }

POST /api/loyalty/qr/scan
  Input: { qr_code_id, points_earned? }
  Output: { customer_name, total_points, success }

GET /api/loyalty/wallet/:qr_code_id
  Output: { customer_name, points, qr_image }
```

---

## 📱 Frontend Components (NEW)

### 1. Wallet Setup Page (`/loyalty/setup`)

```
[QR Code Placeholder]
↓
Name input field
Phone input field (optional)
↓
[Add to Wallet] button
```

**Action:**
- Generates unique wallet card
- Creates QR with customer ID
- Provides Apple Wallet + Google Wallet buttons

### 2. Wallet Card (Apple/Google Wallet)

```
┌─────────────────────┐
│ [Logo] Shop Name    │
│                     │
│ Customer: John      │
│ Points: 150         │
│                     │
│    [QR Code]        │
│                     │
│ "Scan at checkout" │
└─────────────────────┘
```

### 3. Employee QR Scanner (`/employee`)

```
[Scan Customer QR]
    ↓
"Found: John Doe"
"Current Points: 150"
    ↓
[+ 10 Points]  [Redeem Reward]
    ↓
"✓ Points Added!"
"New Total: 160"
```

---

## 🔧 Implementation Roadmap

### Phase 1: QR Generation & Wallet Setup
- [ ] Create QR code generator service
- [ ] Build `/loyalty/setup` page
- [ ] Create wallet card design (using AI from earlier)
- [ ] Add to Apple Wallet API integration
- [ ] Add to Google Wallet API integration
- [ ] Database schema for wallet_cards table

### Phase 2: QR Scanning & Points
- [ ] Create QR scanner component
- [ ] Build `/api/loyalty/qr/scan` endpoint
- [ ] Add points transaction logic
- [ ] Create employee interface for scanning
- [ ] Real-time points update in Wallet

### Phase 3: Rewards Redemption
- [ ] Extend scanning for reward redemption
- [ ] Stock management for rewards
- [ ] Confirmation flow
- [ ] Receipt/confirmation email

### Phase 4: Analytics & Admin
- [ ] Track scan history
- [ ] Analytics dashboard
- [ ] Reward usage reports
- [ ] Customer engagement metrics

---

## 🔐 Security Considerations

### QR Code as "Secure Token"

The QR code ID must be:
- ✅ Unique (UUID)
- ✅ Unguessable (not sequential)
- ✅ Difficult to brute force
- ❌ NOT human-readable phone number (privacy)

**Example:**
```
Good:  qr_550e8400-e29b-41d4-a716-446655440000
Bad:   qr_0123456789
```

### Rate Limiting

Prevent abuse:
```
POST /api/loyalty/qr/scan
- Max 1 request per 10 seconds per QR code
- Max 10 points per customer per minute
- Validate business ownership
```

### RLS Policies

```sql
-- Only business_owner can scan for their business
CREATE POLICY "employees_scan_own_business"
  ON wallet_cards
  USING (business_id = current_business_id());
```

---

## 🎨 Design System Integration

### Loyalty Card Design (Using AI)

Earlier we decided to use AI to generate card designs:

```
Input:
- Business name
- Logo upload
- Business type (café, laundry, etc)
- Brand colors

Output:
- Beautiful SVG/PNG card
- QR code embedded
- Ready for Apple/Google Wallet
```

This is already planned! ✓

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│ Customer    │
└──────┬──────┘
       │
       │ 1. Scans QR (first time)
       ↓
┌──────────────────┐
│ Loyalty Setup    │
│ (Web Page)       │
└──────┬───────────┘
       │
       │ 2. Creates wallet card + QR
       ↓
┌──────────────────────────┐
│ Apple/Google Wallet      │
│ (Stores loyalty card)    │
└──────┬───────────────────┘
       │
       │ 3. Shows QR on card
       ↓
┌──────────────┐
│ Employee     │
│ (Scanner)    │
└──────┬───────┘
       │
       │ 4. Scans QR
       ↓
┌──────────────────────┐
│ Backend API          │
│ /api/loyalty/qr/scan │
└──────┬───────────────┘
       │
       │ 5. Updates points
       ↓
┌──────────────────────┐
│ Database             │
│ (transactions table) │
└──────┬───────────────┘
       │
       │ 6. Wallet auto-updates
       ↓
┌──────────────────────────┐
│ Apple/Google Wallet      │
│ (Shows new points total) │
└──────────────────────────┘
```

---

## 🎯 Success Metrics

After implementation, we'll track:

- ✅ QR scan success rate (should be >99%)
- ✅ Average scan time (<5 seconds)
- ✅ Points transaction time (<2 seconds)
- ✅ Customer wallet adoption rate
- ✅ Redemption rate
- ✅ Customer satisfaction

---

## 🚀 Tech Stack for QR

### QR Code Generation
```javascript
// Node.js - qrcode library
npm install qrcode

const QRCode = require('qrcode');

const wallet_card_id = generateUUID();
const qr_data_url = await QRCode.toDataURL(wallet_card_id);
```

### QR Code Scanning

**Option 1: Browser (Simple)**
```javascript
// Use jsQR library (no camera permissions)
npm install jsqr

// Or native Web APIs (requires HTTPS)
// navigator.mediaDevices.getUserMedia() + canvas
```

**Option 2: Native Mobile (Better)**
```javascript
// React Native or Flutter
// Built-in QR scanning support
```

### Wallet Integration

**Apple Wallet:**
```
npm install passkit-generator
// Generate .pkpass file
// User clicks "Add to Wallet"
```

**Google Wallet:**
```
npm install @google-pay/web-pay-button
// Use JWT to authenticate
// Link to Google Wallet
```

---

## 📝 Implementation Checklist

### Database
- [ ] Create `wallet_cards` table
- [ ] Add RLS policies for wallet_cards
- [ ] Create `get_wallet_card()` RPC
- [ ] Create `scan_loyalty_qr()` RPC

### Backend APIs
- [ ] POST `/api/loyalty/qr/init` - Create wallet
- [ ] POST `/api/loyalty/qr/scan` - Scan & add points
- [ ] GET `/api/loyalty/wallet/:id` - Get wallet data

### Frontend Components
- [ ] Loyalty setup page
- [ ] QR scanner component
- [ ] Employee scanner interface
- [ ] Wallet card display

### Integrations
- [ ] Apple Wallet passkit library
- [ ] Google Wallet API
- [ ] QR code generation
- [ ] QR code scanning

### Testing
- [ ] Unit tests for QR generation
- [ ] E2E test: Create wallet → Scan → Points
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Load test: 100+ simultaneous scans

### Deployment
- [ ] Generate icons for PWA
- [ ] Deploy to production
- [ ] Test on AppStore preview
- [ ] Monitor QR scan performance

---

## 🎓 Key Advantages of This Approach

✅ **No app required** for customer (uses native Wallet)
✅ **Simple QR scanning** (any phone camera)
✅ **Instant points** (real-time update)
✅ **Offline capable** (QR read is local)
✅ **Mobile-first** (designed for phones)
✅ **Secure** (UUID tokens, rate limiting)
✅ **Cross-platform** (iOS + Android)
✅ **Future-proof** (can add NFC later if needed)

---

## 📞 Next Steps

Ready to start building?

1. **Confirm database schema** with user
2. **Design wallet card** using AI system (Phase 3)
3. **Build QR generator** and wallet setup
4. **Implement QR scanning** for employees
5. **Deploy & test** on real devices

What should we start with?

