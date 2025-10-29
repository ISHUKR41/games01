/**
 * Tournament Card Component
 * File: src/components/shared/TournamentCard.tsx
 * Purpose: Reusable card component to display tournament information
 * 
 * This component shows tournament details including entry fees, prizes,
 * and real-time slot availability for the GameArena platform
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Medal, Target, Users, ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSlotAvailability } from '@/lib/hooks/useSlotAvailability'
import { formatCurrency, getSlotColorClass, getSlotPercentage } from '@/lib/utils'
import { cn } from '@/lib/utils'

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
 * TournamentCard - Displays tournament information with real-time slot availability
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
  // Fetch real-time slot availability
  const { data: slotData, isLoading } = useSlotAvailability(tournamentId)
  
  const filled = slotData?.filled || 0
  const remaining = slotData?.remaining || capacity
  const percentage = getSlotPercentage(filled, capacity)
  
  // Determine if tournament is full
  const isFull = remaining === 0
  
  // Get appropriate colors and styles
  const gameColors = {
    bgmi: 'from-orange-500 to-red-500',
    freefire: 'from-blue-500 to-purple-500'
  }
  
  const modeIcons = {
    solo: Users,
    duo: Users,
    squad: Users
  }
  
  const ModeIcon = modeIcons[mode]

  // Animation variants
  const cardVariants = {
    whileHover: { 
      scale: 1.02, 
      y: -8,
      transition: { type: "spring", stiffness: 300 }
    },
    whileTap: { scale: 0.98 }
  }

  return (
    <motion.div variants={cardVariants} whileHover="whileHover" whileTap="whileTap">
      <Card className={cn(
        "overflow-hidden h-full transition-all duration-300",
        "bg-card/80 backdrop-blur border-2",
        isFull 
          ? "border-red-500/20 bg-red-500/5" 
          : "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      )}>
        {/* Card Header with Game Badge */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ModeIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
            
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-gradient-to-r text-white border-0",
                gameColors[game]
              )}
            >
              {game.toUpperCase()}
            </Badge>
          </div>

          {/* Entry Fee */}
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(entryFee)}
            </div>
            <div className="text-sm text-muted-foreground">
              Entry Fee {mode !== 'solo' ? 'per team' : 'per player'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prize Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Winner</span>
              </div>
              <span className="font-bold text-yellow-500">
                {formatCurrency(winnerPrize)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20">
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Runner-up</span>
              </div>
              <span className="font-bold text-gray-400">
                {formatCurrency(runnerPrize)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Per Kill</span>
              </div>
              <span className="font-bold text-red-500">
                {formatCurrency(perKillPrize)}
              </span>
            </div>
          </div>

          {/* Slot Availability */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Availability</span>
              </div>
              
              {isLoading ? (
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <span className={cn(
                  "text-sm font-bold",
                  getSlotColorClass(remaining, capacity)
                )}>
                  {isFull ? 'FULL' : `${remaining}/${capacity} slots`}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={percentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filled} registered</span>
                <span>{percentage}% filled</span>
              </div>
            </div>

            {/* Status Badge */}
            {isFull ? (
              <Badge variant="destructive" className="w-full justify-center">
                Tournament Full
              </Badge>
            ) : remaining < capacity * 0.2 ? (
              <Badge variant="secondary" className="w-full justify-center bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                Filling Fast - {remaining} slots left!
              </Badge>
            ) : (
              <Badge variant="secondary" className="w-full justify-center bg-green-500/20 text-green-700 border-green-500/30">
                Open for Registration
              </Badge>
            )}
          </div>

          {/* Registration Button */}
          <Button 
            asChild 
            className="w-full" 
            disabled={isFull}
            size="lg"
          >
            <Link to={`/${game}`}>
              {isFull ? (
                'Tournament Full'
              ) : (
                <>
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Link>
          </Button>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground text-center">
            {mode === 'solo' ? (
              `Individual competition • ${capacity} players max`
            ) : (
              `Team competition • ${capacity} teams max • ${mode === 'duo' ? '2' : '4'} players per team`
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}