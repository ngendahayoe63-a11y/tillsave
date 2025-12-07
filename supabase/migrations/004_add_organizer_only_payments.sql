-- Add organizer_only_member_id column to payments table
-- This allows recording payments for non-app members in organizer-only groups

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS organizer_only_member_id UUID REFERENCES organizer_only_members(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_organizer_only_member ON payments(organizer_only_member_id);

-- Add notes column for payment metadata
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create constraint: Either membership_id OR organizer_only_member_id must be set (not both, not neither)
-- Note: This is informational; enforce in application code since CHECK constraints with OR are limited
-- A payment belongs to either:
-- 1. A traditional membership (member has user account)
-- 2. An organizer-only member (no user account, just name + phone)

-- Create index for faster lookups by group and organizer-only member
CREATE INDEX IF NOT EXISTS idx_payments_group_organizer_member ON payments(group_id, organizer_only_member_id)
WHERE organizer_only_member_id IS NOT NULL;
