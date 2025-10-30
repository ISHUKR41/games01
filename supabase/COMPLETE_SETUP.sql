-- ============================================================================
-- GAMEARENA TOURNAMENT PLATFORM - COMPLETE DATABASE SETUP
-- ============================================================================
-- This script sets up the complete database schema for the GameArena tournament
-- platform including tables, security policies, functions, storage, and seed data.
--
-- IMPORTANT: This script should be run in your Supabase SQL Editor
-- Make sure to run this as a single script (copy-paste the entire file)
--
-- What this script does:
-- 1. Creates custom enum types for type safety
-- 2. Creates all necessary tables with proper relationships
-- 3. Sets up Row Level Security (RLS) policies for data protection
-- 4. Creates database functions for atomic operations
-- 5. Configures storage bucket for payment screenshots
-- 6. Enables realtime subscriptions for live updates
-- 7. Seeds initial tournament data
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS AND ENUMS
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for game types (BGMI and Free Fire)
DO $$ BEGIN
    CREATE TYPE game_type AS ENUM ('bgmi', 'freefire');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for match modes (Solo, Duo, Squad)
DO $$ BEGIN
    CREATE TYPE match_mode AS ENUM ('solo', 'duo', 'squad');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for registration status tracking
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for admin user roles
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ============================================================================
-- SECTION 2: CREATE TABLES
-- ============================================================================

-- Tournaments table - stores the 6 pre-configured tournament types
-- Each game (BGMI, Free Fire) has 3 modes (Solo, Duo, Squad)
CREATE TABLE IF NOT EXISTS tournaments (
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
-- Handles both individual (solo) and team (duo/squad) registrations
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
    status registration_status DEFAULT 'pending',
    
    -- Team/Player information
    team_name TEXT, -- NULL for solo matches, required for duo/squad
    leader_name TEXT NOT NULL,
    leader_game_id TEXT NOT NULL,
    leader_whatsapp TEXT NOT NULL,
    
    -- Payment information
    transaction_id TEXT NOT NULL,
    payment_screenshot_url TEXT,
    
    -- Rejection tracking
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Participants table - stores team members for duo/squad matches
-- For solo matches, only the leader is stored
-- For duo/squad, additional team members are stored here
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
    player_name TEXT NOT NULL,
    player_game_id TEXT NOT NULL,
    slot_position INTEGER NOT NULL, -- 1 for leader, 2+ for teammates
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin actions table - audit log for all admin approval/rejection actions
-- Provides complete audit trail of all admin decisions
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id),
    action registration_status NOT NULL,
    reason TEXT, -- Required for rejections, optional for approvals
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table - tracks admin users
-- Links Supabase auth users to application roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure each user has unique role assignments
    UNIQUE(user_id, role)
);


-- ============================================================================
-- SECTION 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for faster query performance
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_registration ON participants(registration_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_registration ON admin_actions(registration_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);


-- ============================================================================
-- SECTION 4: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for registrations table
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tournaments table
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Security helper function to check if user has admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id UUID)
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


-- ============================================================================
-- SECTION 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables for data protection
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION 6: CREATE RLS POLICIES
-- ============================================================================

-- TOURNAMENTS TABLE POLICIES
-- Anyone can view all tournaments (needed for public tournament listing)
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
CREATE POLICY "Anyone can view tournaments" ON tournaments
    FOR SELECT USING (true);

-- Only admins can modify tournaments
DROP POLICY IF EXISTS "Admins can modify tournaments" ON tournaments;
CREATE POLICY "Admins can modify tournaments" ON tournaments
    FOR ALL USING (public.has_admin_role(auth.uid()));


-- REGISTRATIONS TABLE POLICIES
-- Anyone can insert registrations (via RPC function for validation)
DROP POLICY IF EXISTS "Anyone can register" ON registrations;
CREATE POLICY "Anyone can register" ON registrations
    FOR INSERT WITH CHECK (true);

