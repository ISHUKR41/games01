/**
 * Navigation Bar Component
 * File: src/components/layout/Navbar.tsx  
 * Purpose: Main navigation component for the GameArena platform
 * 
 * This component provides navigation between different sections of the platform
 * and includes responsive design for mobile and desktop devices
 */

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Gamepad2, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Navbar - Main navigation component with responsive mobile menu
 */
export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Navigation links configuration
  const navLinks = [
    {
      href: '/',
      label: 'Home',
      icon: Gamepad2,
      description: 'Tournament overview'
    },
    {
      href: '/bgmi',
      label: 'BGMI',
      icon: Users,
      description: 'BGMI tournaments'
    },
    {
      href: '/freefire',
      label: 'Free Fire',
      icon: Zap,
      description: 'Free Fire tournaments'
    },
    {
      href: '/contact',
      label: 'Contact',
      icon: Users,
      description: 'Get in touch'
    }
  ]

  // Check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              GameArena
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = isActiveRoute(link.href)
              
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Admin Link & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Admin link - visible on all screen sizes */}
            <Link to="/admin/login">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm" 
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = isActiveRoute(link.href)
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span className="font-medium">{link.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {link.description}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}