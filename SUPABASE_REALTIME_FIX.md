# Supabase Realtime Fix for GameArena

## Critical Issue
The website is experiencing `CHANNEL_ERROR` because realtime is not enabled on the Supabase tables.

## How to Fix

### Option 1: Run SQL via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ielwxcdoejxahmdsfznj
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the following SQL:

```sql
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;

-- Set replica identity to FULL for better tracking
ALTER TABLE registrations REPLICA IDENTITY FULL;
ALTER TABLE admin_actions REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;
ALTER TABLE tournaments REPLICA IDENTITY FULL;

-- Grant SELECT permissions
GRANT SELECT ON registrations TO anon, authenticated;
GRANT SELECT ON admin_actions TO anon, authenticated;
GRANT SELECT ON participants TO anon, authenticated;
GRANT SELECT ON tournaments TO anon, authenticated;
```

4. Click **Run** to execute the SQL
5. Refresh your website - the CHANNEL_ERROR should be gone!

### Option 2: Verify Realtime is Enabled

Run this query to check which tables have realtime enabled:

```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see:
- registrations
- admin_actions
- participants
- tournaments

## Why This Fixes the Issue

The error `CHANNEL_ERROR` occurs because the Supabase client is trying to subscribe to real-time changes on tables that are not part of the `supabase_realtime` publication. By adding the tables to this publication, the subscriptions will work correctly.

This will fix:
- ✅ Slot availability updates in real-time
- ✅ Admin dashboard showing live registration updates
- ✅ No more constant page reloads
- ✅ Data persistence across browser sessions
