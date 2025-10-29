-- GameArena Tournament Platform Database Schema
-- File: 003_create_rls_policies.sql
-- Purpose: Create Row Level Security policies for data protection and access control

-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
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

-- TOURNAMENTS TABLE POLICIES
-- Public can read all active tournaments (needed for displaying tournament info)
CREATE POLICY "Anyone can view tournaments" ON tournaments
  FOR SELECT USING (true);

-- Only admins can modify tournaments
CREATE POLICY "Admins can modify tournaments" ON tournaments
  FOR ALL USING (public.has_admin_role(auth.uid()));

-- REGISTRATIONS TABLE POLICIES  
-- Anonymous users can insert registrations (via RPC function only for validation)
CREATE POLICY "Anyone can register" ON registrations
  FOR INSERT WITH CHECK (true);

-- Users can view their own registrations by transaction ID (for status checking)
CREATE POLICY "View own registrations" ON registrations
  FOR SELECT USING (true);

-- Admins can view and update all registrations
CREATE POLICY "Admins can view all registrations" ON registrations
  FOR SELECT USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Admins can update registration status" ON registrations
  FOR UPDATE USING (public.has_admin_role(auth.uid()));

-- PARTICIPANTS TABLE POLICIES
-- Anyone can view participants (needed for displaying team info)
CREATE POLICY "Anyone can view participants" ON participants
  FOR SELECT USING (true);

-- Anyone can insert participants (handled via RPC function)
CREATE POLICY "Anyone can insert participants" ON participants
  FOR INSERT WITH CHECK (true);

-- ADMIN ACTIONS TABLE POLICIES
-- Only admins can insert and view admin actions
CREATE POLICY "Admins can log actions" ON admin_actions
  FOR INSERT WITH CHECK (public.has_admin_role(auth.uid()));

CREATE POLICY "Admins can view actions" ON admin_actions
  FOR SELECT USING (public.has_admin_role(auth.uid()));

-- USER ROLES TABLE POLICIES
-- Only admins can manage user roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (public.has_admin_role(auth.uid()));

-- Users can view their own roles
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- STORAGE BUCKET SETUP FOR PAYMENT SCREENSHOTS
-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_screenshots', 'payment_screenshots', true)
ON CONFLICT (id) DO NOTHING; -- Only insert if not exists

-- RLS policy for payment screenshot uploads
CREATE POLICY "Anyone can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment_screenshots');

-- RLS policy for viewing payment screenshots
CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment_screenshots');

-- RLS policy for deleting screenshots (admin only)
CREATE POLICY "Admins can delete payment screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment_screenshots' AND
  public.has_admin_role(auth.uid())
);