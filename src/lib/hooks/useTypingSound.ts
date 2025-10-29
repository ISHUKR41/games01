/**
 * Typing Sound Hook
 * File: src/lib/hooks/useTypingSound.ts
 * Purpose: Custom React hook to manage typing sound effects
 * 
 * This hook provides typing sound functionality with user preferences
 * and localStorage persistence for the GameArena platform
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// Type definition for the hook return value
interface UseTypingSoundReturn {
  enabled: boolean
  playSound: () => void
  toggle: () => void
}

/**
 * useTypingSound - Hook for managing typing sound effects
 * 
 * Features:
 * - Toggle sound on/off
 * - Persistent preferences in localStorage
 * - Optimized audio playback
 * - Graceful error handling
 * 
 * @returns Object with enabled state, playSound function, and toggle function
 */
export function useTypingSound(): UseTypingSoundReturn {
  // State to track if typing sound is enabled
  const [enabled, setEnabled] = useState(() => {
    // Load preference from localStorage, default to true
    const saved = localStorage.getItem('gamearena-typing-sound')
    return saved !== null ? JSON.parse(saved) : true
  })

  // Ref to hold the audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isLoadedRef = useRef(false)

  // Initialize audio when component mounts
  useEffect(() => {
    // Check if we're in the browser (SSR safety)
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Create a simple click/typing sound using Web Audio API
      // This is a fallback if the audio file doesn't exist
      const createTypingSound = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          
          return () => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            // Create a subtle click sound
            oscillator.frequency.value = 800
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.05)
          }
        } catch (e) {
          return null
        }
      }

      // Try to load audio file first
      const audio = new Audio('/sounds/typing.mp3')
      audio.volume = 0.3
      audio.preload = 'auto'
      
      const handleCanPlay = () => {
        isLoadedRef.current = true
      }
      
      const handleError = () => {
        // Fallback to Web Audio API
        const fallbackSound = createTypingSound()
        if (fallbackSound) {
          audioRef.current = { play: fallbackSound } as any
          isLoadedRef.current = true
        } else {
          isLoadedRef.current = false
        }
      }

      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('error', handleError)
      
      audioRef.current = audio

      // Cleanup function
      return () => {
        if (audioRef.current) {
          if ('removeEventListener' in audioRef.current) {
            audioRef.current.removeEventListener('canplay', handleCanPlay)
            audioRef.current.removeEventListener('error', handleError)
          }
          audioRef.current = null
        }
      }
    } catch (error) {
      isLoadedRef.current = false
    }
  }, [])

  // Function to play the typing sound
  const playSound = useCallback(() => {
    // Only play if enabled and audio is available
    if (!enabled || !audioRef.current || !isLoadedRef.current) {
      return
    }

    try {
      // Reset audio to beginning for rapid key presses
      audioRef.current.currentTime = 0
      
      // Play the sound (use promise to handle potential errors)
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Handle autoplay policy errors gracefully
          console.warn('Audio play failed:', error)
        })
      }
    } catch (error) {
      console.warn('Failed to play typing sound:', error)
    }
  }, [enabled])

  // Function to toggle sound on/off
  const toggle = useCallback(() => {
    setEnabled((prev: boolean) => {
      const newState = !prev
      
      // Persist preference in localStorage
      localStorage.setItem('gamearena-typing-sound', JSON.stringify(newState))
      
      return newState
    })
  }, [])

  return {
    enabled,
    playSound,
    toggle
  }
}