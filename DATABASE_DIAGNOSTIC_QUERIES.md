# Database Diagnostic Queries

Run these SQL queries in Supabase SQL Editor to diagnose the issue.

## Query 1: Check Your Group Settings
```sql
SELECT 
  id,
  name,
  current_cycle,
  current_cycle_start_date,
  cycle_days,
  status,
  created_at
FROM groups
ORDER BY created_at DESC
LIMIT 5;
```

**What to look for:**
- `current_cycle_start_date` should be a recent date (today or within last 30 days)
- `status` should be 'ACTIVE'
- `current_cycle` should be 1 or higher

---

## Query 2: Check Memberships in Your Group
Replace `'YOUR_GROUP_ID'` with actual group ID from Query 1.

```sql
SELECT 
  m.id,
  m.group_id,
  m.user_id,
  m.status,
  m.joined_at,
  u.name,
  u.email
FROM memberships m
LEFT JOIN users u ON m.user_id = u.id
WHERE m.group_id = 'YOUR_GROUP_ID'
ORDER BY m.joined_at DESC;
```

**What to look for:**
- `status` must be 'ACTIVE' for each member
- Should show 1+ rows
- `name` should show member names

---

## Query 3: Check All Payments in Your Group
Replace `'YOUR_GROUP_ID'` with actual group ID.

```sql
SELECT 
  p.id,
  p.membership_id,
  p.group_id,
  p.amount,
  p.currency,
  p.payment_date,
  p.recorded_by,
  p.recorded_at,
  m.user_id,
  u.name
FROM payments p
LEFT JOIN memberships m ON p.membership_id = m.id
LEFT JOIN users u ON m.user_id = u.id
WHERE p.group_id = 'YOUR_GROUP_ID'
ORDER BY p.payment_date DESC;
```

**What to look for:**
- Should show all payments you recorded
- `payment_date` should match when you recorded it
- `membership_id` should match membership IDs from Query 2
- `group_id` should match your group

---

## Query 4: Check Date Range for Current Cycle

Replace dates with actual cycle dates from Query 1.

```sql
SELECT 
  p.id,
  p.membership_id,
  p.amount,
  p.currency,
  p.payment_date,
  u.name,
  CASE 
    WHEN p.payment_date >= '2025-12-05' AND p.payment_date <= '2025-12-06' THEN 'IN RANGE ✓'
    ELSE 'OUT OF RANGE ✗'
  END as in_cycle_range
FROM payments p
LEFT JOIN memberships m ON p.membership_id = m.id
LEFT JOIN users u ON m.user_id = u.id
WHERE p.group_id = 'YOUR_GROUP_ID'
ORDER BY p.payment_date DESC;
```

**Replace the dates** (`'2025-12-05'` and `'2025-12-06'`) with:
- Start date: `current_cycle_start_date` from Query 1
- End date: Today's date

**What to look for:**
- All payments should show "IN RANGE ✓"
- If you see "OUT OF RANGE ✗", that's why they're not showing up!

---

## Query 5: Verify Member Currency Rates

Replace `'YOUR_MEMBERSHIP_ID'` with a membership ID from Query 2.

```sql
SELECT 
  id,
  membership_id,
  currency,
  daily_rate,
  is_active,
  start_date,
  end_date,
  created_at
FROM member_currency_rates
WHERE membership_id = 'YOUR_MEMBERSHIP_ID'
ORDER BY start_date DESC;
```

**What to look for:**
- Should show 1+ currencies
- `is_active` should be true for current currencies
- `daily_rate` should be set (e.g., 5000, 10, etc.)

---

## Query 6: Full Payment Debug for Specific Member

Replace both placeholders with actual IDs.

```sql
SELECT 
  'MEMBERSHIPS' as table_name,
  m.id,
  m.group_id,
  m.status,
  null as date_col,
  null as amount_col
FROM memberships m
WHERE m.id = 'YOUR_MEMBERSHIP_ID'

UNION ALL

SELECT 
  'PAYMENTS' as table_name,
  p.membership_id,
  p.group_id,
  p.payment_date::text,
  p.amount::text,
  p.currency
FROM payments p
WHERE p.membership_id = 'YOUR_MEMBERSHIP_ID'
ORDER BY table_name DESC;
```

---

## What to Do Next

1. **Copy one query at a time**
2. **Replace placeholders** with your actual IDs
3. **Run in Supabase SQL Editor**
4. **Share the results** with me (take screenshots or copy the table)

---

## Common Issues & What They Mean

| What You See | What It Means | Solution |
|---|---|---|
| Query 1: No results | No group created | Create a group first |
| Query 2: 0 rows | No members in group | Add members to group |
| Query 2: `status` = 'PENDING' | Members not active | Check if they need to accept invite |
| Query 3: 0 rows | No payments recorded | Record a payment in UI |
| Query 3: Different group_id | Payments in wrong group | Re-record in correct group |
| Query 4: "OUT OF RANGE ✗" | Payment dates wrong | **THIS IS THE ISSUE** - payment dates outside current cycle |
| Query 5: 0 rows | No currency rates set | Member needs to set up currency preferences |
