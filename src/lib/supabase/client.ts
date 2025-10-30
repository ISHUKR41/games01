/**
 * Supabase Client Configuration
 * File: src/lib/supabase/client.ts
 * Purpose: Initialize and configure Supabase client for GameArena tournament platform
 * 
 * This client handles all database operations, authentication, storage, and real-time subscriptions
 * It's the core connection between the frontend and Supabase backend
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const FALLBACK_SUPABASE_URL = 'https://ielwxcdoejxahmdsfznj.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbHd4Y2RvZWp4YWhtZHNmem5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg0NjIsImV4cCI6MjA1MDk1NDQ2Mn0.ZqX7_3QtMVf4W1jdtafWBoOMuy9_DDlABJYK39aRYGo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

console.log('Supabase URL loaded:', supabaseUrl ? 'Yes' : 'No')
console.log('Supabase Key loaded:', supabaseAnonKey ? 'Yes' : 'No')
console.log('Using hardcoded credentials:', !import.meta.env.VITE_SUPABASE_URL)

/**
 * Create a mock Supabase client for when environment variables are not configured
 * This prevents the app from crashing and allows pages to render
 */
const createMockSupabaseClient = () => {
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.warn('⚠️  SUPABASE NOT CONFIGURED - Using Mock Client')
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.warn('')
  console.warn('The app is running in fallback mode. Database features will not work.')
  console.warn('')
  console.warn('To enable Supabase features:')
  console.warn('1. Set VITE_SUPABASE_URL in your environment variables')
  console.warn('2. Set VITE_SUPABASE_ANON_KEY in your environment variables')
  console.warn('3. Restart the development server')
  console.warn('')
  console.warn('See SETUP_INSTRUCTIONS.md for detailed setup instructions')
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const mockError = {
    message: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    hint: 'See SETUP_INSTRUCTIONS.md for setup instructions',
    code: 'SUPABASE_NOT_CONFIGURED'
  }

  const mockResponse = { data: null, error: mockError }

  // Create a chainable mock query builder that mimics Supabase API
  const createMockQueryBuilder = () => ({
    select: () => createMockQueryBuilder(),
    insert: () => createMockQueryBuilder(),
    update: () => createMockQueryBuilder(),
    delete: () => createMockQueryBuilder(),
    upsert: () => createMockQueryBuilder(),
    eq: () => createMockQueryBuilder(),
    neq: () => createMockQueryBuilder(),
    gt: () => createMockQueryBuilder(),
    gte: () => createMockQueryBuilder(),
    lt: () => createMockQueryBuilder(),
    lte: () => createMockQueryBuilder(),
    like: () => createMockQueryBuilder(),
    ilike: () => createMockQueryBuilder(),
    is: () => createMockQueryBuilder(),
    in: () => createMockQueryBuilder(),
    contains: () => createMockQueryBuilder(),
    containedBy: () => createMockQueryBuilder(),
    match: () => createMockQueryBuilder(),
    not: () => createMockQueryBuilder(),
    or: () => createMockQueryBuilder(),
    filter: () => createMockQueryBuilder(),
    order: () => createMockQueryBuilder(),
    limit: () => createMockQueryBuilder(),
    range: () => createMockQueryBuilder(),
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
    csv: () => Promise.resolve(mockResponse),
    then: (resolve: any) => Promise.resolve(mockResponse).then(resolve),
    catch: (reject: any) => Promise.resolve(mockResponse).catch(reject),
  })

  // Return a mock client with the essential Supabase API structure
  return {
    from: (table: string) => {
      console.warn(`⚠️ Attempted to query table "${table}" but Supabase is not configured`)
      return createMockQueryBuilder()
    },
    auth: {
      signUp: () => {
        console.warn('⚠️ Attempted to sign up but Supabase is not configured')
        return Promise.resolve({ data: { user: null, session: null }, error: mockError })
      },
      signInWithPassword: () => {
        console.warn('⚠️ Attempted to sign in but Supabase is not configured')
        return Promise.resolve({ data: { user: null, session: null }, error: mockError })
      },
      signInWithOAuth: () => {
        console.warn('⚠️ Attempted OAuth sign in but Supabase is not configured')
        return Promise.resolve({ data: { provider: null, url: null }, error: mockError })
      },
      signOut: () => {
        console.warn('⚠️ Attempted to sign out but Supabase is not configured')
        return Promise.resolve({ error: null })
      },
      getSession: () => {
        return Promise.resolve({ data: { session: null }, error: null })
      },
      getUser: () => {
        return Promise.resolve({ data: { user: null }, error: null })
      },
      onAuthStateChange: () => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        }
      },
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: mockError }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: mockError }),
    },
    storage: {
      from: () => ({
        upload: () => {
          console.warn('⚠️ Attempted to upload file but Supabase is not configured')
          return Promise.resolve(mockResponse)
        },
        download: () => {
          console.warn('⚠️ Attempted to download file but Supabase is not configured')
          return Promise.resolve(mockResponse)
        },
        getPublicUrl: () => {
          console.warn('⚠️ Attempted to get public URL but Supabase is not configured')
          return { data: { publicUrl: '' } }
        },
        remove: () => Promise.resolve(mockResponse),
        list: () => Promise.resolve(mockResponse),
      }),
    },
    rpc: (fn: string, params?: any) => {
      console.warn(`⚠️ Attempted to call RPC function "${fn}" but Supabase is not configured`)
      return Promise.resolve(mockResponse)
    },
    channel: (name: string) => {
      console.warn(`⚠️ Attempted to create channel "${name}" but Supabase is not configured`)
      return {
        on: () => ({ subscribe: () => 'OK' }),
        subscribe: () => 'OK',
        unsubscribe: () => Promise.resolve({ error: null }),
      }
    },
    removeChannel: (channel: any) => {
      console.warn('⚠️ Attempted to remove channel but Supabase is not configured')
      return Promise.resolve({ error: null })
    },
    removeAllChannels: () => {
      console.warn('⚠️ Attempted to remove all channels but Supabase is not configured')
      return Promise.resolve({ error: null })
    },
  } as any
}

// Create the Supabase client or mock client based on environment variables
export const supabase = (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '')
  ? createMockSupabaseClient()
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })

export type { Database } from './types'
