/**
 * Utility Functions
 * File: src/lib/utils.ts
 * Purpose: Common utility functions used throughout the GameArena platform
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with clsx and merges Tailwind classes
 * This function helps avoid conflicting Tailwind classes
 * 
 * @param inputs - Array of class names or conditional class objects
 * @returns Merged and optimized class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats currency in Indian Rupees
 * @param amount - Amount in rupees
 * @returns Formatted currency string (₹1,000)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formats Indian mobile number for display
 * @param mobile - 10 digit mobile number
 * @returns Formatted mobile string (+91 XXXXX-XXXXX)
 */
export function formatMobileNumber(mobile: string): string {
  if (mobile.length !== 10) return mobile
  return `+91 ${mobile.slice(0, 5)}-${mobile.slice(5)}`
}

/**
 * Capitalizes the first letter of each word
 * @param str - Input string
 * @returns Title cased string
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

/**
 * Truncates text to specified length
 * @param text - Input text
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Generates a short ID from UUID for display
 * @param uuid - Full UUID string
 * @returns Short 8-character ID
 */
export function getShortId(uuid: string): string {
  return uuid.split('-')[0].toUpperCase()
}

/**
 * Calculates the percentage of slots filled
 * @param filled - Number of filled slots
 * @param total - Total capacity
 * @returns Percentage (0-100)
 */
export function getSlotPercentage(filled: number, total: number): number {
  if (total === 0) return 0
  return Math.round((filled / total) * 100)
}

/**
 * Gets color class based on slot availability
 * @param remaining - Remaining slots
 * @param total - Total capacity
 * @returns Tailwind color class
 */
export function getSlotColorClass(remaining: number, total: number): string {
  const percentage = (remaining / total) * 100
  
  if (remaining === 0) return 'text-red-500'
  if (percentage < 20) return 'text-red-400'
  if (percentage < 50) return 'text-yellow-400'
  return 'text-green-400'
}

/**
 * Delays execution for specified milliseconds
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Compresses an image file
 * @param file - Image file to compress
 * @param maxSizeKB - Maximum size in KB (default: 800KB)
 * @returns Compressed file
 */
export async function compressImage(
  file: File, 
  maxSizeKB: number = 800
): Promise<File> {
  // Dynamic import to reduce bundle size
  const imageCompression = await import('browser-image-compression')
  
  const options = {
    maxSizeMB: maxSizeKB / 1024, // Convert KB to MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg' as const
  }
  
  try {
    const compressedFile = await imageCompression.default(file, options)
    return compressedFile
  } catch (error) {
    console.warn('Image compression failed, using original file:', error)
    return file
  }
}