# TillSave - Critical Business Logic Documentation

**This document defines the EXACT rules for how TillSave calculates payouts.**  
**These are NOT negotiable - implement them exactly as specified.**

---

## 🔥 RULE #1: Organizer Fee (Per Member, Per Currency)

### The Foundation Rule
**The organizer's fee is NOT a flat amount. It is 1 DAY of that member's daily rate, FOR EACH CURRENCY they saved in.**

### Simple Example (Single Member, Single Currency)

```
Member A contributes: 2,000 RWF/day for 30 days

Timeline:
Day 1: 2,000 RWF ✓
Day 2: 2,000 RWF ✓
...
Day 30: 2,000 RWF ✓

End of Cycle Calculation:
─────────────────────────────────────
Days paid:        30
Daily rate:       2,000 RWF
Gross saved:      30 × 2,000 = 60,000 RWF
─────────────────────────────────────
Organizer fee:    2,000 RWF (1 day's rate)
Member receives:  60,000 - 2,000 = 58,000 RWF
─────────────────────────────────────
Organizer earns:  2,000 RWF
```

### Complex Example (Multiple Members, Variable Contributions)

```
GROUP A - 30-day cycle

MEMBER A:
  Daily rate: 1,000 RWF
  Days paid: 28
  Total saved: 28 × 1,000 = 28,000 RWF
  Organizer fee: 1,000 RWF (1 day)
  Member receives: 27,000 RWF

MEMBER B:
  Daily rate: 5,000 RWF
  Days paid: 30
  Total saved: 30 × 5,000 = 150,000 RWF
  Organizer fee: 5,000 RWF (1 day)
  Member receives: 145,000 RWF

MEMBER C:
  Daily rate: 2,500 RWF
  Days paid: 25
  Total saved: 25 × 2,500 = 62,500 RWF
  Organizer fee: 2,500 RWF (1 day)
  Member receives: 60,000 RWF

TOTAL ORGANIZER EARNINGS:
1,000 + 5,000 + 2,500 = 8,500 RWF
```

**Key insight**: Organizer earns EXACTLY what each member saves on their best day. If member was disciplined and saved a lot, organizer fee is higher. If member saved little, organizer fee is lower. This incentivizes the organizer to recruit disciplined savers.

---

## 🔥 RULE #2: Multi-Currency Per Member (CRITICAL)

### The Foundation Rule
**Each member can save in MULTIPLE CURRENCIES within the same group. Each currency is tracked separately and paid separately.**

### How It Works

```
MEMBER SARAH joins GROUP A (30-day cycle)

Setup: Sarah selects currencies
  RWF: 2,000 per day
  USD: 1 per day
  
Days 1-15: Sarah pays in RWF only
  Day 1: 2,000 RWF ✓
  Day 2: 2,000 RWF ✓
  ...
  Day 15: 2,000 RWF ✓
  
Days 16-30: Sarah switches to USD
  Day 16: $1 USD ✓
  Day 17: $1 USD ✓
  ...
  Day 30: $1 USD ✓

END OF CYCLE - SARAH'S PAYOUT:

RWF Column:
  Days paid: 15
  Daily rate: 2,000 RWF
  Gross: 15 × 2,000 = 30,000 RWF
  Organizer fee: 2,000 RWF (1 day)
  Sarah gets: 28,000 RWF

USD Column:
  Days paid: 15
  Daily rate: $1 USD
  Gross: 15 × $1 = $15 USD
  Organizer fee: $1 USD (1 day)
  Sarah gets: $14 USD

TOTAL SARAH RECEIVES: 28,000 RWF + $14 USD
ORGANIZER EARNS: 2,000 RWF + $1 USD
```

### Why This Matters
- **Flexibility**: Members can save in their preferred currency
- **Real value**: Member saves $1 USD for kids' school fees, 2,000 RWF for emergencies
- **Multiple payouts**: Organizer calculates each currency separately
- **Conversion**: Exchange rates used only for reporting (not for fee calculation)

---

## 🔥 RULE #3: Handling Edge Cases

