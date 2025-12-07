# 🎯 Organizer-Only Mode - Feature Specification

## Overview
A simplified version of TillSave for **cash-based savings groups** where members don't have smartphones or internet access. The organizer handles all recording, payments, and member communication.

---

## 📋 Current Problem
- Members without smartphones can't participate
- No way to notify members via SMS
- System too complex for cash-based tracking
- Members collect money in-person anyway (no digital payout needed)

---

## ✨ Solution: Two Group Types

When creating a group, organizer chooses:

### **Type A: Full Platform** (Current - Digital-first)
- Members create accounts and log in
- Members see their own dashboards
- Members view payouts online
- Works best for groups with smartphones/internet

### **Type B: Organizer-Only** (New - Cash-first) ⭐
- **No member accounts required**
- **Organizer controls everything**
- Members are just contact records (name + phone)
- Organizer records all payments
- Organizer sends SMS updates
- Members collect cash in-person at cycle end

---

## 🏗️ Architecture Changes

### Database Schema Updates

```sql
-- Add group_type column to groups table
ALTER TABLE groups ADD COLUMN group_type VARCHAR(20) 
  CHECK (group_type IN ('FULL_PLATFORM', 'ORGANIZER_ONLY')) 
  DEFAULT 'FULL_PLATFORM';

-- For organizer-only groups, members table becomes simpler
-- New table: organizer_only_members (instead of full memberships)
CREATE TABLE organizer_only_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL, -- For SMS notifications
  email VARCHAR(255), -- Optional
  is_active BOOLEAN DEFAULT true,
  notes TEXT, -- Organizer notes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track payments in organizer-only groups (same as before, just different query logic)
-- payments table works the same way
```

---

## 🎨 UI Changes

### Create Group Page - Group Type Selection

```
┌─────────────────────────────────────┐
│ Create New Savings Group             │
├─────────────────────────────────────┤
│                                       │
│ Group Name: [____________]           │
│ Cycle Days: [30]                     │
│                                       │
│ ✅ Who will use this group?          │
│                                       │
│ ○ FULL PLATFORM                      │
│   Members can log in and see:         │
│   - Their payment history            │
│   - Payout preview                   │
│   - Analytics                        │
│   Best for: Groups with smartphones  │
│                                       │
│ ○ ORGANIZER-ONLY (NEW!) ⭐          │
│   Only you manage everything:        │
│   - Record payments                  │
│   - Send SMS updates                 │
│   - Calculate payouts                │
│   Best for: Cash-based groups        │
│                                       │
│ [Create Group]                       │
└─────────────────────────────────────┘
```

### Group Details Page - Organizer-Only Mode

**Current (Full Platform)**:
- List of member accounts
- Their dashboard links
- Manage memberships

**New (Organizer-Only)**:
```
┌────────────────────────────────────────┐
│ Vacation Savings Group - Cycle 1        │
│ Mode: Organizer-Only (Cash-Based)      │
├────────────────────────────────────────┤
│                                          │
│ 📊 Cycle Summary                        │
│ Total Saved: 450,000 RWF                │
│ Members Paid: 8/10                      │
│ Days Left: 15                           │
│                                          │
│ 📱 Quick SMS Send                       │
│ [Send "Cycle ending in 15 days"]       │
│                                          │
│ 👥 Members & Payments                   │
│ ┌─────────────────────────────────────┐│
│ │ Alice - 0789123456                   ││
│ │ Total: 45,000 RWF | ✅ Paid Today   ││
│ │ [Record Payment] [Send SMS] [Notes] ││
│ │                                      ││
│ │ Bob - 0789234567                     ││
│ │ Total: 40,000 RWF | ⏳ Not Paid    ││
│ │ [Record Payment] [Send SMS] [Notes] ││
│ │                                      ││
│ │ (7 more members...)                  ││
│ └─────────────────────────────────────┘│
│                                          │
│ [End Cycle & Calculate Payouts]         │
│ [Send Batch SMS "Come Collect"]         │
└────────────────────────────────────────┘
```

### Simplified Member List

**Organizer-Only View**:
- Name
- Phone number
- Total saved (this cycle)
- Last payment date
- Quick buttons:
  - Record Payment
  - Send SMS
  - View Notes
  - Mark Collected (after payout)

---

## 📱 SMS Features

### SMS Service Integration (Twilio)

When organizer records a payment:
```
✅ Alice - Payment recorded for 50,000 RWF
SMS: "Hi Alice! We recorded 50,000 RWF from you. New balance: 95,000 RWF"
```

When cycle is about to end:
```
[Send SMS to all members]
"Hi everyone! Our savings cycle ends in 3 days. 
Your current total: 45,000 RWF
Come collect on Dec 20, 2025. Thanks!"
```

When payout is ready:
```
[Send SMS after finalizing]
"Your payout is ready: 44,000 RWF (45,000 - 1,000 fee)
Come collect today at office."
```

