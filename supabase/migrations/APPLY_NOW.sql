-- COMBINED MIGRATION: Organizer-Only Mode Phase 1
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql/new

-- ===== STEP 1: Add group_type column to groups table =====
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS group_type VARCHAR(50) DEFAULT 'FULL_PLATFORM';

-- Add constraint to ensure valid group types
ALTER TABLE groups 
ADD CONSTRAINT valid_group_type 
CHECK (group_type IN ('FULL_PLATFORM', 'ORGANIZER_ONLY'));

-- Create index for filtering by group type
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);

-- ===== STEP 2: Create organizer_only_members table =====
CREATE TABLE IF NOT EXISTS organizer_only_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, phone_number),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizer_only_members_group_id ON organizer_only_members(group_id);
CREATE INDEX IF NOT EXISTS idx_organizer_only_members_phone ON organizer_only_members(phone_number);

-- Enable Row Level Security
ALTER TABLE organizer_only_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "organizers_view_members" ON organizer_only_members;
DROP POLICY IF EXISTS "organizers_insert_members" ON organizer_only_members;
DROP POLICY IF EXISTS "organizers_update_members" ON organizer_only_members;
DROP POLICY IF EXISTS "organizers_delete_members" ON organizer_only_members;

-- Policy: Organizers can view members of their groups
CREATE POLICY "organizers_view_members"
  ON organizer_only_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  );

-- Policy: Organizers can insert members to their groups
CREATE POLICY "organizers_insert_members"
  ON organizer_only_members
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  );

-- Policy: Organizers can update members in their groups
CREATE POLICY "organizers_update_members"
  ON organizer_only_members
  FOR UPDATE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  );

-- Policy: Organizers can delete members from their groups
CREATE POLICY "organizers_delete_members"
  ON organizer_only_members
  FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  );

-- ===== STEP 3: Add SMS configuration columns to groups table =====
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS sms_account_sid VARCHAR(255),
ADD COLUMN IF NOT EXISTS sms_auth_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS sms_from_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS sms_balance DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT true;

-- Create index for filtering groups with SMS enabled
CREATE INDEX IF NOT EXISTS idx_groups_sms_enabled ON groups(sms_enabled);

-- ===== STEP 4: Create sms_logs table for tracking sent messages =====
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID REFERENCES organizer_only_members(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  message_body TEXT NOT NULL,
  message_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'PENDING',
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_only_member_id) REFERENCES organizer_only_members(id) ON DELETE SET NULL
);

-- Create indexes for SMS logs
CREATE INDEX IF NOT EXISTS idx_sms_logs_group_id ON sms_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at);

-- Enable Row Level Security on SMS logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "organizers_view_sms_logs" ON sms_logs;

-- Policy: Organizers can view SMS logs for their groups
CREATE POLICY "organizers_view_sms_logs"
  ON sms_logs
  FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  );

-- ===== MIGRATION COMPLETE =====
-- All tables, columns, and policies have been created.
-- The app is now ready to use organizer-only groups!