### Edge Case 1: Member Pays MORE Than Daily Rate

**Question**: Member's rate is 2,000 RWF but pays 2,500 RWF. What happens?

**Answer**: 
```
RECORD ACTUAL AMOUNT PAID (2,500 RWF)
BUT organizer fee is based on DAILY RATE (2,000 RWF)

Example:
Member A: Daily rate 2,000 RWF
Day 1: Member pays 2,500 RWF (extra 500) ✓ Record 2,500
Day 2: Member pays 2,000 RWF ✓ Record 2,000
...

At payout (30 days):
Total recorded: 2,500 + 2,000 + ... = 62,000 RWF (member overpaid by 2,000)
Organizer fee: 2,000 RWF (based on RATE, not actual payment)
Member receives: 60,000 RWF

The extra 2,000 RWF the member overpaid is CREDITED to next cycle
OR returned to member if they ask
```

**Business Logic**:
- Accept any amount member wants to pay
- Organizer fee is ALWAYS 1 × daily_rate
- Overpayment goes to next cycle or returned

### Edge Case 2: Member Pays LESS Than Daily Rate

**Question**: Member's rate is 2,000 RWF but only pays 1,500 RWF. What happens?

**Answer**:
```
RECORD ACTUAL AMOUNT PAID (1,500 RWF)
It still counts as 1 contribution day

Example:
Member B: Daily rate 2,000 RWF
Day 1: Member pays 1,500 RWF (short 500) ✓ Record 1,500
Day 2: Member pays 2,000 RWF ✓ Record 2,000
...

At payout (30 days):
Total recorded: 1,500 + 2,000 + ... = 59,000 RWF (member underpaid by 1,000)
Days counted: 30 (still counts as 30 days)
Organizer fee: 2,000 RWF (full 1 day rate)
Member receives: 57,000 RWF

The member's shortfall is their problem, not carried forward
```

**Business Logic**:
- Record as partial payment
- Still counts as 1 day contributed
- Organizer fee is ALWAYS 1 × daily_rate (no reduction)
- Member responsible for shortfall

### Edge Case 3: Member Pays TWICE in One Day

**Question**: Member pays 2,000 RWF at 10 AM and 1,000 RWF at 3 PM. What happens?

**Answer**:
```
CREATE TWO SEPARATE PAYMENT RECORDS

Payment 1:
  Date: 2025-03-15
  Amount: 2,000 RWF
  Time: 10:00 AM
  Status: CONFIRMED

Payment 2:
  Date: 2025-03-15
  Amount: 1,000 RWF
  Time: 15:00 PM
  Status: CONFIRMED

COUNTING LOGIC:
When calculating "days paid", count UNIQUE DATES not UNIQUE RECORDS
So: Day 2025-03-15 counts as 1 day (but 3,000 RWF saved)

Example:
Member C: Daily rate 2,000 RWF
Day 1: Two payments (2,000 + 1,000) = 3,000 RWF ✓ Counts as 1 day
Day 2: One payment (2,000) = 2,000 RWF ✓ Counts as 1 day
...

At payout (30 unique dates):
Total recorded: (3,000 + 2,000 + ...) = 62,000 RWF
Days counted: 30 (unique dates)
Organizer fee: 2,000 RWF (1 day rate)
Member receives: 60,000 RWF
```

**Business Logic**:
- Allow multiple payments per day
- Count by UNIQUE DATE, not record count
- Total all payments for that date

### Edge Case 4: Member Joins Mid-Cycle

**Question**: Group cycle is 30 days, member joins on Day 15. What's expected?

**Answer**:
```
Member is only expected to pay for days from join_date forward

Example:
Cycle: Jan 1 - Jan 30 (30 days)
Member joins: Jan 16 (Day 16)
Expected payment days: 16 - 30 = 15 days

If member pays all 15 days:
Total saved: 15 × 2,000 = 30,000 RWF
Organizer fee: 2,000 RWF (1 day)
Member receives: 28,000 RWF

If member pays only 10 days (out of 15 expected):
Total saved: 10 × 2,000 = 20,000 RWF
Organizer fee: 2,000 RWF (1 day - still charged)
Member receives: 18,000 RWF
```

