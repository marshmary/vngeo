-- General Settings Table
-- Stores application-wide settings like video links

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

-- Insert default map drawing video link
INSERT INTO general_settings (key, value, description)
VALUES (
  'map_drawing_video_url',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Video URL for the Map Drawing page'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default feedback form URL
INSERT INTO general_settings (key, value, description)
VALUES (
  'feedback_form_url',
  'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true',
  'Google Form URL for the Feedback page'
)
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_general_settings_updated_at
BEFORE UPDATE ON general_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
