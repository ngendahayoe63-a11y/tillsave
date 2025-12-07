-- Add group_type column to groups table
-- Default to 'FULL_PLATFORM' for backward compatibility

ALTER TABLE groups 
ADD COLUMN group_type VARCHAR(50) DEFAULT 'FULL_PLATFORM';

-- Add constraint to ensure valid group types
ALTER TABLE groups 
ADD CONSTRAINT valid_group_type 
CHECK (group_type IN ('FULL_PLATFORM', 'ORGANIZER_ONLY'));

-- Create index for filtering by group type
CREATE INDEX idx_groups_group_type ON groups(group_type);
