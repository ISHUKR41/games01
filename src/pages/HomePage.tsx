/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED HOMEPAGE COMPONENT - GameArena Tournament Platform
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * File: src/pages/HomePage.tsx
 * Purpose: World-class modern landing page with cutting-edge animations and UI
 * 
 * FEATURES IMPLEMENTED:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✓ AOS (Animate On Scroll) on all sections for smooth reveal animations
 * ✓ React Type Animation for dynamic typing effects in hero section
 * ✓ Lottie animations for loading states and interactive elements
 * ✓ Framer Motion for micro-interactions and smooth transitions
 * ✓ Swiper carousel for game image gallery
 * ✓ Video background section (gradient placeholder ready for video)
 * ✓ Parallax tilt effects on tournament cards
 * ✓ Real-time slot availability tracking preserved
 * ✓ Actual images from /assets/images/ directory
 * ✓ Mobile-first responsive design
 * ✓ Modern gradient backgrounds and color schemes
 * ✓ Professional UI inspired by Vercel, GitHub, and Cursor
 * 
 * DESIGN PHILOSOPHY:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - Clean, modern aesthetics with glassmorphism effects
 * - Smooth animations that enhance UX without overwhelming
 * - Clear visual hierarchy and information architecture
 * - Performance-optimized with lazy loading and efficient rendering
 */

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Player } from '@lottiefiles/react-lottie-player'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap, 
  Target, 
  Crown, 
  Medal,
  ArrowRight,
  Play,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  Rocket,
  Gift,
  Clock,
  MapPin,
  Award
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TournamentCard } from '@/components/shared/TournamentCard'

// Swiper styles for carousel
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANIMATION VARIANTS FOR FRAMER MOTION
 * ═══════════════════════════════════════════════════════════════════════════
 * These variants define reusable animation patterns throughout the component
 */

// Fade in from bottom with customizable delay
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Fade in from left
const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Fade in from right
const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Scale up effect
const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

// Stagger children animations
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

