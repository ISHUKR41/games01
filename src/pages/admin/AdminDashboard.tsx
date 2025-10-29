/**
 * Admin Dashboard Page
 * File: src/pages/admin/AdminDashboard.tsx
 * Purpose: Main tournament management dashboard for administrators
 * 
 * This dashboard provides comprehensive tournament management features including:
 * - Real-time registration statistics across all games and modes
 * - Live updates via Supabase realtime subscriptions
 * - Multi-game tournament management (BGMI and Free Fire)
 * - Advanced filtering and search capabilities
 * - Admin action audit trail
 * - Responsive design for mobile and desktop
 * 
 * Features:
 * - Real-time stats cards with live updates
 * - Tournament capacity monitoring per game/mode
 * - Integrated registration management
 * - Export functionality for registration data
 * - Admin action history tracking
 * - AOS animations for modern UI feel
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogOut,
  Search,
  Download,
  Target,
  Zap,
  RefreshCw,
  History,
  TrendingUp,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorFallback } from '@/components/common/ErrorFallback'
import { RegistrationManagement } from '@/components/admin/RegistrationManagement'

import { supabase } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

/**
 * Dashboard Statistics Interface
 * Represents aggregated stats across all tournaments
 */
interface DashboardStats {
  totalRegistrations: number
  pendingApprovals: number
  approvedToday: number
  rejectedToday: number
  totalRevenue: number
}

/**
 * Tournament Data Interface
 * Represents capacity and registration data per tournament mode
 */
interface TournamentModeData {
  capacity: number
  filled: number
  pending: number
  approved: number
  rejected: number
}

interface TournamentData {
  bgmi: {
    solo: TournamentModeData
    duo: TournamentModeData
    squad: TournamentModeData
  }
  freefire: {
    solo: TournamentModeData
    duo: TournamentModeData
    squad: TournamentModeData
  }
}

/**
 * Admin Action Interface
 * Represents a single admin action in the audit log
 */
interface AdminAction {
  id: string
  registration_id: string | null
  admin_user_id: string | null
  action: 'pending' | 'approved' | 'rejected'
  reason: string | null
  created_at: string
}

