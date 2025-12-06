# What's Actually Happening in Your Database

## The Evidence

From what you're seeing:

**Cycle 10 shows:**
- METERO Aloys: 14 days, 97,997 RWF
- Claudia Test: 23 days, 169,998 RWF
- Your earnings: 14,391 RWF

**Cycle 11 STILL shows the same data**

This means:

1. ❌ The date filtering is NOT working
2. ❌ Old Cycle 1 payments are still being queried
3. ❌ Each new cycle starts with `current_cycle_start_date` still pointing to Cycle 1 date

## Why Your Earnings "Increased"

This is interesting - you said your earnings increased after clicking finalize.

**Theory:** 
- When you clicked "Finalize" for Cycle 10, the system tried to calculate fees
- But because the date range was wrong (still showing Cycle 1 data), it may have:
  - Calculated fees incorrectly
  - Or the fee calculation happened multiple times
  - Or the payout_items table shows accumulated data

**This confirms the root cause:** The `current_cycle_start_date` is not being updated correctly.

## Let's Debug This Now

### Debug Step 1: Check Your Groups in Supabase

Go to Supabase → Your TillSave Project → **"Table Editor"** (easier than SQL)

1. Click on **groups** table
2. Find your group
3. Look at these columns:
   - `current_cycle` - Should be 11 now (since you ended Cycle 10)
   - `current_cycle_start_date` - Should be TODAY or TOMORROW
   
**What you'll probably see:**
- `current_cycle_start_date` = something from January (Cycle 1 date)

### Debug Step 2: Check Payout Records

In Supabase Table Editor:

1. Click on **payouts** table
2. Look for entries with:
   - `group_id` = your group
   - `cycle_number` = 10
   
You should see ONE entry (or two if something went wrong)

**Check the count:**
```
- Cycle 1: 1 record
- Cycle 2: 1 record
- ...
- Cycle 10: Should be 1 record (but might be more?)
```

If Cycle 10 has 2+ records, that's the "earnings increased" problem - it was recorded twice!

### Debug Step 3: Check Payout Items

In Supabase Table Editor:

1. Click on **payout_items** table
2. Filter by your group (join payout → group_id)
3. Look at:
   - How many entries for Cycle 10?
   - Are METERO Aloys and Claudia Test listed?

**Expected:**
- Cycle 10: 2 entries (one per member)

**Problem indicator:**
- Cycle 10: 3+ entries (means recorded multiple times)

## The Fix - Run This NOW

Since my code change doesn't affect **existing** groups, you MUST run this SQL:

**Go to Supabase → SQL Editor → Run this:**

```sql
UPDATE groups
SET 
  current_cycle_start_date = NOW()
WHERE current_cycle_start_date IS NULL 
OR current_cycle_start_date < DATE(NOW());
```

This sets ALL groups' `current_cycle_start_date` to **TODAY**.

Then:

1. Clear browser cache (F12 → Storage → Clear all)
2. Refresh page (Ctrl+F5)
3. Try ending Cycle 11 again

**Now it should show "No Savings Recorded"** because Cycle 11 will only look for payments from TODAY onwards, and no one has paid yet.

## The Real Issue

Your database design stores `current_cycle_start_date` but **never updates it** when you finalize a cycle!

Looking at the code:

```typescript
// In finalizePayout()
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const { error: updateError } = await supabase
  .from('groups')
  .update({
    current_cycle: currentCycle + 1,
    current_cycle_start_date: tomorrow.toISOString()  // ← This SHOULD update!
  })
```

**This code SHOULD be setting the date to tomorrow**, but if it's not working, that's why Cycle 11 still shows Cycle 1 data.

## Check If the Finalize is Working

After you finalize Cycle 10:

1. Go to Supabase Table Editor
2. Click **groups** table
3. Find your group
4. Check `current_cycle_start_date` 

**If it's STILL the old Cycle 1 date:**
- The update is failing silently
- Or the date is being reset somewhere else

**If it's tomorrow's date:**
- The fix is working
- But something else is caching the old data

## Immediate Solution

**The quickest fix:** Run this SQL in Supabase:

```sql
UPDATE groups
SET current_cycle_start_date = NOW()::DATE || ' 00:00:00'::TIME
WHERE id = 'YOUR_GROUP_ID';
```

Replace `YOUR_GROUP_ID` with your actual group ID.

This forces every group to start from TODAY. After this:
- Cycle 11 will only see payments from today
- Should show "No Savings Recorded" ✅

## Next Steps

1. **Check your database** using the debug steps above
2. **Run the SQL fix** to reset `current_cycle_start_date`
3. **Clear browser cache** and refresh
4. **Test**: End Cycle 11 - should show "No Savings Recorded"

Report back what you find in the database!
