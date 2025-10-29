# 🚀 GameArena Deployment Guide

Complete step-by-step guide to deploy GameArena tournament platform to Vercel with Supabase backend.

## 📋 Pre-Deployment Checklist

### ✅ Required Accounts
- [ ] GitHub account (for code repository)
- [ ] Vercel account (for hosting)
- [ ] Supabase project with provided credentials

### ✅ Environment Variables
Ensure you have these environment variables ready:

```env
VITE_SUPABASE_URL=https://ielwxcdoejxahmdsfznj.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_ADMIN_EMAIL=ishukriitpatna@gmail.com
VITE_ADMIN_PASSWORD=ISHUkr75@
VITE_APP_NAME=GameArena
```

## 🗄️ Step 1: Supabase Database Setup

### 1.1 Run SQL Migrations
Execute these SQL files in your Supabase SQL Editor **in order**:

1. **Create Enums**
```sql
-- File: supabase/migrations/001_create_enums.sql
CREATE TYPE game_type AS ENUM ('bgmi', 'freefire');
CREATE TYPE match_mode AS ENUM ('solo', 'duo', 'squad');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE app_role AS ENUM ('admin', 'user');
```

2. **Create Tables** (copy content from `002_create_tables.sql`)
3. **Setup RLS Policies** (copy content from `003_create_rls_policies.sql`) 
4. **Create Functions** (copy content from `004_create_functions.sql`)
5. **Seed Tournament Data** (copy content from `005_seed_tournaments.sql`)

### 1.2 Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `payment_screenshots`
3. Set it to **Public**
4. Configure policies for upload and read access

### 1.3 Configure Authentication
1. Go to Authentication → Settings → URL Configuration
2. Add these redirect URLs:
   - `http://localhost:5173/**` (for development)
   - `https://your-app.vercel.app/**` (replace with your actual domain)

### 1.4 Create Admin User
1. Go to Authentication → Users
2. Click "Invite User"
3. Add email: `ishukriitpatna@gmail.com`
4. Set password: `ISHUkr75@`
5. After user is created, run this SQL to assign admin role:

```sql
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'ishukriitpatna@gmail.com'),
  'admin'
);
```

## 📤 Step 2: Code Repository Setup

### 2.1 Push to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial GameArena tournament platform"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/gamearena.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2.2 Verify Build Locally
```bash
# Test production build
npm run build

# Preview build (optional)
npm run preview
```

## 🌐 Step 3: Vercel Deployment

### 3.1 Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `gamearena` repository

### 3.2 Configure Build Settings
Vercel should automatically detect Vite settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Add Environment Variables
In the Vercel project dashboard, go to Settings → Environment Variables and add:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | `https://ielwxcdoejxahmdsfznj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_ADMIN_EMAIL` | `ishukriitpatna@gmail.com` |
| `VITE_ADMIN_PASSWORD` | `ISHUkr75@` |
| `VITE_APP_NAME` | `GameArena` |

### 3.4 Deploy
1. Click "Deploy" 
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://gamearena-xyz.vercel.app`)

## 🔧 Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Redirect URLs
1. Go to Supabase Authentication → URL Configuration
2. Add your Vercel deployment URL:
   - `https://your-app.vercel.app/**`

### 4.2 Test Critical Functionality

#### ✅ Homepage Test
- [ ] Visit your deployment URL
- [ ] Verify all tournament cards display correctly
- [ ] Check real-time slot counters work
- [ ] Test navigation between pages

#### ✅ Registration Test
- [ ] Try registering for BGMI Solo tournament
- [ ] Fill out all form fields with valid data
- [ ] Upload a payment screenshot (test image)
- [ ] Submit and verify success message
- [ ] Check if slot count decreases

#### ✅ Admin Panel Test
- [ ] Go to `/admin/login`
- [ ] Login with admin credentials
- [ ] Verify dashboard loads with statistics
- [ ] Check registration appears in admin panel
- [ ] Test approve/reject functionality

#### ✅ Real-time Sync Test
- [ ] Open the site in two browser windows
- [ ] Register in one window
- [ ] Verify slot count updates in the second window
- [ ] Test page refresh - data should persist

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Issue: "Supabase client not initialized"
**Solution**: Verify environment variables are correctly set in Vercel and redeploy.

#### Issue: Database connection errors
**Solution**: Check Supabase URL and anon key. Ensure RLS policies are correctly configured.

#### Issue: Admin login fails
**Solution**: 
1. Verify admin user exists in Supabase Auth
2. Check user has admin role in `user_roles` table
3. Ensure environment variables match

#### Issue: File upload fails
**Solution**:
1. Verify `payment_screenshots` bucket exists and is public
2. Check storage policies allow uploads
3. Ensure file size is under 5MB

#### Issue: Real-time updates not working
**Solution**:
1. Check Supabase project has Realtime enabled
2. Verify database triggers are working
3. Check browser console for WebSocket errors

### Debug Steps
1. **Check Vercel Deployment Logs**
   - Go to Vercel Dashboard → Project → Functions tab
   - Look for build or runtime errors

2. **Check Browser Console**
   - Open Developer Tools → Console
   - Look for JavaScript errors or network failures

3. **Verify Database Setup**
   - Run test queries in Supabase SQL Editor
   - Check if all tables and functions exist

4. **Test API Endpoints**
   - Verify Supabase client connection
   - Test database queries manually

## 📊 Performance Optimization

### After Deployment
1. **Enable Vercel Analytics** (optional)
2. **Set up monitoring** for uptime
3. **Configure custom domain** (optional)
4. **Enable HTTPS** (automatic with Vercel)

### Database Performance
1. **Monitor query performance** in Supabase
2. **Check index usage** for slow queries
3. **Set up database backups**

## 🔐 Security Checklist

### Post-Deployment Security
- [ ] Verify all environment variables are secure
- [ ] Check RLS policies are working correctly
- [ ] Test admin authentication thoroughly
- [ ] Verify file upload restrictions work
- [ ] Check for any exposed sensitive data

## 📱 Mobile Testing

### Device Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify responsive design works
- [ ] Check touch interactions
- [ ] Test form submissions on mobile

## 🎯 Final Verification

### Complete End-to-End Test
1. **User Journey**:
   - Visit homepage → Select tournament → Register → Submit
   - Verify confirmation message and slot update

2. **Admin Journey**:
   - Login to admin panel → Review registration → Approve/Reject
   - Verify statistics update correctly

3. **Multi-User Test**:
   - Have multiple people register simultaneously
   - Verify no race conditions or data conflicts

## 📞 Support

If you encounter issues during deployment:

1. **Check this guide** for common solutions
2. **Review error logs** in Vercel dashboard
3. **Test locally first** to isolate issues
4. **Contact support**: support@gamearena.com

## 🎉 Success!

Once all tests pass, your GameArena tournament platform is live and ready to handle real tournament registrations!

**Live URL**: `https://your-app.vercel.app`
**Admin Panel**: `https://your-app.vercel.app/admin/login`

---

**GameArena Deployment Guide** - Complete ✅