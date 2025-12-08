-- Migration: Fix organizer_only_members UNIQUE constraint issue
-- Problem: UNIQUE(group_id, phone_number) fails when adding multiple organizers with empty phone
-- Solution: Change phone_number to allow NULL and update unique constraint

-- Step 1: Add phone_number column as nullable if it doesn't exist
ALTER TABLE organizer_only_members 
  ALTER COLUMN phone_number DROP NOT NULL;

-- Step 2: Drop old constraint and add new one that allows multiple NULLs
ALTER TABLE organizer_only_members
  DROP CONSTRAINT IF EXISTS organizer_only_members_group_id_phone_number_key CASCADE;

-- Step 3: Add new UNIQUE constraint that allows multiple NULL phone numbers
DO $$
BEGIN
  ALTER TABLE organizer_only_members
    ADD CONSTRAINT unique_group_phone 
    UNIQUE NULLS NOT DISTINCT (group_id, phone_number);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Step 4: Add organizers to all ORGANIZER_ONLY groups where they're not already members
INSERT INTO organizer_only_members (group_id, name, phone_number, email, is_active)
SELECT 
  g.id,
  'Me (Organizer)',
  NULL,
  u.email,
  true
FROM groups g
LEFT JOIN auth.users u ON g.organizer_id = u.id
WHERE g.group_type = 'ORGANIZER_ONLY'
  AND NOT EXISTS (
    SELECT 1 FROM organizer_only_members om
    WHERE om.group_id = g.id
    AND om.name = 'Me (Organizer)'
  )
ON CONFLICT DO NOTHING;