-- Anyone can view registrations (needed for status checking)
DROP POLICY IF EXISTS "Anyone can view registrations" ON registrations;
CREATE POLICY "Anyone can view registrations" ON registrations
    FOR SELECT USING (true);

-- Admins can update registration status
DROP POLICY IF EXISTS "Admins can update registrations" ON registrations;
CREATE POLICY "Admins can update registrations" ON registrations
    FOR UPDATE USING (public.has_admin_role(auth.uid()));

-- Admins can delete registrations if needed
DROP POLICY IF EXISTS "Admins can delete registrations" ON registrations;
CREATE POLICY "Admins can delete registrations" ON registrations
    FOR DELETE USING (public.has_admin_role(auth.uid()));


-- PARTICIPANTS TABLE POLICIES
-- Anyone can view participants (needed for displaying team info)
DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
CREATE POLICY "Anyone can view participants" ON participants
    FOR SELECT USING (true);

-- Anyone can insert participants (handled via RPC function)
DROP POLICY IF EXISTS "Anyone can insert participants" ON participants;
CREATE POLICY "Anyone can insert participants" ON participants
    FOR INSERT WITH CHECK (true);

-- Admins can delete participants
DROP POLICY IF EXISTS "Admins can delete participants" ON participants;
CREATE POLICY "Admins can delete participants" ON participants
    FOR DELETE USING (public.has_admin_role(auth.uid()));


-- ADMIN ACTIONS TABLE POLICIES
-- Only admins can insert admin actions
DROP POLICY IF EXISTS "Admins can log actions" ON admin_actions;
CREATE POLICY "Admins can log actions" ON admin_actions
    FOR INSERT WITH CHECK (public.has_admin_role(auth.uid()));

-- Only admins can view admin actions
DROP POLICY IF EXISTS "Admins can view actions" ON admin_actions;
CREATE POLICY "Admins can view actions" ON admin_actions
    FOR SELECT USING (public.has_admin_role(auth.uid()));


-- USER ROLES TABLE POLICIES
-- Only admins can manage user roles
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (public.has_admin_role(auth.uid()));

-- Users can view their own roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);


-- ============================================================================
-- SECTION 7: STORAGE BUCKET SETUP FOR PAYMENT SCREENSHOTS
-- ============================================================================

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment screenshots bucket

-- Allow anyone to upload payment screenshots
DROP POLICY IF EXISTS "Allow anyone to upload payment screenshots" ON storage.objects;
CREATE POLICY "Allow anyone to upload payment screenshots" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow anyone to view payment screenshots (public bucket)
DROP POLICY IF EXISTS "Allow anyone to view payment screenshots" ON storage.objects;
CREATE POLICY "Allow anyone to view payment screenshots" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payment-screenshots');

-- Allow admins to delete payment screenshots
DROP POLICY IF EXISTS "Allow admins to delete payment screenshots" ON storage.objects;
CREATE POLICY "Allow admins to delete payment screenshots" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'payment-screenshots' 
        AND public.has_admin_role(auth.uid())
    );


