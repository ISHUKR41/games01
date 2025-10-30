# GameArena - Tournament SaaS Platform

## Overview
GameArena is a modern tournament platform for BGMI (Battlegrounds Mobile India) and Free Fire mobile games. It provides real-time slot tracking, payment processing with QR codes, and comprehensive admin management capabilities.

**Status**: Fully configured for Replit environment with modern UI enhancements
**Last Updated**: October 30, 2025

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Animations**: Framer Motion, AOS (Animate On Scroll), react-spring, canvas-confetti
- **State Management**: Zustand + TanStack Query v5
- **Form Validation**: React Hook Form + Zod
- **Media**: 18 gaming stock images, YouTube video embeds

### Key Features
- 6 Tournament Types: BGMI (Solo/Duo/Squad) + Free Fire (Solo/Duo/Squad)
- Real-time slot availability tracking with optimized refetching (60s staleTime)
- Payment screenshot upload with validation
- Admin dashboard with approval workflow
- Row Level Security (RLS) for data protection
- Mobile-responsive design with dark theme
- Modern UI with scroll animations, hover effects, and confetti celebrations
- Professional gaming imagery and video embeds
- Standardized tournament IDs across all forms

## Project Structure
```
gamearena/
├── src/
│   ├── components/       # React components
│   │   ├── admin/       # Admin panel components
│   │   ├── forms/       # Registration forms (6 types)
│   │   ├── layout/      # Navbar, Footer
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Page components
│   ├── lib/
│   │   ├── supabase/    # Supabase client & types
│   │   ├── validation/  # Zod schemas
│   │   └── hooks/       # Custom React hooks
│   └── App.tsx          # Main app component
├── supabase/            # Database migrations & setup
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## Development Setup

### Environment Configuration
The application uses Supabase for backend services. Required environment variables (with fallback values in code):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID`: Supabase project ID
- `VITE_ADMIN_EMAIL`: Admin login email
- `VITE_ADMIN_PASSWORD`: Admin login password

Note: The application has hardcoded fallback values in `src/lib/supabase/client.ts` for development.

### Workflow
- **Server**: Runs `npm run dev` on port 5000
  - Vite development server with HMR
  - Configured to accept all hosts (required for Replit proxy)
  - Frontend accessible via webview

### Database Setup
The project includes complete Supabase migrations in `supabase/migrations/`:
1. Initial schema (tournaments, registrations, participants tables)
2. Security policies (RLS)
3. RPC functions (registration, slot tracking, status updates)
4. Storage setup (payment screenshots bucket)

Follow `DATABASE_SETUP_GUIDE.md` for a comprehensive, all-in-one database setup SQL script.

## Tournament Configuration

### BGMI Tournaments
- **Solo**: 100 players, ₹20 entry, ₹350 winner, ₹250 runner-up, ₹9/kill
- **Duo**: 50 teams, ₹40 entry, ₹350 winner, ₹250 runner-up, ₹9/kill
- **Squad**: 25 teams, ₹80 entry, ₹350 winner, ₹250 runner-up, ₹9/kill

### Free Fire Tournaments
- **Solo**: 48 players, ₹20 entry, ₹350 winner, ₹150 runner-up, ₹5/kill
- **Duo**: 24 teams, ₹40 entry, ₹350 winner, ₹150 runner-up, ₹5/kill
- **Squad**: 12 teams, ₹80 entry, ₹350 winner, ₹150 runner-up, ₹5/kill

## Admin Features
- Login: `/admin/login`
- Dashboard: `/admin/dashboard`
- View and manage all registrations
- Approve/reject with reasons
- Real-time statistics
- CSV export functionality

## Replit-Specific Configuration

### Port Configuration
- Frontend: Port 5000 (only port exposed to users)
- Vite configured to bind to `0.0.0.0:5000`
- HMR configured for proper hot reload

### Host Verification
The Vite server is configured to accept all hosts (`host: '0.0.0.0'`) which is **required** for Replit's proxy/iframe setup to work properly.

