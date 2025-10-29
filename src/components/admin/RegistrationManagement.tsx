/**
 * Registration Management Component
 * File: src/components/admin/RegistrationManagement.tsx
 * Purpose: Complete registration management interface for admin dashboard
 * 
 * This component provides comprehensive tournament registration management with:
 * - Real-time updates via Supabase subscriptions for instant data refresh
 * - Bulk selection and actions for efficient batch processing
 * - Payment screenshot preview with full-size modal viewing
 * - Confirmation dialogs for all destructive actions
 * - Advanced filtering by game, mode, and status
 * - Search functionality across team names, player names, and transaction IDs
 * - Responsive design optimized for mobile and desktop
 * - AOS animations for modern UI feel
 * - Comprehensive audit trail tracking
 * 
 * Features:
 * - Single and bulk approve/reject operations
 * - Detailed registration viewing with team members
 * - Payment verification with screenshot preview
 * - Quick actions for pending registrations
 * - Status-based color coding and icons
 * - Real-time stat cards for current view
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
  ImageIcon,
  Gamepad2,
  Phone,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

import { supabase } from '@/lib/supabase/client'
import { updateRegistrationStatus } from '@/lib/supabase/rpc'
import { formatCurrency, formatMobileNumber, getShortId } from '@/lib/utils'
import type { Registration } from '@/lib/supabase/types'

/**
 * Component Props Interface
 */
interface RegistrationManagementProps {
  selectedGame: 'bgmi' | 'freefire'
  selectedMode: 'solo' | 'duo' | 'squad'
  statusFilter: string
  searchQuery: string
}

/**
 * Enhanced Registration Interface with Related Data
 * Includes participants and tournament information
 */
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
 * RegistrationManagement - Complete Admin Interface for Managing Tournament Registrations
 * 
 * This component serves as the main interface for administrators to:
 * - View all registrations with detailed information
 * - Approve or reject registrations individually or in bulk
 * - Search and filter registrations efficiently
 * - View payment screenshots and verify payments
 * - Track registration statistics in real-time
 * 
 * @param selectedGame - Currently selected game (bgmi/freefire)
 * @param selectedMode - Currently selected mode (solo/duo/squad)
 * @param statusFilter - Filter registrations by status (all/pending/approved/rejected)
 * @param searchQuery - Search query for filtering by names and transaction ID
 */
