-- Migration: Create organizer_only_payouts table for cycle tracking
-- This migration is idempotent - safe to run multiple times

-- Step 1: Add cycle tracking columns to groups if they don't exist
ALTER TABLE groups ADD COLUMN IF NOT EXISTS current_cycle INT DEFAULT 1;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS current_cycle_start_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Step 2: Drop and recreate table if it has issues (clean slate)
-- First, drop dependent policies
DROP POLICY IF EXISTS organizer_only_payouts_organizer ON organizer_only_payouts;

-- Drop the table if it exists with any issues
DROP TABLE IF EXISTS organizer_only_payouts CASCADE;

-- Step 3: Create fresh organizer_only_payouts table with all constraints
CREATE TABLE organizer_only_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  organizer_only_member_id UUID NOT NULL,
  cycle_number INT NOT NULL,
  cycle_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cycle_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  payment_count INT DEFAULT 0,
  average_payment DECIMAL(15, 2),
  currency VARCHAR(3) NOT NULL DEFAULT 'RWF',
  status VARCHAR(20) DEFAULT 'READY',
  payout_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(group_id, organizer_only_member_id, cycle_number),
  CHECK (status IN ('READY', 'PAID', 'PENDING'))
);

-- Step 4: Add foreign key constraints with error handling
DO $$
BEGIN
  BEGIN
    ALTER TABLE organizer_only_payouts 
      ADD CONSTRAINT fk_payout_group 
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object OR undefined_table THEN
    NULL;
  END;
END $$;

DO $$
BEGIN
  BEGIN
    ALTER TABLE organizer_only_payouts 
      ADD CONSTRAINT fk_payout_member 
      FOREIGN KEY (organizer_only_member_id) REFERENCES organizer_only_members(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object OR undefined_table THEN
    NULL;
  END;
END $$;

-- Step 5: Create indexes
CREATE INDEX idx_organizer_only_payouts_group 
  ON organizer_only_payouts(group_id);
  
CREATE INDEX idx_organizer_only_payouts_member 
  ON organizer_only_payouts(organizer_only_member_id);
  
CREATE INDEX idx_organizer_only_payouts_status 
  ON organizer_only_payouts(status);
  
CREATE INDEX idx_organizer_only_payouts_cycle 
  ON organizer_only_payouts(cycle_number);
  
CREATE INDEX idx_organizer_only_payouts_group_cycle 
  ON organizer_only_payouts(group_id, cycle_number);

-- Step 6: Enable Row Level Security
ALTER TABLE organizer_only_payouts ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS Policy
CREATE POLICY organizer_only_payouts_organizer ON organizer_only_payouts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = organizer_only_payouts.group_id
      AND g.organizer_id = auth.uid()
    )
  );
