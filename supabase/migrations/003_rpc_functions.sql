-- GameArena Tournament Platform - RPC Functions
-- File: supabase/migrations/003_rpc_functions.sql
-- Purpose: Create atomic database functions to prevent race conditions

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

-- Function to get tournament statistics for admin dashboard
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