-- ============================================================================
-- SECTION 8: CREATE RPC FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function: register_for_tournament
-- Purpose: Atomically register for tournament with capacity checking
-- This prevents race conditions and ensures data integrity
CREATE OR REPLACE FUNCTION register_for_tournament(
    p_tournament_id UUID,
    p_team_name TEXT DEFAULT NULL,
    p_leader_name TEXT,
    p_leader_game_id TEXT,
    p_leader_whatsapp TEXT,
    p_transaction_id TEXT,
    p_payment_screenshot_url TEXT,
    p_participants JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON AS $$
DECLARE
    tournament_record tournaments%ROWTYPE;
    current_registrations INTEGER;
    registration_id UUID;
    participant JSONB;
    slot_position INTEGER := 1;
BEGIN
    -- Lock the tournament row to prevent race conditions
    SELECT * INTO tournament_record
    FROM tournaments
    WHERE id = p_tournament_id AND is_active = true
    FOR UPDATE;
    
    -- Check if tournament exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tournament not found or inactive'
        );
    END IF;
    
    -- Count current approved and pending registrations (both reserve slots)
    SELECT COUNT(*) INTO current_registrations
    FROM registrations
    WHERE tournament_id = p_tournament_id 
    AND status IN ('pending', 'approved');
    
    -- Check capacity
    IF current_registrations >= tournament_record.max_capacity THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tournament is full'
        );
    END IF;
    
    -- Insert registration
    INSERT INTO registrations (
        tournament_id,
        status,
        team_name,
        leader_name,
        leader_game_id,
        leader_whatsapp,
        transaction_id,
        payment_screenshot_url
    ) VALUES (
        p_tournament_id,
        'pending',
        p_team_name,
        p_leader_name,
        p_leader_game_id,
        p_leader_whatsapp,
        p_transaction_id,
        p_payment_screenshot_url
    ) RETURNING id INTO registration_id;
    
    -- Insert leader as first participant (for all modes)
    INSERT INTO participants (
        registration_id,
        player_name,
        player_game_id,
        slot_position
    ) VALUES (
        registration_id,
        p_leader_name,
        p_leader_game_id,
        slot_position
    );
    
    -- Insert additional participants for duo/squad
    IF jsonb_array_length(p_participants) > 0 THEN
        FOR participant IN SELECT * FROM jsonb_array_elements(p_participants)
        LOOP
            slot_position := slot_position + 1;
            INSERT INTO participants (
                registration_id,
                player_name,
                player_game_id,
                slot_position
            ) VALUES (
                registration_id,
                participant->>'player_name',
                participant->>'player_game_id',
                slot_position
            );
        END LOOP;
    END IF;
    
    -- Return success with registration details
    RETURN json_build_object(
        'success', true,
        'registration_id', registration_id,
        'slots_remaining', tournament_record.max_capacity - current_registrations - 1
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: get_slot_availability
-- Purpose: Get real-time slot availability for a tournament
CREATE OR REPLACE FUNCTION get_slot_availability(p_tournament_id UUID)
RETURNS JSON AS $$
DECLARE
    tournament_record tournaments%ROWTYPE;
    approved_count INTEGER;
    pending_count INTEGER;
    rejected_count INTEGER;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record
    FROM tournaments
    WHERE id = p_tournament_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tournament not found'
        );
    END IF;
    
    -- Count registrations by status
    SELECT 
        COUNT(*) FILTER (WHERE status = 'approved'),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'rejected')
    INTO approved_count, pending_count, rejected_count
    FROM registrations
    WHERE tournament_id = p_tournament_id;
    
    RETURN json_build_object(
        'success', true,
        'tournament_id', p_tournament_id,
        'max_capacity', tournament_record.max_capacity,
        'approved_registrations', approved_count,
        'pending_registrations', pending_count,
        'rejected_registrations', rejected_count,
        'available_slots', tournament_record.max_capacity - approved_count,
        'is_full', approved_count >= tournament_record.max_capacity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: update_registration_status
-- Purpose: Update registration status with admin action logging (admin only)
CREATE OR REPLACE FUNCTION update_registration_status(
    p_registration_id UUID,
    p_status registration_status,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if user is admin
    admin_user_id := auth.uid();
    
    IF NOT public.has_admin_role(admin_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized - Admin access required'
        );
    END IF;
    
    -- Update registration status
    UPDATE registrations
    SET 
        status = p_status,
        rejection_reason = CASE WHEN p_status = 'rejected' THEN p_reason ELSE NULL END,
        updated_at = now()
    WHERE id = p_registration_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Registration not found'
        );
    END IF;
    
    -- Log admin action
    INSERT INTO admin_actions (
        registration_id,
        admin_user_id,
        action,
        reason
    ) VALUES (
        p_registration_id,
        admin_user_id,
        p_status,
        p_reason
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Registration status updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: get_tournament_stats
-- Purpose: Get comprehensive statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_tournament_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    -- Calculate statistics for all tournaments
    WITH tournament_stats AS (
        SELECT 
            t.id,
            t.game,
            t.mode,
            t.max_capacity,
            COUNT(r.id) FILTER (WHERE r.status = 'pending') as pending_count,
            COUNT(r.id) FILTER (WHERE r.status = 'approved') as approved_count,
            COUNT(r.id) FILTER (WHERE r.status = 'rejected') as rejected_count,
            t.max_capacity - COUNT(r.id) FILTER (WHERE r.status = 'approved') as available_slots
        FROM tournaments t
        LEFT JOIN registrations r ON t.id = r.tournament_id
        WHERE t.is_active = true
        GROUP BY t.id, t.game, t.mode, t.max_capacity
    )
    SELECT json_agg(
        json_build_object(
            'tournament_id', id,
            'game', game,
            'mode', mode,
            'max_capacity', max_capacity,
            'pending_registrations', pending_count,
            'approved_registrations', approved_count,
            'rejected_registrations', rejected_count,
            'available_slots', available_slots,
            'is_full', approved_count >= max_capacity
        )
    ) INTO stats
    FROM tournament_stats;
    
    RETURN json_build_object(
        'success', true,
        'tournaments', stats
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- SECTION 9: ENABLE REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for critical tables to support live updates
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;

-- Set replica identity to FULL for better change tracking
-- This allows clients to receive old values when rows are updated/deleted
ALTER TABLE registrations REPLICA IDENTITY FULL;
ALTER TABLE admin_actions REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;
ALTER TABLE tournaments REPLICA IDENTITY FULL;


-- ============================================================================
-- SECTION 10: SEED TOURNAMENT DATA
-- ============================================================================

-- Insert the 6 pre-configured tournament types with specific UUIDs
-- These UUIDs match the frontend expectations for real-time slot tracking
INSERT INTO tournaments (id, game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity) VALUES
-- BGMI Tournaments (ID pattern: 10000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
('10000000-0000-4000-8000-000000000001'::uuid, 'bgmi', 'solo', 20, 350, 250, 9, 100),   -- 100 solo players
('10000000-0000-4000-8000-000000000002'::uuid, 'bgmi', 'duo', 40, 350, 250, 9, 50),     -- 50 duo teams (2 players each)
('10000000-0000-4000-8000-000000000003'::uuid, 'bgmi', 'squad', 80, 350, 250, 9, 25),   -- 25 squad teams (4 players each)

-- Free Fire Tournaments (ID pattern: 20000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
('20000000-0000-4000-8000-000000000001'::uuid, 'freefire', 'solo', 20, 350, 150, 5, 48),   -- 48 solo players
('20000000-0000-4000-8000-000000000002'::uuid, 'freefire', 'duo', 40, 350, 150, 5, 24),    -- 24 duo teams (2 players each)
('20000000-0000-4000-8000-000000000003'::uuid, 'freefire', 'squad', 80, 350, 150, 5, 12)   -- 12 squad teams (4 players each)

-- Use ON CONFLICT to prevent duplicate inserts if running script multiple times
ON CONFLICT (game, mode) DO UPDATE SET
  id = EXCLUDED.id,
  entry_fee_rs = EXCLUDED.entry_fee_rs,
  prize_winner_rs = EXCLUDED.prize_winner_rs,
  prize_runner_rs = EXCLUDED.prize_runner_rs,
  prize_per_kill_rs = EXCLUDED.prize_per_kill_rs,
  max_capacity = EXCLUDED.max_capacity;


-- ============================================================================
-- SECTION 11: GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON tournaments TO authenticated, anon;
GRANT SELECT, INSERT ON registrations TO authenticated, anon;
GRANT SELECT, INSERT ON participants TO authenticated, anon;

-- Grant all permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;


-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- 
-- Next Steps:
-- 1. Create your admin user in the Supabase Auth dashboard
-- 2. Copy the user UUID and run the following query:
--    INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
-- 3. Update your frontend .env file with the Supabase credentials
-- 4. Test the application
--
-- ============================================================================
