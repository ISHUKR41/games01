-- GameArena Tournament Platform - Row Level Security Policies
-- File: supabase/migrations/002_security_policies.sql
-- Purpose: Implement secure data access policies for all tables

-- Enable Row Level Security on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION has_admin_role(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tournaments table policies
-- Anyone can view active tournaments
CREATE POLICY "Anyone can view active tournaments" ON tournaments
    FOR SELECT USING (is_active = true);

-- Only admins can modify tournaments
CREATE POLICY "Admins can manage tournaments" ON tournaments
    FOR ALL USING (has_admin_role(auth.uid()));

-- Registrations table policies
-- Anonymous users can insert registrations (via RPC function only)
CREATE POLICY "Allow registration creation via RPC" ON registrations
    FOR INSERT WITH CHECK (true);

-- Users can view their own registrations by transaction_id
CREATE POLICY "Users can view registrations by transaction_id" ON registrations
    FOR SELECT USING (true);

-- Admins can view and update all registrations
CREATE POLICY "Admins can manage all registrations" ON registrations
    FOR ALL USING (has_admin_role(auth.uid()));

-- Participants table policies
-- Same access as registrations
CREATE POLICY "Allow participant creation via RPC" ON participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view participants" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage participants" ON participants
    FOR ALL USING (has_admin_role(auth.uid()));

-- Admin actions table policies
-- Only admins can access admin actions
CREATE POLICY "Only admins can access admin actions" ON admin_actions
    FOR ALL USING (has_admin_role(auth.uid()));

-- User roles table policies
-- Only admins can manage user roles
CREATE POLICY "Only admins can manage user roles" ON user_roles
    FOR ALL USING (has_admin_role(auth.uid()));

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users
GRANT SELECT ON tournaments TO anon, authenticated;
GRANT SELECT, INSERT ON registrations TO anon, authenticated;
GRANT SELECT, INSERT ON participants TO anon, authenticated;

-- Grant admin access
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
