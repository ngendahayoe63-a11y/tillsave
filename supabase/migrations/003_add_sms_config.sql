-- Add SMS configuration columns to groups table
-- For organizer-only groups to store SMS provider settings

ALTER TABLE groups
ADD COLUMN sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN sms_provider VARCHAR(50),  -- 'twilio', 'africastalking', 'nexmo', etc.
ADD COLUMN sms_account_sid VARCHAR(255),  -- Twilio Account SID
ADD COLUMN sms_auth_token VARCHAR(255),   -- Twilio Auth Token (encrypted in production)
ADD COLUMN sms_from_number VARCHAR(20),   -- Sender phone number
ADD COLUMN sms_balance DECIMAL(10, 2),    -- Available SMS balance/credits
ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT true;  -- Whether to send notifications

-- Create index for filtering groups with SMS enabled
CREATE INDEX idx_groups_sms_enabled ON groups(sms_enabled);

-- Add SMS log table for tracking sent messages
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID REFERENCES organizer_only_members(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  message_body TEXT NOT NULL,
  message_type VARCHAR(50),  -- 'payment_recorded', 'cycle_reminder', 'payout_ready', 'custom'
  status VARCHAR(20) DEFAULT 'PENDING',  -- 'PENDING', 'SENT', 'FAILED', 'DELIVERED'
  provider_response JSONB,  -- Store provider's response
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_only_member_id) REFERENCES organizer_only_members(id) ON DELETE SET NULL
);

-- Create indexes for SMS logs
CREATE INDEX idx_sms_logs_group_id ON sms_logs(group_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at);

-- Enable Row Level Security on SMS logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Organizers can view SMS logs for their groups
CREATE POLICY "organizers_view_sms_logs"
  ON sms_logs
  FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE organizer_id = auth.uid()
    )
  );
