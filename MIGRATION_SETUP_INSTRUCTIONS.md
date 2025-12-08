# Migration Application Instructions

## Status
The migration file `009_create_organizer_only_payouts.sql` has been fixed and is ready to apply.

## What This Migration Does
- Adds `current_cycle` and `current_cycle_start_date` columns to `groups` table
- Creates `organizer_only_payouts` table for tracking payout history
- Adds RLS policies for security
- Creates performance indexes

## How to Apply

### Option 1: Supabase Dashboard (Recommended for Now)
1. Go to Supabase Dashboard
2. Navigate to your project
3. Go to SQL Editor
4. Create new query
5. Copy the entire content of `supabase/migrations/009_create_organizer_only_payouts.sql`
6. Paste into SQL Editor
7. Click "Run"

### Option 2: Supabase CLI
```bash
supabase db push
```
(If using Supabase CLI)

### Option 3: Skip for Now
The app works perfectly WITHOUT this migration:
- ✅ Payments recorded
- ✅ Dashboards display
- ✅ Reports generate
- ✅ Cycle endingworks
- ✅ SMS queuing works locally

The migration is optional for Phase 1.

## What Happens if Not Applied
- SMS logs stored locally instead of in database
- Payout history not persisted (but still calculated)
- App remains fully functional

## What Happens After Applied
- SMS delivery tracking in database
- Payout history persisted
- Reports show payout status
- Complete audit trail

## Migration File Location
`d:\Aloys Files\Personal Project\TillSave\supabase\migrations\009_create_organizer_only_payouts.sql`

## Verification Query
After applying, you can verify with:
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'organizer_only_payouts'
);

-- Check if columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'groups' AND column_name IN ('current_cycle', 'current_cycle_start_date');
```
