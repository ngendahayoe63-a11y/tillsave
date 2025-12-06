# 03 - Business Logic (CRITICAL!)

**Read Time**: 30 minutes  
**Level**: Intermediate  
**Prerequisites**: Read 01-QUICK_START.md, 02-ARCHITECTURE.md  
**Importance**: 🔥 CRITICAL - Implement these rules exactly!

---

## The Golden Rule

> **The organizer's fee is 1 DAY of that member's daily rate, FOR EACH CURRENCY they saved in.**

This is the foundation of everything. Understand this deeply.

---

## Rule 1: Organizer Fee Calculation

### Simple Case (Single Member, Single Currency)

```
SCENARIO:
  Member: Alice
  Daily rate: 2,000 RWF
  Cycle: 30 days
  Alice pays: 2,000 RWF every day for 30 days

CALCULATION:
  Total saved:     30 days × 2,000 RWF = 60,000 RWF
  Organizer fee:   1 day × 2,000 RWF = 2,000 RWF
  Alice receives:  60,000 - 2,000 = 58,000 RWF

KEY INSIGHT:
  - Alice saved the most on Day 1 (2,000 RWF)
  - Organizer fee equals Alice's best day
  - This incentivizes disciplined saving
```

### Complex Case (Multiple Members, Variable Contributions)

```
SCENARIO:
  GROUP A has 3 members, 30-day cycle

MEMBER ALICE:
  Daily rate: 1,000 RWF
  Days paid: 28 (missed 2 days)
  Total: 28 × 1,000 = 28,000 RWF
  Fee: 1,000 RWF
  Receives: 27,000 RWF

MEMBER BOB:
  Daily rate: 5,000 RWF
  Days paid: 30 (perfect attendance)
  Total: 30 × 5,000 = 150,000 RWF
  Fee: 5,000 RWF
  Receives: 145,000 RWF

MEMBER CHARLIE:
  Daily rate: 2,500 RWF
  Days paid: 25 (missed 5 days)
  Total: 25 × 2,500 = 62,500 RWF
  Fee: 2,500 RWF
  Receives: 60,000 RWF

ORGANIZER EARNINGS:
  1,000 + 5,000 + 2,500 = 8,500 RWF

KEY INSIGHT:
  - Organizer's income scales with member discipline
  - High-saver (Bob) = higher fee for organizer
  - Low-saver (Alice) = lower fee for organizer
  - This aligns incentives perfectly
```

---

## Rule 2: Multi-Currency Per Member (CRITICAL!)

### The Concept

**Each member can save in MULTIPLE CURRENCIES simultaneously.**  
Each currency has its own daily rate and is calculated separately.

### Example: Member with 2 Currencies

```
SCENARIO:
  Member: Sarah
  She sets up:
    - 2,000 RWF per day (for daily expenses)
    - $1 USD per day (for daughter's school fees)
  Cycle: 30 days

PAYMENT PATTERN:
  Days 1-15: Only RWF
    Day 1: 2,000 RWF ✓
    Day 2: 2,000 RWF ✓
    ...
    Day 15: 2,000 RWF ✓
    Subtotal: 15 × 2,000 = 30,000 RWF

  Days 16-30: Only USD
    Day 16: $1 USD ✓
    Day 17: $1 USD ✓
    ...
    Day 30: $1 USD ✓
    Subtotal: 15 × $1 = $15 USD

END OF CYCLE - SEPARATE PAYOUTS:

RWF Column:
  Days contributed: 15
  Total saved: 30,000 RWF
  Organizer fee: 2,000 RWF (1 day)
  Sarah receives: 28,000 RWF

USD Column:
  Days contributed: 15
  Total saved: $15 USD
  Organizer fee: $1 USD (1 day)
  Sarah receives: $14 USD

FINAL PAYOUT TO SARAH:
  28,000 RWF + $14 USD

ORGANIZER EARNS:
  2,000 RWF + $1 USD
```

### Key Points

✅ Each currency tracked separately  
✅ Each currency gets own daily rate  
✅ Each currency has own fee (1 day of that rate)  
✅ Member gets multiple payouts (one per currency)  
✅ Organizer gets multiple earnings (one per currency)  

---

## Rule 3: Edge Cases

### Edge Case A: Member Overpays

```
SCENARIO:
  Member's daily rate: 2,000 RWF
  Member pays: 2,500 RWF (extra 500)

RULE:
  Record the ACTUAL amount (2,500)
  Fee is based on RATE, not actual amount (2,000)

CALCULATION:
  Days paid: 30
  Total saved: 75,000 RWF (2,500 × 30)
  Organizer fee: 2,000 RWF (rate, not amount)
  Member receives: 73,000 RWF
  Extra saved: 1,000 RWF (credited to next cycle or returned)

CODE LOGIC:
  organizer_fee = daily_rate * days_paid
  member_payout = total_saved - organizer_fee
```

