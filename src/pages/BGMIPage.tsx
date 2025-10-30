/**
 * BGMI Tournament Page - Enhanced Version
 * File: src/pages/BGMIPage.tsx
 * Purpose: Modern, feature-rich BGMI tournament page with real-time slot tracking
 * 
 * Features:
 * - Hero section with tournament image and gradient effects
 * - AOS (Animate On Scroll) animations for smooth user experience
 * - Real-time slot availability tracking with progress bars
 * - Expandable rules & regulations accordion
 * - Tournament mode cards with parallax tilt effects
 * - Prize breakdown with trophy icons
 * - Step-by-step "How to Play" guide
 * - Glassmorphism and modern gradients throughout
 * - Fully responsive design for all devices
 * - Quick navigation to registration forms
 */

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { 
  Target, Users, Trophy, Crown, Zap, Shield, Gamepad2, 
  ArrowRight, CheckCircle2, AlertCircle, Clock, Award,
  ChevronRight, DollarSign, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BGMISoloForm } from '@/components/forms/bgmi/SoloForm'
import { BGMIDuoForm } from '@/components/forms/bgmi/DuoForm'
import { BGMISquadForm } from '@/components/forms/bgmi/SquadForm'
import { useSlotAvailability } from '@/lib/hooks/useSlotAvailability'

/**
 * Animation variants for smooth entrance effects
 */
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
 * BGMIPage Component
 * Main tournament page with comprehensive information and registration
 */
