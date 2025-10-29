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

// Get Supabase configuration from environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ielwxcdoejxahmdsfznj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbHd4Y2RvZWp4YWhtZHNmem5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg0NjIsImV4cCI6MjA1MDk1NDQ2Mn0.ZqX7_3QtMVf4W1jdtafWBoOMuy9_DDlABJYK39aRYGo'

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Using fallback values.')
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