-- Make membership_id nullable to support organizer-only payments
-- Organizer-only groups don't create memberships, so they need organizer_only_member_id instead

ALTER TABLE payments
ALTER COLUMN membership_id DROP NOT NULL;

-- Verify the change
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'payments' AND column_name = 'membership_id';
