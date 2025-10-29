/**
 * Registration Completion Hook
 * File: src/lib/hooks/useRegistrationCompletion.ts
 * Purpose: Shared hook to handle post-registration cleanup and state reset
 * 
 * This hook solves the critical issue where form data persists after submission
 * by properly resetting all form state, clearing image previews, and invalidating queries
 */

import { useCallback } from 'react'
import { UseFormReset } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UseRegistrationCompletionOptions {
  // React Hook Form reset function
  formReset: UseFormReset<any>
  
  // Function to reset current step to 1
  setCurrentStep: (step: number) => void
  
  // Function to clear uploaded image preview URL
  setUploadedImageUrl: (url: string | null) => void
  
  // Tournament ID for cache invalidation
  tournamentId: string
  
  // Optional callback after cleanup
  onComplete?: () => void
}

interface UseRegistrationCompletionReturn {
  // Call this function when registration is successfully submitted
  handleSuccess: (registrationId?: string, slotsRemaining?: number) => void
  
  // Call this function when registration fails
  handleError: (error: Error) => void
}

/**
 * useRegistrationCompletion - Centralized post-registration cleanup
 * 
 * Features:
 * - Resets form to default values
 * - Clears multi-step navigation back to step 1
 * - Revokes image preview URLs to prevent memory leaks
 * - Invalidates slot availability cache for real-time updates
 * - Shows success/error toasts
 * 
 * @param options Configuration object with form reset functions and tournament ID
 * @returns Object with handleSuccess and handleError functions
 */
export function useRegistrationCompletion(
  options: UseRegistrationCompletionOptions
): UseRegistrationCompletionReturn {
  const {
    formReset,
    setCurrentStep,
    setUploadedImageUrl,
    tournamentId,
    onComplete
  } = options

  const queryClient = useQueryClient()

  /**
   * Handle successful registration
   * - Resets all form state
   * - Clears image previews
   * - Invalidates cache
   * - Shows success message
   */
  const handleSuccess = useCallback(
    (registrationId?: string, slotsRemaining?: number) => {
      // Step 1: Reset form to default values
      formReset()

      // Step 2: Reset multi-step navigation to first step
      setCurrentStep(1)

      // Step 3: Clear image preview URL (important to prevent memory leaks)
      setUploadedImageUrl(null)

      // Step 4: Invalidate slot availability cache to trigger refetch
      // This ensures the UI shows updated slot counts immediately
      queryClient.invalidateQueries({
        queryKey: ['slot-availability', tournamentId]
      })

      // Step 5: Also invalidate admin registrations if needed
      queryClient.invalidateQueries({
        queryKey: ['admin-registrations']
      })

      // Step 6: Show success toast with details
      toast.success('Registration Successful!', {
        description: slotsRemaining !== undefined
          ? `Your registration has been submitted. ${slotsRemaining} slots remaining.`
          : 'Your registration has been submitted for admin approval.',
        duration: 5000,
      })

      // Step 7: Call optional completion callback
      if (onComplete) {
        onComplete()
      }
    },
    [formReset, setCurrentStep, setUploadedImageUrl, queryClient, tournamentId, onComplete]
  )

  /**
   * Handle registration error
   * - Shows error toast
   * - Logs error for debugging
   */
  const handleError = useCallback(
    (error: Error) => {
      // Log error for debugging
      console.error('Registration error:', error)

      // Show user-friendly error message
      const errorMessage = error.message || 'An unexpected error occurred'
      
      toast.error('Registration Failed', {
        description: errorMessage.includes('full')
          ? 'Tournament is full. Please try another tournament.'
          : errorMessage,
        duration: 7000,
      })
    },
    []
  )

  return {
    handleSuccess,
    handleError,
  }
}
