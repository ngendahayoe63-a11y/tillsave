-- Create organizer_only_members table for cash-based groups without user accounts

CREATE TABLE organizer_only_members (
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

-- Create index for faster lookups
CREATE INDEX idx_organizer_only_members_group_id ON organizer_only_members(group_id);
CREATE INDEX idx_organizer_only_members_phone ON organizer_only_members(phone_number);

-- Enable Row Level Security
ALTER TABLE organizer_only_members ENABLE ROW LEVEL SECURITY;

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
