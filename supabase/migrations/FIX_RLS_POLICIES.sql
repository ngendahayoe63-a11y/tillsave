-- FIX: Update RLS Policy for Groups Table INSERT
-- This allows users to insert groups where they are the organizer

-- First, check current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'groups';

-- Drop the problematic INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can insert groups" ON groups;
DROP POLICY IF EXISTS "organizers can create groups" ON groups;

-- Create a new, more permissive INSERT policy
-- Allow users to INSERT groups where they are setting themselves as organizer
CREATE POLICY "users_can_create_groups"
  ON groups
  FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id
  );

-- Make sure SELECT, UPDATE, DELETE policies still work
-- These should already exist but we're documenting them:

-- SELECT policy (organizers can view their own groups)
DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
CREATE POLICY "users_can_view_own_groups"
  ON groups
  FOR SELECT
  USING (
    auth.uid() = organizer_id
    OR
    id IN (
      SELECT group_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE policy (organizers can update their own groups)
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
CREATE POLICY "users_can_update_own_groups"
  ON groups
  FOR UPDATE
  USING (
    auth.uid() = organizer_id
  );

-- DELETE policy (organizers can delete their own groups)
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;
CREATE POLICY "users_can_delete_own_groups"
  ON groups
  FOR DELETE
  USING (
    auth.uid() = organizer_id
  );

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the policies are correct:

-- Check all policies on groups table
-- SELECT tablename, policyname, permissive, roles, qual, with_check FROM pg_policies WHERE tablename = 'groups';

-- Test insert (should work now)
-- INSERT INTO groups (organizer_id, name, join_code, cycle_days, status, current_cycle, current_cycle_start_date, group_type)
-- VALUES (auth.uid(), 'Test Group', 'TESTCODE123', 30, 'ACTIVE', 1, NOW(), 'FULL_PLATFORM')
-- RETURNING *;