/**
 * AdminDashboard - Main admin panel for tournament management
 * 
 * This component serves as the central hub for tournament administrators to:
 * - Monitor real-time registration statistics
 * - Manage registrations across multiple games and modes
 * - View audit logs of all admin actions
 * - Export registration data
 * - Access detailed registration management tools
 */
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State management
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<'bgmi' | 'freefire'>('bgmi')
  const [selectedMode, setSelectedMode] = useState<'solo' | 'duo' | 'squad'>('solo')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * Fetch Dashboard Statistics
   * Aggregates stats from all registrations and tournaments
   * Automatically refetches every 30 seconds for real-time updates
   */
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch all registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('status, tournament_id, created_at, tournaments!inner(entry_fee_rs)')

      if (regError) throw regError

      // Type guard for data
      type RegistrationData = {
        status: string
        tournament_id: string
        created_at: string
        tournaments: { entry_fee_rs: number } | null
      }
      
      const typedRegistrations = (registrations || []) as RegistrationData[]

      // Get today's date range (start of day to now)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISOString = today.toISOString()

      // Calculate statistics
      const stats: DashboardStats = {
        totalRegistrations: typedRegistrations.length,
        pendingApprovals: typedRegistrations.filter(r => r.status === 'pending').length,
        approvedToday: typedRegistrations.filter(r => 
          r.status === 'approved' && new Date(r.created_at) >= today
        ).length,
        rejectedToday: typedRegistrations.filter(r => 
          r.status === 'rejected' && new Date(r.created_at) >= today
        ).length,
        totalRevenue: typedRegistrations
          .filter(r => r.status === 'approved')
          .reduce((sum, r) => sum + (r.tournaments?.entry_fee_rs || 0), 0)
      }

      return stats
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true
  })

  /**
   * Fetch Tournament Data
   * Gets capacity and registration counts for each game/mode combination
   * Updates in real-time via polling and subscriptions
   */
  const { data: tournamentData, isLoading: tournamentLoading, refetch: refetchTournaments } = useQuery<TournamentData>({
    queryKey: ['tournament-data'],
    queryFn: async () => {
      // Fetch all tournaments
      const { data: tournaments, error: tourError } = await supabase
        .from('tournaments')
        .select('id, game, mode, max_capacity')
        .eq('is_active', true)

      if (tourError) throw tourError

      // Fetch all registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('tournament_id, status, tournaments!inner(game, mode)')

      if (regError) throw regError

      // Type definitions for query results
      type TournamentRow = {
        id: string
        game: string
        mode: string
        max_capacity: number
      }

      type RegistrationRow = {
        tournament_id: string
        status: string
        tournaments: { game: string; mode: string } | null
      }

      const typedTournaments = (tournaments || []) as TournamentRow[]
      const typedRegistrations = (registrations || []) as RegistrationRow[]

      // Build tournament data structure
      const result: TournamentData = {
        bgmi: {
          solo: { capacity: 0, filled: 0, pending: 0, approved: 0, rejected: 0 },
          duo: { capacity: 0, filled: 0, pending: 0, approved: 0, rejected: 0 },
          squad: { capacity: 0, filled: 0, pending: 0, approved: 0, rejected: 0 }
        },
        freefire: {
          solo: { capacity: 0, filled: 0, pending: 0, approved: 0, rejected: 0 },
          duo: { capacity: 0, filled: 0, pending: 0, approved: 0, rejected: 0 },
          squad: { capacity: 0, filled: 0, pending: 0, approved: 0, rejected: 0 }
        }
      }

      // Set capacities from tournaments
      typedTournaments.forEach(tournament => {
        const game = tournament.game as 'bgmi' | 'freefire'
        const mode = tournament.mode as 'solo' | 'duo' | 'squad'
        result[game][mode].capacity = tournament.max_capacity
      })

      // Count registrations by status
      typedRegistrations.forEach(registration => {
        const game = registration.tournaments?.game as 'bgmi' | 'freefire'
        const mode = registration.tournaments?.mode as 'solo' | 'duo' | 'squad'
        
        if (game && mode && result[game] && result[game][mode]) {
          if (registration.status === 'approved') {
            result[game][mode].filled++
            result[game][mode].approved++
          } else if (registration.status === 'pending') {
            result[game][mode].pending++
          } else if (registration.status === 'rejected') {
            result[game][mode].rejected++
          }
        }
      })

      return result
    },
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  })

  /**
   * Fetch Recent Admin Actions
   * Gets the latest admin actions for the audit log
   * Limited to 50 most recent actions
   */
  const { data: recentActions, refetch: refetchActions } = useQuery<AdminAction[]>({
    queryKey: ['admin-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    },
    staleTime: 60000 // 1 minute
  })

  /**
   * Setup Real-time Subscriptions
   * Subscribes to database changes for live updates
   * Listens to registrations and admin_actions tables
   */
  useEffect(() => {
    // Subscribe to registrations changes
    const registrationsChannel = supabase
      .channel('admin-dashboard-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
          queryClient.invalidateQueries({ queryKey: ['tournament-data'] })
          queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
        }
      )
      .subscribe()

    // Subscribe to admin actions changes
    const actionsChannel = supabase
      .channel('admin-dashboard-actions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_actions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-actions'] })
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(registrationsChannel)
      supabase.removeChannel(actionsChannel)
    }
  }, [queryClient])

  /**
   * Check Authentication and Admin Role
   * Verifies user is authenticated and has admin privileges
   * Redirects to login if not authenticated or not an admin
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          navigate('/admin/login', { replace: true })
          return
        }

        // Verify admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single()

        if (roleError || !roleData) {
          await supabase.auth.signOut()
          navigate('/admin/login', { replace: true })
          return
        }

        setIsAuthenticating(false)
        
      } catch (error: any) {
        console.error('Auth check failed:', error)
        setError(error.message)
        setIsAuthenticating(false)
      }
    }

    checkAuth()
  }, [navigate])

  /**
   * Handle Manual Refresh
   * Refreshes all dashboard data and shows loading state
   */
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchStats(),
        refetchTournaments(),
        refetchActions(),
        queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
      ])
      toast.success('Dashboard refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
      console.error('Refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Handle Logout
   * Signs out the admin user and redirects to login page
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/admin/login', { replace: true })
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    }
  }

  /**
   * Export Registrations to CSV
   * Downloads all registrations for the selected game/mode
   */
  const handleExport = async () => {
    try {
      toast.info('Preparing export...')
      
      // Type definition for registration export data
      type RegistrationExportData = {
        id: string
        team_name: string | null
        leader_name: string
        leader_game_id: string
        leader_whatsapp: string
        transaction_id: string
        status: string
        created_at: string
      }
      
      // Fetch registrations for selected game/mode
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          *,
          participants:participants(*),
          tournament:tournaments(*)
        `)
        .eq('tournaments.game', selectedGame)
        .eq('tournaments.mode', selectedMode)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Type the registrations data
      const typedRegistrations = (registrations || []) as RegistrationExportData[]

      // Convert to CSV format
      const csvData = typedRegistrations.map(reg => ({
        'Registration ID': reg.id,
        'Team Name': reg.team_name || 'N/A',
        'Leader Name': reg.leader_name,
        'Leader Game ID': reg.leader_game_id,
        'WhatsApp': reg.leader_whatsapp,
        'Transaction ID': reg.transaction_id,
        'Status': reg.status,
        'Created At': new Date(reg.created_at).toLocaleString()
      }))

      if (csvData.length === 0) {
        toast.info('No registrations to export')
        return
      }

      // Create CSV string
      const headers = Object.keys(csvData[0])
      const csvString = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvString], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedGame}-${selectedMode}-registrations-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export completed successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  // Show loading while authenticating
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    )
  }

  // Show error if authentication failed
  if (error) {
    return <ErrorFallback error={new Error(error)} />
  }

  // Get current tournament data
  const currentTournament = tournamentData?.[selectedGame]?.[selectedMode] || {
    capacity: 0,
    filled: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  }
  const remainingSlots = currentTournament.capacity - currentTournament.filled

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div data-aos="fade-right">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Tournament management and registration oversight
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4" data-aos="fade-left">
              {/* Refresh Button */}
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {/* Online Status Badge */}
              <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30 hidden sm:flex">
                <Activity className="mr-1 h-3 w-3 animate-pulse" />
                Live
              </Badge>
              
              {/* Logout Button */}
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Dashboard Statistics Cards */}
          <div data-aos="fade-up" data-aos-duration="600">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Overview Statistics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              {/* Total Registrations Card */}
              <Card 
                className="hover:shadow-lg transition-shadow duration-300" 
                data-aos="flip-up" 
                data-aos-delay="0"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl md:text-2xl font-bold truncate">
                        {statsLoading ? '...' : dashboardStats?.totalRegistrations || 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        Total Registrations
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Approvals Card */}
              <Card 
                className="hover:shadow-lg transition-shadow duration-300" 
                data-aos="flip-up" 
                data-aos-delay="100"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl md:text-2xl font-bold truncate">
                        {statsLoading ? '...' : dashboardStats?.pendingApprovals || 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        Pending Approvals
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approved Today Card */}
              <Card 
                className="hover:shadow-lg transition-shadow duration-300" 
                data-aos="flip-up" 
                data-aos-delay="200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl md:text-2xl font-bold truncate">
                        {statsLoading ? '...' : dashboardStats?.approvedToday || 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        Approved Today
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rejected Today Card */}
              <Card 
                className="hover:shadow-lg transition-shadow duration-300" 
                data-aos="flip-up" 
                data-aos-delay="300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl md:text-2xl font-bold truncate">
                        {statsLoading ? '...' : dashboardStats?.rejectedToday || 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        Rejected Today
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Revenue Card */}
              <Card 
                className="hover:shadow-lg transition-shadow duration-300" 
                data-aos="flip-up" 
                data-aos-delay="400"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Trophy className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl md:text-2xl font-bold truncate">
                        {statsLoading ? '...' : formatCurrency(dashboardStats?.totalRevenue || 0)}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        Total Revenue
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tournament Management Section */}
          <Card data-aos="fade-up" data-aos-delay="200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tournament Management
              </CardTitle>
              <CardDescription>
                Select a game and mode to manage registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bgmi" onValueChange={(value) => setSelectedGame(value as 'bgmi' | 'freefire')}>
                {/* Game Selection Tabs */}
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="bgmi" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>BGMI</span>
                  </TabsTrigger>
                  <TabsTrigger value="freefire" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Free Fire</span>
                  </TabsTrigger>
                </TabsList>

                {/* BGMI Tournament Modes */}
                <TabsContent value="bgmi" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(tournamentData?.bgmi || {}).map(([mode, data], index) => (
                      <Card 
                        key={mode}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedMode === mode 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedMode(mode as 'solo' | 'duo' | 'squad')}
                        data-aos="zoom-in"
                        data-aos-delay={index * 100}
                      >
                        <CardContent className="p-6 text-center">
                          <h3 className="font-semibold text-lg capitalize mb-4">{mode}</h3>
                          <div className="space-y-3">
                            <div className="text-3xl font-bold text-primary">
                              {tournamentLoading ? '...' : data.filled}/{tournamentLoading ? '...' : data.capacity}
                            </div>
                            <div className="text-sm text-muted-foreground">Slots Filled</div>
                            
                            {/* Status Breakdown */}
                            <div className="flex justify-center gap-3 flex-wrap">
                              {data.pending > 0 && (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 text-xs">
                                  {data.pending} Pending
                                </Badge>
                              )}
                              {data.approved > 0 && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-600 text-xs">
                                  {data.approved} Approved
                                </Badge>
                              )}
                            </div>

                            {/* Capacity Progress Bar */}
                            <div className="w-full bg-muted rounded-full h-2 mt-3">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(data.filled / data.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Free Fire Tournament Modes */}
                <TabsContent value="freefire" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(tournamentData?.freefire || {}).map(([mode, data], index) => (
                      <Card 
                        key={mode}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedMode === mode 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedMode(mode as 'solo' | 'duo' | 'squad')}
                        data-aos="zoom-in"
                        data-aos-delay={index * 100}
                      >
                        <CardContent className="p-6 text-center">
                          <h3 className="font-semibold text-lg capitalize mb-4">{mode}</h3>
                          <div className="space-y-3">
                            <div className="text-3xl font-bold text-primary">
                              {tournamentLoading ? '...' : data.filled}/{tournamentLoading ? '...' : data.capacity}
                            </div>
                            <div className="text-sm text-muted-foreground">Slots Filled</div>
                            
                            {/* Status Breakdown */}
                            <div className="flex justify-center gap-3 flex-wrap">
                              {data.pending > 0 && (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 text-xs">
                                  {data.pending} Pending
                                </Badge>
                              )}
                              {data.approved > 0 && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-600 text-xs">
                                  {data.approved} Approved
                                </Badge>
                              )}
                            </div>

                            {/* Capacity Progress Bar */}
                            <div className="w-full bg-muted rounded-full h-2 mt-3">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(data.filled / data.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Registration Management Section */}
          <Card data-aos="fade-up" data-aos-delay="300">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <CardTitle>Registration Queue</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedGame.toUpperCase()} {selectedMode.toUpperCase()} - {remainingSlots} slots remaining
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                </div>
              </div>
              
              {/* Filters Section */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mt-4 pt-4 border-t">
                {/* Status Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label className="whitespace-nowrap">Status:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Search Input */}
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                  <Label className="whitespace-nowrap hidden sm:block">Search:</Label>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Team name, player name, transaction ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Registration Management Component */}
              <RegistrationManagement 
                selectedGame={selectedGame}
                selectedMode={selectedMode}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />
            </CardContent>
          </Card>

          {/* Admin Action History Section */}
          {recentActions && recentActions.length > 0 && (
            <Card data-aos="fade-up" data-aos-delay="400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Admin Actions
                </CardTitle>
                <CardDescription>
                  Last 50 administrative actions performed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActions.slice(0, 10).map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {/* Action Icon */}
                      <div className="mt-1">
                        {action.action === 'approved' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {action.action === 'rejected' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {action.action === 'pending' && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>

                      {/* Action Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium capitalize">{action.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(action.created_at).toLocaleString()}
                          </Badge>
                        </div>
                        {action.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {action.reason}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
