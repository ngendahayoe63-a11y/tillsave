# Direct Fix - Copy Paste These Exact Queries

The SQL I gave you might be too complex. Let me give you simpler queries to try.

## What to Do RIGHT NOW

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Find your TillSave project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query** button

### Step 2: First, Check the Current State

**Copy and paste this EXACTLY:**

```sql
SELECT id, name, current_cycle, current_cycle_start_date, created_at FROM groups LIMIT 1;
```

Click **Run** (or Ctrl+Enter)

**What to look for:**
- `current_cycle_start_date` = NULL? → BIG PROBLEM
- `current_cycle_start_date` = very old date (like Jan 2025)? → Problem
- `current_cycle_start_date` = recent date (Dec 2025)? → Good!

### Step 3: If current_cycle_start_date is NULL or old, run this:

**SIMPLEST FIX - Copy exactly:**

```sql
UPDATE groups SET current_cycle_start_date = NOW() WHERE current_cycle_start_date IS NULL OR current_cycle_start_date < NOW() - INTERVAL '7 days';
```

Click **Run**

You should see: **"X rows updated"** where X is how many groups got fixed

### Step 4: Also ensure current_cycle is set:

```sql
UPDATE groups SET current_cycle = COALESCE(current_cycle, 1) WHERE current_cycle IS NULL;
```

Click **Run**

### Step 5: Verify it worked:

```sql
SELECT id, name, current_cycle, current_cycle_start_date FROM groups ORDER BY created_at DESC;
```

Check each row:
- ✅ `current_cycle_start_date` should NOT be NULL
- ✅ Should be today or very recent
- ✅ Should NOT be from January

---

## Step 6: Clear Your Browser and Test

1. **Press:** F12 (open DevTools)
2. **Click:** **Application** tab (or **Storage** in Firefox)
3. **Left sidebar:** Find your domain and click it
4. **Right panel:** Click **Clear site data** button (top right of Application tab)
5. **Close DevTools:** Press F12 again
6. **Hard refresh page:** Press Ctrl+F5

### Step 7: Test Your Group

1. Open your TillSave app
2. Open your group
3. Click **"End Cycle & Payout"**
4. **Check what you see:**

**Scenario A: Empty Cycle**
```
✅ CORRECT: "No Savings Recorded"
✅ CORRECT: Shows "Back to Group" button
```

**Scenario B: Cycle with Payments**
```
✅ CORRECT: Shows ONLY payments from TODAY
✅ CORRECT: Does NOT show Cycle 1 data
✅ CORRECT: Your earnings are from TODAY only
```

**Scenario C: Still Showing Old Data**
```
❌ WRONG: Shows METERO Aloys or Claudia Test from way back
❌ WRONG: Still showing 97,997 RWF data
```

---

## If Still Showing Old Data - Debug This

1. Open DevTools: **F12**
2. Click: **Console** tab
3. Go to: **End Cycle & Payout** page
4. Look for the log message with:
```
Query date range: XXXX-XX-XX to XXXX-XX-XX
```

**Tell me the exact dates you see**

If it shows:
- `Query date range: 2025-01-15 to 2025-12-06` → Database fix didn't work
- `Query date range: 2025-12-06 to 2025-12-06` → Database OK, might be caching issue

---

## One More Thing to Try

If the regular update didn't work, try this MORE AGGRESSIVE fix:

```sql
UPDATE groups 
SET current_cycle_start_date = NOW()::timestamp with time zone
WHERE 1=1;
```

This updates **ALL** groups to start from RIGHT NOW.

Then test again.

---

## Last Resort: Manual Single Group Fix

If nothing works, fix just YOUR group:

Replace `YOUR-GROUP-ID-HERE` with your actual group ID:

```sql
UPDATE groups 
SET 
  current_cycle = 10,
  current_cycle_start_date = NOW()
WHERE id = 'YOUR-GROUP-ID-HERE';
```

Then:
1. Clear browser cache again
2. Refresh
3. Test

---

## Report Back

After you try these, tell me:

1. **Did the SQL update show "X rows updated"?** YES / NO
2. **What does the verification query show for current_cycle_start_date?** (exact value)
3. **What does the browser console show for "Query date range"?** (exact dates)
4. **What do you see on "End Cycle & Payout" page?** ("No Savings Recorded" or old data?)

With these answers I can diagnose exactly what's wrong!