**Business Logic**:
- Store `joined_at` timestamp
- When calculating expected days: (cycle_end - join_date)
- Organizer fee applies regardless of when member joined
- This incentivizes joining early

### Edge Case 5: Organizer Fee if Member Paid 0 Days

**Question**: Member joined but never paid anything. Does organizer still get a fee?

**Answer**:
```
DEPENDS ON BUSINESS POLICY (choose one):

Option A: NO FEE (recommended)
  Total saved: 0 RWF
  Organizer fee: 0 RWF
  Member receives: 0 RWF
  Reasoning: Organizer only earns if member actually participated

Option B: YES FEE (strict)
  Total saved: 0 RWF
  Organizer fee: 2,000 RWF (full daily rate)
  Member owes: -2,000 RWF (carry to next cycle)
  Reasoning: Organizer fee is for managing the cycle, regardless of participation

Current TillSave Implementation: Option A (no fee if no payments)
```

---

## 🔥 RULE #4: Multi-Currency Payout Breakdown

### Example: Member with 3 Currencies

```
MEMBER DAVID - 30 day cycle

Setup:
  RWF: 1,000/day
  USD: $0.50/day
  KES: 50 KES/day

Payment History (sample):
  Days 1-10: RWF only (1,000 × 10 = 10,000 RWF)
  Days 11-20: USD only ($0.50 × 10 = $5 USD)
  Days 21-30: KES only (50 × 10 = 500 KES)

PAYOUT BREAKDOWN:

RWF Column:
  Days: 10
  Rate: 1,000 RWF/day
  Gross: 10,000 RWF
  Fee: 1,000 RWF
  Net: 9,000 RWF

USD Column:
  Days: 10
  Rate: $0.50/day
  Gross: $5 USD
  Fee: $0.50 USD
  Net: $4.50 USD

KES Column:
  Days: 10
  Rate: 50 KES/day
  Gross: 500 KES
  Fee: 50 KES
  Net: 450 KES

MEMBER DAVID RECEIVES: 9,000 RWF + $4.50 USD + 450 KES
ORGANIZER EARNS: 1,000 RWF + $0.50 USD + 50 KES

For Reporting (convert to RWF at current rates):
  Exchange rates (example): 1 USD = 1,200 RWF, 1 KES = 10 RWF
  David's total (in RWF): 9,000 + (4.50 × 1,200) + (450 × 10)
                         = 9,000 + 5,400 + 4,500 = 18,900 RWF
```

---

## 📋 Payout Calculation Algorithm (Implementation)

This is the EXACT algorithm to implement in `payoutCalculator.ts`:

