-- Add group_type column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS 
  group_type VARCHAR(20) DEFAULT 'FULL_PLATFORM' 
  CHECK (group_type IN ('FULL_PLATFORM', 'ORGANIZER_ONLY'));

-- Create organizer_only_members table (no user accounts)
CREATE TABLE IF NOT EXISTS organizer_only_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(group_id, phone_number)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_organizer_only_members_group 
  ON organizer_only_members(group_id);
CREATE INDEX IF NOT EXISTS idx_organizer_only_members_active 
  ON organizer_only_members(group_id, is_active);

-- Enable Row Level Security
ALTER TABLE organizer_only_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Organizers can manage their own group's members
DROP POLICY IF EXISTS organizer_only_members_organizer ON organizer_only_members;
CREATE POLICY organizer_only_members_organizer ON organizer_only_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = organizer_only_members.group_id
      AND g.organizer_id = auth.uid()
    )
  );

-- Create SMS configuration table
CREATE TABLE IF NOT EXISTS sms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL UNIQUE REFERENCES groups(id) ON DELETE CASCADE,
  twilio_account_sid VARCHAR(255),
  twilio_auth_token VARCHAR(255),
  sender_phone_number VARCHAR(20),
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SMS logs table for tracking
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID REFERENCES organizer_only_members(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  message_body TEXT NOT NULL,
  message_type VARCHAR(50), -- 'payment_notification', 'cycle_reminder', 'payout_ready', 'custom'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for SMS logs
CREATE INDEX IF NOT EXISTS idx_sms_logs_group ON sms_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_member ON sms_logs(organizer_only_member_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);

-- Enable RLS on SMS tables
ALTER TABLE sms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SMS config
DROP POLICY IF EXISTS sms_config_organizer ON sms_config;
CREATE POLICY sms_config_organizer ON sms_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = sms_config.group_id
      AND g.organizer_id = auth.uid()
    )
  );

-- RLS Policies for SMS logs
DROP POLICY IF EXISTS sms_logs_organizer ON sms_logs;
CREATE POLICY sms_logs_organizer ON sms_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = sms_logs.group_id
      AND g.organizer_id = auth.uid()
    )
  );

-- Modify payments table to support organizer_only_members
ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
  organizer_only_member_id UUID REFERENCES organizer_only_members(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_payments_organizer_only_member 
  ON payments(organizer_only_member_id);
