# 🔧 Fix RLS Policy Error

## The Problem
```
"Failed to create group: new row violates row-level security policy for table 'groups'"
```

This means the RLS (Row Level Security) policy on the `groups` table is blocking group creation.

---

## The Solution

### Step 1: Run the RLS Fix Script
1. Go to **Supabase SQL Editor** → **New Query**
2. Open: `supabase/migrations/FIX_RLS_POLICIES.sql`
3. Copy ALL the code and paste into Supabase SQL Editor
4. Click **Execute**

This will:
- ✅ Drop existing conflicting INSERT policies
- ✅ Create new INSERT policy allowing users to create groups where they are the organizer
- ✅ Ensure SELECT, UPDATE, DELETE policies work correctly

---

## Why This Happened

The existing RLS policies on the `groups` table were too restrictive. When you tried to insert a new group:

1. You set `organizer_id = auth.uid()` (your user ID)
2. The RLS policy checked: "Is this allowed?"
3. The policy was blocking the insert
4. Error: "Row violates RLS policy"

The fix creates a policy that says:
> "A user can INSERT a group IF they are setting themselves as the organizer"

This is the correct behavior!

---

## After Running the Fix

1. **Hard refresh browser**: `Ctrl+Shift+R`
2. **Restart dev server**: Press `Ctrl+C` then `npm run dev`
3. **Test group creation**:
   - Go to Create Group page
   - Enter group name
   - Select group type (Full Platform or Organizer-Only)
   - Click Create
   - ✅ Should succeed now!

---

## If It Still Doesn't Work

### Check Current Policies
Run this in Supabase SQL Editor:

```sql
SELECT tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'groups' 
ORDER BY tablename, policyname;
```

You should see policies like:
- `users_can_create_groups`
- `users_can_view_own_groups`
- `users_can_update_own_groups`
- `users_can_delete_own_groups`

If you see old policies like "Users can create groups" or "organizers can create groups", those need to be dropped first.

### Test the Policy Directly
Run this (replace with your actual user ID if needed):

```sql
INSERT INTO groups (
  organizer_id, 
  name, 
  join_code, 
  cycle_days, 
  status, 
  current_cycle, 
  current_cycle_start_date, 
  group_type
)
VALUES (
  auth.uid(), 
  'Test Group', 
  'TESTCODE123', 
  30, 
  'ACTIVE', 
  1, 
  NOW(), 
  'FULL_PLATFORM'
)
RETURNING *;
```

If this works, the RLS is fixed!

---

## Also Check: HTTP 401 Errors

You may also see:
```
POST https://oyflnhsbnlpfaqepdmud.supabase.co/rest/v1/groups?select=* 401 (Unauthorized)
```

This means your auth token is expired or missing. Fix:

1. **Logout**: Click your profile → Sign out
2. **Login again**: Sign back in
3. **Try creating group**: Should work now

---

## 406 Not Acceptable Errors

These come from the `generateJoinCode()` function trying to check if a join code already exists:

```sql
SELECT id FROM groups WHERE join_code = 'ABCDEF'
```

The 406 error is from Supabase's REST API when the response header is missing. This is usually harmless - the function keeps generating codes until it finds one that doesn't get a 406.

If this becomes a problem, we can optimize the join code generation (Phase 2).

---

## Summary of What to Do

1. ✅ Run `FIX_RLS_POLICIES.sql` in Supabase SQL Editor
2. ✅ Hard refresh browser (`Ctrl+Shift+R`)
3. ✅ Restart dev server (`npm run dev`)
4. ✅ Test creating a group
5. ✅ If auth issues, logout and login again

That's it! 🚀

---

## Need More Help?

Check these:
- Are you logged in? (Check profile icon)
- Is your session fresh? (Logout/login)
- Do you see the two group type options? (Full Platform + Organizer-Only)
- Can you enter group name? (Form works?)
- Error message details? (Copy exact error)

Let me know! 📝
