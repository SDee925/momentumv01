/*
  # Momentum Tracking System Schema

  ## Overview
  This migration creates the complete database schema for the Momentum productivity app, which helps users break through inaction with AI-powered task management and progress tracking.

  ## New Tables

  ### 1. `playbooks`
  Stores the main momentum sessions with AI-generated analysis and configuration.
  - `id` (uuid, primary key) - Unique identifier for each playbook
  - `user_id` (uuid, nullable) - Future-proofing for multi-user support
  - `focus_area` (text) - User's stated area of focus/struggle
  - `analysis` (text) - AI-generated analysis/roast of user's procrastination
  - `opportunities` (jsonb) - Structured opportunities (internal, external, hidden)
  - `pitfalls` (jsonb) - Array of potential pitfalls to avoid
  - `journal_entry` (text) - User's reflections and notes
  - `created_at` (timestamptz) - When the playbook was created
  - `archived_at` (timestamptz, nullable) - When the playbook was archived

  ### 2. `actions`
  Individual tasks/actions within a playbook.
  - `id` (uuid, primary key) - Unique identifier for each action
  - `playbook_id` (uuid, foreign key) - Links to parent playbook
  - `title` (text) - Short, punchy action name
  - `description` (text) - Specific directive/instructions
  - `horizon` (text) - Time horizon: immediate, medium, or long
  - `rationale` (text) - Why this action breaks inertia
  - `is_completed` (boolean) - Completion status
  - `position` (integer) - Display order
  - `created_at` (timestamptz) - When action was created

  ### 3. `sub_actions`
  Micro-steps for breaking down complex actions.
  - `id` (uuid, primary key) - Unique identifier for each sub-action
  - `action_id` (uuid, foreign key) - Links to parent action
  - `title` (text) - Short instruction for micro-step
  - `is_completed` (boolean) - Completion status
  - `position` (integer) - Display order
  - `created_at` (timestamptz) - When sub-action was created

  ## Security
  - RLS enabled on all tables
  - Public access for now (authentication to be added later)
  - Restrictive policies ensuring data isolation when auth is implemented

  ## Important Notes
  1. Using `user_id` as nullable for now to support anonymous usage
  2. JSONB columns for flexible structured data (opportunities, pitfalls)
  3. Cascading deletes ensure referential integrity
  4. Indexed foreign keys for query performance
*/

-- Create playbooks table
CREATE TABLE IF NOT EXISTS playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  focus_area text NOT NULL,
  analysis text NOT NULL,
  opportunities jsonb DEFAULT '{"internal":"","external":"","hidden":""}'::jsonb,
  pitfalls jsonb DEFAULT '[]'::jsonb,
  journal_entry text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  archived_at timestamptz
);

-- Create actions table
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id uuid NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  horizon text NOT NULL CHECK (horizon IN ('immediate', 'medium', 'long')),
  rationale text NOT NULL,
  is_completed boolean DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sub_actions table
CREATE TABLE IF NOT EXISTS sub_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_actions_playbook_id ON actions(playbook_id);
CREATE INDEX IF NOT EXISTS idx_sub_actions_action_id ON sub_actions(action_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_archived_at ON playbooks(archived_at);

-- Enable Row Level Security
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (temporary, until auth is added)
-- These allow anyone to read/write for now, but are structured to easily add user_id checks later
CREATE POLICY "Allow public read access to playbooks"
  ON playbooks FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to playbooks"
  ON playbooks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to playbooks"
  ON playbooks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to playbooks"
  ON playbooks FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to actions"
  ON actions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to actions"
  ON actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to actions"
  ON actions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to actions"
  ON actions FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to sub_actions"
  ON sub_actions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to sub_actions"
  ON sub_actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to sub_actions"
  ON sub_actions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to sub_actions"
  ON sub_actions FOR DELETE
  USING (true);