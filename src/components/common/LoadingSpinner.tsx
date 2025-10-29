/**
 * Loading Spinner Component
 * File: src/components/common/LoadingSpinner.tsx
 * Purpose: Reusable loading spinner component for the GameArena platform
 * 
 * This component provides visual feedback during loading states throughout
 * the application, maintaining a consistent loading experience
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

/**
 * LoadingSpinner - Displays an animated loading indicator
 * @param size - Size variant (sm: 16px, md: 24px, lg: 32px)
 * @param className - Additional CSS classes
 * @param text - Optional loading text to display
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  // Size mapping for the spinner icon
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )} 
      />
      {text && (
        <span className="text-sm text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  )
}