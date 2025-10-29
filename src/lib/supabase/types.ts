/**
 * Supabase Database Types
 * File: src/lib/supabase/types.ts
 * Purpose: TypeScript type definitions for the GameArena database schema
 * 
 * These types are generated based on the Supabase database schema and provide
 * type safety for all database operations throughout the application
 */

// Main Database interface that maps to all tables
export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          game: 'bgmi' | 'freefire'
          mode: 'solo' | 'duo' | 'squad'
          entry_fee_rs: number
          prize_winner_rs: number
          prize_runner_rs: number
          prize_per_kill_rs: number
          max_capacity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game: 'bgmi' | 'freefire'
          mode: 'solo' | 'duo' | 'squad'
          entry_fee_rs: number
          prize_winner_rs: number
          prize_runner_rs: number
          prize_per_kill_rs: number
          max_capacity: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game?: 'bgmi' | 'freefire'
          mode?: 'solo' | 'duo' | 'squad'
          entry_fee_rs?: number
          prize_winner_rs?: number
          prize_runner_rs?: number
          prize_per_kill_rs?: number
          max_capacity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          tournament_id: string
          status: 'pending' | 'approved' | 'rejected'
          team_name: string | null
          leader_name: string
          leader_game_id: string
          leader_whatsapp: string
          transaction_id: string
          payment_screenshot_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          status?: 'pending' | 'approved' | 'rejected'
          team_name?: string | null
          leader_name: string
          leader_game_id: string
          leader_whatsapp: string
          transaction_id: string
          payment_screenshot_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          team_name?: string | null
          leader_name?: string
          leader_game_id?: string
          leader_whatsapp?: string
          transaction_id?: string
          payment_screenshot_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          registration_id: string
          player_name: string
          player_game_id: string
          slot_position: number
          created_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          player_name: string
          player_game_id: string
          slot_position: number
          created_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          player_name?: string
          player_game_id?: string
          slot_position?: number
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          registration_id: string | null
          admin_user_id: string | null
          action: 'pending' | 'approved' | 'rejected'
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          registration_id?: string | null
          admin_user_id?: string | null
          action: 'pending' | 'approved' | 'rejected'
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          registration_id?: string | null
          admin_user_id?: string | null
          action?: 'pending' | 'approved' | 'rejected'
          reason?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [key: string]: {
        Args: any
        Returns: any
      }
    }
    Enums: {
      game_type: 'bgmi' | 'freefire'
      match_mode: 'solo' | 'duo' | 'squad'
      registration_status: 'pending' | 'approved' | 'rejected'
      app_role: 'admin' | 'user'
    }
  }
}

// Export individual types for convenience
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
export type Participant = Database['public']['Tables']['participants']['Row']
export type AdminAction = Database['public']['Tables']['admin_actions']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']

// Form data types for registration forms
export interface RegistrationFormData {
  team_name?: string
  leader_name: string
  leader_game_id: string
  leader_whatsapp: string
  transaction_id: string
  payment_screenshot: File | null
  participants?: ParticipantFormData[]
}

export interface ParticipantFormData {
  player_name: string
  player_game_id: string
  slot_position: number
}

// API response types
export interface RegistrationResponse {
  success: boolean
  registration_id?: string
  slots_remaining?: number
  error?: string
}

export interface SlotAvailability {
  capacity: number
  filled: number
  remaining: number
}

export interface TournamentStats {
  total_registrations: number
  pending_count: number
  approved_count: number
  rejected_count: number
  capacity: number
  remaining_slots: number
}