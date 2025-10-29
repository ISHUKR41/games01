-- GameArena Tournament Platform - Initial Database Schema
-- File: supabase/migrations/001_initial_schema.sql
-- Purpose: Create all tables, enums, and initial data for the tournament platform

-- Create custom enums for type safety
CREATE TYPE game_type AS ENUM ('bgmi', 'freefire');
CREATE TYPE match_mode AS ENUM ('solo', 'duo', 'squad');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tournaments table - stores tournament configurations
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
    UNIQUE(game, mode)
);

-- Registrations table - stores all tournament registrations
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    status registration_status DEFAULT 'pending',
    team_name TEXT,
    leader_name TEXT NOT NULL,
    leader_game_id TEXT NOT NULL,
    leader_whatsapp TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    payment_screenshot_url TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Participants table - stores team members for duo/squad tournaments
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_game_id TEXT NOT NULL,
    slot_position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin actions table - logs all admin approval/rejection actions
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id),
    action registration_status NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table - manages admin access
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);
CREATE INDEX idx_participants_registration_id ON participants(registration_id);
CREATE INDEX idx_admin_actions_registration_id ON admin_actions(registration_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Insert tournament configurations
INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity) VALUES
-- BGMI Tournaments
('bgmi', 'solo', 20, 350, 250, 9, 100),
('bgmi', 'duo', 40, 350, 250, 9, 50),
('bgmi', 'squad', 80, 350, 250, 9, 25),

-- Free Fire Tournaments
('freefire', 'solo', 20, 350, 150, 5, 48),
('freefire', 'duo', 40, 350, 150, 5, 24),
('freefire', 'squad', 80, 350, 150, 5, 12);
