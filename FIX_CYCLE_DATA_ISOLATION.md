# Fix Cycle Data Isolation Issue

## Problem Identified
Old cycle data (from Cycle 1) persists when viewing newer cycles (Cycle 10) because:

1. **New groups created before fix**: `current_cycle_start_date` was NULL or not set
2. **Query filtering breaks**: When `current_cycle_start_date` is NULL, Supabase date comparisons don't work correctly
3. **Result**: `previewCyclePayout()` returns all payments ever made, not just current cycle

## Example Issue
```
Group created on Dec 1, 2025
- current_cycle_start_date: NULL (or old date)
- Payment recorded: Dec 5, 2025
- Even in Cycle 10 (Dec 10), that payment still shows because NULL <= any date is true
```

## Solution

### Part 1: Fixed for New Groups ✅
Modified `groupsService.createGroup()` to set:
- `current_cycle: 1`
- `current_cycle_start_date: TODAY (in ISO format)`

This ensures new groups have proper date boundaries from day 1.

**File Modified**: `src/services/groupsService.ts` (lines 28-42)

### Part 2: Fix Existing Groups in Supabase ⚠️ MANUAL ACTION NEEDED

**Go to Supabase Dashboard and run this SQL query:**

```sql
-- Update all groups with NULL current_cycle_start_date
-- Set it to their created_at date (or today if you want fresh start)
UPDATE groups
SET 
  current_cycle_start_date = COALESCE(current_cycle_start_date, created_at, NOW()),
  current_cycle = COALESCE(current_cycle, 1)
WHERE 
  current_cycle_start_date IS NULL 
  OR current_cycle IS NULL;
```

**Before running this query:**
1. Go to https://supabase.com/dashboard
2. Navigate to your TillSave project
3. Click "SQL Editor" in left sidebar
4. Create a new query
5. Copy-paste the SQL above
6. Click "Execute" button
7. You should see how many rows were updated

**Example Output:**
```
Query executed successfully
10 rows updated
```

### Part 3: How It Works Now

**When New Cycle Starts:**
1. `previewCyclePayout()` gets `current_cycle_start_date` from database
2. Queries payments where:
   - `payment_date >= current_cycle_start_date` (on or after cycle start)
   - `payment_date <= today` (on or before today)
3. Only payments in that range are shown (old cycles excluded)

**When Cycle Ends:**
1. `finalizePayout()` saves payout record with cycle number
2. Sets `current_cycle_start_date = TOMORROW`
3. Increments `current_cycle` counter
4. Tomorrow's date ensures new cycle doesn't include today's payments

**When Next Cycle Loads:**
1. `loadData()` reloads page data
2. `previewCyclePayout()` uses NEW `current_cycle_start_date` (tomorrow → today)
3. Returns empty array if no new payments (shows "No Savings Recorded")
4. Or shows only payments from new cycle start date forward

## Verification Steps

After running the SQL fix, test the flow:

1. **Create a test group** (or use existing)
2. **Record a payment** for the current cycle
3. **End the cycle** (should show your payment)
4. **Start next cycle** (should show "No Savings Recorded" if empty)
5. **Verify old payment doesn't reappear** in the new cycle

## Code Changes Summary

**File: `src/services/groupsService.ts`**
- When creating a group, now sets:
  - `current_cycle: 1`
  - `current_cycle_start_date: today.toISOString()`
- This ensures first cycle starts with proper date filtering

**Why This Fixes It:**
- NULL values in date queries behave unpredictably in SQL
- By setting today's date, payments before today are excluded
- When cycle ends, setting `current_cycle_start_date = tomorrow` ensures clean boundary

## Important Notes

⚠️ **Do NOT manually edit payouts or payout_items in database** - these are historical records and should be read-only after `finalizePayout()` completes

✅ **Safe to update**: `groups.current_cycle_start_date` and `groups.current_cycle` - these are cycle state, not payment records

🔄 **Testing**: After the fix, all new payments will properly isolate to their cycle. Old payments remain in database (for `payout_items` historical record) but won't show in new cycle previews.