```typescript
// Types
interface MemberCurrencyRate {
  id: string;
  membership_id: string;
  currency: 'RWF' | 'USD' | 'KES' | 'UGX' | 'TZS';
  daily_rate: number;
  is_active: boolean;
}

interface Payment {
  id: string;
  membership_id: string;
  amount: number;
  currency: 'RWF' | 'USD' | 'KES' | 'UGX' | 'TZS';
  payment_date: string; // YYYY-MM-DD
  status: 'CONFIRMED' | 'PENDING' | 'DISPUTED';
}

interface CurrencyPayout {
  currency: string;
  daily_rate: number;
  days_contributed: number;
  gross_amount: number;
  organizer_fee: number;
  member_net: number;
}

interface MemberPayoutSummary {
  membership_id: string;
  total_organizer_earnings: string; // JSON: { RWF: 1000, USD: 0.5 }
  payouts_by_currency: CurrencyPayout[];
  total_in_rwf?: number; // For reporting
}

// Main function
function calculateMemberPayout(
  payments: Payment[],
  currencyRates: MemberCurrencyRate[]
): MemberPayoutSummary {
  
  // Step 1: Filter only CONFIRMED payments
  const confirmedPayments = payments.filter(p => p.status === 'CONFIRMED');
  
  // Step 2: Group payments by currency
  const paymentsByCurrency = new Map<string, Payment[]>();
  for (const payment of confirmedPayments) {
    if (!paymentsByCurrency.has(payment.currency)) {
      paymentsByCurrency.set(payment.currency, []);
    }
    paymentsByCurrency.get(payment.currency)!.push(payment);
  }
  
  // Step 3: For each currency, calculate payout
  const payoutsByCurrency: CurrencyPayout[] = [];
  const organizerEarnings: Record<string, number> = {};
  
  for (const [currency, currencyPayments] of paymentsByCurrency.entries()) {
    // Find member's daily rate for this currency
    const rate = currencyRates.find(
      r => r.currency === currency && r.is_active
    );
    
    if (!rate) {
      console.error(`No active rate found for ${currency}`);
      continue;
    }
    
    // Count unique days (not payment records)
    const uniqueDates = new Set(
      currencyPayments.map(p => p.payment_date)
    );
    const daysContributed = uniqueDates.size;
    
    // Sum all payments for this currency
    const grossAmount = currencyPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    
    // Organizer fee is exactly 1 day's rate
    const organizerFee = rate.daily_rate;
    
    // Member gets gross minus fee
    const memberNet = grossAmount - organizerFee;
    
    payoutsByCurrency.push({
      currency,
      daily_rate: rate.daily_rate,
      days_contributed: daysContributed,
      gross_amount: grossAmount,
      organizer_fee: organizerFee,
      member_net: memberNet,
    });
    
    organizerEarnings[currency] = organizerFee;
  }
  
  // Step 4: Return structured payout
  return {
    membership_id: payments[0]?.membership_id || '',
    total_organizer_earnings: JSON.stringify(organizerEarnings),
    payouts_by_currency: payoutsByCurrency,
  };
}

// Export function
export const payoutCalculator = {
  calculateMemberPayout,
};
```

---

## 🗄️ Database Queries for Payout Calculation

These are the SQL queries needed to calculate payouts in Supabase:

```sql
-- Query 1: Get all payments for a member in a cycle
SELECT 
  p.id,
  p.amount,
  p.currency,
  p.payment_date,
  p.status
FROM payments p
WHERE p.membership_id = $1
  AND p.status = 'CONFIRMED'
  AND p.payment_date BETWEEN $2 AND $3  -- cycle_start to cycle_end
ORDER BY p.payment_date, p.created_at;

-- Query 2: Get member's active currency rates
SELECT 
  id,
  membership_id,
  currency,
  daily_rate,
  is_active
FROM member_currency_rates
WHERE membership_id = $1 AND is_active = true;

-- Query 3: Get all members in a group for bulk payout calculation
SELECT 
  m.id as membership_id,
  u.id as user_id,
  u.name,
  u.phone
FROM memberships m
JOIN users u ON u.id = m.user_id
WHERE m.group_id = $1 AND m.status = 'ACTIVE';

-- Query 4: Aggregate payout for reporting
SELECT 
  pi.currency,
  SUM(pi.gross_amount) as total_gross,
  SUM(pi.organizer_fee) as total_organizer_fees,
  SUM(pi.net_amount) as total_member_payouts,
  COUNT(DISTINCT pi.membership_id) as member_count
FROM payout_items pi
WHERE pi.payout_id = $1
GROUP BY pi.currency;
```

---

## ✅ Testing the Payout Logic

### Test Case 1: Single Member, Single Currency

```javascript
// Input
const member = {
  membership_id: 'mem-123',
  currency_rates: [
    { currency: 'RWF', daily_rate: 2000, is_active: true }
  ],
  payments: [
    { amount: 2000, currency: 'RWF', payment_date: '2025-03-01', status: 'CONFIRMED' },
    { amount: 2000, currency: 'RWF', payment_date: '2025-03-02', status: 'CONFIRMED' },
    // ... 30 payments total
  ]
};

// Expected output
{
  membership_id: 'mem-123',
  total_organizer_earnings: '{"RWF": 2000}',
  payouts_by_currency: [
    {
      currency: 'RWF',
      daily_rate: 2000,
      days_contributed: 30,
      gross_amount: 60000,
      organizer_fee: 2000,
      member_net: 58000
    }
  ]
}
```

