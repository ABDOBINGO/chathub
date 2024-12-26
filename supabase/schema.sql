-- Enable the pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing tables and policies
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow users to update own messages" ON messages;
DROP POLICY IF EXISTS "Allow users to delete own messages" ON messages;
DROP POLICY IF EXISTS "Allow users to view messages" ON messages;

-- Drop dependent tables first
DROP TABLE IF EXISTS message_reactions;
DROP TABLE IF EXISTS message_reaction_counts;
DROP TABLE IF EXISTS message_reports;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS profiles;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add customization columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS bubble_style text DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#0066FF',
ADD COLUMN IF NOT EXISTS message_alignment text DEFAULT 'right',
ADD COLUMN IF NOT EXISTS enable_sounds boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_timestamps boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_read_receipts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_notifications boolean DEFAULT true;

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Add voice_url column to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS voice_url text;

-- Create indexes for search
CREATE INDEX IF NOT EXISTS profiles_email_search_idx ON profiles USING btree (email);
CREATE INDEX IF NOT EXISTS profiles_full_name_search_idx ON profiles USING btree (full_name);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow users to view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for messages
CREATE POLICY "Allow users to view messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for voice messages if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'voice-messages', 'voice-messages', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'voice-messages'
);

-- Allow authenticated users to upload voice messages
CREATE POLICY "Allow authenticated users to upload voice messages"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'voice-messages' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read voice messages
CREATE POLICY "Allow users to read voice messages"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'voice-messages');

-- Allow users to delete their own voice messages
CREATE POLICY "Allow users to delete their own voice messages"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'voice-messages' AND 
    (storage.foldername(name))[1] = auth.uid()::text
); 