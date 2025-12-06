# Quick Test Scenario for Payment Recording

## Test Steps

### 1. Create a Test Group
- Go to `/organizer` dashboard
- Click "Create Group" (or use existing group)
- Note the group name and ensure at least 1 member is in it

### 2. Add a Member Currency Setup
- Make sure the member has set up their currency preferences
- Go to member's payment setup page
- Ensure at least one currency (e.g., RWF) is selected

### 3. Record a Test Payment
- From group details page, click on a member
- Click "Record Payment"
- **Fill in:**
  - Currency: RWF (or whatever's set)
  - Amount: 10000 (any amount)
  - Date: TODAY'S DATE (IMPORTANT!)
  - Optional: Upload receipt
- Click "Record Payment"

### 4. Check Browser Console
Open DevTools (F12) and check console for:

**Expected logs after recording payment:**
```
💾 Recording payment: 10000 RWF on 2025-12-06 for membership XXX
✅ Payment saved with ID: yyy-zzz-aaa
```

**If you don't see these:** 
- Payment wasn't sent to backend
- Check network tab for errors

### 5. Try to End Cycle
- Go back to group details
- Click "End Cycle & Payout"
- Watch the browser console

**Expected logs:**
```
📊 Payout Preview - Cycle 1
Query date range: 2025-12-05 to 2025-12-06
Raw start date from DB: 2025-12-05T00:00:00Z
Found 1 active members
Member: John Doe
  - Queried payments between 2025-12-05 and 2025-12-06
  - Found: 1 payment(s)
✅ Payout preview complete: 1 members with data to payout
```

**If you see "Found: 0 payment(s)":**
- Date range is wrong
- OR payment date doesn't match cycle date
- OR membership status is not ACTIVE

### 6. Check Supabase
1. Go to Supabase dashboard
2. SQL Editor
3. Run queries from PAYMENT_DEBUG_GUIDE.md

---

## Screenshots Needed

To diagnose the issue, please capture:

1. **Browser Console Screenshot** (DevTools → Console tab)
   - Show the full log sequence from payment recording through "End Cycle"
   
2. **Supabase payments table** 
   - Show 1-2 rows of data
   
3. **Supabase groups table**
   - Show the current_cycle_start_date column for your group

This will help me pinpoint exactly where the issue is!
