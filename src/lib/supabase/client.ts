/**
 * Supabase Client Configuration
 * File: src/lib/supabase/client.ts
 * Purpose: Initialize and configure Supabase client for GameArena tournament platform
 * 
 * This client handles all database operations, authentication, storage, and real-time subscriptions
 * It's the core connection between the frontend and Supabase backend
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from './types' // Import the generated types

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug log (will be removed in production)
console.log('Supabase URL loaded:', supabaseUrl ? 'Yes' : 'No')
console.log('Supabase Key loaded:', supabaseAnonKey ? 'Yes' : 'No')

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', { 
    url: supabaseUrl, 
    keyPrefix: supabaseAnonKey?.substring(0, 20) 
  })
  throw new Error('Missing Supabase configuration! Please check your .env file.')
}

// Create and export the Supabase client with TypeScript types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh for better user experience
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL hash (useful for email confirmations)
    detectSessionInUrl: true
  },
  realtime: {
    // Enable real-time features for live slot updates
    params: {
      eventsPerSecond: 10
    }
  }
})

// Export types for use throughout the application
export type { Database } from './types'