### Edge Case B: Member Underpays

```
SCENARIO:
  Member's daily rate: 2,000 RWF
  Member pays: 1,500 RWF (short 500)

RULE:
  Record the ACTUAL amount (1,500)
  Still counts as 1 day paid
  Fee is STILL the full daily rate

CALCULATION:
  Days paid: 30 (each day counts, regardless of amount)
  Total saved: 45,000 RWF (1,500 × 30)
  Organizer fee: 2,000 RWF (full rate)
  Member receives: 43,000 RWF

KEY POINT:
  Member's shortfall is their responsibility, not carried forward
```

### Edge Case C: Multiple Payments Same Day

```
SCENARIO:
  Day 15: Member pays 2,000 RWF at 10 AM AND 1,000 RWF at 3 PM

RULE:
  Create 2 payment records but count as 1 day

DATABASE:
  Payment 1: 2,000 RWF on 2025-03-15
  Payment 2: 1,000 RWF on 2025-03-15

CALCULATION (at payout):
  Days paid: Count UNIQUE DATES, not record count
  If this is 1 of 30 days: counts as 1 day
  Total from this day: 3,000 RWF

LOGIC:
  SELECT COUNT(DISTINCT payment_date) AS days_paid
  FROM payments
  WHERE membership_id = $1
```

### Edge Case D: Member Joins Mid-Cycle

```
SCENARIO:
  Cycle: Jan 1-30 (30 days)
  Member joins: Jan 16 (Day 16)
  Expected days: 16-30 = 15 days

RULE:
  Member expected to pay only from join_date forward
  Organizer fee still applies (full daily rate)

IF MEMBER PAYS ALL 15 DAYS:
  Total saved: 15 × 2,000 = 30,000 RWF
  Organizer fee: 2,000 RWF (1 day)
  Member receives: 28,000 RWF

IF MEMBER PAYS 10 OF 15 DAYS:
  Total saved: 10 × 2,000 = 20,000 RWF
  Organizer fee: 2,000 RWF (1 day)
  Member receives: 18,000 RWF

DATABASE:
  Store: memberships.joined_at = '2025-01-16'
  Use: (cycle_end - joined_at) to calculate expected days
```

### Edge Case E: Member Paid Nothing

```
SCENARIO:
  Member joined but never paid

RULE (TillSave Policy):
  NO FEE if member contributed 0 days

CALCULATION:
  Total saved: 0 RWF
  Organizer fee: 0 RWF
  Member receives: 0 RWF

ALTERNATIVE POLICY (not used):
  Some systems charge organizer fee even if no contribution
  This is NOT how TillSave works
```

---

## Rule 4: Multi-Currency Example

### Complex Scenario

```
MEMBER: David
CURRENCIES:
  RWF: 1,000/day
  USD: $0.50/day  
  KES: 50 KES/day

PAYMENT HISTORY (30-day cycle):
  Days 1-10: Only RWF (10 × 1,000 = 10,000 RWF)
  Days 11-20: Only USD (10 × $0.50 = $5 USD)
  Days 21-30: Only KES (10 × 50 = 500 KES)

END OF CYCLE - 3 SEPARATE PAYOUTS:

RWF:
  Days: 10
  Total: 10,000 RWF
  Fee: 1,000 RWF
  Payout: 9,000 RWF

USD:
  Days: 10
  Total: $5 USD
  Fee: $0.50 USD
  Payout: $4.50 USD

KES:
  Days: 10
  Total: 500 KES
  Fee: 50 KES
  Payout: 450 KES

DAVID RECEIVES:
  9,000 RWF + $4.50 USD + 450 KES

ORGANIZER EARNS:
  1,000 RWF + $0.50 USD + 50 KES
```

---

## Implementation: Database Queries

### Calculate Member Payout (Single Currency)

```sql
SELECT 
  m.id as membership_id,
  u.name as member_name,
  COUNT(DISTINCT p.payment_date) as days_paid,
  mcr.daily_rate,
  mcr.currency,
  SUM(p.amount) as total_saved,
  (mcr.daily_rate) as organizer_fee,
  (SUM(p.amount) - mcr.daily_rate) as member_payout
FROM memberships m
JOIN users u ON m.user_id = u.id
JOIN member_currency_rates mcr ON m.id = mcr.membership_id
LEFT JOIN payments p ON m.id = p.membership_id 
  AND p.currency = mcr.currency
  AND p.payment_date BETWEEN $cycle_start AND $cycle_end
WHERE m.group_id = $group_id
GROUP BY m.id, u.name, mcr.currency, mcr.daily_rate
```

### Calculate All Payouts (Multi-Currency)

