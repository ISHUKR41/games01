/**
 * Database Setup Guide Component
 * Shows clear instructions when database is not configured
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Database, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { checkDatabaseSetup, SetupStatus } from '@/lib/supabase/setupChecker'

export const DatabaseSetupGuide: React.FC = () => {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [checking, setChecking] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    setChecking(true)
    const result = await checkDatabaseSetup()
    setStatus(result)
    setChecking(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Checking database setup...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!status || status.isSetup) {
    return null
  }

  const sqlSetupQuery = `-- COPY EVERYTHING FROM SUPABASE_SETUP_COMPLETE.sql FILE
-- Then come back and create admin user`

  const adminSetupQuery = `-- Step 1: Create user in Authentication > Users:
-- Email: ishukriitpatna@gmail.com
-- Password: ISHUkr75@
-- Enable "Auto Confirm User"

-- Step 2: Copy the User ID, then run:
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');`

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-gray-900 border-red-500 border-2">
          <CardHeader className="border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <CardTitle className="text-2xl text-white">
                Database Setup Required / Database Setup Zaruri Hai
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <Alert className="bg-red-500/10 border-red-500">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDescription className="text-white text-lg">
                <strong>Your Supabase database is empty!</strong>
                <br />
                Aapka Supabase database khali hai! Tables aur functions create nahi hue.
              </AlertDescription>
            </Alert>

            {status.missingItems.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                <h3 className="text-yellow-500 font-bold mb-2">Missing Items:</h3>
                <ul className="space-y-1">
                  {status.missingItems.map((item, i) => (
                    <li key={i} className="text-white flex items-center gap-2">
                      <span className="text-red-500">❌</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                🚀 FIX - Just 2 Steps (5 minutes)
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                  <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    STEP 1: Setup Database (3 minutes)
                  </h4>
                  <ol className="space-y-2 text-white list-decimal list-inside">
                    <li>
                      Open Supabase Dashboard:
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open('https://supabase.com/dashboard/project/ielwxcdoejxahmdsfznj/editor', '_blank')}
                      >
                        Open Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </li>
                    <li>Click "SQL Editor" → "New Query"</li>
                    <li>
                      Open file <code className="bg-gray-800 px-2 py-1 rounded">SUPABASE_SETUP_COMPLETE.sql</code> from this project
                    </li>
                    <li>Copy ALL content (it's a big file, copy everything!)</li>
                    <li>Paste in SQL Editor and click RUN</li>
                    <li>Wait for "Success" message</li>
                  </ol>

                  <div className="mt-3 p-3 bg-gray-800 rounded text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Verify Setup:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('SELECT COUNT(*) FROM tournaments;')}
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <code className="text-green-400">SELECT COUNT(*) FROM tournaments;</code>
                    <p className="text-gray-400 mt-1">Should return: 6</p>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4">
                  <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    STEP 2: Create Admin User (2 minutes)
                  </h4>
                  <ol className="space-y-2 text-white list-decimal list-inside">
                    <li>
                      In Supabase Dashboard → Authentication → Users
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open('https://supabase.com/dashboard/project/ielwxcdoejxahmdsfznj/auth/users', '_blank')}
                      >
                        Open Users <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </li>
                    <li>Click "Add User" and fill:
                      <div className="ml-6 mt-1 bg-gray-800 p-2 rounded text-sm">
                        <div>Email: <code className="text-green-400">ishukriitpatna@gmail.com</code></div>
                        <div>Password: <code className="text-green-400">ISHUkr75@</code></div>
                        <div>✓ Enable "Auto Confirm User"</div>
                      </div>
                    </li>
                    <li>Copy the User ID (looks like: a1b2c3d4-e5f6...)</li>
                    <li>Go back to SQL Editor and run:
                      <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Admin Role Query:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(adminSetupQuery)}
                          >
                            <Copy className="h-4 w-4" />
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <pre className="text-green-400 text-xs whitespace-pre-wrap">
                          {adminSetupQuery}
                        </pre>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <h4 className="text-green-400 font-bold mb-2">✅ After Setup:</h4>
                <ul className="space-y-1 text-white">
                  <li>✓ Refresh this page</li>
                  <li>✓ Registration will work (no more "Tournament Full")</li>
                  <li>✓ Admin login will work</li>
                  <li>✓ Slots will show correctly (100, 50, 25, etc.)</li>
                  <li>✓ Data will persist (won't disappear on refresh)</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={checkSetup}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Check Setup Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
