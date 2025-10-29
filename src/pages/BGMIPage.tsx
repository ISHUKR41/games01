/**
 * BGMI Tournament Page
 * File: src/pages/BGMIPage.tsx
 * Purpose: Main page for BGMI tournaments with Solo, Duo, and Squad modes
 * 
 * This page provides information about BGMI tournaments and hosts the
 * registration forms for all three game modes
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Target, Users, Trophy, Crown, Zap, Shield, Gamepad2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BGMISoloForm } from '@/components/forms/bgmi/SoloForm'
import { BGMIDuoForm } from '@/components/forms/bgmi/DuoForm'
import { BGMISquadForm } from '@/components/forms/bgmi/SquadForm'

// Animation variants
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

/**
 * BGMIPage - Main BGMI tournaments page with tabbed interface
 */
export const BGMIPage: React.FC = () => {
  // Tournament information
  const tournamentInfo = {
    solo: {
      capacity: 100,
      entryFee: 20,
      winnerPrize: 350,
      runnerPrize: 250,
      killPrize: 9
    },
    duo: {
      capacity: 50,
      entryFee: 40,
      winnerPrize: 350,
      runnerPrize: 250,
      killPrize: 9
    },
    squad: {
      capacity: 25,
      entryFee: 80,
      winnerPrize: 350,
      runnerPrize: 250,
      killPrize: 9
    }
  }

  // Game rules and features
  const gameRules = [
    {
      title: 'Battle Royale Mode',
      description: 'Classic 100-player battle royale with shrinking play zone',
      icon: Target
    },
    {
      title: 'Strategic Gameplay', 
      description: 'Use tactics, positioning, and teamwork to survive',
      icon: Shield
    },
    {
      title: 'Multiple Weapons',
      description: 'Wide variety of weapons and attachments to master',
      icon: Zap
    },
    {
      title: 'Team Communication',
      description: 'Coordinate with your team for victory',
      icon: Users
    }
  ]

  const prizeStructure = [
    {
      position: '1st Place',
      prize: '₹350',
      icon: Crown,
      color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    },
    {
      position: '2nd Place', 
      prize: '₹250',
      icon: Trophy,
      color: 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    },
    {
      position: 'Per Kill',
      prize: '₹9',
      icon: Target,
      color: 'text-red-500 bg-red-500/10 border-red-500/20'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-red-500/10 to-background">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-red-500/30 to-orange-600/30 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            {/* Page Header */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                <Target className="mr-1 h-3 w-3" />
                Battle Royale Tournament
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold">
                BGMI
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  {' '}Tournaments
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join intense 100-player battle royale tournaments. Master strategy, survival, and teamwork to claim victory and prizes.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur border">
                <div className="text-2xl font-bold text-orange-500">3</div>
                <div className="text-sm text-muted-foreground">Game Modes</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur border">
                <div className="text-2xl font-bold text-orange-500">175</div>
                <div className="text-sm text-muted-foreground">Total Slots</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur border">
                <div className="text-2xl font-bold text-orange-500">₹350</div>
                <div className="text-sm text-muted-foreground">Winner Prize</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur border">
                <div className="text-2xl font-bold text-orange-500">₹9</div>
                <div className="text-sm text-muted-foreground">Per Kill</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Game Information */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Game Rules */}
            <motion.div variants={fadeInUp} className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Game Rules &{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    Features
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Master these key elements to dominate the battleground
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gameRules.map((rule, index) => {
                  const Icon = rule.icon
                  return (
                    <motion.div
                      key={rule.title}
                      variants={fadeInUp}
                      custom={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="text-center p-6 rounded-lg bg-card/50 backdrop-blur border hover:border-orange-500/50 transition-all"
                    >
                      <Icon className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                      <h3 className="font-semibold text-lg mb-2">{rule.title}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Prize Structure */}
            <motion.div variants={fadeInUp} className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Prize{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    Structure
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Rewards for champions and skilled players
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {prizeStructure.map((prize, index) => {
                  const Icon = prize.icon
                  return (
                    <motion.div
                      key={prize.position}
                      variants={fadeInUp}
                      custom={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-6 rounded-lg border ${prize.color} backdrop-blur`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-3" />
                      <div className="text-lg font-semibold mb-1">{prize.position}</div>
                      <div className="text-2xl font-bold">{prize.prize}</div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tournament Registration */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Tournament{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Registration
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Choose your preferred game mode and register now
              </p>
            </div>

            {/* Tournament Tabs */}
            <Tabs defaultValue="solo" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="solo" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Solo
                </TabsTrigger>
                <TabsTrigger value="duo" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Duo
                </TabsTrigger>
                <TabsTrigger value="squad" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Squad
                </TabsTrigger>
              </TabsList>

              {/* Solo Tournament */}
              <TabsContent value="solo" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-orange-500" />
                      BGMI Solo Tournament
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BGMISoloForm />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Duo Tournament */}
              <TabsContent value="duo" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      BGMI Duo Tournament
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BGMIDuoForm />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Squad Tournament */}
              <TabsContent value="squad" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      BGMI Squad Tournament
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BGMISquadForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default BGMIPage