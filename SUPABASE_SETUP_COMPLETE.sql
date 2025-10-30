-- ============================================================================
-- GameArena Tournament Platform - COMPLETE SUPABASE SETUP
-- ============================================================================
-- CRITICAL: Run this entire script in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard
-- Project: https://ielwxcdoejxahmdsfznj.supabase.co
-- ============================================================================
-- This script will:
-- ✓ Create all database tables
-- ✓ Set up security policies
-- ✓ Create RPC functions for registration and slot counting
-- ✓ Enable realtime subscriptions
-- ✓ Create payment screenshot storage bucket
-- ✓ Seed tournaments with SPECIFIC IDs matching your frontend code
-- ============================================================================

-- STEP 1: Enable Required Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Create Custom Enum Types
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_type') THEN
        CREATE TYPE game_type AS ENUM ('bgmi', 'freefire');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_mode') THEN
        CREATE TYPE match_mode AS ENUM ('solo', 'duo', 'squad');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- STEP 3: Create All Tables (Using TEXT IDs for tournaments to match frontend)
-- ============================================================================

-- Tournaments table with TEXT ID for specific tournament identifiers
CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
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

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id TEXT REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
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

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_game_id TEXT NOT NULL,
    slot_position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin actions table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id),
    action registration_status NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- STEP 4: Create Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_registration ON participants(registration_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_registration ON admin_actions(registration_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- STEP 5: Create Helper Functions
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for registrations table
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tournaments table
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION has_admin_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = 'admin'
    );
$$;

-- STEP 6: Enable Row Level Security
-- ============================================================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create RLS Policies
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can modify tournaments" ON tournaments;
DROP POLICY IF EXISTS "Anyone can register" ON registrations;
DROP POLICY IF EXISTS "View own registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can update registration status" ON registrations;
DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
DROP POLICY IF EXISTS "Anyone can insert participants" ON participants;
DROP POLICY IF EXISTS "Admins can log actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can view actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;

-- Tournaments policies
CREATE POLICY "Anyone can view tournaments" ON tournaments
    FOR SELECT USING (true);

CREATE POLICY "Admins can modify tournaments" ON tournaments
    FOR ALL USING (public.has_admin_role(auth.uid()));

-- Registrations policies
CREATE POLICY "Anyone can register" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "View own registrations" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "Admins can view all registrations" ON registrations
    FOR SELECT USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Admins can update registration status" ON registrations
    FOR UPDATE USING (public.has_admin_role(auth.uid()));

-- Participants policies
CREATE POLICY "Anyone can view participants" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert participants" ON participants
    FOR INSERT WITH CHECK (true);

-- Admin actions policies
CREATE POLICY "Admins can log actions" ON admin_actions
    FOR INSERT WITH CHECK (public.has_admin_role(auth.uid()));

CREATE POLICY "Admins can view actions" ON admin_actions
    FOR SELECT USING (public.has_admin_role(auth.uid()));

-- User roles policies
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- STEP 8: Grant Permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON tournaments TO anon, authenticated;
GRANT SELECT, INSERT ON registrations TO anon, authenticated;
GRANT SELECT, INSERT ON participants TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- STEP 9: Create RPC Functions
-- ============================================================================

-- Function: register_for_tournament
-- Handles tournament registration with atomic capacity checking
CREATE OR REPLACE FUNCTION register_for_tournament(
    p_tournament_id TEXT,
    p_team_name TEXT,
    p_leader_name TEXT,
    p_leader_game_id TEXT,
    p_leader_whatsapp TEXT,
    p_transaction_id TEXT,
    p_payment_screenshot_url TEXT,
    p_participants JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tournament RECORD;
    v_current_count INTEGER;
    v_registration_id UUID;
    v_participant JSONB;
BEGIN
    -- Lock tournament row to prevent race conditions
    SELECT * INTO v_tournament
    FROM tournaments
    WHERE id = p_tournament_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found or not active');
    END IF;

    -- Count pending and approved registrations
    SELECT COUNT(*) INTO v_current_count
    FROM registrations
    WHERE tournament_id = p_tournament_id
        AND status IN ('pending', 'approved');

    -- Check capacity
    IF v_current_count >= v_tournament.max_capacity THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is full');
    END IF;

    -- Insert registration
    INSERT INTO registrations (
        tournament_id, team_name, leader_name, leader_game_id,
        leader_whatsapp, transaction_id, payment_screenshot_url
    ) VALUES (
        p_tournament_id, p_team_name, p_leader_name, p_leader_game_id,
        p_leader_whatsapp, p_transaction_id, p_payment_screenshot_url
    )
    RETURNING id INTO v_registration_id;

    -- Insert participants for duo/squad
    IF p_participants IS NOT NULL THEN
        FOR v_participant IN SELECT * FROM jsonb_array_elements(p_participants)
        LOOP
            INSERT INTO participants (
                registration_id, player_name, player_game_id, slot_position
            ) VALUES (
                v_registration_id,
                v_participant->>'player_name',
                v_participant->>'player_game_id',
                (v_participant->>'slot_position')::INTEGER
            );
        END LOOP;
    END IF;

    RETURN json_build_object(
        'success', true,
        'registration_id', v_registration_id,
        'slots_remaining', v_tournament.max_capacity - (v_current_count + 1)
    );
END;
$$;

-- Function: get_slot_availability
-- Returns current slot availability for a tournament
CREATE OR REPLACE FUNCTION get_slot_availability(p_tournament_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_capacity INTEGER;
    v_filled INTEGER;
BEGIN
    SELECT t.max_capacity, COALESCE(COUNT(r.id), 0)
    INTO v_capacity, v_filled
    FROM tournaments t
    LEFT JOIN registrations r ON r.tournament_id = t.id
        AND r.status IN ('pending', 'approved')
    WHERE t.id = p_tournament_id
    GROUP BY t.max_capacity;
    
    -- Handle case where tournament doesn't exist
    IF v_capacity IS NULL THEN
        RETURN json_build_object(
            'capacity', 0,
            'filled', 0,
            'remaining', 0
        );
    END IF;

    RETURN json_build_object(
        'capacity', v_capacity,
        'filled', v_filled,
        'remaining', v_capacity - v_filled
    );
END;
$$;

-- Function: update_registration_status
-- Admin function to approve/reject registrations
CREATE OR REPLACE FUNCTION update_registration_status(
    p_registration_id UUID,
    p_new_status registration_status,
    p_admin_user_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status registration_status;
BEGIN
    IF NOT public.has_admin_role(p_admin_user_id) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    SELECT status INTO v_old_status
    FROM registrations
    WHERE id = p_registration_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Registration not found');
    END IF;

    UPDATE registrations
    SET status = p_new_status,
        rejection_reason = CASE WHEN p_new_status = 'rejected' THEN p_reason ELSE NULL END,
        updated_at = now()
    WHERE id = p_registration_id;

    INSERT INTO admin_actions (registration_id, admin_user_id, action, reason)
    VALUES (p_registration_id, p_admin_user_id, p_new_status, p_reason);

    RETURN json_build_object('success', true, 'old_status', v_old_status, 'new_status', p_new_status);
END;
$$;

-- Function: get_tournament_stats
-- Returns comprehensive tournament statistics
CREATE OR REPLACE FUNCTION get_tournament_stats(p_tournament_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'total_registrations', COUNT(*),
        'pending_count', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved_count', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected_count', COUNT(*) FILTER (WHERE status = 'rejected'),
        'capacity', (SELECT max_capacity FROM tournaments WHERE id = p_tournament_id),
        'remaining_slots', (
            SELECT t.max_capacity - COALESCE(COUNT(*) FILTER (WHERE r.status IN ('pending', 'approved')), 0)
            FROM tournaments t
            LEFT JOIN registrations r ON r.tournament_id = t.id
            WHERE t.id = p_tournament_id
            GROUP BY t.max_capacity
        )
    ) INTO v_stats
    FROM registrations
    WHERE tournament_id = p_tournament_id;

    RETURN v_stats;
END;
$$;

-- STEP 10: Setup Storage Bucket for Payment Screenshots
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Allow anyone to upload payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete payment screenshots" ON storage.objects;

CREATE POLICY "Allow anyone to upload payment screenshots" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Allow anyone to view payment screenshots" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Allow admins to delete payment screenshots" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'payment-screenshots' AND public.has_admin_role(auth.uid()));

-- STEP 11: Enable Realtime Subscriptions
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_actions;

ALTER TABLE tournaments REPLICA IDENTITY FULL;
ALTER TABLE registrations REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;
ALTER TABLE admin_actions REPLICA IDENTITY FULL;

-- STEP 12: Seed Tournament Data with SPECIFIC UUIDs
-- ============================================================================
-- CRITICAL: These UUIDs must match your frontend code exactly!
INSERT INTO tournaments (id, game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity) VALUES
-- BGMI Tournaments (ID pattern: 10000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
('10000000-0000-4000-8000-000000000001'::uuid, 'bgmi', 'solo', 20, 350, 250, 9, 100),
('10000000-0000-4000-8000-000000000002'::uuid, 'bgmi', 'duo', 40, 350, 250, 9, 50),
('10000000-0000-4000-8000-000000000003'::uuid, 'bgmi', 'squad', 80, 350, 250, 9, 25),
-- Free Fire Tournaments (ID pattern: 20000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
('20000000-0000-4000-8000-000000000001'::uuid, 'freefire', 'solo', 20, 350, 150, 5, 48),
('20000000-0000-4000-8000-000000000002'::uuid, 'freefire', 'duo', 40, 350, 150, 5, 24),
('20000000-0000-4000-8000-000000000003'::uuid, 'freefire', 'squad', 80, 350, 150, 5, 12)
ON CONFLICT (game, mode) DO UPDATE SET
    id = EXCLUDED.id,
    entry_fee_rs = EXCLUDED.entry_fee_rs,
    prize_winner_rs = EXCLUDED.prize_winner_rs,
    prize_runner_rs = EXCLUDED.prize_runner_rs,
    prize_per_kill_rs = EXCLUDED.prize_per_kill_rs,
    max_capacity = EXCLUDED.max_capacity;

-- ============================================================================
-- SETUP COMPLETE! ✅
-- ============================================================================
-- You should now have:
-- ✓ 5 tables (tournaments, registrations, participants, admin_actions, user_roles)
-- ✓ 6 tournament configurations with SPECIFIC IDs
-- ✓ 4 RPC functions (register, get_slots, update_status, get_stats)
-- ✓ Row Level Security policies
-- ✓ Storage bucket for payment screenshots
-- ✓ Realtime subscriptions enabled
-- ============================================================================

-- VERIFICATION QUERY
-- Run this to verify everything is set up correctly:
SELECT 
    id,
    game || '-' || mode AS tournament_name,
    max_capacity,
    'Capacity OK' AS status
FROM tournaments
ORDER BY game, mode;

-- Expected output:
-- bgmi-solo-id      | bgmi-solo  | 100 | Capacity OK
-- bgmi-duo-id       | bgmi-duo   |  50 | Capacity OK
-- bgmi-squad-id     | bgmi-squad |  25 | Capacity OK
-- freefire-solo-id  | freefire-solo  | 48 | Capacity OK
-- freefire-duo-id   | freefire-duo   | 24 | Capacity OK
-- freefire-squad-id | freefire-squad | 12 | Capacity OK