## Recent Changes
- **Oct 30, 2025**: Major enhancements and critical fixes
  - Fixed Supabase connection by adding hardcoded credential fallbacks in client.ts
  - Fixed auto-reload issue by reducing refetch frequency (60s staleTime) and disabling aggressive polling
  - Fixed "Tournament Full" false positive by standardizing tournament IDs across all 6 forms
  - Fixed critical image path issue by moving all stock images to public/attached_assets folder
  - Enhanced entire website with modern design elements:
    - Added AOS scroll animations to all pages
    - Integrated 18 professional gaming stock images
    - Added YouTube video embeds for BGMI and Free Fire
    - Implemented react-spring animations for smooth transitions
    - Added canvas-confetti celebration effects
  - Created comprehensive DATABASE_SETUP_GUIDE.md with single SQL script for complete setup
  - Fixed TypeScript error (config.smooth → config.gentle in react-spring)
  - All forms now use consistent tournament IDs (bgmi-solo-id, bgmi-duo-id, etc.)
- **Oct 29, 2025** (Afternoon): Critical bug fixes and enhancements
  - Fixed form state persistence issue - forms now reset after successful submission
  - Created useRegistrationCompletion hook for centralized form cleanup
  - Fixed memory leaks by properly revoking object URLs in all 6 forms
  - Improved typing sound hook with Web Audio API fallback (no console warnings)
  - Updated Vite HMR configuration for better stability
  - Added React Query DevTools (dev mode only)
  - Added modern UI libraries (react-loading-skeleton, vaul, react-use)
  - Created Supabase realtime SQL migration (006_enable_realtime.sql)
  - Created comprehensive documentation (FIXES_IMPLEMENTED.md, SUPABASE_REALTIME_FIX.md)
- **Oct 29, 2025** (Morning): Initial Replit environment setup
  - Installed all dependencies (npm install)
  - Fixed vite.config.ts for ES modules (__dirname issue with import.meta.url)
  - Changed port from 5173 to 5000 (Replit requirement)
  - Configured server to bind to 0.0.0.0 for Replit proxy
  - Set up workflow for dev server (npm run dev on port 5000)
  - Added VITE_SUPABASE_ANON_KEY to Replit Secrets

## Current Status
✅ **Working:**
- Website loads successfully on Replit with modern UI
- Frontend displays with dark theme and professional gaming imagery
- All 18 stock images loading correctly from public folder
- YouTube videos embedded and playing
- Scroll animations (AOS) working on all pages
- Confetti effects on homepage
- All navigation links working
- Responsive design active across all devices
- Typing sounds feature ready (sound file missing)
- Supabase connection established with fallback credentials
- Optimized refetching prevents page reloads (60s staleTime)
- Tournament IDs standardized across all forms

⚠️ **Needs Setup:**
- Supabase database initialization (follow DATABASE_SETUP_GUIDE.md - single SQL script)
- Admin user creation in Supabase Auth
- Payment screenshots storage bucket (created automatically by setup script)
- Realtime subscriptions (enabled automatically by setup script)

## Known Issues & Notes
- **Data Persistence**: Currently using fallback static data. Database setup required for real persistence.
- **WebSocket Errors**: Authentication errors expected until database is initialized.
- **Admin Panel**: Requires database setup + admin user creation to function.
- **Payment Upload**: Requires Supabase storage bucket configuration.
- **Slot Tracking**: Will work across users/refreshes once database is set up.

## Database Setup
**IMPORTANT**: Follow `DATABASE_SETUP_GUIDE.md` for a comprehensive, all-in-one SQL script that:
1. Creates all database tables with proper relationships and constraints
2. Seeds 6 tournament configurations (3 BGMI + 3 Free Fire)
3. Enables Row Level Security (RLS) policies
4. Creates 4 RPC functions (register, get_slots, update_status, get_stats)
5. Sets up storage bucket for payment screenshots
6. Enables realtime subscriptions

**One Script Does Everything!** Just copy-paste the complete SQL from the guide into Supabase SQL Editor and run it. The app will work with limited functionality until database is configured.

### Tournament IDs
The frontend uses these standardized tournament IDs:
- BGMI Solo: `bgmi-solo-id`
- BGMI Duo: `bgmi-duo-id`
- BGMI Squad: `bgmi-squad-id`
- Free Fire Solo: `freefire-solo-id`
- Free Fire Duo: `freefire-duo-id`
- Free Fire Squad: `freefire-squad-id`

If your database uses different UUIDs, update these IDs in all 6 form components.

## Deployment
For production deployment to Vercel or other platforms:
1. Run `npm run build` to create production build
2. Set environment variables in hosting platform
3. Configure Supabase redirect URLs
4. Deploy `dist` folder

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## User Preferences
None recorded yet.
