-- ============================================================================
-- General Settings Table
-- ============================================================================
-- Stores application-wide settings like video links
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create general_settings table
CREATE TABLE IF NOT EXISTS general_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON general_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON general_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON general_settings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON general_settings;

-- Allow public read access (no authentication required)
CREATE POLICY "Allow public read access"
ON general_settings
FOR SELECT
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Allow authenticated insert"
ON general_settings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Allow authenticated update"
ON general_settings
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Allow authenticated delete"
ON general_settings
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for general_settings
DROP TRIGGER IF EXISTS update_general_settings_updated_at ON general_settings;
CREATE TRIGGER update_general_settings_updated_at
  BEFORE UPDATE ON general_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO general_settings (key, value, description)
VALUES (
  'map_drawing_video_url',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Video URL for the Map Drawing page'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

INSERT INTO general_settings (key, value, description)
VALUES (
  'feedback_form_url',
  'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true',
  'Google Form URL for the Feedback page'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;
