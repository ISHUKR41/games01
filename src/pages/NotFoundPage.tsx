/**
 * Not Found Page Component
 * File: src/pages/NotFoundPage.tsx
 * Purpose: 404 error page for invalid routes in the GameArena platform
 * 
 * This page provides a user-friendly 404 error message with navigation
 * options to help users find what they're looking for
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Gamepad2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * NotFoundPage - 404 error page with helpful navigation
 */
export const NotFoundPage: React.FC = () => {
  // Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

  const bounceAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center"
        >
          <Card className="bg-card/50 backdrop-blur border-2">
            <CardHeader className="pb-4">
              {/* 404 Animation */}
              <motion.div
                animate={bounceAnimation}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <span className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    404
                  </span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-4 -right-4"
                  >
                    <Gamepad2 className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
              </motion.div>

              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Oops! Page Not Found
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 text-center">
                <p className="text-xl text-muted-foreground">
                  The tournament page you're looking for doesn't exist or has been moved.
                </p>
                
                <p className="text-muted-foreground">
                  Don't worry! You can still join the action by exploring our active tournaments.
                </p>
              </div>

              {/* Quick Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Button asChild size="lg" className="w-full">
                  <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    Go Home
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/bgmi">
                    <Gamepad2 className="mr-2 h-5 w-5" />
                    BGMI Tournaments
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/freefire">
                    <Search className="mr-2 h-5 w-5" />
                    Free Fire Tournaments
                  </Link>
                </Button>

                <Button 
                  asChild 
                  variant="ghost" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.history.back()}
                >
                  <button>
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Go Back
                  </button>
                </Button>
              </div>

              {/* Help Text */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Still having trouble? Visit our{' '}
                  <Link 
                    to="/contact" 
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Page
                  </Link>
                  {' '}for support.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFoundPage