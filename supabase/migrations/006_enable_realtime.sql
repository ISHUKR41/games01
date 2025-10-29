-- GameArena Tournament Platform Database Schema
-- File: 006_enable_realtime.sql
-- Purpose: Enable realtime subscriptions for all tables to fix CHANNEL_ERROR issues

-- Enable realtime for registrations table (most critical for slot updates)
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;

-- Enable realtime for admin_actions table (for admin dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE admin_actions;

-- Enable realtime for participants table (for team member updates)
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- Enable realtime for tournaments table (for tournament config changes)
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;

-- Set replica identity to FULL for better old record tracking on UPDATE/DELETE
-- This allows clients to receive the old values when rows are updated or deleted
ALTER TABLE registrations REPLICA IDENTITY FULL;
ALTER TABLE admin_actions REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;
ALTER TABLE tournaments REPLICA IDENTITY FULL;

-- Grant necessary permissions for realtime
GRANT SELECT ON registrations TO anon, authenticated;
GRANT SELECT ON admin_actions TO anon, authenticated;
GRANT SELECT ON participants TO anon, authenticated;
GRANT SELECT ON tournaments TO anon, authenticated;
