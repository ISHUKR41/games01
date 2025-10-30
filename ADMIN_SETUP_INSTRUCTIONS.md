# GameArena Admin Setup Instructions

## Step 1: Run the Database Setup

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project: https://ielwxcdoejxahmdsfznj.supabase.co
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the ENTIRE contents of `SUPABASE_SETUP_COMPLETE.sql` file
6. Paste it into the SQL Editor
7. Click **"Run"** button

**Wait for it to complete** - you should see "Success" message.

## Step 2: Verify Database Setup

Run this query in the SQL Editor:

```sql
SELECT 
    id,
    game || '-' || mode AS tournament_name,
    max_capacity
FROM tournaments
ORDER BY game, mode;
```

You should see 6 tournaments:
- bgmi-solo-id (capacity 100)
- bgmi-duo-id (capacity 50)
- bgmi-squad-id (capacity 25)
- freefire-solo-id (capacity 48)
- freefire-duo-id (capacity 24)
- freefire-squad-id (capacity 12)

## Step 3: Create Admin User

### Option A: Sign Up Through Your App (Recommended)

1. Go to your website's admin login page: `https://your-site.com/admin/login`
2. You'll see a sign-up option or go directly to Supabase Auth
3. Sign up with your email: **ishukriitpatna@gmail.com**
4. Check your email for confirmation link (if email confirmation is enabled)
5. Once confirmed, continue to Step 4

### Option B: Create User Directly in Supabase

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click **"Add User"**
3. Enter:
   - Email: **ishukriitpatna@gmail.com**
   - Password: **ISHUkr75@**
4. Enable: **Auto Confirm User**
5. Click **"Create User"**
6. **Copy the User ID** (it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## Step 4: Grant Admin Role

After creating your user, run this SQL query to make yourself an admin:

```sql
-- Replace 'YOUR_USER_ID_HERE' with the actual User ID you copied
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

**Example:**
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');
```

## Step 5: Verify Admin Access

1. Go to your admin login page
2. Login with:
   - Email: **ishukriitpatna@gmail.com**
   - Password: **ISHUkr75@**
3. You should be redirected to the admin dashboard

## Troubleshooting

### Error: "Invalid API Key"

This usually means:
- Database isn't set up yet → Go back to Step 1
- Environment variables not configured → Check Replit secrets

### Error: "Access denied. Admin privileges required"

This means:
- You haven't run the SQL to grant admin role → Go back to Step 4
- Wrong user ID was used → Verify the user ID from Authentication > Users

### Can't Find My User ID

1. Go to **Authentication > Users** in Supabase Dashboard
2. Find your email in the list
3. Click on the user
4. Copy the **UUID** shown at the top

### Slot Showing "Tournament Full" When Empty

This means:
- Database not set up correctly → Re-run `SUPABASE_SETUP_COMPLETE.sql`
- Tournament IDs don't match → Verify tournaments table has the exact IDs shown in Step 2

## Quick Check Query

Run this to verify everything is working:

```sql
-- Check tournaments
SELECT COUNT(*) as tournament_count FROM tournaments;
-- Should return: 6

-- Check if you're an admin
SELECT u.email, ur.role
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'admin';
-- Should show your email with 'admin' role

-- Check registrations count
SELECT COUNT(*) FROM registrations;
-- Should return: 0 (if no one has registered yet)
```

## What Happens After Setup?

✅ All 6 tournaments will be available with 0 registrations
✅ Users can register for tournaments
✅ You can log in to admin panel
✅ You can approve/reject registrations
✅ Slot availability will update in real-time
✅ Data persists across refreshes

## Need Help?

Common issues are usually:
1. Database script not run completely
2. Admin role not granted
3. User ID copied incorrectly

Re-check each step carefully!
