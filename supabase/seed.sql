-- GameArena Tournament Platform - Seed Data
-- File: supabase/seed.sql
-- Purpose: Insert essential seed data for the application

-- Note: Admin user must be created manually through Supabase Auth UI first
-- Then run this query with the actual user UUID

-- Example of how to add admin role (replace with actual user UUID)
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin');

-- Insert sample registrations for testing (optional - remove in production)
-- These can be used to test the admin panel functionality

DO $$
DECLARE
    bgmi_solo_id UUID;
    bgmi_duo_id UUID;
    bgmi_squad_id UUID;
    ff_solo_id UUID;
    ff_duo_id UUID;
    ff_squad_id UUID;
    reg_id UUID;
BEGIN
    -- Get tournament IDs
    SELECT id INTO bgmi_solo_id FROM tournaments WHERE game = 'bgmi' AND mode = 'solo';
    SELECT id INTO bgmi_duo_id FROM tournaments WHERE game = 'bgmi' AND mode = 'duo';
    SELECT id INTO bgmi_squad_id FROM tournaments WHERE game = 'bgmi' AND mode = 'squad';
    SELECT id INTO ff_solo_id FROM tournaments WHERE game = 'freefire' AND mode = 'solo';
    SELECT id INTO ff_duo_id FROM tournaments WHERE game = 'freefire' AND mode = 'duo';
    SELECT id INTO ff_squad_id FROM tournaments WHERE game = 'freefire' AND mode = 'squad';
    
    -- Sample BGMI Solo registration
    INSERT INTO registrations (
        tournament_id, status, leader_name, leader_game_id, 
        leader_whatsapp, transaction_id, payment_screenshot_url
    ) VALUES (
        bgmi_solo_id, 'pending', 'Test Player 1', 'TestPlayer001', 
        '9876543210', 'TXN001TEST', 'https://example.com/screenshot1.jpg'
    ) RETURNING id INTO reg_id;
    
    INSERT INTO participants (registration_id, player_name, player_game_id, slot_position)
    VALUES (reg_id, 'Test Player 1', 'TestPlayer001', 1);
    
    -- Sample BGMI Duo registration
    INSERT INTO registrations (
        tournament_id, status, team_name, leader_name, leader_game_id, 
        leader_whatsapp, transaction_id, payment_screenshot_url
    ) VALUES (
        bgmi_duo_id, 'approved', 'Test Team Alpha', 'Leader Alpha', 'LeaderAlpha01', 
        '9876543211', 'TXN002TEST', 'https://example.com/screenshot2.jpg'
    ) RETURNING id INTO reg_id;
    
    INSERT INTO participants (registration_id, player_name, player_game_id, slot_position) VALUES
    (reg_id, 'Leader Alpha', 'LeaderAlpha01', 1),
    (reg_id, 'Player Beta', 'PlayerBeta01', 2);
    
    -- Sample BGMI Squad registration
    INSERT INTO registrations (
        tournament_id, status, team_name, leader_name, leader_game_id, 
        leader_whatsapp, transaction_id, payment_screenshot_url
    ) VALUES (
        bgmi_squad_id, 'rejected', 'Test Team Delta', 'Leader Delta', 'LeaderDelta01', 
        '9876543212', 'TXN003TEST', 'https://example.com/screenshot3.jpg'
    ) RETURNING id INTO reg_id;
    
    INSERT INTO participants (registration_id, player_name, player_game_id, slot_position) VALUES
    (reg_id, 'Leader Delta', 'LeaderDelta01', 1),
    (reg_id, 'Player Gamma', 'PlayerGamma01', 2),
    (reg_id, 'Player Epsilon', 'PlayerEpsilon01', 3),
    (reg_id, 'Player Zeta', 'PlayerZeta01', 4);
    
    -- Sample Free Fire Solo registration
    INSERT INTO registrations (
        tournament_id, status, leader_name, leader_game_id, 
        leader_whatsapp, transaction_id, payment_screenshot_url
    ) VALUES (
        ff_solo_id, 'pending', 'FF Player 1', 'FFPlayer001', 
        '9876543213', 'TXN004TEST', 'https://example.com/screenshot4.jpg'
    ) RETURNING id INTO reg_id;
    
    INSERT INTO participants (registration_id, player_name, player_game_id, slot_position)
    VALUES (reg_id, 'FF Player 1', 'FFPlayer001', 1);
    
END $$;
