/**
 * Supabase Database Setup Checker
 * File: src/lib/supabase/setupChecker.ts
 * Purpose: Verify database setup and provide clear feedback
 */

import { supabase } from './client'

export interface SetupStatus {
  isSetup: boolean
  hasTables: boolean
  hasFunctions: boolean
  hasAdminUser: boolean
  missingItems: string[]
  errors: string[]
}

/**
 * Check if database is properly set up
 */
export async function checkDatabaseSetup(): Promise<SetupStatus> {
  const status: SetupStatus = {
    isSetup: false,
    hasTables: false,
    hasFunctions: false,
    hasAdminUser: false,
    missingItems: [],
    errors: []
  }

  try {
    // Check 1: Can we query tournaments table?
    console.log('🔍 Checking tournaments table...')
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id')
      .limit(1)

    if (tournamentsError) {
      status.errors.push(`Tournaments table: ${tournamentsError.message}`)
      status.missingItems.push('Database tables not created')
    } else {
      status.hasTables = true
      console.log('✅ Tournaments table exists')
    }

    // Check 2: Can we call RPC functions?
    console.log('🔍 Checking RPC functions...')
    const { data: slotData, error: rpcError } = await (supabase as any)
      .rpc('get_slot_availability', { p_tournament_id: 'bgmi-solo-id' })

    if (rpcError) {
      status.errors.push(`RPC functions: ${rpcError.message}`)
      status.missingItems.push('Database functions not created')
    } else {
      status.hasFunctions = true
      console.log('✅ RPC functions exist')
    }

    // Check 3: Do we have the current user session?
    console.log('🔍 Checking admin authentication...')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Check if current user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single()

      if (!roleError && roleData) {
        status.hasAdminUser = true
        console.log('✅ Admin user configured')
      } else {
        status.missingItems.push('Admin role not assigned to current user')
      }
    } else {
      status.missingItems.push('No admin user logged in')
    }

    // Final status
    status.isSetup = status.hasTables && status.hasFunctions
    
    return status
  } catch (error: any) {
    status.errors.push(`Unexpected error: ${error.message}`)
    return status
  }
}

/**
 * Get user-friendly setup instructions based on what's missing
 */
export function getSetupInstructions(status: SetupStatus): string {
  if (status.isSetup) {
    return '✅ Database is fully set up and ready!'
  }

  let instructions = '⚠️ DATABASE NOT SET UP!\n\n'
  instructions += 'Missing items:\n'
  status.missingItems.forEach(item => {
    instructions += `  ❌ ${item}\n`
  })
  
  instructions += '\n📋 QUICK FIX:\n\n'
  instructions += '1. Go to: https://supabase.com/dashboard\n'
  instructions += '2. Open your project: https://ielwxcdoejxahmdsfznj.supabase.co\n'
  instructions += '3. Click "SQL Editor" → "New Query"\n'
  instructions += '4. Open SUPABASE_SETUP_COMPLETE.sql from this project\n'
  instructions += '5. Copy ALL content and paste in SQL Editor\n'
  instructions += '6. Click RUN\n'
  instructions += '7. Wait for success message\n'
  instructions += '8. Refresh this page\n\n'
  
  if (!status.hasAdminUser) {
    instructions += '📝 ADMIN SETUP:\n\n'
    instructions += '1. In Supabase Dashboard → Authentication → Users\n'
    instructions += '2. Add User:\n'
    instructions += '   - Email: ishukriitpatna@gmail.com\n'
    instructions += '   - Password: ISHUkr75@\n'
    instructions += '   - Enable "Auto Confirm User"\n'
    instructions += '3. Copy the User ID\n'
    instructions += '4. In SQL Editor, run:\n'
    instructions += '   INSERT INTO user_roles (user_id, role)\n'
    instructions += '   VALUES (\'YOUR_USER_ID\', \'admin\');\n\n'
  }

  return instructions
}
