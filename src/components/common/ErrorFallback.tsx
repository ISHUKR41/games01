/**
 * Error Fallback Component
 * File: src/components/common/ErrorFallback.tsx
 * Purpose: Graceful error handling component for the GameArena platform
 * 
 * This component displays user-friendly error messages and provides
 * recovery options when something goes wrong in the application
 */

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorFallbackProps {
  error?: Error | null
  resetError?: () => void
  title?: string
  description?: string
}

/**
 * ErrorFallback - Displays error information with recovery options
 * @param error - The error object (if available)
 * @param resetError - Function to reset the error state
 * @param title - Custom error title
 * @param description - Custom error description
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try refreshing the page."
}) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2">
            {description}
          </AlertDescription>
        </Alert>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <Alert>
            <AlertTitle>Debug Information</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-xs">
              <pre className="whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {error.stack}
                    </div>
                  </details>
                )}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Recovery actions */}
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            size="sm"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}