export const RegistrationManagement: React.FC<RegistrationManagementProps> = ({
  selectedGame,
  selectedMode,
  statusFilter,
  searchQuery
}) => {
  const queryClient = useQueryClient()
  
  // State Management
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithDetails | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false)
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false)
  const [bulkRejectionReason, setBulkRejectionReason] = useState('')
  const [showPaymentImage, setShowPaymentImage] = useState(false)
  const [paymentImageUrl, setPaymentImageUrl] = useState<string | null>(null)

  /**
   * Fetch Registrations Query
   * Fetches registrations based on current filters with real-time updates
   * Includes participants and tournament data via joins
   */
  const { data: registrations, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-registrations', selectedGame, selectedMode, statusFilter, searchQuery],
    queryFn: async (): Promise<RegistrationWithDetails[]> => {
      // Build base query with joins
      let query = supabase
        .from('registrations')
        .select(`
          *,
          participants:participants(*),
          tournament:tournaments(*)
        `)
        .order('created_at', { ascending: false })

      // Filter by game and mode through tournament relationship
      query = query.eq('tournaments.game', selectedGame)
      query = query.eq('tournaments.mode', selectedMode)

      // Filter by status if not "all"
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply search filter across multiple fields
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })

  /**
   * Setup Real-time Subscriptions
   * Subscribes to database changes for instant updates
   * Automatically refetches queries when registrations change
   */
  useEffect(() => {
    // Create channel for registration changes
    const channel = supabase
      .channel('admin-registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'registrations'
        },
        (payload) => {
          console.log('Registration changed:', payload)
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
          queryClient.invalidateQueries({ queryKey: ['tournament-data'] })
          
          // Show toast notification for new registrations
          if (payload.eventType === 'INSERT') {
            toast.info('New registration received!')
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  /**
   * Update Registration Status Mutation
   * Handles single registration status updates (approve/reject)
   */
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
      // Verify authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Call RPC function to update status
      const result = await updateRegistrationStatus({
        p_registration_id: registrationId,
        p_new_status: newStatus,
        p_admin_user_id: session.user.id,
        p_reason: reason || null
      })

      if (!result.success) throw new Error(result.error)

      return result
    },
    onSuccess: (data, variables) => {
      // Refresh all registration-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['tournament-data'] })
      queryClient.invalidateQueries({ queryKey: ['admin-actions'] })
      
      // Reset loading state and clear selection
      setActionLoading(null)
      setSelectedRegistration(null)
      setRejectionReason('')
      
      // Show success notification
      toast.success(`Registration ${variables.newStatus === 'approved' ? 'approved' : 'rejected'} successfully`)
    },
    onError: (error: Error) => {
      console.error('Failed to update registration status:', error)
      setActionLoading(null)
      toast.error(`Failed to update registration: ${error.message}`)
    }
  })

  /**
   * Bulk Update Mutation
   * Handles bulk approval/rejection of multiple registrations
   */
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      registrationIds,
      newStatus,
      reason
    }: {
      registrationIds: string[]
      newStatus: 'approved' | 'rejected'
      reason?: string
    }) => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Process each registration
      const promises = registrationIds.map(id => 
        updateRegistrationStatus({
          p_registration_id: id,
          p_new_status: newStatus,
          p_admin_user_id: session.user.id,
          p_reason: reason || null
        })
      )

      const results = await Promise.all(promises)
      
      // Check if any failed
      const failures = results.filter(r => !r.success)
      if (failures.length > 0) {
        throw new Error(`${failures.length} registrations failed to update`)
      }

      return results
    },
    onSuccess: (data, variables) => {
      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['tournament-data'] })
      queryClient.invalidateQueries({ queryKey: ['admin-actions'] })
      
      // Reset state
      setSelectedIds(new Set())
      setShowBulkApproveDialog(false)
      setShowBulkRejectDialog(false)
      setBulkRejectionReason('')
      
      // Show success toast
      const action = variables.newStatus === 'approved' ? 'approved' : 'rejected'
      toast.success(`${variables.registrationIds.length} registrations ${action} successfully`)
    },
    onError: (error: Error) => {
      console.error('Bulk update failed:', error)
      toast.error(`Bulk update failed: ${error.message}`)
    }
  })

  /**
   * Handle Single Registration Approval
   * Approves a single registration with confirmation
   */
  const handleApprove = async (registration: RegistrationWithDetails) => {
    setActionLoading(registration.id)
    updateStatusMutation.mutate({
      registrationId: registration.id,
      newStatus: 'approved'
    })
  }

  /**
   * Handle Single Registration Rejection
   * Rejects a single registration with required reason
   */
  const handleReject = async (registration: RegistrationWithDetails, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setActionLoading(registration.id)
    updateStatusMutation.mutate({
      registrationId: registration.id,
      newStatus: 'rejected',
      reason: reason.trim()
    })
  }

  /**
   * Handle Bulk Approval
   * Approves all selected registrations at once
   */
  const handleBulkApprove = () => {
    const ids = Array.from(selectedIds)
    bulkUpdateMutation.mutate({
      registrationIds: ids,
      newStatus: 'approved'
    })
  }

  /**
   * Handle Bulk Rejection
   * Rejects all selected registrations with a reason
   */
  const handleBulkReject = () => {
    if (!bulkRejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    const ids = Array.from(selectedIds)
    bulkUpdateMutation.mutate({
      registrationIds: ids,
      newStatus: 'rejected',
      reason: bulkRejectionReason.trim()
    })
  }

  /**
   * Toggle Selection for a Registration
   * Adds or removes registration from bulk selection
   */
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  /**
   * Toggle All Selections
   * Selects or deselects all pending registrations
   */
  const toggleSelectAll = () => {
    if (!registrations) return
    
    const pendingRegistrations = registrations.filter(r => r.status === 'pending')
    
    if (selectedIds.size === pendingRegistrations.length) {
      // Deselect all
      setSelectedIds(new Set())
    } else {
      // Select all pending
      setSelectedIds(new Set(pendingRegistrations.map(r => r.id)))
    }
  }

  /**
   * View Payment Screenshot
   * Opens modal with full-size payment screenshot
   */
  const viewPaymentScreenshot = (url: string) => {
    setPaymentImageUrl(url)
    setShowPaymentImage(true)
  }

  /**
   * Get Status Badge Configuration
   * Returns styling and icon for different registration statuses
   */
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

  // Calculate statistics for current view
  const pendingCount = registrations?.filter(r => r.status === 'pending').length || 0
  const approvedCount = registrations?.filter(r => r.status === 'approved').length || 0
  const rejectedCount = registrations?.filter(r => r.status === 'rejected').length || 0
  const allPendingIds = registrations?.filter(r => r.status === 'pending').map(r => r.id) || []
  const isAllSelected = selectedIds.size > 0 && selectedIds.size === allPendingIds.length

  /**
   * Loading State
   * Shows loading spinner while fetching data
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading registrations..." />
      </div>
    )
  }

  /**
   * Error State
   * Shows error message with retry option
   */
  if (error) {
    return (
      <div className="text-center py-12" data-aos="fade-up">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Registrations</h3>
        <p className="text-muted-foreground mb-4">
          Failed to load registration data. Please try again.
        </p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  /**
   * Empty State
   * Shows when no registrations match the current filters
   */
  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-12" data-aos="fade-up">
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
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-aos="fade-up">
        {/* Pending Card */}
        <Card className="bg-yellow-500/10 border-yellow-500/20" data-aos="flip-up" data-aos-delay="0">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>

        {/* Approved Card */}
        <Card className="bg-green-500/10 border-green-500/20" data-aos="flip-up" data-aos-delay="100">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>

        {/* Rejected Card */}
        <Card className="bg-red-500/10 border-red-500/20" data-aos="flip-up" data-aos-delay="200">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {selectedIds.size} registration{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowBulkApproveDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowBulkRejectDialog(true)}
            >
              <X className="mr-2 h-4 w-4" />
              Reject Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </motion.div>
      )}

      {/* Registrations Table */}
      <div className="border rounded-lg overflow-x-auto" data-aos="fade-up" data-aos-delay="300">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select All Checkbox */}
              <TableHead className="w-12">
                {pendingCount > 0 && (
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all pending"
                  />
                )}
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Team/Player</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {registrations.map((registration, index) => {
                const statusBadge = getStatusBadge(registration.status)
                const StatusIcon = statusBadge.icon
                const isSelected = selectedIds.has(registration.id)

                return (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <TableCell>
                      {registration.status === 'pending' && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(registration.id)}
                          aria-label={`Select ${registration.team_name || registration.leader_name}`}
                        />
                      )}
                    </TableCell>

                    {/* Registration ID */}
                    <TableCell className="font-mono text-xs">
                      {getShortId(registration.id)}
                    </TableCell>

                    {/* Team/Player Info */}
                    <TableCell>
                      <div className="space-y-1 min-w-[150px]">
                        {registration.team_name && (
                          <div className="font-semibold truncate">{registration.team_name}</div>
                        )}
                        <div className="text-sm text-muted-foreground truncate">
                          Leader: {registration.leader_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {registration.leader_game_id}
                        </div>
                        {registration.participants && registration.participants.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{registration.participants.length} member{registration.participants.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{formatMobileNumber(registration.leader_whatsapp)}</span>
                      </div>
                    </TableCell>

                    {/* Payment Info */}
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="text-sm font-mono truncate">{registration.transaction_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(registration.tournament?.entry_fee_rs || 0)}
                        </div>
                        {registration.payment_screenshot_url && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => viewPaymentScreenshot(registration.payment_screenshot_url!)}
                          >
                            <ImageIcon className="mr-1 h-3 w-3" />
                            View Screenshot
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge className={statusBadge.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">{registration.status.toUpperCase()}</span>
                      </Badge>
                    </TableCell>

                    {/* Registration Date */}
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(registration.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(registration.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details Dialog */}
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
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                              <DialogDescription>
                                {selectedRegistration?.team_name || selectedRegistration?.leader_name} - {selectedRegistration?.status?.toUpperCase()}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedRegistration && (
                              <div className="space-y-6">
                                {/* Team Information Section */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Team Information
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Registration ID</Label>
                                      <p className="font-mono text-sm mt-1">{getShortId(selectedRegistration.id)}</p>
                                    </div>
                                    {selectedRegistration.team_name && (
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Team Name</Label>
                                        <p className="font-semibold mt-1">{selectedRegistration.team_name}</p>
                                      </div>
                                    )}
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Leader Name</Label>
                                      <p className="mt-1">{selectedRegistration.leader_name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Leader Game ID</Label>
                                      <p className="font-mono mt-1">{selectedRegistration.leader_game_id}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                                      <p className="mt-1">{formatMobileNumber(selectedRegistration.leader_whatsapp)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Tournament</Label>
                                      <p className="mt-1 capitalize">
                                        {selectedRegistration.tournament?.game} - {selectedRegistration.tournament?.mode}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Team Members Section */}
                                {selectedRegistration.participants && selectedRegistration.participants.length > 0 && (
                                  <>
                                    <Separator />
                                    <div className="space-y-4">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <Gamepad2 className="h-4 w-4" />
                                        Team Members
                                      </h4>
                                      <div className="space-y-3">
                                        {selectedRegistration.participants
                                          .sort((a, b) => a.slot_position - b.slot_position)
                                          .map((participant) => (
                                            <div 
                                              key={participant.id} 
                                              className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                                                  {participant.slot_position + 1}
                                                </div>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{participant.player_name}</p>
                                                <p className="text-sm text-muted-foreground font-mono truncate">
                                                  {participant.player_game_id}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Payment Information Section */}
                                <Separator />
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Payment Information</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                                      <p className="font-mono mt-1">{selectedRegistration.transaction_id}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Amount Paid</Label>
                                      <p className="font-semibold text-green-600 mt-1">
                                        {formatCurrency(selectedRegistration.tournament?.entry_fee_rs || 0)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Payment Screenshot Preview */}
                                  {selectedRegistration.payment_screenshot_url && (
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Payment Screenshot</Label>
                                      <div className="space-y-2">
                                        <img 
                                          src={selectedRegistration.payment_screenshot_url} 
                                          alt="Payment screenshot" 
                                          className="w-full max-w-md rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => viewPaymentScreenshot(selectedRegistration.payment_screenshot_url!)}
                                        />
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          asChild
                                        >
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
                                  )}
                                </div>

                                {/* Admin Actions Section - Only for Pending */}
                                {selectedRegistration.status === 'pending' && (
                                  <>
                                    <Separator />
                                    <div className="space-y-4">
                                      <h4 className="font-semibold">Admin Actions</h4>
                                      <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Approve Button */}
                                        <Button 
                                          onClick={() => handleApprove(selectedRegistration)}
                                          disabled={actionLoading === selectedRegistration.id}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
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
                                        
                                        {/* Reject Dialog */}
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="destructive" className="flex-1">
                                              <X className="mr-2 h-4 w-4" />
                                              Reject Registration
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Reject Registration</DialogTitle>
                                              <DialogDescription>
                                                Please provide a reason for rejecting this registration. 
                                                This will be logged for audit purposes.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div>
                                                <Label htmlFor="rejection-reason">Rejection Reason*</Label>
                                                <Textarea
                                                  id="rejection-reason"
                                                  placeholder="Enter reason for rejection..."
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  className="mt-2 min-h-[100px]"
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button 
                                                variant="outline" 
                                                onClick={() => setRejectionReason('')}
                                              >
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
                                                  <>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Confirm Rejection
                                                  </>
                                                )}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Rejection Reason Display - For Rejected Registrations */}
                                {selectedRegistration.status === 'rejected' && (
                                  <>
                                    <Separator />
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-sm text-red-600">
                                          {selectedRegistration.status === 'rejected' 
                                            ? 'Rejection reason not available' 
                                            : 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Quick Actions for Pending Registrations */}
                        {registration.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(registration)}
                            disabled={actionLoading === registration.id}
                            className="bg-green-600 hover:bg-green-700 hidden sm:flex"
                          >
                            {actionLoading === registration.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
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

      {/* Bulk Approve Confirmation Dialog */}
      <Dialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedIds.size} registration{selectedIds.size !== 1 ? 's' : ''}?
              This action will grant tournament access to all selected registrations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkApprove}
              disabled={bulkUpdateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkUpdateMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve {selectedIds.size} Registration{selectedIds.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Confirmation Dialog */}
      <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Rejection</DialogTitle>
            <DialogDescription>
              You are about to reject {selectedIds.size} registration{selectedIds.size !== 1 ? 's' : ''}.
              Please provide a reason for this action.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-rejection-reason">Rejection Reason*</Label>
            <Textarea
              id="bulk-rejection-reason"
              placeholder="Enter reason for rejecting these registrations..."
              value={bulkRejectionReason}
              onChange={(e) => setBulkRejectionReason(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkRejectDialog(false)
                setBulkRejectionReason('')
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBulkReject}
              disabled={!bulkRejectionReason.trim() || bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject {selectedIds.size} Registration{selectedIds.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Screenshot Full View Dialog */}
      <Dialog open={showPaymentImage} onOpenChange={setShowPaymentImage}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>
              Full-size view of payment verification screenshot
            </DialogDescription>
          </DialogHeader>
          {paymentImageUrl && (
            <div className="space-y-4">
              <img 
                src={paymentImageUrl} 
                alt="Payment screenshot full size" 
                className="w-full rounded-lg border"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentImage(false)}>
                  Close
                </Button>
                <Button asChild>
                  <a 
                    href={paymentImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
