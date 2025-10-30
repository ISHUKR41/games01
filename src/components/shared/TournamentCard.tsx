/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOURNAMENT CARD COMPONENT - Enhanced with Parallax Tilt
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * File: src/components/shared/TournamentCard.tsx
 * Purpose: Reusable card component with 3D tilt effect for tournaments
 * 
 * FEATURES:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✓ React Parallax Tilt for interactive 3D hover effects
 * ✓ Real-time slot availability tracking with live updates
 * ✓ Responsive design with mobile-friendly layout
 * ✓ Animated prize information with color-coded badges
 * ✓ Progress bar showing registration status
 * ✓ Dynamic styling based on tournament availability
 * ✓ Smooth transitions and micro-interactions
 * 
 * This component displays comprehensive tournament information including:
 * - Entry fees and prize distribution
 * - Real-time slot availability
 * - Game mode and capacity information
 * - Registration status and call-to-action
 */

import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import confetti from 'canvas-confetti'
import { Trophy, Medal, Target, Users, ArrowRight, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSlotAvailability } from '@/lib/hooks/useSlotAvailability'
import { formatCurrency, getSlotColorClass, getSlotPercentage } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * ─────────────────────────────────────────────────────────────────────────
 * COMPONENT PROPS INTERFACE
 * ─────────────────────────────────────────────────────────────────────────
 */
interface TournamentCardProps {
  title: string
  game: 'bgmi' | 'freefire'
  mode: 'solo' | 'duo' | 'squad'
  entryFee: number
  winnerPrize: number
  runnerPrize: number
  perKillPrize: number
  capacity: number
  tournamentId: string
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOURNAMENT CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Displays tournament information in an interactive card with 3D tilt effect
 * and real-time slot availability updates
 */
export const TournamentCard: React.FC<TournamentCardProps> = ({
  title,
  game,
  mode,
  entryFee,
  winnerPrize,
  runnerPrize,
  perKillPrize,
  capacity,
  tournamentId
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // REAL-TIME DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────
  // Fetch live slot availability from the database
  const { data: slotData, isLoading } = useSlotAvailability(tournamentId)
  
  const filled = slotData?.filled || 0
  const remaining = slotData?.remaining || capacity
  const percentage = getSlotPercentage(filled, capacity)
  
  // Determine tournament availability status
  const isFull = remaining === 0
  const isFillingFast = remaining < capacity * 0.2 && remaining > 0
  
  // Track previous filled count to detect new registrations
  const prevFilledRef = useRef(filled)
  
  // ─────────────────────────────────────────────────────────────────────────
  // CONFETTI EFFECT ON NEW REGISTRATION
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Check if slots filled increased (new registration)
    if (filled > prevFilledRef.current && filled > 0) {
      // Trigger confetti animation
      const gameColors = game === 'bgmi' 
        ? ['#f97316', '#dc2626', '#ec4899'] 
        : ['#3b82f6', '#8b5cf6', '#6366f1']
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: gameColors,
        ticks: 100,
        gravity: 1.2,
        scalar: 1.2
      })
    }
    
