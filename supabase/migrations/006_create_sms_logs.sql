-- Create SMS configuration columns on groups table (from previous migration, but ensuring they exist)
-- This allows organizers to configure SMS settings per group

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT;

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT;

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT;

-- Create sms_logs table to track all SMS sent
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID REFERENCES organizer_only_members(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- PAYMENT_RECORDED, PAYMENT_REMINDER, CYCLE_PAYOUT, WELCOME
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sms_logs_group ON sms_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_member ON sms_logs(organizer_only_member_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON sms_logs(created_at DESC);

-- Apply RLS policies for SMS logs
-- Organizers can view SMS logs for their groups
DROP POLICY IF EXISTS sms_logs_select_organizer ON sms_logs;
DROP POLICY IF EXISTS sms_logs_insert_organizer ON sms_logs;

CREATE POLICY sms_logs_select_organizer 
ON sms_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = sms_logs.group_id
    AND g.organizer_id = auth.uid()
  )
);

CREATE POLICY sms_logs_insert_organizer
ON sms_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = sms_logs.group_id
    AND g.organizer_id = auth.uid()
  )
);

-- Enable RLS on sms_logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
