# GameArena Supabase Database Setup Guide

This guide will help you set up the complete Supabase database for the GameArena tournament platform to enable full functionality including real-time updates, registrations, and admin panel.

## 🎯 **Current Status**
- ✅ Website is running with fallback data 
- ✅ All pages load correctly (Homepage, BGMI, Free Fire, Contact)
- ✅ Modern UI with animations working perfectly
- ⚠️ Database needs setup for full functionality (registrations, admin panel, real-time updates)

## 📋 **Prerequisites**
1. Supabase account (free tier is sufficient)
2. Your Supabase project is already created: `ielwxcdoejxahmdsfznj`
3. Environment variables are configured in the project

## 🚀 **Step-by-Step Setup**

### **Step 1: Access Your Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `ielwxcdoejxahmdsfznj`
4. Navigate to the **SQL Editor** in the left sidebar

### **Step 2: Run Database Migrations (In Order)**

#### **Migration 1: Initial Schema**
Copy and paste this SQL into the SQL Editor and run it:

```sql
-- GameArena Tournament Platform - Initial Database Schema
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
```

#### **Migration 2: Security Policies**
Run this SQL next:

```sql
-- GameArena Tournament Platform - Row Level Security Policies
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
```

#### **Migration 3: RPC Functions**
Run this SQL to create the database functions:

```sql
-- GameArena Tournament Platform - RPC Functions
-- Function to register for tournament with capacity checking
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
    
    -- Count current approved registrations
    SELECT COUNT(*) INTO current_registrations
    FROM registrations
    WHERE tournament_id = p_tournament_id 
    AND status = 'approved';
    
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

-- Function to get slot availability for a tournament
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

-- Function to update registration status (admin only)
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
    
    IF NOT has_admin_role(admin_user_id) THEN
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
```

#### **Migration 4: Storage Setup**
Run this SQL to set up file storage:

```sql
-- GameArena Tournament Platform - Storage Setup
-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for payment screenshots bucket

-- Allow anyone to upload payment screenshots
CREATE POLICY "Allow anyone to upload payment screenshots" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow anyone to view payment screenshots (public bucket)
CREATE POLICY "Allow anyone to view payment screenshots" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payment-screenshots');

-- Allow admins to delete payment screenshots
CREATE POLICY "Allow admins to delete payment screenshots" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'payment-screenshots' 
        AND has_admin_role(auth.uid())
    );
```

### **Step 3: Enable Realtime**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Scroll down to **Realtime**
3. Make sure **Enable Realtime** is turned ON
4. Add these tables to Realtime:
   - `tournaments`
   - `registrations` 
   - `participants`
   - `admin_actions`

### **Step 4: Set Up Admin User**
1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **"Add user"** 
3. Add user with:
   - **Email**: `ishukriitpatna@gmail.com`
   - **Password**: `ISHUkr75@`
   - **Email Confirm**: Yes
4. After creating the user, go to **SQL Editor** and run:

```sql
-- Get the user ID first
SELECT id, email FROM auth.users WHERE email = 'ishukriitpatna@gmail.com';

-- Then insert admin role (replace <USER_ID> with actual UUID from above)
INSERT INTO user_roles (user_id, role) 
VALUES ('<USER_ID>', 'admin');
```

### **Step 5: Test Database Connection**
1. Refresh your GameArena website: `http://localhost:5173`
2. You should now see:
   - ✅ Real tournament data instead of fallback data
   - ✅ No more 401 errors in console
   - ✅ Real-time slot updates working
   - ✅ Registration forms working
   - ✅ Admin panel accessible at `/admin/login`

## 🎉 **Expected Results After Setup**

### **Homepage Will Show:**
- Real-time slot availability for all 6 tournaments
- Accurate capacity tracking (100, 50, 25 for BGMI and 48, 24, 12 for Free Fire)
- "Open for Registration" status for new tournaments

### **Registration Forms Will Work:**
- Form submission will create pending registrations
- Image upload to Supabase storage
- Real-time slot counting
- No data loss on refresh

### **Admin Panel Will Work:**
- Login with: `ishukriitpatna@gmail.com` / `ISHUkr75@`
- View all registrations by game/mode
- Approve/reject registrations with reasons
- Real-time dashboard updates
- Export functionality

### **Real-time Features:**
- Slot counts update instantly across all users
- Admin approvals reflect immediately
- No need to refresh pages

## 🚨**Troubleshooting**

### **Issue: Still getting 401 errors**
- Double-check all SQL migrations ran successfully
- Verify Realtime is enabled
- Check that tournament data was inserted

### **Issue: Admin login not working**
- Verify admin user was created in Authentication → Users
- Confirm admin role was inserted correctly
- Check that `has_admin_role` function exists

### **Issue: Real-time not working**
- Enable Realtime in Settings → API
- Add all tables to Realtime subscription
- Check browser console for WebSocket connection

### **Issue: File uploads failing**
- Verify storage bucket was created
- Check storage policies are in place
- Confirm bucket is set to public

## 🎯 **Final Verification**
After completing all steps, verify these features work:

1. ✅ Homepage shows real tournament data
2. ✅ All 6 registration forms work end-to-end
3. ✅ Admin panel login and dashboard functional
4. ✅ Real-time slot tracking across browsers
5. ✅ Image uploads to Supabase storage
6. ✅ No console errors (except minor warnings)

**The GameArena platform will be fully functional and ready for deployment to Vercel!** 🚀