export const BGMIPage: React.FC = () => {
  // Refs for smooth scrolling to registration sections
  const registrationRef = useRef<HTMLDivElement>(null)
  
  // Scroll to registration section when user clicks quick action button
  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /**
   * Tournament Configuration
   * Defines capacity, fees, and prizes for each game mode
   * Tournament IDs match the database seed data UUIDs
   */
  const tournamentInfo = {
    solo: {
      id: '10000000-0000-4000-8000-000000000001',
      capacity: 100,
      entryFee: 20,
      winnerPrize: 350,
      runnerPrize: 250,
      killPrize: 9,
      icon: Target,
      color: 'orange'
    },
    duo: {
      id: '10000000-0000-4000-8000-000000000002',
      capacity: 50,
      entryFee: 40,
      winnerPrize: 350,
      runnerPrize: 250,
      killPrize: 9,
      icon: Users,
      color: 'red'
    },
    squad: {
      id: '10000000-0000-4000-8000-000000000003',
      capacity: 25,
      entryFee: 80,
      winnerPrize: 350,
      runnerPrize: 250,
      killPrize: 9,
      icon: Shield,
      color: 'amber'
    }
  }

  // Fetch real-time slot availability for all modes
  const soloSlots = useSlotAvailability(tournamentInfo.solo.id)
  const duoSlots = useSlotAvailability(tournamentInfo.duo.id)
  const squadSlots = useSlotAvailability(tournamentInfo.squad.id)

  /**
   * How to Play Steps
   * Step-by-step guide for tournament participation
   */
  const howToPlaySteps = [
    {
      step: 1,
      title: 'Choose Your Mode',
      description: 'Select from Solo, Duo, or Squad tournament based on your preference',
      icon: Target
    },
    {
      step: 2,
      title: 'Register & Pay',
      description: 'Fill the registration form and pay the entry fee via UPI or other methods',
      icon: DollarSign
    },
    {
      step: 3,
      title: 'Receive Room Details',
      description: 'Get room ID and password via WhatsApp 30 minutes before match starts',
      icon: Clock
    },
    {
      step: 4,
      title: 'Join & Compete',
      description: 'Enter the room, compete with skill, and aim for the top position',
      icon: Gamepad2
    },
    {
      step: 5,
      title: 'Win Prizes',
      description: 'Top players receive instant prize money based on rank and kills',
      icon: Trophy
    }
  ]

  /**
   * Tournament Rules & Regulations
   * Expandable accordion with detailed rules
   */
  const tournamentRules = [
    {
      id: 'general',
      title: 'General Rules',
      content: [
        'All players must register before the tournament deadline',
        'Entry fees are non-refundable once paid',
        'Players must join the room 10 minutes before match time',
        'Late entries will not be allowed after room is full',
        'All participants must follow fair play guidelines'
      ]
    },
    {
      id: 'gameplay',
      title: 'Gameplay Guidelines',
      content: [
        'No hacking, modding, or use of unauthorized third-party apps',
        'Teaming in solo mode is strictly prohibited',
        'Players must record gameplay for proof if requested',
        'Any form of cheating will result in immediate disqualification',
        'Admin decisions are final in case of disputes'
      ]
    },
    {
      id: 'prizes',
      title: 'Prize Distribution',
      content: [
        'Winners will be announced immediately after match ends',
        'Prize money will be transferred within 24-48 hours',
        'Players must provide valid UPI ID for prize transfer',
        'Kill points are awarded as per final kill count',
        'Prizes are subject to verification of fair gameplay'
      ]
    },
    {
      id: 'conduct',
      title: 'Code of Conduct',
      content: [
        'Respect all players and tournament organizers',
        'No abusive language or toxic behavior',
        'Follow all communication via official WhatsApp group',
        'Report any suspicious activity to admins immediately',
        'Violation of conduct may lead to permanent ban'
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* ===================================
          HERO SECTION WITH IMAGE
          Features: Tournament image, gradient overlay, quick stats
          =================================== */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/attached_assets/stock_images/bgmi_battlegrounds_m_f949e56a.jpg" 
            alt="BGMI Tournament"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-red-900/85 to-background/95"></div>
          
          {/* Animated gradient orbs for modern effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-orange-500/40 to-red-500/40 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-red-500/40 to-orange-600/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-20" data-aos="fade-up">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            {/* Tournament Badge */}
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-4 py-2 text-sm">
                <Target className="mr-2 h-4 w-4" />
                Battle Royale Tournament
              </Badge>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-white">
              BGMI
              <span className="block mt-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Tournaments
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Join intense 100-player battle royale tournaments. Master strategy, survival, and teamwork to claim victory and prizes.
            </motion.p>

            {/* Quick Action Button */}
            <motion.div variants={fadeInUp}>
              <Button 
                size="lg"
                onClick={scrollToRegistration}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 py-6 text-lg"
              >
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="text-center p-4 rounded-xl bg-black/30 backdrop-blur-md border border-orange-500/20" data-aos="fade-up" data-aos-delay="100">
                <div className="text-3xl font-bold text-orange-400">3</div>
                <div className="text-sm text-gray-300">Game Modes</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-black/30 backdrop-blur-md border border-orange-500/20" data-aos="fade-up" data-aos-delay="200">
                <div className="text-3xl font-bold text-orange-400">175</div>
                <div className="text-sm text-gray-300">Total Slots</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-black/30 backdrop-blur-md border border-orange-500/20" data-aos="fade-up" data-aos-delay="300">
                <div className="text-3xl font-bold text-orange-400">₹350</div>
                <div className="text-sm text-gray-300">Winner Prize</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-black/30 backdrop-blur-md border border-orange-500/20" data-aos="fade-up" data-aos-delay="400">
                <div className="text-3xl font-bold text-orange-400">₹9</div>
                <div className="text-sm text-gray-300">Per Kill</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================================
          TOURNAMENT MODES WITH SLOT TRACKING
          Features: Tilt cards, real-time slots, progress bars
          =================================== */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Choose Your
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Battle Mode</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select from three exciting game modes and secure your slot before they fill up
            </p>
          </div>

          {/* Tournament Mode Cards with Parallax Tilt */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Solo Mode Card */}
            <Tilt
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={true}
              glareMaxOpacity={0.2}
              scale={1.02}
              transitionSpeed={1000}
            >
              <Card 
                className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:border-orange-500/50 transition-all h-full"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                {/* Card Header */}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-10 w-10 text-orange-500" />
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {soloSlots.data?.remaining || tournamentInfo.solo.capacity} Slots Left
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Solo Tournament</CardTitle>
                  <CardDescription>Individual battle royale competition</CardDescription>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="space-y-4">
                  {/* Slot Availability Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slot Availability</span>
                      <span className="font-semibold text-orange-500">
                        {soloSlots.data?.filled || 0}/{soloSlots.data?.capacity || tournamentInfo.solo.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={((soloSlots.data?.filled || 0) / (soloSlots.data?.capacity || tournamentInfo.solo.capacity)) * 100} 
                      className="h-2 bg-orange-500/20"
                    />
                  </div>

                  {/* Tournament Details */}
                  <div className="space-y-3 pt-4 border-t border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entry Fee</span>
                      <span className="font-bold text-lg text-orange-500">₹{tournamentInfo.solo.entryFee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">1st Prize</span>
                      <span className="font-bold text-lg">₹{tournamentInfo.solo.winnerPrize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Per Kill</span>
                      <span className="font-bold">₹{tournamentInfo.solo.killPrize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Players</span>
                      <span className="font-semibold">{tournamentInfo.solo.capacity}</span>
                    </div>
                  </div>

                  {/* Quick Register Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    onClick={scrollToRegistration}
                  >
                    Register for Solo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Tilt>

            {/* Duo Mode Card */}
            <Tilt
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={true}
              glareMaxOpacity={0.2}
              scale={1.02}
              transitionSpeed={1000}
            >
              <Card 
                className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 hover:border-red-500/50 transition-all h-full"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {/* Card Header */}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-10 w-10 text-red-500" />
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {duoSlots.data?.remaining || tournamentInfo.duo.capacity} Slots Left
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Duo Tournament</CardTitle>
                  <CardDescription>Team of 2 players competition</CardDescription>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="space-y-4">
                  {/* Slot Availability Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slot Availability</span>
                      <span className="font-semibold text-red-500">
                        {duoSlots.data?.filled || 0}/{duoSlots.data?.capacity || tournamentInfo.duo.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={((duoSlots.data?.filled || 0) / (duoSlots.data?.capacity || tournamentInfo.duo.capacity)) * 100} 
                      className="h-2 bg-red-500/20"
                    />
                  </div>

                  {/* Tournament Details */}
                  <div className="space-y-3 pt-4 border-t border-red-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entry Fee</span>
                      <span className="font-bold text-lg text-red-500">₹{tournamentInfo.duo.entryFee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">1st Prize</span>
                      <span className="font-bold text-lg">₹{tournamentInfo.duo.winnerPrize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Per Kill</span>
                      <span className="font-bold">₹{tournamentInfo.duo.killPrize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Teams</span>
                      <span className="font-semibold">{tournamentInfo.duo.capacity}</span>
                    </div>
                  </div>

                  {/* Quick Register Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    onClick={scrollToRegistration}
                  >
                    Register for Duo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Tilt>

            {/* Squad Mode Card */}
            <Tilt
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={true}
              glareMaxOpacity={0.2}
              scale={1.02}
              transitionSpeed={1000}
            >
              <Card 
                className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50 transition-all h-full"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {/* Card Header */}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-10 w-10 text-amber-500" />
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {squadSlots.data?.remaining || tournamentInfo.squad.capacity} Slots Left
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Squad Tournament</CardTitle>
                  <CardDescription>Team of 4 players competition</CardDescription>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="space-y-4">
                  {/* Slot Availability Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slot Availability</span>
                      <span className="font-semibold text-amber-500">
                        {squadSlots.data?.filled || 0}/{squadSlots.data?.capacity || tournamentInfo.squad.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={((squadSlots.data?.filled || 0) / (squadSlots.data?.capacity || tournamentInfo.squad.capacity)) * 100} 
                      className="h-2 bg-amber-500/20"
                    />
                  </div>

                  {/* Tournament Details */}
                  <div className="space-y-3 pt-4 border-t border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entry Fee</span>
                      <span className="font-bold text-lg text-amber-500">₹{tournamentInfo.squad.entryFee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">1st Prize</span>
                      <span className="font-bold text-lg">₹{tournamentInfo.squad.winnerPrize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Per Kill</span>
                      <span className="font-bold">₹{tournamentInfo.squad.killPrize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Teams</span>
                      <span className="font-semibold">{tournamentInfo.squad.capacity}</span>
                    </div>
                  </div>

                  {/* Quick Register Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    onClick={scrollToRegistration}
                  >
                    Register for Squad
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Tilt>
          </div>
        </div>
      </section>

      {/* ===================================
          PRIZE BREAKDOWN SECTION
          Features: Trophy icons, animated cards
          =================================== */}
      <section className="py-20 bg-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Prize
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Distribution</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Rewards for champions and skilled players
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* 1st Place Prize */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 backdrop-blur-sm"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-2xl font-bold mb-2">1st Place</h3>
              <div className="text-4xl font-bold text-yellow-500 mb-2">₹350</div>
              <p className="text-sm text-muted-foreground">Winner takes it all</p>
            </motion.div>

            {/* 2nd Place Prize */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-400/10 to-gray-500/10 border border-gray-400/30 backdrop-blur-sm"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">2nd Place</h3>
              <div className="text-4xl font-bold text-gray-400 mb-2">₹250</div>
              <p className="text-sm text-muted-foreground">Runner-up reward</p>
            </motion.div>

            {/* Per Kill Prize */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 backdrop-blur-sm"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <Target className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-2xl font-bold mb-2">Per Kill</h3>
              <div className="text-4xl font-bold text-red-500 mb-2">₹9</div>
              <p className="text-sm text-muted-foreground">For every elimination</p>
            </motion.div>
          </div>

          {/* Additional Prize Info */}
          <div className="mt-12 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="400">
            <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Prize Distribution Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      All prizes will be transferred to winners within 24-48 hours via UPI. 
                      Kill points are calculated based on final scoreboard. Ensure you provide 
                      valid payment details during registration for smooth prize transfer.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===================================
          HOW TO PLAY SECTION
          Features: Step-by-step guide with icons
          =================================== */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              How to
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Participate</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to join the tournament and compete for prizes
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="max-w-4xl mx-auto space-y-6">
            {howToPlaySteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Step Number */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white">
                            {step.step}
                          </div>
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="h-6 w-6 text-orange-500" />
                            <h3 className="text-xl font-bold">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>

                        {/* Arrow Indicator (except last step) */}
                        {index < howToPlaySteps.length - 1 && (
                          <ChevronRight className="h-6 w-6 text-orange-500/50 hidden md:block" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===================================
          RULES & REGULATIONS ACCORDION
          Features: Expandable sections with detailed rules
          =================================== */}
      <section className="py-20 bg-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Rules &
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Regulations</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Read and understand all tournament rules before registering
            </p>
          </div>

          {/* Rules Accordion */}
          <div className="max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            <Accordion type="single" collapsible className="space-y-4">
              {tournamentRules.map((rule, index) => (
                <AccordionItem 
                  key={rule.id} 
                  value={rule.id}
                  className="bg-card/50 backdrop-blur-sm border border-orange-500/20 rounded-lg px-6 hover:border-orange-500/40 transition-all"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <AccordionTrigger className="text-lg font-semibold hover:text-orange-500">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      {rule.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {rule.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Important Notice */}
            <Card className="mt-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30" data-aos="fade-up" data-aos-delay="400">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Important Notice</h4>
                    <p className="text-sm text-muted-foreground">
                      By registering for this tournament, you agree to abide by all the rules and regulations mentioned above. 
                      Any violation may result in disqualification and forfeiture of entry fee. The organizers reserve the right 
                      to make final decisions in case of disputes. Fair play is mandatory for all participants.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===================================
          REGISTRATION SECTION
          Features: Tabbed interface for different modes
          =================================== */}
      <section ref={registrationRef} className="py-20 bg-gradient-to-b from-background to-muted/30" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Tournament
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Registration</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose your preferred game mode and complete the registration
            </p>
          </div>

          {/* Tournament Registration Tabs */}
          <Tabs defaultValue="solo" className="w-full max-w-5xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="solo" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Solo
              </TabsTrigger>
              <TabsTrigger value="duo" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Duo
              </TabsTrigger>
              <TabsTrigger value="squad" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Squad
              </TabsTrigger>
            </TabsList>

            {/* Solo Registration Form */}
            <TabsContent value="solo" className="space-y-6">
              <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Gamepad2 className="h-6 w-6 text-orange-500" />
                    BGMI Solo Tournament Registration
                  </CardTitle>
                  <CardDescription className="text-base">
                    Entry Fee: ₹{tournamentInfo.solo.entryFee} | Winner Prize: ₹{tournamentInfo.solo.winnerPrize} | Per Kill: ₹{tournamentInfo.solo.killPrize}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BGMISoloForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Duo Registration Form */}
            <TabsContent value="duo" className="space-y-6">
              <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Users className="h-6 w-6 text-red-500" />
                    BGMI Duo Tournament Registration
                  </CardTitle>
                  <CardDescription className="text-base">
                    Entry Fee: ₹{tournamentInfo.duo.entryFee} | Winner Prize: ₹{tournamentInfo.duo.winnerPrize} | Per Kill: ₹{tournamentInfo.duo.killPrize}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BGMIDuoForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Squad Registration Form */}
            <TabsContent value="squad" className="space-y-6">
              <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Shield className="h-6 w-6 text-amber-500" />
                    BGMI Squad Tournament Registration
                  </CardTitle>
                  <CardDescription className="text-base">
                    Entry Fee: ₹{tournamentInfo.squad.entryFee} | Winner Prize: ₹{tournamentInfo.squad.winnerPrize} | Per Kill: ₹{tournamentInfo.squad.killPrize}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BGMISquadForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

export default BGMIPage
