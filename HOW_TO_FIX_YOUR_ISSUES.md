# GameArena - Complete Fix Guide

## 🔴 Current Problems You're Facing

1. **Registration shows "Tournament Full"** even when no one has registered
2. **Admin login shows "Invalid API Key"** error  
3. **Data disappears after refresh**
4. **Slots showing full from the start**

## ✅ Root Cause

**Your Supabase database is completely empty!** No tables exist yet. The application is trying to connect to Supabase, but there's no database structure set up.

## 🚀 COMPLETE FIX - Step by Step

### Step 1: Setup Your Supabase Database (5 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project: https://ielwxcdoejxahmdsfznj.supabase.co

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Setup Script:**
   - Open the file `SUPABASE_SETUP_COMPLETE.sql` in this project
   - Copy ALL the contents (it's a big file, make sure you copy everything)
   - Paste it into the SQL Editor
   - Click "RUN" button
   - Wait for "Success" message

4. **Verify Setup:**
   Run this query to check:
   ```sql
   SELECT id, game, mode, max_capacity FROM tournaments ORDER BY game, mode;
   ```
   
   You should see 6 tournaments:
   - bgmi-solo-id (100 capacity)
   - bgmi-duo-id (50 capacity)
   - bgmi-squad-id (25 capacity)
   - freefire-solo-id (48 capacity)
   - freefire-duo-id (24 capacity)
   - freefire-squad-id (12 capacity)

### Step 2: Create Your Admin Account (2 minutes)

1. **Go to Authentication > Users** in Supabase Dashboard

2. **Create a new user:**
   - Click "Add User"
   - Email: `ishukriitpatna@gmail.com`
   - Password: `ISHUkr75@`
   - Enable "Auto Confirm User"
   - Click "Create User"

3. **Copy the User ID** (looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890)

4. **Grant Admin Role:**
   - Go back to SQL Editor
   - Run this (replace with your actual User ID):
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('YOUR_USER_ID_HERE', 'admin');
   ```

### Step 3: Restart Your Application

1. **In Replit**, restart the server
2. **Clear your browser cache** (Ctrl+Shift+Delete)
3. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R)

### Step 4: Test Everything

#### Test Registration:
1. Go to BGMI Solo tournament page
2. You should see "100 slots available" (not "Tournament Full")
3. Fill out the registration form
4. Upload payment screenshot
5. Submit
6. Check that slots now show "99 slots available"

#### Test Admin Login:
1. Go to `/admin/login`
2. Login with:
   - Email: ishukriitpatna@gmail.com
   - Password: ISHUkr75@
3. You should see the admin dashboard
4. You should see the registration you just made
5. Try approving or rejecting it

## 🎯 What Each Fix Does

### Database Setup (`SUPABASE_SETUP_COMPLETE.sql`)
- Creates 5 tables (tournaments, registrations, participants, admin_actions, user_roles)
- Sets up security policies (who can read/write what)
- Creates 4 RPC functions for registration and slot counting
- Creates storage bucket for payment screenshots
- Enables real-time updates
- Seeds 6 tournaments with the EXACT IDs your code expects

### Admin User Setup
- Creates an admin account for you
- Grants admin role so you can access admin panel
- Allows you to approve/reject registrations

## 🔍 How to Verify Everything Works

### Check 1: Tournaments Exist
```sql
SELECT COUNT(*) FROM tournaments;
```
Should return: **6**

### Check 2: Admin Role Assigned
```sql
SELECT u.email, ur.role
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id;
```
Should show your email with **'admin'** role

### Check 3: Slot Availability Function Works
```sql
SELECT * FROM get_slot_availability('bgmi-solo-id');
```
Should return:
- capacity: 100
- filled: 0
- remaining: 100

### Check 4: Registration Function Works
Try registering through your app, then run:
```sql
SELECT COUNT(*) FROM registrations;
```
Should return: **1** (or however many registrations you made)

## 🐛 Troubleshooting

### Still showing "Tournament Full"?
**Problem:** Database not set up correctly
**Fix:** Re-run `SUPABASE_SETUP_COMPLETE.sql`

### "Invalid API Key" on admin login?
**Problem:** Admin role not granted
**Fix:** Re-run the admin role SQL query with correct User ID

### Data disappears after refresh?
**Problem:** Before, your app was using client-side-only state
**Fix:** After database setup, data now persists in Supabase (permanent)

### Slots not updating in real-time?
**Problem:** Realtime subscriptions not enabled
**Fix:** The setup SQL already enabled this. Try:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
```

### Can't upload payment screenshots?
**Problem:** Storage bucket not created
**Fix:** The setup SQL created this. Verify in Storage section of Supabase dashboard

## 📊 Expected Behavior After Fix

✅ **Solo tournaments** show 100 available slots (BGMI) or 48 (Free Fire)
✅ **Duo tournaments** show 50 available slots (BGMI) or 24 (Free Fire)  
✅ **Squad tournaments** show 25 available slots (BGMI) or 12 (Free Fire)
✅ **After registration**, slot count decreases by 1
✅ **Admin login** works with your email/password
✅ **Admin panel** shows all pending registrations
✅ **Approve/Reject** works and updates slot count
✅ **Data persists** across page refreshes
✅ **Real-time updates** - when someone registers, everyone sees updated slots

## 🎉 Success Checklist

- [ ] Ran `SUPABASE_SETUP_COMPLETE.sql` successfully
- [ ] Verified 6 tournaments exist in database
- [ ] Created admin user in Supabase Auth
- [ ] Granted admin role via SQL
- [ ] Verified admin role in database
- [ ] Restarted application
- [ ] Cleared browser cache
- [ ] Can see correct slot counts (100, 50, 25, 48, 24, 12)
- [ ] Can register for a tournament
- [ ] Slot count decreases after registration
- [ ] Can login to admin panel
- [ ] Can see registrations in admin panel
- [ ] Can approve/reject registrations

## 📞 Need More Help?

If you've followed all steps and still have issues:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - Click "Logs" in sidebar
   - Look for any errors

2. **Check Browser Console:**
   - Press F12
   - Look for any red errors
   - Share them for debugging

3. **Verify Environment Variables:**
   - Check that Replit Secrets has all values
   - Restart the application after checking

4. **Check Database Tables:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   Should show: tournaments, registrations, participants, admin_actions, user_roles

## 💡 Key Points to Remember

1. **Tournament IDs are fixed** - Don't change them in the database
2. **Slots update automatically** - Real-time via Supabase
3. **Pending + Approved count as filled** - Rejected don't count
4. **Admin must approve** - Registrations don't auto-approve
5. **Payment screenshots required** - Can't submit without it
6. **Data is permanent** - Stored in Supabase, not browser

---

**Created:** October 30, 2025
**Platform:** GameArena Tournament SaaS
**Stack:** React + Vite + TypeScript + Supabase
