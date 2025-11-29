/*
  # Update RLS Policies for Authenticated Users

  ## Overview
  This migration updates Row Level Security policies to restrict access to authenticated users only.
  Each user will only be able to access their own data.

  ## Changes
  1. Drop existing public access policies
  2. Add new policies that check auth.uid() = user_id
  3. Update policies to ensure users can only access their own playbooks and related data

  ## Security
  - All tables now require authentication
  - Users can only read/write their own data
  - Foreign key relationships ensure data isolation cascades properly
*/

-- Drop old public policies
DROP POLICY IF EXISTS "Allow public read access to playbooks" ON playbooks;
DROP POLICY IF EXISTS "Allow public insert access to playbooks" ON playbooks;
DROP POLICY IF EXISTS "Allow public update access to playbooks" ON playbooks;
DROP POLICY IF EXISTS "Allow public delete access to playbooks" ON playbooks;
DROP POLICY IF EXISTS "Allow public read access to actions" ON actions;
DROP POLICY IF EXISTS "Allow public insert access to actions" ON actions;
DROP POLICY IF EXISTS "Allow public update access to actions" ON actions;
DROP POLICY IF EXISTS "Allow public delete access to actions" ON actions;
DROP POLICY IF EXISTS "Allow public read access to sub_actions" ON sub_actions;
DROP POLICY IF EXISTS "Allow public insert access to sub_actions" ON sub_actions;
DROP POLICY IF EXISTS "Allow public update access to sub_actions" ON sub_actions;
DROP POLICY IF EXISTS "Allow public delete access to sub_actions" ON sub_actions;

-- Playbook policies
CREATE POLICY "Users can view own playbooks"
  ON playbooks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playbooks"
  ON playbooks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks"
  ON playbooks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks"
  ON playbooks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Actions policies
CREATE POLICY "Users can view own actions"
  ON actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playbooks
      WHERE playbooks.id = actions.playbook_id
      AND playbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create actions in own playbooks"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playbooks
      WHERE playbooks.id = actions.playbook_id
      AND playbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own actions"
  ON actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playbooks
      WHERE playbooks.id = actions.playbook_id
      AND playbooks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playbooks
      WHERE playbooks.id = actions.playbook_id
      AND playbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own actions"
  ON actions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playbooks
      WHERE playbooks.id = actions.playbook_id
      AND playbooks.user_id = auth.uid()
    )
  );

-- Sub-actions policies
CREATE POLICY "Users can view own sub_actions"
  ON sub_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM actions
      JOIN playbooks ON playbooks.id = actions.playbook_id
      WHERE actions.id = sub_actions.action_id
      AND playbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sub_actions in own actions"
  ON sub_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions
      JOIN playbooks ON playbooks.id = actions.playbook_id
      WHERE actions.id = sub_actions.action_id
      AND playbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sub_actions"
  ON sub_actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM actions
      JOIN playbooks ON playbooks.id = actions.playbook_id
      WHERE actions.id = sub_actions.action_id
      AND playbooks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions
      JOIN playbooks ON playbooks.id = actions.playbook_id
      WHERE actions.id = sub_actions.action_id
      AND playbooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sub_actions"
  ON sub_actions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM actions
      JOIN playbooks ON playbooks.id = actions.playbook_id
      WHERE actions.id = sub_actions.action_id
      AND playbooks.user_id = auth.uid()
    )
  );