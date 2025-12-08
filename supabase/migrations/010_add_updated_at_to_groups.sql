-- Add updated_at column to groups table if it doesn't exist
ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
