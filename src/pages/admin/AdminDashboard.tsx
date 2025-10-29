/**
 * Admin Dashboard Page
 * File: src/pages/admin/AdminDashboard.tsx
 * Purpose: Main tournament management dashboard for administrators
 * 
 * This dashboard provides comprehensive tournament management features including
 * registration approval, real-time statistics, and player management
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Filter,
  Search,
  Download,
  Eye,
  MoreVertical,
  Target,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorFallback } from '@/components/common/ErrorFallback'
import { RegistrationManagement } from '@/components/admin/RegistrationManagement'

import { supabase } from '@/lib/supabase/client'
import { formatCurrency, getShortId } from '@/lib/utils'

/**
 * AdminDashboard - Main admin panel for tournament management
 */
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<'bgmi' | 'freefire'>('bgmi')
  const [selectedMode, setSelectedMode] = useState<'solo' | 'duo' | 'squad'>('solo')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with real data fetching
  const dashboardStats = {
    totalRegistrations: 156,
    pendingApprovals: 23,
    approvedToday: 45,
    rejectedToday: 3,
    totalRevenue: 12480
  }

  const tournamentData = {
    bgmi: {
      solo: { capacity: 100, filled: 67, pending: 12 },
      duo: { capacity: 50, filled: 34, pending: 8 },
      squad: { capacity: 25, filled: 18, pending: 3 }
    },
    freefire: {
      solo: { capacity: 48, filled: 29, pending: 5 },
      duo: { capacity: 24, filled: 16, pending: 4 },
      squad: { capacity: 12, filled: 8, pending: 2 }
    }
  }

  // Check authentication and admin role on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          navigate('/admin/login', { replace: true })
          return
        }

        // Check admin role
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
        // Load dashboard data here
        setIsLoading(false)
        
      } catch (error: any) {
        console.error('Auth check failed:', error)
        setError(error.message)
        setIsAuthenticating(false)
      }
    }

    checkAuth()
  }, [navigate])

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/admin/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
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

  // Show error if something went wrong
  if (error) {
    return <ErrorFallback error={new Error(error)} />
  }

  const currentTournament = tournamentData[selectedGame][selectedMode]
  const remainingSlots = currentTournament.capacity - currentTournament.filled

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Tournament management and registration oversight
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
                <CheckCircle className="mr-1 h-3 w-3" />
                Online
              </Badge>
              
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.totalRegistrations}</div>
                    <div className="text-sm text-muted-foreground">Total Registrations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.pendingApprovals}</div>
                    <div className="text-sm text-muted-foreground">Pending Approvals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.approvedToday}</div>
                    <div className="text-sm text-muted-foreground">Approved Today</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.rejectedToday}</div>
                    <div className="text-sm text-muted-foreground">Rejected Today</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tournament Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tournament Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bgmi" onValueChange={(value) => setSelectedGame(value as 'bgmi' | 'freefire')}>
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="bgmi" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    BGMI
                  </TabsTrigger>
                  <TabsTrigger value="freefire" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Free Fire
                  </TabsTrigger>
                </TabsList>

                {/* BGMI Tab */}
                <TabsContent value="bgmi" className="space-y-6 mt-6">
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(tournamentData.bgmi).map(([mode, data]) => (
                      <Card 
                        key={mode}
                        className={`cursor-pointer transition-colors ${selectedMode === mode ? 'border-primary' : ''}`}
                        onClick={() => setSelectedMode(mode as 'solo' | 'duo' | 'squad')}
                      >
                        <CardContent className="p-4 text-center">
                          <h3 className="font-semibold text-lg capitalize mb-2">{mode}</h3>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">
                              {data.filled}/{data.capacity}
                            </div>
                            <div className="text-sm text-muted-foreground">Registered</div>
                            {data.pending > 0 && (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                                {data.pending} Pending
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Free Fire Tab */}
                <TabsContent value="freefire" className="space-y-6 mt-6">
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(tournamentData.freefire).map(([mode, data]) => (
                      <Card 
                        key={mode}
                        className={`cursor-pointer transition-colors ${selectedMode === mode ? 'border-primary' : ''}`}
                        onClick={() => setSelectedMode(mode as 'solo' | 'duo' | 'squad')}
                      >
                        <CardContent className="p-4 text-center">
                          <h3 className="font-semibold text-lg capitalize mb-2">{mode}</h3>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">
                              {data.filled}/{data.capacity}
                            </div>
                            <div className="text-sm text-muted-foreground">Registered</div>
                            {data.pending > 0 && (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                                {data.pending} Pending
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Registration Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Registration Queue - {selectedGame.toUpperCase()} {selectedMode.toUpperCase()}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Label>Status:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
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
                
                <div className="flex items-center gap-2">
                  <Label>Search:</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Team name, player name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <RegistrationManagement 
                selectedGame={selectedGame}
                selectedMode={selectedMode}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard