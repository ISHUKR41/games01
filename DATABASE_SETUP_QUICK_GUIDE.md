# 🚀 GameArena Database Setup - Quick Guide

## Current Status
- ✅ Website is running on Replit
- ✅ Frontend working with fallback data
- ⚠️ **Database needs setup for real data persistence**

## Why You Need This
Right now, your data disappears when you refresh because there's no database. Follow these steps to enable:
- ✅ Real data persistence (data survives refresh)
- ✅ Slot tracking across multiple users
- ✅ Admin panel functionality
- ✅ Real-time updates

---

## Setup Steps (15 minutes)

### Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/ielwxcdoejxahmdsfznj
2. Sign in to your Supabase account
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Database Initialization Script

Copy and paste this ENTIRE script into the SQL Editor and click **RUN**:

```sql
-- GameArena Database Initialization Script
-- Run this ONCE to set up everything

-- 1. Create custom types
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
END $$;

-- 2. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create tournaments table
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
    UNIQUE(game, mode)
);

-- 4. Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
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

-- 5. Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_game_id TEXT NOT NULL,
    slot_position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create admin_actions table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id),
    action registration_status NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_registration_id ON participants(registration_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_registration_id ON admin_actions(registration_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- 9. Insert tournament configurations (only if they don't exist)
INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity) 
SELECT 'bgmi', 'solo', 20, 350, 250, 9, 100
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE game = 'bgmi' AND mode = 'solo');

INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity)
SELECT 'bgmi', 'duo', 40, 350, 250, 9, 50
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE game = 'bgmi' AND mode = 'duo');

INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity)
SELECT 'bgmi', 'squad', 80, 350, 250, 9, 25
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE game = 'bgmi' AND mode = 'squad');

INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity)
SELECT 'freefire', 'solo', 20, 350, 150, 5, 48
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE game = 'freefire' AND mode = 'solo');

INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity)
SELECT 'freefire', 'duo', 40, 350, 150, 5, 24
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE game = 'freefire' AND mode = 'duo');

INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity)
SELECT 'freefire', 'squad', 80, 350, 150, 5, 12
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE game = 'freefire' AND mode = 'squad');

-- 10. Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 11. Create helper function for admin role checking
CREATE OR REPLACE FUNCTION has_admin_role(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create RLS policies
-- Tournaments policies
DROP POLICY IF EXISTS "Anyone can view active tournaments" ON tournaments;
CREATE POLICY "Anyone can view active tournaments" ON tournaments
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage tournaments" ON tournaments;
CREATE POLICY "Admins can manage tournaments" ON tournaments
    FOR ALL USING (has_admin_role(auth.uid()));

-- Registrations policies
DROP POLICY IF EXISTS "Allow registration creation via RPC" ON registrations;
CREATE POLICY "Allow registration creation via RPC" ON registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view registrations by transaction_id" ON registrations;
CREATE POLICY "Users can view registrations by transaction_id" ON registrations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all registrations" ON registrations;
CREATE POLICY "Admins can manage all registrations" ON registrations
    FOR ALL USING (has_admin_role(auth.uid()));

-- Participants policies
DROP POLICY IF EXISTS "Allow participant creation via RPC" ON participants;
CREATE POLICY "Allow participant creation via RPC" ON participants
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
CREATE POLICY "Anyone can view participants" ON participants
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage participants" ON participants;
CREATE POLICY "Admins can manage participants" ON participants
    FOR ALL USING (has_admin_role(auth.uid()));

-- Admin actions policies
DROP POLICY IF EXISTS "Only admins can access admin actions" ON admin_actions;
CREATE POLICY "Only admins can access admin actions" ON admin_actions
    FOR ALL USING (has_admin_role(auth.uid()));

-- User roles policies
DROP POLICY IF EXISTS "Only admins can manage user roles" ON user_roles;
CREATE POLICY "Only admins can manage user roles" ON user_roles
    FOR ALL USING (has_admin_role(auth.uid()));

-- 13. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON tournaments TO anon, authenticated;
GRANT SELECT, INSERT ON registrations TO anon, authenticated;
GRANT SELECT, INSERT ON participants TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 14. Create RPC function for tournament registration
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
    SELECT * INTO tournament_record
    FROM tournaments
    WHERE id = p_tournament_id AND is_active = true
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tournament not found or inactive'
        );
    END IF;
    
    SELECT COUNT(*) INTO current_registrations
    FROM registrations
    WHERE tournament_id = p_tournament_id 
    AND status = 'approved';
    
    IF current_registrations >= tournament_record.max_capacity THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tournament is full'
        );
    END IF;
    
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

-- 15. Create RPC function for slot availability
CREATE OR REPLACE FUNCTION get_slot_availability(p_tournament_id UUID)
RETURNS JSON AS $$
DECLARE
    tournament_record tournaments%ROWTYPE;
    approved_count INTEGER;
    pending_count INTEGER;
    rejected_count INTEGER;
BEGIN
    SELECT * INTO tournament_record
    FROM tournaments
    WHERE id = p_tournament_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tournament not found'
        );
    END IF;
    
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

-- 16. Create RPC function for updating registration status (admin only)
CREATE OR REPLACE FUNCTION update_registration_status(
    p_registration_id UUID,
    p_status registration_status,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    admin_user_id := auth.uid();
    
    IF NOT has_admin_role(admin_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized - Admin access required'
        );
    END IF;
    
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

-- 17. Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 18. Storage policies
DROP POLICY IF EXISTS "Allow anyone to upload payment screenshots" ON storage.objects;
CREATE POLICY "Allow anyone to upload payment screenshots" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Allow anyone to view payment screenshots" ON storage.objects;
CREATE POLICY "Allow anyone to view payment screenshots" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Allow admins to delete payment screenshots" ON storage.objects;
CREATE POLICY "Allow admins to delete payment screenshots" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'payment-screenshots' 
        AND has_admin_role(auth.uid())
    );

-- ✅ Setup Complete!
SELECT 'Database setup completed successfully! 🎉' as status;
```

