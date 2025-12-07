# 🚀 How to Apply Database Migrations

## Quick Steps

### 1. Open Supabase SQL Editor
1. Go to: https://app.supabase.com
2. Select your project (TillSave)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Copy the SQL Migration
1. Open this file: `supabase/migrations/APPLY_NOW.sql`
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor

### 3. Run the Migration
1. Click the **Execute** button (or press `Ctrl+Enter`)
2. Wait for it to complete (should take ~5 seconds)
3. You should see: "Success" messages with no errors

### 4. Verify Success
```sql
-- Run these to verify:
SELECT * FROM information_schema.columns 
WHERE table_name='groups' AND column_name='group_type';

SELECT * FROM information_schema.tables 
WHERE table_name='organizer_only_members';

SELECT * FROM information_schema.tables 
WHERE table_name='sms_logs';
```

If all three return results, the migration was successful! ✅

---

## What Gets Created

✅ **Column**: `groups.group_type` (defaults to 'FULL_PLATFORM')
✅ **Table**: `organizer_only_members` - for non-app members
✅ **Table**: `sms_logs` - for tracking SMS messages
✅ **Columns**: SMS config on groups table
✅ **RLS Policies**: Secure organizer-only access
✅ **Indexes**: Fast queries

---

## Common Issues

### Error: "Column already exists"
- This is fine! The `IF NOT EXISTS` handles this.
- Just continue running the script.

### Error: "Cannot create policy that already exists"
- Also handled! The script drops and recreates policies.
- Just continue.

### Error: "Foreign key constraint failed"
- Make sure the `groups` table exists first.
- Run: `SELECT * FROM groups LIMIT 1;` to verify

### No errors but app still breaks?
- Clear your browser cache (Ctrl+Shift+Delete)
- Hard refresh the app (Ctrl+Shift+R)
- Restart your dev server: `npm run dev`

---

## After Migration

### Test the Feature
1. Go to your app in development mode
2. Click "Create New Savings Group"
3. You should now see TWO options:
   - ✅ Full Platform (existing option)
   - ✅ Organizer-Only (NEW - for cash-based groups)
4. Try creating a group with each type
5. For Organizer-Only groups, you should see a member list
6. Try adding members by phone number

### Expected Results
- ✅ Can create FULL_PLATFORM groups (works as before)
- ✅ Can create ORGANIZER_ONLY groups (NEW)
- ✅ Can add members to organizer-only groups
- ✅ Can record payments (UI only, Phase 2 integration)
- ✅ Can remove members

---

## If Something Goes Wrong

### Rollback (Remove Everything)
Run this in Supabase SQL Editor to remove all Phase 1 changes:

```sql
-- ROLLBACK - Run ONLY if needed
DROP TABLE IF EXISTS sms_logs;
DROP TABLE IF EXISTS organizer_only_members;
ALTER TABLE groups DROP COLUMN IF EXISTS group_type;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_enabled;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_provider;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_account_sid;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_auth_token;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_from_number;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_balance;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_notifications_enabled;
```

Then restart your app.

---

## Need Help?

Check the logs:
1. Supabase Dashboard: Logs (bottom right)
2. Browser Console: `F12` → Console tab
3. Server logs: Look at your dev server output

Common fixes:
- 🔄 Hard refresh browser
- 🔄 Restart dev server: `npm run dev`
- 🔄 Clear browser cache
- 🔄 Check internet connection
- 🔄 Make sure you're logged in to Supabase

---

Let me know when you've run the migration! ✅
