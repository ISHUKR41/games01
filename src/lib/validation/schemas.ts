/**
 * Form Validation Schemas
 * File: src/lib/validation/schemas.ts
 * Purpose: Zod validation schemas for all forms in the GameArena platform
 * 
 * These schemas ensure data integrity and provide client-side validation
 * for user inputs, preventing invalid data from being submitted
 */

import { z } from 'zod'

// Base validation schemas for common fields

// Name validation - Only letters, spaces, and common Indian name characters
export const nameSchema = z.string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[A-Za-z\s.'-]+$/, "Name can only contain letters, spaces, dots, apostrophes and hyphens")

// Indian mobile number validation - 10 digits starting with 6-9
export const indianMobileSchema = z.string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9")

// Game ID validation - Alphanumeric with common special characters
export const gameIdSchema = z.string()
  .trim()
  .min(3, "Game ID must be at least 3 characters")
  .max(20, "Game ID must be less than 20 characters")
  .regex(/^[A-Za-z0-9_.-]+$/, "Game ID can only contain letters, numbers, dots, hyphens, and underscores")

// Transaction ID validation - For payment reference
export const transactionIdSchema = z.string()
  .trim()
  .min(5, "Transaction ID must be at least 5 characters")
  .max(50, "Transaction ID must be less than 50 characters")
  .regex(/^[A-Za-z0-9]+$/, "Transaction ID can only contain letters and numbers")

// Team name validation - For duo and squad matches
export const teamNameSchema = z.string()
  .trim()
  .min(3, "Team name must be at least 3 characters")
  .max(30, "Team name must be less than 30 characters")
  .regex(/^[A-Za-z0-9\s._-]+$/, "Team name can contain letters, numbers, spaces, dots, underscores, and hyphens")

// File validation for payment screenshots
export const paymentScreenshotSchema = z
  .instanceof(File, { message: "Please upload a payment screenshot" })
  .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
    "Only JPG, JPEG, and PNG image files are allowed"
  )
  .refine((file) => file.size > 0, "Please select a valid image file")

// Terms and conditions acceptance
export const termsSchema = z.boolean().refine((val) => val === true, {
  message: "You must agree to the terms and conditions to register"
})

// SOLO FORM SCHEMAS

// BGMI Solo registration form schema
export const bgmiSoloFormSchema = z.object({
  leader_name: nameSchema,
  leader_game_id: gameIdSchema,
  leader_whatsapp: indianMobileSchema,
  transaction_id: transactionIdSchema,
  payment_screenshot: paymentScreenshotSchema,
  terms: termsSchema
})

// Free Fire Solo registration form schema  
export const freefireSoloFormSchema = z.object({
  leader_name: nameSchema,
  leader_game_id: gameIdSchema,
  leader_whatsapp: indianMobileSchema,
  transaction_id: transactionIdSchema,
  payment_screenshot: paymentScreenshotSchema,
  terms: termsSchema
})

// DUO FORM SCHEMAS

// BGMI Duo registration form schema
export const bgmiDuoFormSchema = z.object({
  team_name: teamNameSchema,
  leader_name: nameSchema,
  leader_game_id: gameIdSchema,
  leader_whatsapp: indianMobileSchema,
  player2_name: nameSchema,
  player2_game_id: gameIdSchema,
  transaction_id: transactionIdSchema,
  payment_screenshot: paymentScreenshotSchema,
  terms: termsSchema
}).refine((data) => data.leader_game_id !== data.player2_game_id, {
  message: "Game IDs must be different for each player",
  path: ["player2_game_id"]
})

// Free Fire Duo registration form schema
export const freefireDuoFormSchema = z.object({
  team_name: teamNameSchema,
  leader_name: nameSchema,
  leader_game_id: gameIdSchema,
  leader_whatsapp: indianMobileSchema,
  player2_name: nameSchema,
  player2_game_id: gameIdSchema,
  transaction_id: transactionIdSchema,
  payment_screenshot: paymentScreenshotSchema,
  terms: termsSchema
}).refine((data) => data.leader_game_id !== data.player2_game_id, {
  message: "Game IDs must be different for each player",
  path: ["player2_game_id"]
})

// SQUAD FORM SCHEMAS

// BGMI Squad registration form schema
export const bgmiSquadFormSchema = z.object({
  team_name: teamNameSchema,
  leader_name: nameSchema,
  leader_game_id: gameIdSchema,
  leader_whatsapp: indianMobileSchema,
  player2_name: nameSchema,
  player2_game_id: gameIdSchema,
  player3_name: nameSchema,
  player3_game_id: gameIdSchema,
  player4_name: nameSchema,
  player4_game_id: gameIdSchema,
  transaction_id: transactionIdSchema,
  payment_screenshot: paymentScreenshotSchema,
  terms: termsSchema
}).refine((data) => {
  const gameIds = [data.leader_game_id, data.player2_game_id, data.player3_game_id, data.player4_game_id]
  const uniqueGameIds = new Set(gameIds)
  return uniqueGameIds.size === gameIds.length
}, {
  message: "All game IDs must be unique",
  path: ["player4_game_id"]
})

// Free Fire Squad registration form schema
export const freefireSquadFormSchema = z.object({
  team_name: teamNameSchema,
  leader_name: nameSchema,
  leader_game_id: gameIdSchema,
  leader_whatsapp: indianMobileSchema,
  player2_name: nameSchema,
  player2_game_id: gameIdSchema,
  player3_name: nameSchema,
  player3_game_id: gameIdSchema,
  player4_name: nameSchema,
  player4_game_id: gameIdSchema,
  transaction_id: transactionIdSchema,
  payment_screenshot: paymentScreenshotSchema,
  terms: termsSchema
}).refine((data) => {
  const gameIds = [data.leader_game_id, data.player2_game_id, data.player3_game_id, data.player4_game_id]
  const uniqueGameIds = new Set(gameIds)
  return uniqueGameIds.size === gameIds.length
}, {
  message: "All game IDs must be unique",
  path: ["player4_game_id"]
})

// Export type definitions for TypeScript
export type BgmiSoloFormData = z.infer<typeof bgmiSoloFormSchema>
export type FreefireSoloFormData = z.infer<typeof freefireSoloFormSchema>
export type BgmiDuoFormData = z.infer<typeof bgmiDuoFormSchema>
export type FreefireDuoFormData = z.infer<typeof freefireDuoFormSchema>
export type BgmiSquadFormData = z.infer<typeof bgmiSquadFormSchema>
export type FreefireSquadFormData = z.infer<typeof freefireSquadFormSchema>