### Step 3: Enable Realtime

1. In Supabase dashboard, go to **Database** → **Replication**
2. Click **Add Source** (or enable replication)
3. Enable these tables for realtime:
   - `tournaments`
   - `registrations`
   - `participants`

### Step 4: Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: `ishukriitpatna@gmail.com`
   - **Password**: `ISHUkr75@`
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create user**
5. Copy the user ID that appears (looks like: `a1b2c3d4-...`)
6. Go back to **SQL Editor** and run:

```sql
-- Replace YOUR_USER_ID with the actual ID you copied
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin');
```

### Step 5: Verify Setup

1. Refresh your GameArena website
2. Check browser console - the 401 errors should be gone ✅
3. Try registering for a tournament - data should persist!
4. Refresh the page - slot count should stay the same!
5. Login to admin panel at `/admin/login`

---

## ✅ What You'll Get After Setup

- **Real Data Persistence**: Registrations saved forever
- **Live Slot Updates**: Counts update instantly for all users
- **Admin Panel**: Approve/reject registrations
- **Multi-User Support**: Share link with friends, everyone sees same data
- **No More Data Loss**: Refresh all you want!

---

## 🚨 Troubleshooting

### Still seeing 401 errors?
- Make sure you ran the ENTIRE SQL script
- Check if tournaments table has 6 rows: `SELECT * FROM tournaments;`

### Admin login not working?
- Verify user was created in **Authentication** → **Users**
- Make sure you ran the admin role INSERT query with correct user ID

### Realtime not working?
- Go to **Database** → **Replication**
- Enable replication for `tournaments`, `registrations`, `participants`

---

## Need Help?

If something doesn't work:
1. Check the browser console for specific errors
2. Go to Supabase → **SQL Editor** → **Query History** to see if queries ran
3. Make sure all 6 tournaments appear: `SELECT game, mode, max_capacity FROM tournaments;`

The website will work with fallback data even without database setup, but you need the database for real functionality!