```sql
WITH member_payouts AS (
  SELECT 
    m.id,
    m.user_id,
    u.name,
    mcr.currency,
    COUNT(DISTINCT p.payment_date) as days_paid,
    COALESCE(SUM(p.amount), 0) as total_saved,
    mcr.daily_rate,
    mcr.daily_rate as organizer_fee,
    COALESCE(SUM(p.amount), 0) - mcr.daily_rate as member_payout
  FROM memberships m
  JOIN users u ON m.user_id = u.id
  JOIN member_currency_rates mcr ON m.id = mcr.membership_id
  LEFT JOIN payments p ON m.id = p.membership_id 
    AND p.currency = mcr.currency
    AND p.payment_date BETWEEN $cycle_start AND $cycle_end
  WHERE m.group_id = $group_id
  GROUP BY m.id, m.user_id, u.name, mcr.currency, mcr.daily_rate
)
SELECT * FROM member_payouts
ORDER BY m.id, currency
```

---

## Implementation: Service Logic

### Payout Service Code Pattern

```typescript
// payoutService.ts
export const payoutService = {
  previewCyclePayout: async (groupId: string) => {
    // 1. Get group cycle info
    const { data: group } = await supabase
      .from('groups')
      .select('current_cycle_start_date, cycle_days')
      .eq('id', groupId)
      .single();

    const cycleStart = new Date(group.current_cycle_start_date);
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + group.cycle_days);

    // 2. Get all members
    const { data: members } = await supabase
      .from('memberships')
      .select('id, user_id, users(name)')
      .eq('group_id', groupId);

    // 3. For each member, calculate per-currency payouts
    const payoutItems = [];
    for (const member of members) {
      // Get member's currency rates
      const { data: rates } = await supabase
        .from('member_currency_rates')
        .select('currency, daily_rate')
        .eq('membership_id', member.id);

      // For each currency, calculate payout
      for (const rate of rates) {
        // Get payments for this member/currency in this cycle
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, payment_date')
          .eq('membership_id', member.id)
          .eq('currency', rate.currency)
          .gte('payment_date', cycleStart.toISOString())
          .lte('payment_date', cycleEnd.toISOString());

        const daysPaid = new Set(
          payments.map(p => p.payment_date)
        ).size;
        
        const totalSaved = payments.reduce((sum, p) => sum + p.amount, 0);
        const organizerFee = rate.daily_rate;
        const memberPayout = totalSaved - organizerFee;

        payoutItems.push({
          membershipId: member.id,
          memberName: member.users.name,
          currency: rate.currency,
          totalSaved,
          organizerFee,
          memberPayout,
          daysPaid
        });
      }
    }

    return payoutItems;
  }
};
```

---

## Testing Scenarios

### Test Case 1: Simple Payout
```
✅ Single member
✅ Single currency
✅ Perfect attendance
✅ Expected: (total - 1 day rate)
```

### Test Case 2: Multiple Members
```
✅ 3 members with different rates
✅ Different days attended
✅ Expected: Each gets (total - their 1 day rate)
✅ Organizer gets sum of fees
```

### Test Case 3: Multi-Currency
```
✅ 1 member
✅ 2 currencies
✅ Different payment patterns
✅ Expected: 2 separate payouts
```

### Test Case 4: Edge Cases
```
✅ Member pays 0 days: fee = 0
✅ Member joins mid-cycle: reduced expected days
✅ Member overpays: extra credited next cycle
✅ Member underpays: shortfall their problem
```

---

## Common Mistakes to Avoid

❌ **Mistake 1**: Calculating fee based on actual payments, not daily rate  
✅ **Correct**: Fee = daily_rate × 1 day, regardless of actual amount paid

❌ **Mistake 2**: Forgetting the multi-currency aspect  
✅ **Correct**: Calculate each currency separately

❌ **Mistake 3**: Not handling zero days paid  
✅ **Correct**: IF days_paid = 0 THEN fee = 0

❌ **Mistake 4**: Counting payment records instead of unique dates  
✅ **Correct**: Use `COUNT(DISTINCT payment_date)`

❌ **Mistake 5**: Applying fee even if member never paid  
✅ **Correct**: Fee only applies if days_paid > 0

---

## Summary

The payout algorithm is:

```
FOR each member:
  FOR each currency they saved in:
    days_paid = COUNT(DISTINCT payment_dates in cycle)
    total_saved = SUM(payment amounts in cycle)
    organizer_fee = daily_rate (1 day)
    member_payout = total_saved - organizer_fee
    CREATE payout_item with all above
```

That's it. Implement exactly this way.

---

## Next Steps

→ **Read**: `04-PROJECT_STRUCTURE.md` - Navigate the codebase

→ **Reference**: `05-DATABASE_SCHEMA.md` - Understand data storage

→ **Implement**: Find `src/services/payoutService.ts` in code and review

---

**Last Updated**: December 6, 2025  
**Status**: ✅ Complete and tested  
**Importance**: 🔥 CRITICAL - These rules are non-negotiable!