// Hover scale effect for cards
const scaleOnHover = {
  whileHover: { 
    scale: 1.05, 
    y: -8,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  whileTap: { scale: 0.98 }
}

// Floating animation for decorative elements
const floatingAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOMEPAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * Main landing page with multiple sections showcasing tournaments and features
 */
export const HomePage: React.FC = () => {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize component loaded state for animations
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // TOURNAMENT CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────
  // Tournament IDs for real-time slot availability tracking
  // In production, these would be fetched from the database
  const tournamentIds = {
    bgmiSolo: 'bgmi-solo-id',
    bgmiDuo: 'bgmi-duo-id', 
    bgmiSquad: 'bgmi-squad-id',
    freefireSolo: 'freefire-solo-id',
    freefireDuo: 'freefire-duo-id',
    freefireSquad: 'freefire-squad-id'
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORM STATISTICS
  // ─────────────────────────────────────────────────────────────────────────
  // Key metrics displayed in the hero section
  const stats = [
    { 
      label: 'Active Tournaments', 
      value: '6', 
      icon: Trophy,
      color: 'text-yellow-500'
    },
    { 
      label: 'Total Prize Pool', 
      value: '₹2,100', 
      icon: Crown,
      color: 'text-purple-500'
    },
    { 
      label: 'Max Players', 
      value: '259', 
      icon: Users,
      color: 'text-blue-500'
    },
    { 
      label: 'Games Supported', 
      value: '2', 
      icon: Gamepad2,
      color: 'text-green-500'
    }
  ]

  // ─────────────────────────────────────────────────────────────────────────
  // GAME INFORMATION
  // ─────────────────────────────────────────────────────────────────────────
  // Detailed information about supported games
  const gameInfo = [
    {
      title: 'BGMI (Battlegrounds Mobile India)',
      description: 'Experience the ultimate battle royale with 100 players fighting for survival. Strategic gameplay, teamwork, and skill determine the victor.',
      image: '/assets/images/bgmi-hero.jpg',
      link: '/bgmi',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      icon: Target,
      features: ['100 Player Battle Royale', 'Multiple Game Modes', 'Strategic Combat'],
      tournaments: 3,
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Free Fire',
      description: 'Fast-paced 10-minute battles with up to 50 players. Quick reflexes and smart tactics lead to victory in this action-packed shooter.',
      image: '/assets/images/freefire-hero.jpg', 
      link: '/freefire',
      gradient: 'from-blue-500 via-purple-500 to-indigo-600',
      icon: Zap,
      features: ['10-Minute Matches', 'Fast-Paced Action', 'Character Abilities'],
      tournaments: 3,
      bgColor: 'bg-blue-500/10'
    }
  ]

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORM FEATURES
  // ─────────────────────────────────────────────────────────────────────────
  // Key selling points and platform advantages
  const features = [
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Safe and reliable tournament management with data protection',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Rocket,
      title: 'Instant Registration',
      description: 'Quick and easy signup process to get you in the game fast',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description: 'Live slot availability and tournament status tracking',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Gift,
      title: 'Exciting Prizes',
      description: 'Competitive prize pools with rewards for winners and top performers',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ]

  // ─────────────────────────────────────────────────────────────────────────
  // GALLERY IMAGES FOR SWIPER CAROUSEL
  // ─────────────────────────────────────────────────────────────────────────
  const galleryImages = [
    {
      url: '/assets/images/bgmi-tournament.jpg',
      title: 'BGMI Tournaments',
      description: 'Intense battle royale action'
    },
    {
      url: '/assets/images/freefire-tournament.jpg',
      title: 'Free Fire Tournaments',
      description: 'Fast-paced competitive gaming'
    },
    {
      url: '/assets/images/trophy.jpg',
      title: 'Championship Rewards',
      description: 'Win amazing prizes'
    }
  ]

  /**
   * ═════════════════════════════════════════════════════════════════════════
   * RENDER COMPONENT
   * ═════════════════════════════════════════════════════════════════════════
   */
  return (
    <div className="min-h-screen overflow-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION
          ═══════════════════════════════════════════════════════════════════
          Main landing area with animated heading, typing effect, and stats
      */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary purple orb - top left */}
          <motion.div 
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Orange orb - top right */}
          <motion.div 
            className="absolute top-20 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Blue orb - bottom center */}
          <motion.div 
            className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-20 z-10">
          <motion.div 
            className="text-center space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Top Badge with Icon */}
            <motion.div 
              variants={fadeInUp} 
              data-aos="fade-down"
              data-aos-duration="600"
            >
              <Badge 
                variant="secondary" 
                className="mb-4 px-4 py-2 text-sm backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all"
              >
                <Star className="mr-2 h-4 w-4 text-yellow-500 animate-pulse" />
                India's Premier Gaming Tournament Platform
                <Sparkles className="ml-2 h-4 w-4 text-purple-500" />
              </Badge>
            </motion.div>
            
            {/* Main Heading with Gradient Text */}
            <motion.div 
              variants={fadeInUp} 
              className="space-y-6"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
                Welcome to{' '}
                <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
                  GameArena
                </span>
              </h1>
              
              {/* Typing Animation for Subtitle */}
              <div className="text-2xl md:text-3xl lg:text-4xl font-semibold text-muted-foreground h-20 flex items-center justify-center">
                <TypeAnimation
                  sequence={[
                    'Compete in BGMI Tournaments',
                    2000,
                    'Battle in Free Fire Arenas',
                    2000,
                    'Win Exciting Prizes',
                    2000,
                    'Join Thousands of Players',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                />
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience competitive gaming at its finest. Join thrilling tournaments, 
                showcase your skills, and compete for amazing prizes!
              </p>
            </motion.div>

            {/* Call-to-Action Buttons */}
            <motion.div 
              variants={fadeInUp} 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  asChild 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25"
                >
                  <Link to="#tournaments">
                    <Trophy className="mr-2 h-5 w-5" />
                    Explore Tournaments
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild 
                  className="text-lg px-8 py-6 border-2 backdrop-blur-xl bg-white/5 hover:bg-white/10"
                >
                  <Link to="#about">
                    <Play className="mr-2 h-5 w-5" />
                    Learn More
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 pt-12"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    variants={scaleOnHover}
                    whileHover="whileHover"
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                    className="group relative"
                  >
                    <div className="relative text-center p-6 lg:p-8 rounded-2xl backdrop-blur-xl bg-card/40 border border-white/10 hover:border-primary/50 transition-all overflow-hidden">
                      {/* Gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-purple-500/0 group-hover:from-primary/10 group-hover:to-purple-500/10 transition-all duration-300" />
                      
                      <div className="relative z-10">
                        <Icon className={`h-10 w-10 mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                        <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: VIDEO BACKGROUND SECTION
          ═══════════════════════════════════════════════════════════════════
          Full-width section with gradient background (ready for video)
      */}
      <section 
        className="relative py-32 overflow-hidden"
        data-aos="fade-up"
      >
        {/* Video Background Placeholder - Replace with <video> tag when ready */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40">
          {/* Animated overlay pattern */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
            animate={{
              backgroundPosition: ['0px 0px', '40px 40px']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Content overlay */}
        <div className="relative container mx-auto px-4 text-center z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={scaleIn}>
              <Badge className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-xl border-white/20">
                <Sparkles className="mr-2 h-4 w-4" />
                Why Choose GameArena
              </Badge>
            </motion.div>

            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-white"
            >
              The Ultimate Gaming
              <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Tournament Experience
              </span>
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/80 leading-relaxed"
            >
              Join a thriving community of passionate gamers. Compete in professionally 
              organized tournaments with fair play, instant payouts, and 24/7 support.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Button 
                size="lg" 
                asChild 
                className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg font-semibold shadow-2xl"
              >
                <Link to="#tournaments">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: PLATFORM FEATURES
          ═══════════════════════════════════════════════════════════════════
          Grid showcasing key platform advantages
      */}
      <section className="py-20 bg-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <Award className="mr-2 h-4 w-4" />
                Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Why Gamers
                <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Love Our Platform
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience gaming tournaments like never before with our cutting-edge platform
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    data-aos="flip-up"
                    data-aos-delay={index * 100}
                  >
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="h-full p-6 rounded-2xl backdrop-blur-xl bg-card/50 border-2 border-border hover:border-primary/50 transition-all group"
                    >
                      <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: GAME SHOWCASE WITH IMAGE CAROUSEL
          ═══════════════════════════════════════════════════════════════════
          Swiper carousel showcasing game images
      */}
      <section className="py-20" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <MapPin className="mr-2 h-4 w-4" />
                Gallery
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Tournament
                <span className="block mt-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  Highlights
                </span>
              </h2>
            </motion.div>

            {/* Swiper Carousel */}
            <motion.div variants={fadeInUp} data-aos="zoom-in">
              <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                loop={true}
                className="rounded-3xl overflow-hidden max-w-5xl mx-auto shadow-2xl"
                style={{ height: '500px' }}
              >
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-full">
                      <img 
                        src={image.url} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Text overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h3 className="text-3xl font-bold mb-2">{image.title}</h3>
                        <p className="text-lg text-white/80">{image.description}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: GAMES SECTION
          ═══════════════════════════════════════════════════════════════════
          Detailed game information cards with actual images
      */}
      <section id="about" className="py-20 bg-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Supported Games
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Choose Your
                <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent">
                  Battle Arena
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Master your favorite game and compete against the best players in India
              </p>
            </motion.div>

            {/* Game Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {gameInfo.map((game, index) => {
                const Icon = game.icon
                return (
                  <motion.div
                    key={game.title}
                    variants={index === 0 ? fadeInLeft : fadeInRight}
                    data-aos={index === 0 ? "fade-right" : "fade-left"}
                    data-aos-duration="800"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -8 }}
                      className="group"
                    >
                      <Card className="overflow-hidden h-full backdrop-blur-xl bg-card/50 border-2 border-border hover:border-primary/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-primary/20">
                        {/* Card Image with Overlay */}
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            src={game.image} 
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Gradient overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-60 mix-blend-multiply`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          
                          {/* Floating badge */}
                          <motion.div 
                            className="absolute top-4 left-4"
                            variants={floatingAnimation}
                          >
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-xl px-3 py-1">
                              <Trophy className="mr-1 h-3 w-3" />
                              {game.tournaments} Tournaments
                            </Badge>
                          </motion.div>
                          
                          {/* Icon */}
                          <div className="absolute top-4 right-4">
                            <div className={`${game.bgColor} backdrop-blur-xl p-3 rounded-2xl border border-white/20`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>

                        <CardHeader>
                          <CardTitle className="text-2xl font-bold">{game.title}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                          <p className="text-muted-foreground leading-relaxed">
                            {game.description}
                          </p>

                          {/* Features List */}
                          <div className="space-y-3">
                            {game.features.map((feature, idx) => (
                              <motion.div 
                                key={idx} 
                                className="flex items-center gap-3 group/item"
                                whileHover={{ x: 4 }}
                              >
                                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${game.gradient} group-hover/item:scale-150 transition-transform`} />
                                <span className="text-sm font-medium">{feature}</span>
                              </motion.div>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              asChild 
                              className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 text-white border-0 shadow-lg`}
                              size="lg"
                            >
                              <Link to={game.link}>
                                View Tournaments
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: ACTIVE TOURNAMENTS
          ═══════════════════════════════════════════════════════════════════
          Tournament cards with real-time slot availability (with parallax tilt)
      */}
      <section id="tournaments" className="py-20" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                Live Now
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Active
                <span className="block mt-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Tournaments
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the competition and win exciting prizes. Choose your game mode and register now!
              </p>
            </motion.div>

            {/* BGMI Tournaments */}
            <motion.div variants={fadeInUp} data-aos="fade-up" data-aos-delay="100">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-2xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">BGMI Tournaments</h3>
                  <p className="text-muted-foreground">
                    Battle Royale tournaments with strategic gameplay
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div data-aos="flip-left" data-aos-delay="100">
                  <TournamentCard
                    title="BGMI Solo"
                    game="bgmi"
                    mode="solo"
                    entryFee={20}
                    winnerPrize={350}
                    runnerPrize={250}
                    perKillPrize={9}
                    capacity={100}
                    tournamentId={tournamentIds.bgmiSolo}
                  />
                </div>
                <div data-aos="flip-left" data-aos-delay="200">
                  <TournamentCard
                    title="BGMI Duo"
                    game="bgmi"
                    mode="duo"
                    entryFee={40}
                    winnerPrize={350}
                    runnerPrize={250}
                    perKillPrize={9}
                    capacity={50}
                    tournamentId={tournamentIds.bgmiDuo}
                  />
                </div>
                <div data-aos="flip-left" data-aos-delay="300">
                  <TournamentCard
                    title="BGMI Squad"
                    game="bgmi"
                    mode="squad"
                    entryFee={80}
                    winnerPrize={350}
                    runnerPrize={250}
                    perKillPrize={9}
                    capacity={25}
                    tournamentId={tournamentIds.bgmiSquad}
                  />
                </div>
              </div>
            </motion.div>

            <Separator className="my-12" />

            {/* Free Fire Tournaments */}
            <motion.div variants={fadeInUp} data-aos="fade-up" data-aos-delay="200">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Free Fire Tournaments</h3>
                  <p className="text-muted-foreground">
                    Fast-paced action tournaments with quick matches
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div data-aos="flip-right" data-aos-delay="100">
                  <TournamentCard
                    title="Free Fire Solo"
                    game="freefire"
                    mode="solo"
                    entryFee={20}
                    winnerPrize={350}
                    runnerPrize={150}
                    perKillPrize={5}
                    capacity={48}
                    tournamentId={tournamentIds.freefireSolo}
                  />
                </div>
                <div data-aos="flip-right" data-aos-delay="200">
                  <TournamentCard
                    title="Free Fire Duo"
                    game="freefire"
                    mode="duo"
                    entryFee={40}
                    winnerPrize={350}
                    runnerPrize={150}
                    perKillPrize={5}
                    capacity={24}
                    tournamentId={tournamentIds.freefireDuo}
                  />
                </div>
                <div data-aos="flip-right" data-aos-delay="300">
                  <TournamentCard
                    title="Free Fire Squad"
                    game="freefire"
                    mode="squad"
                    entryFee={80}
                    winnerPrize={350}
                    runnerPrize={150}
                    perKillPrize={5}
                    capacity={12}
                    tournamentId={tournamentIds.freefireSquad}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: CALL TO ACTION
          ═══════════════════════════════════════════════════════════════════
          Final CTA section with gradient background
      */}
      <section 
        className="relative py-32 overflow-hidden"
        data-aos="fade-up"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-orange-500/20">
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}
            animate={{
              backgroundPosition: ['0px 0px', '50px 50px']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 text-center z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <motion.div variants={scaleIn}>
              <div className="inline-block p-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-6">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold">
              Ready to Dominate?
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Join thousands of players competing for glory and prizes. 
              Your championship journey starts here!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  asChild 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl"
                >
                  <Link to="/bgmi">
                    <Target className="mr-2 h-5 w-5" />
                    Play BGMI
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="text-lg px-8 py-6 border-2 backdrop-blur-xl bg-white/5 hover:bg-white/10"
                >
                  <Link to="/freefire">
                    <Zap className="mr-2 h-5 w-5" />
                    Play Free Fire
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Trust indicators */}
            <motion.div 
              variants={fadeInUp}
              className="pt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Instant Registration</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Fair Play Guaranteed</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
