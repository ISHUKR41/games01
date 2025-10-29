/**
 * Registration Management Component
 * File: src/components/admin/RegistrationManagement.tsx
 * Purpose: Complete registration management interface for admin dashboard
 * 
 * This component handles viewing, approving, rejecting registrations with
 * real-time updates, payment screenshot viewing, and comprehensive management
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  Check, 
  X, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  MoreVertical,
  ImageIcon,
  Download,
  Gamepad2,
  Phone
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

import { supabase } from '@/lib/supabase/client'
import { updateRegistrationStatus } from '@/lib/supabase/rpc'
import { formatCurrency, formatMobileNumber, getShortId } from '@/lib/utils'
import type { Registration } from '@/lib/supabase/types'

interface RegistrationManagementProps {
  selectedGame: 'bgmi' | 'freefire'
  selectedMode: 'solo' | 'duo' | 'squad'
  statusFilter: string
  searchQuery: string
}

// Enhanced Registration type with related data
interface RegistrationWithDetails extends Registration {
  participants?: Array<{
    id: string
    player_name: string
    player_game_id: string
    slot_position: number
  }>
  tournament?: {
    game: string
    mode: string
    entry_fee_rs: number
  }
}

/**
 * RegistrationManagement - Complete admin interface for managing registrations
 */
