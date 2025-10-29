-- GameArena Tournament Platform Database Schema
-- File: 004_create_functions.sql
-- Purpose: Create database functions for atomic operations and business logic

-- Function: register_for_tournament
-- Purpose: Atomically register for tournament with capacity checking and race condition prevention
-- This function solves the critical data loss and synchronization issues
CREATE OR REPLACE FUNCTION register_for_tournament(
  p_tournament_id UUID,
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
  -- Lock tournament row to prevent race conditions during capacity check
  SELECT * INTO v_tournament
  FROM tournaments
  WHERE id = p_tournament_id AND is_active = true
  FOR UPDATE;

  -- Check if tournament exists and is active
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tournament not found or not active');
  END IF;

  -- Count approved registrations (pending are also counted to reserve slots)
  SELECT COUNT(*) INTO v_current_count
  FROM registrations
  WHERE tournament_id = p_tournament_id
    AND status IN ('pending', 'approved'); -- Count pending as well to reserve slot

  -- Check if tournament has available capacity
  IF v_current_count >= v_tournament.max_capacity THEN
    RETURN json_build_object('success', false, 'error', 'Tournament is full');
  END IF;

  -- Insert registration record
  INSERT INTO registrations (
    tournament_id,
    team_name,
    leader_name,
    leader_game_id,
    leader_whatsapp,
    transaction_id,
    payment_screenshot_url
  ) VALUES (
    p_tournament_id,
    p_team_name,
    p_leader_name,
    p_leader_game_id,
    p_leader_whatsapp,
    p_transaction_id,
    p_payment_screenshot_url
  )
  RETURNING id INTO v_registration_id;

  -- Insert additional participants if provided (for duo/squad matches)
  IF p_participants IS NOT NULL THEN
    FOR v_participant IN SELECT * FROM jsonb_array_elements(p_participants)
    LOOP
      INSERT INTO participants (
        registration_id,
        player_name,
        player_game_id,
        slot_position
      ) VALUES (
        v_registration_id,
        v_participant->>'player_name',
        v_participant->>'player_game_id',
        (v_participant->>'slot_position')::INTEGER
      );
    END LOOP;
  END IF;

  -- Return success response with updated slot information
  RETURN json_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'slots_remaining', v_tournament.max_capacity - (v_current_count + 1)
  );
END;
$$;

-- Function: get_slot_availability
-- Purpose: Get real-time slot availability for a tournament
-- This function provides accurate slot counts for the UI
CREATE OR REPLACE FUNCTION get_slot_availability(p_tournament_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INTEGER;
  v_filled INTEGER;
BEGIN
  -- Get tournament capacity and count filled slots
  SELECT t.max_capacity, COUNT(r.id)
  INTO v_capacity, v_filled
  FROM tournaments t
  LEFT JOIN registrations r ON r.tournament_id = t.id
    AND r.status IN ('pending', 'approved') -- Count both pending and approved
  WHERE t.id = p_tournament_id
  GROUP BY t.max_capacity;

  -- Return slot availability information
  RETURN json_build_object(
    'capacity', v_capacity,
    'filled', v_filled,
    'remaining', v_capacity - v_filled
  );
END;
$$;

-- Function: update_registration_status
-- Purpose: Update registration status with admin action logging
-- This function ensures all status changes are properly logged
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
  -- Check if user has admin role
  IF NOT public.has_admin_role(p_admin_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get current status
  SELECT status INTO v_old_status
  FROM registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Registration not found');
  END IF;

  -- Update registration status
  UPDATE registrations
  SET status = p_new_status, updated_at = now()
  WHERE id = p_registration_id;

  -- Log admin action
  INSERT INTO admin_actions (
    registration_id,
    admin_user_id,
    action,
    reason
  ) VALUES (
    p_registration_id,
    p_admin_user_id,
    p_new_status,
    p_reason
  );

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_new_status
  );
END;
$$;

-- Function: get_tournament_stats
-- Purpose: Get comprehensive statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_tournament_stats(p_tournament_id UUID)
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
      SELECT max_capacity - COUNT(*) FILTER (WHERE status IN ('pending', 'approved'))
      FROM tournaments t, registrations r
      WHERE t.id = p_tournament_id AND r.tournament_id = t.id
    )
  ) INTO v_stats
  FROM registrations
  WHERE tournament_id = p_tournament_id;

  RETURN v_stats;
END;
$$;