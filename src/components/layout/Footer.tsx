/**
 * Footer Component
 * File: src/components/layout/Footer.tsx
 * Purpose: Footer component with typing sound toggle and links
 * 
 * This component provides the site footer with useful links, typing sound toggle,
 * and company information for the GameArena platform
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Volume2, VolumeX, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTypingSound } from '@/lib/hooks/useTypingSound'

/**
 * Footer - Site footer with navigation and typing sound toggle
 */
export const Footer: React.FC = () => {
  const { enabled: typingSoundEnabled, toggle: toggleTypingSound } = useTypingSound()

  // Current year for copyright
  const currentYear = new Date().getFullYear()

  // Footer link sections
  const linkSections = [
    {
      title: 'Tournaments',
      links: [
        { label: 'BGMI Solo', href: '/bgmi' },
        { label: 'BGMI Duo', href: '/bgmi' },
        { label: 'BGMI Squad', href: '/bgmi' },
        { label: 'Free Fire Solo', href: '/freefire' },
        { label: 'Free Fire Duo', href: '/freefire' },
        { label: 'Free Fire Squad', href: '/freefire' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'Tournament Rules', href: '/#rules' },
        { label: 'Payment Guide', href: '/#payment' },
        { label: 'FAQ', href: '/contact#faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About GameArena', href: '/contact#about' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Admin Panel', href: '/admin/login' }
      ]
    }
  ]

  return (
    <footer className="border-t bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 font-bold text-xl"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                GameArena
              </span>
            </Link>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's premier tournament platform for BGMI and Free Fire. 
              Join thousands of players competing for exciting prizes.
            </p>

            {/* Contact Information */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@gamearena.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765-43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Link Sections */}
              {linkSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={`${section.title}-${index}`}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Settings Section */}
        <div className="border-t pt-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">
                User Preferences
              </h3>
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </div>

            {/* Typing Sound Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {typingSoundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="typing-sound" className="text-sm">
                  Typing Sound
                </Label>
              </div>
              
              <Switch
                id="typing-sound"
                checked={typingSoundEnabled}
                onCheckedChange={toggleTypingSound}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} GameArena. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Made in India 🇮🇳</span>
              <span>•</span>
              <span>Secure Payments</span>
              <span>•</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}