export const RegistrationManagement: React.FC<RegistrationManagementProps> = ({
  selectedGame,
  selectedMode,
  statusFilter,
  searchQuery
}) => {
  const queryClient = useQueryClient()
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithDetails | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch registrations with real-time updates
  const { data: registrations, isLoading, error } = useQuery({
    queryKey: ['admin-registrations', selectedGame, selectedMode, statusFilter, searchQuery],
    queryFn: async (): Promise<RegistrationWithDetails[]> => {
      // Build query
      let query = supabase
        .from('registrations')
        .select(`
          *,
          participants:participants(*),
          tournament:tournaments(*)
        `)
        .order('created_at', { ascending: false })

      // Filter by game and mode
      query = query.eq('tournaments.game', selectedGame)
      query = query.eq('tournaments.mode', selectedMode)

      // Filter by status
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Search functionality
      if (searchQuery.trim()) {
        query = query.or(
          `leader_name.ilike.%${searchQuery}%,` +
          `team_name.ilike.%${searchQuery}%,` +
          `transaction_id.ilike.%${searchQuery}%`
        )
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching registrations:', error)
        throw error
      }

      return data || []
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true
  })

  // Set up real-time subscription for registration updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          // Invalidate and refetch registrations when changes occur
          queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      registrationId,
      newStatus,
      reason
    }: {
      registrationId: string
      newStatus: 'approved' | 'rejected'
      reason?: string
    }) => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Update registration status via RPC
      const result = await updateRegistrationStatus({
        p_registration_id: registrationId,
        p_new_status: newStatus,
        p_admin_user_id: session.user.id,
        p_reason: reason || null
      })

      if (!result.success) throw new Error(result.error)

      return result
    },
    onSuccess: () => {
      // Refresh registrations list
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
      setActionLoading(null)
      setSelectedRegistration(null)
      setRejectionReason('')
    },
    onError: (error) => {
      console.error('Failed to update registration status:', error)
      setActionLoading(null)
    }
  })

  // Handle approve registration
  const handleApprove = async (registration: RegistrationWithDetails) => {
    setActionLoading(registration.id)
    updateStatusMutation.mutate({
      registrationId: registration.id,
      newStatus: 'approved'
    })
  }

  // Handle reject registration
  const handleReject = async (registration: RegistrationWithDetails, reason: string) => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setActionLoading(registration.id)
    updateStatusMutation.mutate({
      registrationId: registration.id,
      newStatus: 'rejected',
      reason: reason.trim()
    })
  }

  // Get status badge color and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30', 
          icon: Clock 
        }
      case 'approved':
        return { 
          color: 'bg-green-500/20 text-green-600 border-green-500/30', 
          icon: CheckCircle 
        }
      case 'rejected':
        return { 
          color: 'bg-red-500/20 text-red-600 border-red-500/30', 
          icon: XCircle 
        }
      default:
        return { 
          color: 'bg-gray-500/20 text-gray-600 border-gray-500/30', 
          icon: AlertCircle 
        }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading registrations..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Registrations</h3>
        <p className="text-muted-foreground mb-4">
          Failed to load registration data. Please try again.
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })}>
          Retry
        </Button>
      </div>
    )
  }

  // Empty state
  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Registrations Found</h3>
        <p className="text-muted-foreground">
          No registrations match your current filters for {selectedGame.toUpperCase()} {selectedMode.toUpperCase()}.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-600">
              {registrations.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">
              {registrations.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-600">
              {registrations.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Team/Player</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {registrations.map((registration) => {
                const statusBadge = getStatusBadge(registration.status)
                const StatusIcon = statusBadge.icon

                return (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-xs">
                      {getShortId(registration.id)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {registration.team_name && (
                          <div className="font-semibold">{registration.team_name}</div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Leader: {registration.leader_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {registration.leader_game_id}
                        </div>
                        {registration.participants && registration.participants.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{registration.participants.length} team members
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {formatMobileNumber(registration.leader_whatsapp)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-mono">{registration.transaction_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(registration.tournament?.entry_fee_rs || 0)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={statusBadge.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {registration.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(registration.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(registration.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* View Details Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRegistration(registration)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                              <DialogDescription>
                                {selectedRegistration?.team_name || selectedRegistration?.leader_name} - {selectedRegistration?.status?.toUpperCase()}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedRegistration && (
                              <div className="space-y-6">
                                {/* Team/Player Information */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Team Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Registration ID</Label>
                                      <p className="font-mono text-sm">{getShortId(selectedRegistration.id)}</p>
                                    </div>
                                    {selectedRegistration.team_name && (
                                      <div>
                                        <Label>Team Name</Label>
                                        <p className="font-semibold">{selectedRegistration.team_name}</p>
                                      </div>
                                    )}
                                    <div>
                                      <Label>Leader Name</Label>
                                      <p>{selectedRegistration.leader_name}</p>
                                    </div>
                                    <div>
                                      <Label>Leader Game ID</Label>
                                      <p className="font-mono">{selectedRegistration.leader_game_id}</p>
                                    </div>
                                    <div>
                                      <Label>WhatsApp</Label>
                                      <p>{formatMobileNumber(selectedRegistration.leader_whatsapp)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Team Members */}
                                {selectedRegistration.participants && selectedRegistration.participants.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="font-semibold">Team Members</h4>
                                    <div className="space-y-3">
                                      {selectedRegistration.participants.map((participant, index) => (
                                        <div key={participant.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Player {participant.slot_position + 1}</span>
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium">{participant.player_name}</p>
                                            <p className="text-sm text-muted-foreground font-mono">{participant.player_game_id}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Payment Information */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Payment Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Transaction ID</Label>
                                      <p className="font-mono">{selectedRegistration.transaction_id}</p>
                                    </div>
                                    <div>
                                      <Label>Amount Paid</Label>
                                      <p className="font-semibold text-green-600">
                                        {formatCurrency(selectedRegistration.tournament?.entry_fee_rs || 0)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Payment Screenshot */}
                                  {selectedRegistration.payment_screenshot_url && (
                                    <div>
                                      <Label>Payment Screenshot</Label>
                                      <div className="mt-2">
                                        <img 
                                          src={selectedRegistration.payment_screenshot_url} 
                                          alt="Payment screenshot" 
                                          className="max-w-md rounded-lg border"
                                        />
                                        <div className="mt-2">
                                          <Button variant="outline" size="sm" asChild>
                                            <a 
                                              href={selectedRegistration.payment_screenshot_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                            >
                                              <ExternalLink className="mr-2 h-4 w-4" />
                                              Open Full Size
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                {selectedRegistration.status === 'pending' && (
                                  <div className="space-y-4">
                                    <Separator />
                                    <h4 className="font-semibold">Admin Actions</h4>
                                    <div className="flex gap-4">
                                      <Button 
                                        onClick={() => handleApprove(selectedRegistration)}
                                        disabled={actionLoading === selectedRegistration.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {actionLoading === selectedRegistration.id ? (
                                          <LoadingSpinner size="sm" />
                                        ) : (
                                          <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Approve Registration
                                          </>
                                        )}
                                      </Button>
                                      
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="destructive">
                                            <X className="mr-2 h-4 w-4" />
                                            Reject Registration
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Reject Registration</DialogTitle>
                                            <DialogDescription>
                                              Please provide a reason for rejecting this registration. This will be logged for audit purposes.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="reason">Rejection Reason</Label>
                                              <Textarea
                                                id="reason"
                                                placeholder="Enter reason for rejection..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="mt-2"
                                              />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                              <Button variant="outline" onClick={() => setRejectionReason('')}>
                                                Cancel
                                              </Button>
                                              <Button 
                                                variant="destructive"
                                                onClick={() => handleReject(selectedRegistration, rejectionReason)}
                                                disabled={!rejectionReason.trim() || actionLoading === selectedRegistration.id}
                                              >
                                                {actionLoading === selectedRegistration.id ? (
                                                  <LoadingSpinner size="sm" />
                                                ) : (
                                                  'Reject Registration'
                                                )}
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Quick Actions for Pending Registrations */}
                        {registration.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(registration)}
                              disabled={actionLoading === registration.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === registration.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setSelectedRegistration(registration)}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
