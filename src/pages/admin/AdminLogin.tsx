/**
 * Admin Login Page
 * File: src/pages/admin/AdminLogin.tsx
 * Purpose: Authentication page for admin panel access
 * 
 * This page handles admin authentication using Supabase Auth with
 * role verification and secure access to the tournament management dashboard
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowLeft, 
  AlertTriangle,
  CheckCircle,
  Gamepad2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

import { supabase } from '@/lib/supabase/client'
import { useTypingSound } from '@/lib/hooks/useTypingSound'

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * AdminLogin - Secure authentication page for tournament administrators
 */
export const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const { playSound } = useTypingSound()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Form setup
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: import.meta.env.VITE_ADMIN_EMAIL || '',
      password: ''
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  // Check if user is already authenticated on page load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Check if user has admin role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .single()

          if (roleData) {
            // User is already authenticated as admin, redirect to dashboard
            navigate('/admin/dashboard', { replace: true })
            return
          } else {
            // User is authenticated but not an admin, sign them out
            await supabase.auth.signOut()
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [navigate])

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Attempt to sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Authentication failed')
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .single()

      if (roleError || !roleData) {
        // User doesn't have admin role, sign them out
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      // Success! Redirect to dashboard
      navigate('/admin/dashboard', { replace: true })
      
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking authentication status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back to home link */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to GameArena
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur border-2">
            <CardHeader className="space-y-4 text-center">
              {/* Logo and branding */}
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Gamepad2 className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">
                  Admin Login
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Access the tournament management dashboard
                </p>
              </div>

              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                <Shield className="mr-1 h-3 w-3" />
                Secure Access Required
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Login form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter admin email"
                    {...register('email')}
                    onKeyDown={playSound}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter admin password"
                      {...register('password')}
                      onKeyDown={playSound}
                      className={errors.password ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Error display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="Signing in..." />
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In to Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* Security notice */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-400">
                      Secure Authentication
                    </p>
                    <p className="text-blue-600/80 dark:text-blue-400/80">
                      Your session is protected with enterprise-grade security
                    </p>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  Only authorized tournament administrators can access this panel.
                  <br />
                  Need help? Contact{' '}
                  <a 
                    href="mailto:support@gamearena.com" 
                    className="text-primary hover:underline"
                  >
                    support@gamearena.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminLogin