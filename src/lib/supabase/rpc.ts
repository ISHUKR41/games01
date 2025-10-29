/**
 * Supabase RPC Wrapper Functions
 * File: src/lib/supabase/rpc.ts
 * Purpose: Type-safe wrapper functions for Supabase RPC calls
 * 
 * This file provides wrapper functions to handle RPC calls with proper typing
 * while bypassing TypeScript's strict inference issues
 */

import { supabase } from './client'

// Types for RPC function parameters and returns
export interface RegisterForTournamentParams {
  p_tournament_id: string
  p_team_name: string | null
  p_leader_name: string
  p_leader_game_id: string
  p_leader_whatsapp: string
  p_transaction_id: string
  p_payment_screenshot_url: string | null
  p_participants: any | null
}

export interface RegisterForTournamentResponse {
  success: boolean
  registration_id?: string
  slots_remaining?: number
  error?: string
}

export interface SlotAvailabilityParams {
  p_tournament_id: string
}

export interface SlotAvailabilityResponse {
  capacity: number
  filled: number
  remaining: number
}

export interface UpdateRegistrationStatusParams {
  p_registration_id: string
  p_new_status: 'pending' | 'approved' | 'rejected'
  p_admin_user_id: string
  p_reason?: string | null
}

export interface UpdateRegistrationStatusResponse {
  success: boolean
  old_status?: 'pending' | 'approved' | 'rejected'
  new_status?: 'pending' | 'approved' | 'rejected'
  error?: string
}

/**
 * Register for tournament with proper error handling
 */
export async function registerForTournament(
  params: RegisterForTournamentParams
): Promise<RegisterForTournamentResponse> {
  const { data, error } = await (supabase as any).rpc('register_for_tournament', params)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data as RegisterForTournamentResponse
}

/**
 * Get slot availability for a tournament
 */
export async function getSlotAvailability(
  params: SlotAvailabilityParams
): Promise<SlotAvailabilityResponse> {
  const { data, error } = await (supabase as any).rpc('get_slot_availability', params)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data as SlotAvailabilityResponse
}

/**
 * Update registration status (admin only)
 */
export async function updateRegistrationStatus(
  params: UpdateRegistrationStatusParams
): Promise<UpdateRegistrationStatusResponse> {
  const { data, error } = await (supabase as any).rpc('update_registration_status', params)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data as UpdateRegistrationStatusResponse
}

/**
 * Get tournament statistics (admin only)
 */
export async function getTournamentStats(tournamentId: string) {
  const { data, error } = await (supabase as any).rpc('get_tournament_stats', {
    p_tournament_id: tournamentId
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

/**
 * Check if user has admin role
 */
export async function hasAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await (supabase as any).rpc('has_admin_role', {
    _user_id: userId
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data as boolean
}
