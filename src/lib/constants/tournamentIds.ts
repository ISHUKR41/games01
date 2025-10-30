/**
 * Tournament ID Constants
 * File: src/lib/constants/tournamentIds.ts
 * Purpose: Centralized tournament UUID constants that match database schema
 * 
 * These UUIDs are explicitly defined in the database seed data (COMPLETE_SETUP.sql)
 * to ensure frontend and backend tournament IDs always match
 */

// BGMI Tournament UUIDs (Pattern: 10000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
export const BGMI_SOLO_ID = '10000000-0000-4000-8000-000000000001'
export const BGMI_DUO_ID = '10000000-0000-4000-8000-000000000002'
export const BGMI_SQUAD_ID = '10000000-0000-4000-8000-000000000003'

// Free Fire Tournament UUIDs (Pattern: 20000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
export const FREEFIRE_SOLO_ID = '20000000-0000-4000-8000-000000000001'
export const FREEFIRE_DUO_ID = '20000000-0000-4000-8000-000000000002'
export const FREEFIRE_SQUAD_ID = '20000000-0000-4000-8000-000000000003'

// Export all tournament IDs as an object for easy access
export const TOURNAMENT_IDS = {
  bgmi: {
    solo: BGMI_SOLO_ID,
    duo: BGMI_DUO_ID,
    squad: BGMI_SQUAD_ID
  },
  freefire: {
    solo: FREEFIRE_SOLO_ID,
    duo: FREEFIRE_DUO_ID,
    squad: FREEFIRE_SQUAD_ID
  }
} as const

// Type-safe tournament ID lookup helper
export function getTournamentId(
  game: 'bgmi' | 'freefire',
  mode: 'solo' | 'duo' | 'squad'
): string {
  return TOURNAMENT_IDS[game][mode]
}