### Test Case 2: Member with Multiple Currencies

```javascript
// Input: Member pays RWF days 1-15, USD days 16-30
const member = {
  membership_id: 'mem-456',
  currency_rates: [
    { currency: 'RWF', daily_rate: 2000, is_active: true },
    { currency: 'USD', daily_rate: 1, is_active: true }
  ],
  payments: [
    // Days 1-15: RWF
    ...Array(15).fill().map((_, i) => ({
      amount: 2000,
      currency: 'RWF',
      payment_date: `2025-03-0${i + 1}`,
      status: 'CONFIRMED'
    })),
    // Days 16-30: USD
    ...Array(15).fill().map((_, i) => ({
      amount: 1,
      currency: 'USD',
      payment_date: `2025-03-${i + 16}`,
      status: 'CONFIRMED'
    }))
  ]
};

// Expected output
{
  membership_id: 'mem-456',
  total_organizer_earnings: '{"RWF": 2000, "USD": 1}',
  payouts_by_currency: [
    {
      currency: 'RWF',
      daily_rate: 2000,
      days_contributed: 15,
      gross_amount: 30000,
      organizer_fee: 2000,
      member_net: 28000
    },
    {
      currency: 'USD',
      daily_rate: 1,
      days_contributed: 15,
      gross_amount: 15,
      organizer_fee: 1,
      member_net: 14
    }
  ]
}
```

### Test Case 3: Edge Case - Overpayment

```javascript
// Input: Member pays 2500 RWF on day 1 (rate is 2000)
const member = {
  membership_id: 'mem-789',
  currency_rates: [
    { currency: 'RWF', daily_rate: 2000, is_active: true }
  ],
  payments: [
    { amount: 2500, currency: 'RWF', payment_date: '2025-03-01', status: 'CONFIRMED' },
    { amount: 2000, currency: 'RWF', payment_date: '2025-03-02', status: 'CONFIRMED' },
    // ... more payments
    // Total: 2500 + (29 × 2000) = 60500
  ]
};

// Expected output
{
  payouts_by_currency: [
    {
      currency: 'RWF',
      daily_rate: 2000,
      days_contributed: 30,
      gross_amount: 60500,  // ACTUAL amount paid
      organizer_fee: 2000,   // Based on RATE, not actual
      member_net: 58500      // 500 extra carried to next cycle
    }
  ]
}
```

---

## 🎯 Implementation Checklist

When implementing payout logic:

- [ ] Accept ACTUAL payment amounts (not rate-based)
- [ ] Count days by UNIQUE DATE (not payment record count)
- [ ] Organizer fee is ALWAYS 1 × daily_rate
- [ ] Multiple currencies tracked separately
- [ ] Each currency gets its own payout record
- [ ] Organizer fee deducted from each currency independently
- [ ] Handle 0 payments (no fee charged if member never paid)
- [ ] Handle mid-cycle joins (prorated expected days)
- [ ] Store both gross and net amounts
- [ ] Store organizer earnings per currency
- [ ] Handle currency conversion for reporting only
- [ ] Never round intermediate calculations (use decimal, not float)

---

## 📞 When You Have Questions

**Question**: "How do we handle the organizer fee if a member pays in cash?"  
**Answer**: Record the payment in whatever currency the member chose during setup. Fee is 1 day's rate in that currency.

**Question**: "What if exchange rates change mid-cycle?"  
**Answer**: Payouts calculated in original currencies. Exchange rates only used for conversion when generating reports.

**Question**: "Can a member change their daily rate mid-cycle?"  
**Answer**: Store rate as time-series (start_date, end_date). New rate applies from next payment onward.

**Question**: "What if the organizer wants to change fees to 10%?"  
**Answer**: That changes the algorithm. Right now it's "1 day's rate". If you want % fee, entire payout logic changes. Ask for clarification.

---

**This is THE business logic. Don't deviate.** 🔥
