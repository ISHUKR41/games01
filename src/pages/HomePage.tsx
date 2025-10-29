/**
 * HomePage Component
 * File: src/pages/HomePage.tsx
 * Purpose: Main landing page for the GameArena tournament platform
 * 
 * This page provides an overview of all tournaments, game information,
 * and serves as the entry point for users to explore BGMI and Free Fire tournaments
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { TournamentCard } from '@/components/shared/TournamentCard'
import { useSlotAvailability } from '@/lib/hooks/useSlotAvailability'

// Animation variants for framer motion
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.05, y: -5 },
  whileTap: { scale: 0.95 }
}

/**
 * HomePage - Main landing page component
 */
export const HomePage: React.FC = () => {
  // Tournament IDs for fetching real-time slot availability
  // These would be fetched from the database in a real implementation
  const tournamentIds = {
    bgmiSolo: 'bgmi-solo-id',
    bgmiDuo: 'bgmi-duo-id', 
    bgmiSquad: 'bgmi-squad-id',
    freefireSolo: 'freefire-solo-id',
    freefireDuo: 'freefire-duo-id',
    freefireSquad: 'freefire-squad-id'
  }

  // Game information sections
  const gameInfo = [
    {
      title: 'BGMI (Battlegrounds Mobile India)',
      description: 'Experience the ultimate battle royale with 100 players fighting for survival. Strategic gameplay, teamwork, and skill determine the victor.',
      image: '/assets/images/bgmi-hero.jpg',
      link: '/bgmi',
      color: 'from-orange-500 to-red-600',
      icon: Target,
      features: ['100 Player Battle Royale', 'Multiple Game Modes', 'Strategic Combat'],
      tournaments: 3
    },
    {
      title: 'Free Fire',
      description: 'Fast-paced 10-minute battles with up to 50 players. Quick reflexes and smart tactics lead to victory in this action-packed shooter.',
      image: '/assets/images/freefire-hero.jpg', 
      link: '/freefire',
      color: 'from-blue-500 to-purple-600',
      icon: Zap,
      features: ['10-Minute Matches', 'Fast-Paced Action', 'Character Abilities'],
      tournaments: 3
    }
  ]

  // Statistics for the platform
  const stats = [
    { label: 'Active Tournaments', value: '6', icon: Trophy },
    { label: 'Total Prize Pool', value: '₹2,100', icon: Crown },
    { label: 'Max Players', value: '259', icon: Users },
    { label: 'Games Supported', value: '2', icon: Gamepad2 }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            className="text-center space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Main Heading */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <Star className="mr-1 h-3 w-3" />
                India's Premier Tournament Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent">
                  GameArena
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Compete in thrilling BGMI and Free Fire tournaments. 
                Join thousands of players and win exciting prizes!
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link to="#tournaments">
                  <Trophy className="mr-2 h-5 w-5" />
                  Explore Tournaments
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild className="text-lg">
                <Link to="#about">
                  <Play className="mr-2 h-5 w-5" />
                  Learn More
                </Link>
              </Button>
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    variants={scaleOnHover}
                    className="text-center p-6 rounded-lg bg-card/50 backdrop-blur border"
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section id="about" className="py-20 bg-muted/30">
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
              <h2 className="text-3xl md:text-5xl font-bold">
                Choose Your
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {' '}Battle Arena
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
                    variants={fadeInUp}
                    custom={index}
                  >
                    <motion.div variants={scaleOnHover}>
                      <Card className="overflow-hidden h-full bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all">
                        {/* Card Image */}
                        <div className={`h-48 bg-gradient-to-br ${game.color} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="absolute bottom-4 left-4">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                              {game.tournaments} Tournaments
                            </Badge>
                          </div>
                          <Icon className="absolute top-4 right-4 h-8 w-8 text-white" />
                        </div>

                        <CardHeader>
                          <CardTitle className="text-2xl">{game.title}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {game.description}
                          </p>

                          {/* Features */}
                          <div className="space-y-2">
                            {game.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button asChild className="w-full">
                            <Link to={game.link}>
                              View Tournaments
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
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

      {/* Tournaments Section */}
      <section id="tournaments" className="py-20">
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
              <h2 className="text-3xl md:text-5xl font-bold">
                Active{' '}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Tournaments
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the competition and win exciting prizes. Choose your game mode and register now!
              </p>
            </motion.div>

            {/* BGMI Tournaments */}
            <motion.div variants={fadeInUp}>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-6 w-6 text-orange-500" />
                  BGMI Tournaments
                </h3>
                <p className="text-muted-foreground">
                  Battle Royale tournaments with strategic gameplay
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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
            </motion.div>

            <Separator />

            {/* Free Fire Tournaments */}
            <motion.div variants={fadeInUp}>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-blue-500" />
                  Free Fire Tournaments
                </h3>
                <p className="text-muted-foreground">
                  Fast-paced action tournaments with quick matches
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-purple-500/10 to-orange-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Compete?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of players and start your journey to becoming a champion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/bgmi">
                  <Target className="mr-2 h-5 w-5" />
                  Play BGMI
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/freefire">
                  <Zap className="mr-2 h-5 w-5" />
                  Play Free Fire
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}