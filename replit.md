# GameArena - Tournament SaaS Platform

## Overview
GameArena is a modern tournament platform for BGMI (Battlegrounds Mobile India) and Free Fire mobile games. It provides real-time slot tracking, payment processing with QR codes, and comprehensive admin management capabilities.

**Status**: Fully configured for Replit environment
**Last Updated**: October 29, 2025

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Animations**: Framer Motion
- **State Management**: Zustand + TanStack Query v5
- **Form Validation**: React Hook Form + Zod

### Key Features
- 6 Tournament Types: BGMI (Solo/Duo/Squad) + Free Fire (Solo/Duo/Squad)
- Real-time slot availability tracking
- Payment screenshot upload with validation
- Admin dashboard with approval workflow
- Row Level Security (RLS) for data protection
- Mobile-responsive design with dark theme

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

Follow `SUPABASE_SETUP.md` for detailed database setup instructions.

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
- **Oct 29, 2025**: Initial Replit environment setup
  - Installed all dependencies (npm install)
  - Fixed vite.config.ts for ES modules (__dirname issue with import.meta.url)
  - Changed port from 5173 to 5000 (Replit requirement)
  - Configured server to bind to 0.0.0.0 for Replit proxy
  - Added allowedHosts for Replit domains to fix host blocking error
  - Set up workflow for dev server (npm run dev on port 5000)
  - Added VITE_SUPABASE_ANON_KEY to Replit Secrets
  - Created DATABASE_SETUP_QUICK_GUIDE.md for easy database initialization

## Current Status
✅ **Working:**
- Website loads successfully on Replit
- Frontend displays with modern dark theme
- All navigation links working
- Responsive design active
- Typing sounds feature ready (sound file missing)
- Fallback tournament data showing correctly

⚠️ **Needs Setup:**
- Supabase database initialization (follow DATABASE_SETUP_QUICK_GUIDE.md)
- Admin user creation in Supabase Auth
- Payment screenshots storage bucket
- Realtime subscriptions (requires database setup)

## Known Issues & Notes
- **Data Persistence**: Currently using fallback static data. Database setup required for real persistence.
- **WebSocket Errors**: Authentication errors expected until database is initialized.
- **Admin Panel**: Requires database setup + admin user creation to function.
- **Payment Upload**: Requires Supabase storage bucket configuration.
- **Slot Tracking**: Will work across users/refreshes once database is set up.

## Database Setup
**IMPORTANT**: Follow `DATABASE_SETUP_QUICK_GUIDE.md` for step-by-step instructions to:
1. Initialize all database tables and functions
2. Enable Row Level Security policies
3. Set up storage for payment screenshots
4. Create admin user with proper roles
5. Enable realtime updates

The app will work with limited functionality until database is configured.

## Deployment
For production deployment to Vercel or other platforms:
1. Run `npm run build` to create production build
2. Set environment variables in hosting platform
3. Configure Supabase redirect URLs
4. Deploy `dist` folder

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## User Preferences
None recorded yet.
