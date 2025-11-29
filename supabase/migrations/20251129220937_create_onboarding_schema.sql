/*
  # Onboarding System Schema

  ## Overview
  This migration creates the database schema for the onboarding flow that captures user's stuck points,
  identifies block patterns, and generates personalized momentum sequences.

  ## New Tables

  ### 1. `user_profiles`
  Stores user profile data including onboarding results and preferences.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `stuck_input` (text) - User's initial stuck point description
  - `friction_input` (text) - Selected friction point
  - `block_pattern` (text) - Identified block pattern (Clarity, Overwhelm, Fear, etc.)
  - `block_reasoning` (text) - AI reasoning for block classification
  - `momentum_sequence` (jsonb) - 3-step momentum sequence
  - `user_preferences` (jsonb) - User preferences from onboarding
  - `onboarding_completed_at` (timestamptz) - When onboarding was completed
  - `created_at` (timestamptz) - When profile was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on user_profiles table
  - Users can only access their own profile data
  - Authenticated users can create and update their own profile

  ## Important Notes
  1. One profile per user (enforced by unique constraint on user_id)
  2. JSONB columns for flexible structured data
  3. All onboarding data preserved for future reference
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stuck_input text DEFAULT '',
  friction_input text DEFAULT '',
  block_pattern text DEFAULT '',
  block_reasoning text DEFAULT '',
  momentum_sequence jsonb DEFAULT '{}'::jsonb,
  user_preferences jsonb DEFAULT '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();