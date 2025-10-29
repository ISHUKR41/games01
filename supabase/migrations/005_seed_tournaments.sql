-- GameArena Tournament Platform Database Schema
-- File: 005_seed_tournaments.sql
-- Purpose: Seed the database with the 6 pre-configured tournament types

-- Insert BGMI tournaments with specified pricing and capacity
INSERT INTO tournaments (game, mode, entry_fee_rs, prize_winner_rs, prize_runner_rs, prize_per_kill_rs, max_capacity) VALUES
-- BGMI Solo: 100 players, ₹20 entry, Winner ₹350, Runner-up ₹250, ₹9 per kill
('bgmi', 'solo', 20, 350, 250, 9, 100),

-- BGMI Duo: 50 teams, ₹40 entry, Winner ₹350, Runner-up ₹250, ₹9 per kill  
('bgmi', 'duo', 40, 350, 250, 9, 50),

-- BGMI Squad: 25 teams, ₹80 entry, Winner ₹350, Runner-up ₹250, ₹9 per kill
('bgmi', 'squad', 80, 350, 250, 9, 25),

-- Free Fire Solo: 48 players, ₹20 entry, Winner ₹350, Runner-up ₹150, ₹5 per kill
('freefire', 'solo', 20, 350, 150, 5, 48),

-- Free Fire Duo: 24 teams, ₹40 entry, Winner ₹350, Runner-up ₹150, ₹5 per kill
('freefire', 'duo', 40, 350, 150, 5, 24),

-- Free Fire Squad: 12 teams, ₹80 entry, Winner ₹350, Runner-up ₹150, ₹5 per kill
('freefire', 'squad', 80, 350, 150, 5, 12)

-- Use ON CONFLICT to prevent duplicate inserts during repeated migrations
ON CONFLICT (game, mode) DO NOTHING;