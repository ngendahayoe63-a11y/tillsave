# 🚀 Organizer-Only Mode - Implementation Roadmap

## Quick Summary
Your testers are asking for a **simplified, cash-based mode** where:
- ❌ Members DON'T need accounts or apps
- ✅ Organizer records everything
- ✅ System sends SMS notifications
- ✅ Members just bring money, organizer tracks it

This makes TillSave work for **informal cash savings groups** - a HUGE market!

---

## Phase 1: Core Features (Weeks 1-2)

### 1.1 Database Changes
```sql
-- Add to groups table
ALTER TABLE groups ADD COLUMN 
  group_type VARCHAR(20) DEFAULT 'FULL_PLATFORM';

-- New table for organizer-only members (no user accounts)
CREATE TABLE organizer_only_members (
  id UUID PRIMARY KEY,
  group_id UUID,
  name VARCHAR(255),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 1.2 UI Changes Needed

**Create Group Flow**:
- Add radio buttons: "Full Platform" vs "Organizer-Only"
- Store group_type in database

**Group Details Page** (Organizer-Only):
- Show simple member list (name, phone, total saved, last payment)
- "Record Payment" button per member
- "Send SMS" button per member
- Summary stats: total saved, members paid, cycle progress

**Member Management** (Organizer-Only):
- Add/remove members by name & phone (no account creation)
- Manual entry or import CSV

### 1.3 Payments Recording
- Same payment recording, but:
  - No membership required, just member ID
  - Show member list instead of selecting from users
  - Link directly to organizer_only_members

### 1.4 Payout Calculation
- Same math, same results
- Show in simple list format
- Option to mark "collected" per member

---

## Phase 2: SMS Notifications (Weeks 3-4)

### 2.1 SMS Integration (Twilio)

**Setup**:
```
npm install twilio
```

**Group Settings** - Add SMS config:
- Twilio Account SID
- Twilio Auth Token
- Sender Phone Number
- Enable/disable SMS

### 2.2 SMS Templates

Automatic SMS on:
1. Payment recorded: "Your payment of 50,000 RWF recorded. Balance: 95,000 RWF"
2. Cycle reminder: "Savings cycle ends in 3 days"
3. Payout ready: "Your payout 44,000 RWF is ready. Come collect!"

Manual SMS:
- Organizer can send any message to all members
- Free-form text field

### 2.3 SMS Service

```typescript
// New service: src/services/smsService.ts
export const smsService = {
  sendPaymentNotification: async (memberPhone, amount, newBalance) => {
    // Send via Twilio
  },
  
  sendCycleReminder: async (groupId, daysLeft) => {
    // Send to all members
  },
  
  sendPayoutNotification: async (memberPhone, payout, collectionDate) => {
    // Send payout details
  },
  
  sendBulkSMS: async (members, message) => {
    // Send custom message to multiple members
  }
};
```

---

## Phase 3: Nice-to-Have (Weeks 5+)

### 3.1 Member Summary Report
- Printable/SMS member statement
- Shows: total saved, fee, payout, payment dates

### 3.2 WhatsApp Integration
- Alternative to SMS (cheaper in some countries)
- Same notifications via WhatsApp

### 3.3 CSV Import/Export
- Import member list from Excel
- Export payment records

### 3.4 Organizer Dashboard Filter
- Filter groups by type
- Separate views for digital vs cash groups

---

## 🎯 Key Files to Create/Modify

### New Files
```
src/services/smsService.ts              # SMS notifications
src/services/organizerOnlyService.ts    # Organizer-only group logic
src/components/OrganizerOnlyDashboard.tsx
src/pages/organizer/OrganizerOnlyGroupDetails.tsx
src/components/MemberSMSPanel.tsx       # Send SMS UI
```

### Modified Files
```
src/pages/organizer/CreateGroupPage.tsx         # Add group type selection
src/pages/organizer/GroupDetailsPage.tsx        # Show different UI based on type
src/services/dashboardService.ts                # Support both group types
src/pages/organizer/CyclePayoutPage.tsx        # Show collection options
src/App.tsx                                     # Maybe new routes?
```

### Database Migrations
```
migrations/add_group_type_column.sql
migrations/create_organizer_only_members.sql
migrations/add_sms_config_to_groups.sql
```

---

## 📊 Effort Estimation

| Feature | Effort | Time |
|---------|--------|------|
| **Phase 1: Core** | | |
| Database schema | 2 hours | 0.25 days |
| Group type selection UI | 3 hours | 0.4 days |
| Simplified member list | 4 hours | 0.5 days |
| Payment recording (same logic) | 2 hours | 0.25 days |
| Payout calculation (same logic) | 1 hour | 0.1 days |
| Testing | 4 hours | 0.5 days |
| **Phase 1 Total** | **16 hours** | **~2 days** |
| | | |
| **Phase 2: SMS** | | |
| Twilio integration | 3 hours | 0.4 days |
| SMS service methods | 5 hours | 0.6 days |
| Group settings SMS config | 3 hours | 0.4 days |
| Auto SMS on payment | 3 hours | 0.4 days |
| Bulk SMS UI | 3 hours | 0.4 days |
| Testing & debugging | 5 hours | 0.6 days |
| **Phase 2 Total** | **22 hours** | **~3 days** |

**Total: ~5 days of development**

---

## 💡 Implementation Tips

### 1. Reuse Existing Code
- Payment recording logic (same)
- Payout calculation (same)
- Group management (mostly same)
- Only the UI and member management differ

### 2. Database Strategy
- Add `group_type` column to groups table
- `full_platform` uses `memberships` table
- `organizer_only` uses `organizer_only_members` table
- Both use same `payments` table

### 3. UI Strategy
- Create separate component: `OrganizerOnlyGroupDetails`
- Check `group.group_type` in GroupDetailsPage
- Render appropriate component

```tsx
// In GroupDetailsPage
{group.group_type === 'FULL_PLATFORM' ? (
  <FullPlatformGroupDetails group={group} />
) : (
  <OrganizerOnlyGroupDetails group={group} />
)}
```

### 4. SMS Strategy
- Use Twilio (cheapest, most reliable in Africa)
- Cost: ~$0.01-0.05 per SMS
- Pricing: https://www.twilio.com/sms/pricing
- Consider bulk pricing for high-volume organizers

### 5. Testing Strategy
- Create test organizer-only group
- Record payments for multiple members
- Test SMS sending (with test credentials)
- Verify payout calculation
- Test with actual phone numbers

---

## 🎯 Success Metrics

After launch:
- [ ] Organizers can create cash-based groups
- [ ] Record payments for non-registered members
- [ ] Send SMS notifications
- [ ] Calculate payouts correctly
- [ ] Members confirm SMS is helpful
- [ ] At least 5 organizers using organizer-only mode
- [ ] Zero bugs in payout calculation

---

## 🔄 Change Management

When rolling out:

1. **Existing users**: Not affected
   - Their groups default to FULL_PLATFORM
   - No UI changes for them
   - Backward compatible

2. **New users**: Can choose
   - See both options at group creation
   - Choose what fits their use case

3. **Migration path**: Users can switch later (optional Phase 3 feature)

---

## 💬 Marketing Message

> **"TillSave Now Works for Everyone"**
>
> Whether your group has smartphones or just comes together with cash, 
> TillSave tracks your savings. Choose digital or simple mode at signup.
> Both calculate payouts perfectly.

---

## ❓ Questions to Answer Before Starting

1. **SMS Provider**: Use Twilio? Any preferences?
2. **Budget**: What's budget for SMS costs?
3. **Timeline**: When do you need this?
4. **Organizers**: Who are 2-3 organizers to test with?
5. **Languages**: Need SMS in Kinyarwanda/French?
6. **Phone Format**: What phone number format? (+250..., 07..., etc)

---

## ✅ Next Steps

1. ✅ **Design complete** (this document)
2. ⬜ **Get stakeholder approval** - review with your testers
3. ⬜ **Select SMS provider** - Recommend Twilio
4. ⬜ **Create test group** - Create organizer-only group manually
5. ⬜ **Start Phase 1 development** - Core features
6. ⬜ **Beta test** - 2-3 organizers test
7. ⬜ **Launch** - Release to all
8. ⬜ **Phase 2** - Add SMS after feedback