### SMS Configuration

In Group Settings:
```
SMS Notifications
☑️ Enabled

SMS Provider: Twilio
Account SID: [***]
Auth Token: [***]
Phone Number: +1234567890

Messages:
☑️ Record payment confirmation
☑️ Daily balance reminder
☑️ Cycle ending soon (3 days before)
☑️ Payout ready notification
☑️ Custom messages allowed
```

---

## 📊 Payout Calculation - Organizer-Only

**Same logic, but simpler UI**:

1. Organizer clicks "End Cycle"
2. System calculates:
   - Total per member
   - Organizer fee (1 day contribution)
   - Net payout
3. Shows list:
```
┌─────────────────────────────────┐
│ Payout Preview - Cycle 1        │
├─────────────────────────────────┤
│ Alice                           │
│ Total: 45,000 RWF              │
│ Fee: 1,000 RWF                 │
│ Payout: 44,000 RWF ✓           │
│                                 │
│ Bob                             │
│ Total: 40,000 RWF              │
│ Fee: 1,000 RWF                 │
│ Payout: 39,000 RWF ✓           │
│                                 │
│ (8 more members...)             │
│                                 │
│ [Finalize Payouts]              │
│ [Send Collection SMS]           │
└─────────────────────────────────┘
```

4. After finalization, option to:
   - Send SMS to all members
   - Print payment list
   - Mark members as "collected" one by one

---

## 🔄 Member Communication

### Organizer Can Send SMS Anytime

Quick templates:
- "Payment received: [amount]"
- "New balance: [amount]"
- "Cycle ending in [X] days"
- "Come collect your money - [date]"
- Custom message

### Summary SMS Before Collection

```
"Hi Alice,
Your Vacation Savings - Cycle 1 Summary:
Amount Saved: 45,000 RWF
Organizer Fee: 1,000 RWF
Your Payout: 44,000 RWF
Collection Date: Dec 20, 2025

Come to office between 9-5 to collect.
Questions? Call 0789123456"
```

---

## 🎯 Implementation Phases

### Phase 1 (MVP - 2 weeks)
- [x] Group type selection at creation
- [x] Organizer-only group dashboard
- [x] Simplified member list (name, phone, total saved)
- [x] Record payment directly from member list
- [x] Payout calculation (same logic)
- [x] Manual SMS option (text field to send custom message)

### Phase 2 (2 weeks)
- [ ] SMS integration (Twilio)
- [ ] Automated SMS on payment recording
- [ ] Batch SMS send
- [ ] SMS templates
- [ ] SMS delivery logs

### Phase 3 (Ongoing)
- [ ] WhatsApp integration (alternative to SMS)
- [ ] Print-friendly member receipts
- [ ] QR code for payment verification
- [ ] Organizer reports (cash collected, etc)

---

## 💾 Data Isolation

Important: Keep organizer-only and full-platform groups separate in UI:

```
Groups Dashboard

Full Platform Groups (4):
- Lunch Club
- Education Fund
- Medical Fund
- Holiday Trip

Organizer-Only Groups (3):
- Village Savings (Cash-Based)
- Mobile Money Group
- Community Fund
```

---

## 🔐 Security Considerations

**Organizer-Only Mode**:
- Still requires organizer authentication (PIN + password)
- No member login = no breach risk for members
- SMS can expose phone numbers (expected in cash-based groups)
- All payment recording done by organizer = audit trail

---

## 📈 Why This Matters

**For Cash-Based Groups**:
1. ✅ No smartphone requirement for members
2. ✅ Easier tracking of physical cash
3. ✅ SMS keeps members informed without apps
4. ✅ Simpler UX (organizer only)
5. ✅ Works in low-connectivity areas
6. ✅ Fits existing cash collection process

**Market Impact**:
- Opens TillSave to 50%+ of African savings groups
- Becomes the only solution with both digital AND cash modes
- Competitive advantage over Yodha, SurePay, etc.

---

## 🚀 Go-to-Market Strategy

Position as:
> **"TillSave: Works with or without smartphones"**

"Want to go digital? Use our full platform. Prefer cash? Use organizer mode. Switch anytime."

---

## ✅ Testing Checklist

- [ ] Create organizer-only group
- [ ] Add members without creating accounts
- [ ] Record payments for multiple members
- [ ] Send SMS notification
- [ ] Calculate payout with fee
- [ ] Verify member list shows correct totals
- [ ] Test cycle finalization
- [ ] Verify payment history per member
- [ ] Test switching between group types (if needed)

---

## 📞 Next Steps

1. **Get developer feedback** on implementation complexity
2. **Design mockups** for organizer-only dashboard
3. **SMS provider selection** (Twilio recommended)
4. **Database migration** plan
5. **QA test plan** for both group types
6. **User testing** with actual organizers

