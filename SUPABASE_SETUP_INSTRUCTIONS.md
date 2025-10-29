# Supabase Database Setup Instructions for GameArena

This guide will walk you through setting up the complete database schema for the GameArena Tournament Platform in your Supabase project.

## Overview

You'll be setting up:
- ✅ 5 main tables (tournaments, registrations, participants, admin_actions, user_roles)
- ✅ Row Level Security (RLS) policies for data protection
- ✅ Realtime subscriptions for live updates
- ✅ Storage bucket for payment screenshots
- ✅ Database functions for atomic operations
- ✅ Seed data for 6 tournament types

## Prerequisites

Before you begin, make sure you have:
- A Supabase account (free tier works fine)
- A Supabase project created
- Your Supabase project URL and anon key

---

## Step 1: Access Your Supabase SQL Editor

1. Go to your Supabase project dashboard at https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click on **New Query** to create a new SQL query

---

## Step 2: Run the Complete Setup Script

1. Open the file `supabase/COMPLETE_SETUP.sql` from your project
2. **Copy the entire contents** of the file (all ~700 lines)
3. **Paste** it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

The script will execute and set up everything you need. It should complete in 3-5 seconds.

### What This Script Does

The script will automatically:
- Create all necessary database tables
- Set up security policies
- Create database functions
- Configure storage for payment screenshots
- Enable realtime subscriptions
- Insert seed data for the 6 tournaments

---

## Step 3: Create Your Admin User

Now you need to create an admin user to access the admin dashboard.

### 3.1 Create User in Supabase Auth

1. In your Supabase dashboard, click on **Authentication** in the left sidebar
2. Click on **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   - **Email**: `ishukriitpatna@gmail.com` (or your preferred admin email)
   - **Password**: Create a strong password (at least 8 characters)
   - Check "Auto Confirm User" if available
5. Click **Create user**

### 3.2 Get the User UUID

1. After creating the user, you'll see them in the users list
2. Click on the user to view details
3. **Copy the UUID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 3.3 Grant Admin Role

1. Go back to **SQL Editor**
2. Create a new query
3. Paste this SQL (replace `YOUR_USER_UUID` with the UUID you copied):

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_UUID', 'admin');
```

4. Click **Run**

You should see a success message. Your admin user is now ready!

---

## Step 4: Verify the Setup

Let's verify everything was created correctly.

### 4.1 Check Tables

Run this query in SQL Editor:

```sql
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;
```

You should see these 5 tables:
- admin_actions
- participants
- registrations
- tournaments
- user_roles

### 4.2 Check Tournament Data

Run this query:

```sql
SELECT game, mode, entry_fee_rs, max_capacity 
FROM tournaments 
ORDER BY game, mode;
```

You should see 6 tournaments:
- bgmi / duo (₹40, 50 slots)
- bgmi / solo (₹20, 100 slots)
- bgmi / squad (₹80, 25 slots)
- freefire / duo (₹40, 24 slots)
- freefire / solo (₹20, 48 slots)
- freefire / squad (₹80, 12 slots)

### 4.3 Check Storage Bucket

1. Click on **Storage** in the left sidebar
2. You should see a bucket named **payment-screenshots**
3. Click on it to verify it exists

### 4.4 Check Realtime

1. Click on **Database** → **Replication** in the left sidebar
2. Click on **supabase_realtime** publication
3. You should see these tables enabled:
   - registrations
   - admin_actions
   - participants
   - tournaments

If you don't see them, run this in SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
```

---

## Step 5: Update Your Frontend Environment Variables

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxx.supabase.co`)
   - **Project API keys** → **anon** **public** key (starts with `eyJ...`)

3. Update your `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_ADMIN_EMAIL=ishukriitpatna@gmail.com
```

**Note:** The Project ID is the part before `.supabase.co` in your URL.

---

## Step 6: Test Your Setup

### Test the Frontend

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to the local URL (usually http://localhost:5000)

3. You should see:
   - Tournament cards displaying correctly
   - Slot counts showing (e.g., "100/100 slots available")

### Test Registration (Optional)

1. Click on any tournament
2. Fill out the registration form
3. Upload a test image for payment screenshot
4. Submit the form
5. You should see a success message with a transaction ID

### Test Admin Panel

1. Go to `/admin/login` in your browser
2. Log in with the admin email and password you created
3. You should see the admin dashboard with:
   - Pending registrations section
   - Approved registrations section
   - Rejected registrations section

---

## Troubleshooting

### Issue: "relation 'tournaments' does not exist"

**Solution:** The setup script didn't run completely. Try running it again.

### Issue: "permission denied for table tournaments"

**Solution:** RLS policies might not be set up. Run the COMPLETE_SETUP.sql script again.

### Issue: Admin login fails with "Unauthorized"

**Solution:** 
1. Check that you added the admin role in Step 3.3
2. Verify the user UUID is correct:
   ```sql
   SELECT * FROM user_roles;
   ```

### Issue: Realtime updates not working

**Solution:** 
1. Check that realtime is enabled in Supabase dashboard
2. Verify tables are in the replication:
   ```sql
   SELECT tablename FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime';
   ```

### Issue: Can't upload payment screenshots

**Solution:**
1. Check that the storage bucket exists
2. Verify storage policies:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'payment-screenshots';
   ```

### Issue: "Tournament is full" but slots show available

**Solution:** The count includes pending registrations. This is by design to reserve slots.

---

## Database Schema Overview

### Tables

1. **tournaments** - Pre-configured tournament types
   - 6 tournaments (BGMI & Free Fire: Solo, Duo, Squad)
   - Stores pricing, capacity, and prize information

2. **registrations** - Tournament registrations
   - Stores team/player info, payment details
   - Status: pending, approved, rejected

3. **participants** - Team members
   - Links to registrations
   - Stores individual player details

4. **admin_actions** - Audit log
   - Tracks all admin decisions
   - Includes approval/rejection reasons

5. **user_roles** - Admin access control
   - Links Supabase auth users to app roles

### Key Functions

- **register_for_tournament()** - Handles registration with race condition protection
- **get_slot_availability()** - Returns real-time slot counts
- **update_registration_status()** - Admin function to approve/reject
- **get_tournament_stats()** - Returns dashboard statistics

---

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **Admin-only access** for sensitive operations  
✅ **Public read access** for tournament data  
✅ **Audit logging** for all admin actions  
✅ **File upload validation** (5MB limit, image types only)

---

## Next Steps

After completing the setup:

1. ✅ Test tournament registration flow
2. ✅ Test admin approval/rejection process
3. ✅ Verify realtime updates work
4. ✅ Test payment screenshot uploads
5. ✅ Review the admin dashboard

---

## Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all steps were completed in order
3. Check the browser console for errors
4. Review Supabase logs in the dashboard

---

## Important Notes

⚠️ **Never expose your service_role key** in frontend code  
⚠️ **Keep your admin password secure**  
⚠️ **Review RLS policies before going to production**  
⚠️ **Set up database backups** in Supabase settings  

---

## Production Checklist

Before deploying to production:

- [ ] Change admin password to a strong password
- [ ] Enable email confirmation for user signups
- [ ] Set up custom domain for Supabase (optional)
- [ ] Configure CORS settings if needed
- [ ] Enable database backups
- [ ] Review and test all RLS policies
- [ ] Test realtime subscriptions under load
- [ ] Monitor database usage and quotas

---

**Setup Complete! 🎉**

Your GameArena tournament platform database is now fully configured and ready to use.
