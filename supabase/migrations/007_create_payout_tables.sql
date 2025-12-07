-- Add payout tracking columns to organizer_only_members
ALTER TABLE organizer_only_members
ADD COLUMN IF NOT EXISTS total_payouts NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payout_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_status VARCHAR(20) DEFAULT 'NOT_ELIGIBLE'; -- NOT_ELIGIBLE, ELIGIBLE, PAID

-- Create payouts table to track payout history
CREATE TABLE IF NOT EXISTS organizer_only_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID NOT NULL REFERENCES organizer_only_members(id) ON DELETE CASCADE,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_count INTEGER NOT NULL DEFAULT 0,
  average_payment NUMERIC(15,2),
  payout_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, READY, PAID, CANCELLED
  payment_method VARCHAR(20), -- CASH, BANK_TRANSFER, MOBILE_MONEY
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payouts_group ON organizer_only_payouts(group_id);
CREATE INDEX IF NOT EXISTS idx_payouts_member ON organizer_only_payouts(organizer_only_member_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON organizer_only_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_cycle ON organizer_only_payouts(cycle_start_date, cycle_end_date);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON organizer_only_payouts(created_at DESC);

-- Create payout disbursements table to track each payout transaction
CREATE TABLE IF NOT EXISTS payout_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES organizer_only_payouts(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID NOT NULL REFERENCES organizer_only_members(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  disburse_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, CANCELLED
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disbursements_payout ON payout_disbursements(payout_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_member ON payout_disbursements(organizer_only_member_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON payout_disbursements(status);
CREATE INDEX IF NOT EXISTS idx_disbursements_date ON payout_disbursements(disburse_date DESC);

-- Create member statistics table for analytics
CREATE TABLE IF NOT EXISTS member_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  organizer_only_member_id UUID NOT NULL REFERENCES organizer_only_members(id) ON DELETE CASCADE,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  total_saved NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_payouts NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_count INTEGER NOT NULL DEFAULT 0,
  missed_cycles INTEGER NOT NULL DEFAULT 0,
  consistency_score NUMERIC(3,2) DEFAULT 0, -- 0.0 to 1.0
  last_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, organizer_only_member_id, period_start_date)
);

CREATE INDEX IF NOT EXISTS idx_member_stats_group ON member_statistics(group_id);
CREATE INDEX IF NOT EXISTS idx_member_stats_member ON member_statistics(organizer_only_member_id);
CREATE INDEX IF NOT EXISTS idx_member_stats_period ON member_statistics(period_start_date, period_end_date);

-- Apply RLS policies for payouts
DROP POLICY IF EXISTS payouts_select_organizer ON organizer_only_payouts;
DROP POLICY IF EXISTS payouts_insert_organizer ON organizer_only_payouts;
DROP POLICY IF EXISTS payouts_update_organizer ON organizer_only_payouts;

CREATE POLICY payouts_select_organizer
ON organizer_only_payouts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = organizer_only_payouts.group_id
    AND g.organizer_id = auth.uid()
  )
);

CREATE POLICY payouts_insert_organizer
ON organizer_only_payouts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = organizer_only_payouts.group_id
    AND g.organizer_id = auth.uid()
  )
);

CREATE POLICY payouts_update_organizer
ON organizer_only_payouts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = organizer_only_payouts.group_id
    AND g.organizer_id = auth.uid()
  )
);

-- Apply RLS policies for disbursements
DROP POLICY IF EXISTS disbursements_select_organizer ON payout_disbursements;
DROP POLICY IF EXISTS disbursements_insert_organizer ON payout_disbursements;
DROP POLICY IF EXISTS disbursements_update_organizer ON payout_disbursements;

CREATE POLICY disbursements_select_organizer
ON payout_disbursements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = payout_disbursements.group_id
    AND g.organizer_id = auth.uid()
  )
);

CREATE POLICY disbursements_insert_organizer
ON payout_disbursements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = payout_disbursements.group_id
    AND g.organizer_id = auth.uid()
  )
);

CREATE POLICY disbursements_update_organizer
ON payout_disbursements FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = payout_disbursements.group_id
    AND g.organizer_id = auth.uid()
  )
);

-- Apply RLS policies for member statistics
DROP POLICY IF EXISTS member_stats_select_organizer ON member_statistics;
DROP POLICY IF EXISTS member_stats_insert_organizer ON member_statistics;

CREATE POLICY member_stats_select_organizer
ON member_statistics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = member_statistics.group_id
    AND g.organizer_id = auth.uid()
  )
);

CREATE POLICY member_stats_insert_organizer
ON member_statistics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = member_statistics.group_id
    AND g.organizer_id = auth.uid()
  )
);

-- Enable RLS
ALTER TABLE organizer_only_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_statistics ENABLE ROW LEVEL SECURITY;
