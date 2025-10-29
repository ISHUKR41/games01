-- GameArena Tournament Platform Database Schema
-- File: 001_create_enums.sql
-- Purpose: Create custom enum types for better data integrity and type safety

-- Create enum for game types (BGMI and Free Fire)
CREATE TYPE game_type AS ENUM ('bgmi', 'freefire');

-- Create enum for match modes (Solo, Duo, Squad)  
CREATE TYPE match_mode AS ENUM ('solo', 'duo', 'squad');

-- Create enum for registration status tracking
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for admin user roles
CREATE TYPE app_role AS ENUM ('admin', 'user');