    // Update previous filled count
    prevFilledRef.current = filled
  }, [filled, game])
  
  // ─────────────────────────────────────────────────────────────────────────
  // STYLING CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────
  
  // Game-specific gradient colors
  const gameGradients = {
    bgmi: 'from-orange-500 via-red-500 to-pink-600',
    freefire: 'from-blue-500 via-purple-500 to-indigo-600'
  }
  
  // Game-specific background colors
  const gameBgColors = {
    bgmi: 'bg-orange-500/5',
    freefire: 'bg-blue-500/5'
  }
  
  // Mode icons (all use Users icon, could be customized per mode)
  const modeIcons = {
    solo: Users,
    duo: Users,
    squad: Users
  }
  
  const ModeIcon = modeIcons[mode]

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION VARIANTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Card hover animation for framer-motion
  const cardVariants = {
    whileHover: { 
      y: -4,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  }

  /**
   * ═════════════════════════════════════════════════════════════════════════
   * RENDER COMPONENT
   * ═════════════════════════════════════════════════════════════════════════
   */
  return (
    // Parallax Tilt Container - Creates 3D perspective effect on hover
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      perspective={1000}
      scale={1.02}
      transitionSpeed={2000}
      gyroscope={true}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#ffffff"
      glarePosition="all"
      className="h-full"
    >
      <motion.div 
        variants={cardVariants} 
        whileHover="whileHover"
        className="h-full"
      >
        <Card className={cn(
          "overflow-hidden h-full transition-all duration-300",
          "backdrop-blur-xl bg-card/80 border-2",
          isFull 
            ? "border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/10" 
            : "border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
          gameBgColors[game]
        )}>
          
          {/* ═══════════════════════════════════════════════════════════════
              CARD HEADER
              ═══════════════════════════════════════════════════════════════
              Title, game badge, and entry fee display
          */}
          <CardHeader className="pb-4 space-y-4">
            {/* Title Row with Icon and Game Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${gameGradients[game]}`}>
                  <ModeIcon className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
              </div>
              
              {/* Game Badge with Gradient */}
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-gradient-to-r text-white border-0 shadow-lg",
                  gameGradients[game]
                )}
              >
                {game.toUpperCase()}
              </Badge>
            </div>

            {/* Entry Fee Display - Prominent Center Section */}
            <div className="text-center py-3 px-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <div className="text-4xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {formatCurrency(entryFee)}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                Entry Fee {mode !== 'solo' ? 'per team' : 'per player'}
              </div>
            </div>
          </CardHeader>

          {/* ═══════════════════════════════════════════════════════════════
              CARD CONTENT
              ═══════════════════════════════════════════════════════════════
              Prize information, slot availability, and registration button
          */}
          <CardContent className="space-y-5">
            
            {/* Prize Distribution Section */}
            <div className="space-y-3">
              {/* Winner Prize */}
              <motion.div 
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Winner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-yellow-600 dark:text-yellow-500 text-lg">
                    {formatCurrency(winnerPrize)}
                  </span>
                  <Sparkles className="h-4 w-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>

              {/* Runner-up Prize */}
              <motion.div 
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-2 border-gray-400/20 hover:border-gray-400/40 transition-all group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500">
                    <Medal className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Runner-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-600 dark:text-gray-400 text-lg">
                    {formatCurrency(runnerPrize)}
                  </span>
                  <Sparkles className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>

              {/* Per Kill Prize */}
              <motion.div 
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border-2 border-red-500/20 hover:border-red-500/40 transition-all group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Per Kill</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-red-600 dark:text-red-500 text-lg">
                    {formatCurrency(perKillPrize)}
                  </span>
                  <Sparkles className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </div>

            {/* Slot Availability Section */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
              {/* Availability Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Slot Availability</span>
                </div>
                
                {/* Loading State or Slot Count */}
                {isLoading ? (
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                ) : (
                  <span className={cn(
                    "text-sm font-bold px-2 py-1 rounded",
                    getSlotColorClass(remaining, capacity)
                  )}>
                    {isFull ? 'FULL' : `${remaining}/${capacity}`}
                  </span>
                )}
              </div>

              {/* Progress Bar Visualization */}
              <div className="space-y-2">
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-2.5 transition-all",
                    isFull && "bg-red-500/20"
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>{filled} registered</span>
                  <span>{percentage}% filled</span>
                </div>
              </div>

              {/* Status Badge */}
              {isFull ? (
                <Badge variant="destructive" className="w-full justify-center py-2 font-semibold">
                  🔴 Tournament Full
                </Badge>
              ) : isFillingFast ? (
                <Badge className="w-full justify-center py-2 bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 border-yellow-500/30 font-semibold hover:bg-yellow-500/30">
                  ⚡ Filling Fast - {remaining} slots left!
                </Badge>
              ) : (
                <Badge className="w-full justify-center py-2 bg-green-500/20 text-green-700 dark:text-green-500 border-green-500/30 font-semibold hover:bg-green-500/30">
                  ✅ Open for Registration
                </Badge>
              )}
            </div>

            {/* Registration Call-to-Action Button */}
            <motion.div
              whileHover={{ scale: isFull ? 1 : 1.02 }}
              whileTap={{ scale: isFull ? 1 : 0.98 }}
              onClick={() => {
                // Trigger mini confetti on button click
                if (!isFull) {
                  const gameColors = game === 'bgmi' 
                    ? ['#f97316', '#dc2626'] 
                    : ['#3b82f6', '#8b5cf6']
                  
                  confetti({
                    particleCount: 20,
                    spread: 40,
                    origin: { y: 0.7 },
                    colors: gameColors,
                    ticks: 60
                  })
                }
              }}
            >
              <Button 
                asChild 
                className={cn(
                  "w-full font-bold shadow-lg transition-all",
                  !isFull && `bg-gradient-to-r ${gameGradients[game]} hover:opacity-90 border-0 text-white`
                )}
                disabled={isFull}
                size="lg"
              >
                <Link to={`/${game}`}>
                  {isFull ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Tournament Full
                    </>
                  ) : (
                    <>
                      Register Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Link>
              </Button>
            </motion.div>

            {/* Additional Tournament Information */}
            <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border/50">
              {mode === 'solo' ? (
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>Individual competition • {capacity} players max</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>
                    Team competition • {capacity} teams max • {mode === 'duo' ? '2' : '4'} players per team
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Tilt>
  )
}
