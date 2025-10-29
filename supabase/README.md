# GameArena Tournament Platform - Supabase Setup

This directory contains all the database migrations, policies, and configuration for the GameArena tournament platform.

## Database Schema Overview

The database consists of 5 main tables:

### 1. tournaments
Stores tournament configurations for all 6 tournament types:
- BGMI: Solo (100 players), Duo (50 teams), Squad (25 teams)  
- Free Fire: Solo (48 players), Duo (24 teams), Squad (12 teams)

### 2. registrations
Stores all tournament registrations with payment details and approval status.

### 3. participants  
Stores individual team members for duo/squad tournaments.

### 4. admin_actions
Logs all admin approval/rejection actions for audit trail.

### 5. user_roles
Manages admin access control.

## Setup Instructions

### 1. Run Migrations
Execute the migration files in order:

```sql
-- 1. Create schema and initial data
\i supabase/migrations/001_initial_schema.sql

-- 2. Set up security policies  
\i supabase/migrations/002_security_policies.sql

-- 3. Create RPC functions
\i supabase/migrations/003_rpc_functions.sql  

-- 4. Set up storage
\i supabase/migrations/004_storage_setup.sql
```

### 2. Create Admin User

1. Go to Supabase Auth → Users
2. Create a new user with email: `ishukriitpatna@gmail.com`
3. Set password: `ISHUkr75@`
4. Copy the user UUID from the users table
5. Run this SQL with the actual UUID:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('your-actual-user-uuid-here', 'admin');
```

### 3. Configure Storage

The storage bucket `payment-screenshots` is automatically created with:
- 5MB file size limit
- Allowed types: JPG, PNG, WebP
- Public read access
- Upload access for all users

### 4. Environment Variables

Make sure your frontend has these environment variables:

```env
VITE_SUPABASE_URL=https://ielwxcdoejxahmdsfznj.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=ielwxcdoejxahmdsfznj
VITE_ADMIN_EMAIL=ishukriitpatna@gmail.com
```

## Key Features

### Real-time Updates
- Uses Supabase Realtime to sync slot availability across all clients
- Admin panel updates in real-time when registrations change

### Atomic Operations  
- `register_for_tournament()` function uses row locking to prevent race conditions
- Ensures no overbooking when multiple users register simultaneously

### Security
- Row Level Security (RLS) enabled on all tables
- Admin-only access to sensitive operations
- Input validation and sanitization

### File Storage
- Secure payment screenshot uploads
- Automatic filename generation with transaction ID
- File type and size validation

## RPC Functions

### register_for_tournament()
Atomically registers a team/player for a tournament with capacity checking.

**Parameters:**
- `p_tournament_id`: Tournament UUID
- `p_team_name`: Team name (for duo/squad only)
- `p_leader_name`: Team leader name
- `p_leader_game_id`: Leader's game ID
- `p_leader_whatsapp`: Leader's WhatsApp number
- `p_transaction_id`: Payment transaction ID
- `p_payment_screenshot_url`: Screenshot URL
- `p_participants`: JSON array of team members (for duo/squad)

### get_slot_availability()
Returns real-time slot availability for a tournament.

### update_registration_status()
Admin-only function to approve/reject registrations.

### get_tournament_stats()
Returns comprehensive statistics for the admin dashboard.

## Testing

Optional seed data is included in `seed.sql` for testing the admin panel functionality. Remove before production deployment.

## Security Notes

1. Never expose the service role key in frontend code
2. All data access goes through RLS policies
3. Admin actions are logged for audit purposes
4. File uploads are validated server-side

## Troubleshooting

**If migrations fail:**
1. Check if extensions are enabled: `uuid-ossp`
2. Verify RLS is enabled on auth.users table
3. Ensure proper permissions are granted

**If real-time doesn't work:**
1. Check if Realtime is enabled in Supabase dashboard
2. Verify the client is subscribed to the correct channel
3. Check browser network tab for websocket connection

**If admin access fails:**
1. Verify user exists in auth.users table
2. Check user_roles table for admin entry
3. Ensure has_admin_role() function exists
