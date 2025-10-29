# 🎮 GameArena - Tournament SaaS Platform

A fully modern, professional SaaS website for BGMI and Free Fire tournaments with real-time slot tracking, payment processing, and comprehensive admin management.

![GameArena](https://img.shields.io/badge/GameArena-Tournament%20Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel)

## ✨ Features

### 🏆 Tournament Types
- **BGMI Tournaments**: Solo (100 players), Duo (50 teams), Squad (25 teams)
- **Free Fire Tournaments**: Solo (48 players), Duo (24 teams), Squad (12 teams)

### 💰 Prize Structure
- **BGMI**: Entry ₹20/₹40/₹80 | Winner ₹350 | Runner-up ₹250 | Per Kill ₹9
- **Free Fire**: Entry ₹20/₹40/₹80 | Winner ₹350 | Runner-up ₹150 | Per Kill ₹5

### 🚀 Key Features
- ⚡ **Real-time Slot Tracking** - Live updates across all devices
- 🔒 **Data Persistence** - No data loss on refresh or sharing
- 📱 **Modern UI/UX** - Dark theme with glassmorphism effects
- 🎵 **Typing Sounds** - Interactive sound effects
- 📊 **Admin Dashboard** - Comprehensive management panel
- 💳 **QR Payment** - Screenshot upload with validation
- 🔄 **Real-time Updates** - Instant slot availability updates
- 📈 **Analytics** - Tournament statistics and reporting
- 📱 **Mobile Responsive** - Works on all devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** + **shadcn/ui** for modern UI components
- **Framer Motion** for smooth animations
- **React Hook Form** + **Zod** for form validation
- **TanStack Query v5** for server state management

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** for data protection
- **Supabase Auth** for admin authentication
- **Supabase Storage** for payment screenshot uploads
- **Supabase Realtime** for live updates

### Additional Libraries
- **browser-image-compression** - Image optimization
- **react-confetti** - Celebration animations
- **lucide-react** - Modern icon library
- **sonner** - Toast notifications

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gamearena
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ielwxcdoejxahmdsfznj.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=ielwxcdoejxahmdsfznj

# Admin Configuration  
VITE_ADMIN_EMAIL=ishukriitpatna@gmail.com
VITE_ADMIN_PASSWORD=ISHUkr75@

# App Configuration
VITE_APP_NAME=GameArena
VITE_APP_DESCRIPTION="India's Premier BGMI & Free Fire Tournament Platform"
```

### 4. Supabase Setup
Follow the instructions in `supabase/README.md`:

1. Run all migration files in order
2. Create admin user in Supabase Auth
3. Configure storage bucket for payment screenshots
4. Set up Row Level Security policies

### 5. Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` to see the application.

### 6. Build for Production
```bash
npm run build
```

## 🚀 Deployment to Vercel

### 1. Connect to Vercel
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Import project from GitHub

### 2. Configure Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_ADMIN_EMAIL`
- `VITE_APP_NAME`
- `VITE_APP_DESCRIPTION`

### 3. Build Settings
Vercel should auto-detect Vite. If not, set:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 4. Deploy
Click "Deploy" and wait for the build to complete.

### 5. Configure Supabase Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- Add your Vercel domain: `https://your-app.vercel.app/**`

## 📁 Project Structure

```
gamearena/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # 6 registration forms
│   │   │   ├── bgmi/        # BGMI forms (Solo, Duo, Squad)
│   │   │   └── freefire/    # Free Fire forms (Solo, Duo, Squad)
│   │   ├── admin/           # Admin panel components
│   │   ├── shared/          # Reusable components
│   │   └── layout/          # Layout components
│   ├── pages/               # Page components
│   ├── lib/
│   │   ├── supabase/        # Supabase configuration
│   │   ├── validation/      # Zod schemas
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── assets/              # Images, sounds, videos
├── supabase/
│   ├── migrations/          # Database migrations
│   ├── seed.sql            # Sample data
│   └── README.md           # Supabase setup guide
└── public/                  # Static assets
```

## 🎯 Core Features

### Registration Process
1. **Select Tournament** - Choose from 6 tournament types
2. **Fill Details** - Multi-step form with validation
3. **Payment** - QR code with screenshot upload
4. **Submit** - Atomic database operation prevents race conditions
5. **Admin Approval** - Admin reviews and approves/rejects

### Real-time Slot Tracking
- **Live Updates**: Slot counts update instantly across all devices
- **Data Persistence**: No data loss on page refresh or link sharing
- **Race Prevention**: Atomic database functions prevent overbooking

### Admin Panel
- **Authentication**: Secure login with role-based access
- **Dashboard**: Real-time statistics and analytics
- **Registration Management**: Approve/reject with reasons
- **Export**: CSV download of registration data
- **Search & Filter**: Find registrations by various criteria

### Modern UI Features
- **Dark Theme**: Modern dark color scheme
- **Glassmorphism**: Subtle transparency effects
- **Animations**: Smooth Framer Motion transitions
- **Typing Sounds**: Interactive audio feedback
- **Responsive**: Mobile-first design approach

## 🔧 API Documentation

### Supabase RPC Functions

#### `register_for_tournament()`
Atomically registers a team for a tournament with capacity checking.

```typescript
const { data, error } = await supabase.rpc('register_for_tournament', {
  p_tournament_id: 'uuid',
  p_team_name: 'Team Name', // null for solo
  p_leader_name: 'Leader Name',
  p_leader_game_id: 'GameID123',
  p_leader_whatsapp: '9876543210',
  p_transaction_id: 'TXN123456',
  p_payment_screenshot_url: 'https://...',
  p_participants: [
    { player_name: 'Player 2', player_game_id: 'GameID456' }
  ]
});
```

#### `get_slot_availability()`
Returns real-time slot availability for a tournament.

#### `update_registration_status()`
Admin-only function to approve/reject registrations.

## 🐛 Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed
- Check TypeScript errors: `npm run type-check`

### Deployment Issues
- Verify environment variables are set in Vercel
- Check build logs for errors
- Ensure Supabase URLs are configured correctly

### Database Issues
- Run migrations in correct order
- Verify RLS policies are enabled
- Check admin user roles in user_roles table

## 📊 Performance Optimizations

- **Code Splitting**: Lazy-loaded routes and components
- **Image Compression**: Automatic client-side image optimization
- **Caching**: TanStack Query with smart cache strategies
- **Bundle Optimization**: Tree-shaking and chunk splitting

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Input Validation**: Zod schemas for all forms
- **File Upload Security**: Type and size validation
- **Admin Authentication**: Role-based access control
- **Audit Logging**: All admin actions logged

## 📱 Mobile Features

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Mobile-friendly interactions
- **Fast Loading**: Optimized for mobile networks
- **Offline Support**: Service worker for caching (planned)

## 🎨 Design System

### Colors
- **Primary**: Electric blue (#3b82f6)
- **Secondary**: Purple (#8b5cf6)
- **Background**: Dark navy (#0a0e27)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

### Typography
- **Font**: Inter / Geist Sans
- **Headings**: Bold, larger sizes with gradients
- **Body**: Regular weight, high contrast
- **Code**: Monospace for IDs and technical content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing BaaS platform
- **Vercel** for seamless deployment
- **shadcn/ui** for beautiful UI components
- **Framer Motion** for smooth animations

---

**Built with ❤️ for the Indian gaming community**

For support, email: ishukriitpatna@gmail.com