-- GameArena Tournament Platform Database Schema
-- File: 002_create_tables.sql
-- Purpose: Create all main tables with proper relationships and constraints

-- Tournaments table - stores the 6 pre-configured tournament types
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game game_type NOT NULL,
  mode match_mode NOT NULL,
  entry_fee_rs INTEGER NOT NULL,
  prize_winner_rs INTEGER NOT NULL,
  prize_runner_rs INTEGER NOT NULL,
  prize_per_kill_rs INTEGER NOT NULL,
  max_capacity INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure each game-mode combination is unique
  UNIQUE(game, mode)
);

-- Registrations table - stores all tournament registrations
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) NOT NULL,
  status registration_status DEFAULT 'pending',
  
  -- Team/Player information
  team_name TEXT, -- NULL for solo matches
  leader_name TEXT NOT NULL,
  leader_game_id TEXT NOT NULL,
  leader_whatsapp TEXT NOT NULL,
  
  -- Payment information
  transaction_id TEXT NOT NULL,
  payment_screenshot_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Participants table - stores additional team members for duo/squad matches
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_game_id TEXT NOT NULL,
  slot_position INTEGER NOT NULL, -- 1 for player 2, 2 for player 3, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin actions table - audit log for all admin approval/rejection actions
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id),
  admin_user_id UUID REFERENCES auth.users(id),
  action registration_status NOT NULL,
  reason TEXT, -- Required for rejections
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table - tracks admin users
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure each user has unique role assignments
  UNIQUE(user_id, role)
);

-- Create performance indexes
CREATE INDEX idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);
CREATE INDEX idx_participants_registration ON participants(registration_id);
CREATE INDEX idx_admin_actions_registration ON admin_actions(registration_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Add updated_at trigger for registrations table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();