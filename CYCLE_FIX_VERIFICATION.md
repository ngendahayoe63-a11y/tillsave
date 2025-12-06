# Cycle Data Isolation - Quick Verification Guide

## The Root Cause (FIXED)

Your groups table had `current_cycle_start_date` set to NULL for existing groups.

In SQL, when you query with NULL dates:
```sql
WHERE payment_date >= NULL  -- This is ALWAYS false in strict SQL
```

This caused the query to either:
1. Return NO payments (if strict comparison)
2. Return ALL payments (if NULL is ignored)

**Result**: Old Cycle 1 data appeared in Cycle 10

## What Was Fixed

1. ✅ **New Groups**: Now set `current_cycle_start_date` to TODAY on creation
2. ⏳ **Existing Groups**: Need manual SQL fix in Supabase

## Verify the Fix in 2 Steps

### Step 1: Check Your Groups in Supabase

1. Go to https://supabase.com → Your TillSave Project
2. Click "SQL Editor" in sidebar
3. Run this query:

```sql
SELECT 
  id,
  name,
  created_at,
  current_cycle,
  current_cycle_start_date,
  status
FROM groups
ORDER BY created_at DESC
LIMIT 10;
```

**Look for:**
- ✅ Groups with `current_cycle_start_date` = today's date or later
- ❌ Groups with `current_cycle_start_date` = NULL

**If you see NULL values**, run this fix:

```sql
UPDATE groups
SET 
  current_cycle_start_date = COALESCE(current_cycle_start_date, created_at, NOW()),
  current_cycle = COALESCE(current_cycle, 1)
WHERE 
  current_cycle_start_date IS NULL 
  OR current_cycle IS NULL;
```

### Step 2: Test in App

1. **Open one of your groups**
2. **Go to "End Cycle & Payout"**
3. **Observe the member list:**
   - ✅ Should show ONLY payments from this cycle
   - ❌ Should NOT show Cycle 1 data anymore
4. **End the cycle**
5. **Start next cycle**
6. **Should show "No Savings Recorded"** if no new payments

## Expected Behavior After Fix

### Empty New Cycle
```
End Cycle & Payout - No Savings Recorded
↓ Expected Button
Back to Group
```

### Cycle with Payments
```
Review Payout

Member: John Doe
- 15 days contributed
- 450,000 RWF saved
- 5% fee: 22,500 RWF
- Net: 427,500 RWF

Member: Jane Smith
- 10 days contributed
- 300,000 RWF saved
- 5% fee: 15,000 RWF
- Net: 285,000 RWF

[Confirm Finalize]
```

## Detailed Debugging (if still not working)

If you still see old cycle data after the SQL fix, check the browser console:

1. **Open DevTools** (F12)
2. **Click Console tab**
3. **Go to "End Cycle & Payout"**
4. **Look for this log:**
```
📊 Payout Preview - Cycle 10
   Query date range: 2025-12-10 to 2025-12-10
   Raw start date from DB: 2025-12-10T00:00:00.000Z
Found 5 active members
```

**Check these values:**
- `Query date range` should show TODAY's date as start
- `Raw start date from DB` should match your `current_cycle_start_date`

**If dates look wrong:**
- The Supabase SQL fix didn't apply properly
- Or group's `current_cycle_start_date` is corrupt

## How Payment Filtering Works (Technical)

```typescript
// In previewCyclePayout()
const startDateStr = '2025-12-10';  // current_cycle_start_date
const endDateStr = '2025-12-10';     // today

// Query payments:
payments
  .gte('payment_date', '2025-12-10')   // Payments on or after cycle start
  .lte('payment_date', '2025-12-10')   // Payments on or before today
  
// Result: Only payments with date = 2025-12-10
// Cycle 1 payments (from 2025-12-01) are excluded
```

## Summary

| Issue | Before | After |
|-------|--------|-------|
| New group created | `current_cycle_start_date` = NULL | = TODAY |
| Date filtering | Broken (NULL comparisons) | Works correctly |
| Old cycle data | Persists in new cycles | Properly archived |
| Payment isolation | All payments shown | Only current cycle shown |
| "No Savings Recorded" | Doesn't work right | Shows when cycle is empty |

## Still Have Issues?

Check these in order:

1. **Verify SQL update ran successfully**
   ```sql
   SELECT COUNT(*) FROM groups WHERE current_cycle_start_date IS NULL;
   -- Should return: 0 rows
   ```

2. **Check a specific group's cycle state**
   ```sql
   SELECT current_cycle, current_cycle_start_date, status
   FROM groups
   WHERE name = 'Your Group Name';
   ```

3. **Check if payments exist for this cycle**
   ```sql
   SELECT COUNT(*) as payment_count
   FROM payments p
   JOIN memberships m ON p.membership_id = m.id
   WHERE m.group_id = 'YOUR_GROUP_ID'
   AND p.payment_date >= '2025-12-10'  -- Use today's date
   AND p.payment_date <= '2025-12-10';
   ```

If all these check out but you still see old data, there may be a caching issue - try clearing your browser cache and refreshing.
