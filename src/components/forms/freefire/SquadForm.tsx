/**
 * Free Fire Squad Registration Form
 * File: src/components/forms/freefire/SquadForm.tsx
 * Purpose: Registration form for Free Fire Squad tournament
 * 
 * This form handles squad team registration with validation,
 * payment screenshot upload, and real-time slot checking
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  User, 
  Gamepad2, 
  Phone, 
  CreditCard, 
  Upload, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Target,
  QrCode,
  UserPlus,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

import { freefireSquadFormSchema, type FreefireSquadFormData } from '@/lib/validation/schemas'
import { supabase } from '@/lib/supabase/client'
import { registerForTournament } from '@/lib/supabase/rpc'
import { useTypingSound } from '@/lib/hooks/useTypingSound'
import { useSlotAvailability } from '@/lib/hooks/useSlotAvailability'
import { useRegistrationCompletion } from '@/lib/hooks/useRegistrationCompletion'
import { compressImage, formatCurrency } from '@/lib/utils'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * FreeFireSquadForm - Multi-step registration form for Free Fire Squad tournaments
 */
export const FreeFireSquadForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const { playSound } = useTypingSound()

  // Tournament details for Free Fire Squad
  const tournamentDetails = {
    game: 'freefire',
    mode: 'squad',
    entryFee: 80,
    winnerPrize: 350,
    runnerPrize: 150,
    killPrize: 5,
    capacity: 12,
    tournamentId: 'freefire-squad-id'
  }

  // Get real-time slot availability
  const { data: slotData } = useSlotAvailability(tournamentDetails.tournamentId)
  const slotsRemaining = slotData?.remaining || 0
  const isFull = slotsRemaining === 0

  // Form setup
  const form = useForm<FreefireSquadFormData>({
    resolver: zodResolver(freefireSquadFormSchema),
    defaultValues: {
      team_name: '',
      leader_name: '',
      leader_game_id: '',
      leader_whatsapp: '',
      player2_name: '',
      player2_game_id: '',
      player3_name: '',
      player3_game_id: '',
      player4_name: '',
      player4_game_id: '',
      transaction_id: '',
      payment_screenshot: undefined,
      terms: false
    }
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Watch form values for step validation
  const watchedFields = watch()

  // Registration completion hook
  const { handleSuccess, handleError } = useRegistrationCompletion({
    formReset: form.reset,
    setCurrentStep,
    setUploadedImageUrl,
    tournamentId: tournamentDetails.tournamentId,
  })

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: FreefireSquadFormData) => {
      // Step 1: Upload payment screenshot
      if (!data.payment_screenshot) {
        throw new Error('Payment screenshot is required')
      }

      // Compress image
      const compressedFile = await compressImage(data.payment_screenshot, 800)

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `payment_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment_screenshots')
        .upload(fileName, compressedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment_screenshots')
        .getPublicUrl(fileName)

      // Step 2: Register via database function
      const result = await registerForTournament({
        p_tournament_id: tournamentDetails.tournamentId,
        p_team_name: data.team_name,
        p_leader_name: data.leader_name,
        p_leader_game_id: data.leader_game_id,
        p_leader_whatsapp: data.leader_whatsapp,
        p_transaction_id: data.transaction_id,
        p_payment_screenshot_url: publicUrl,
        p_participants: [
          {
            player_name: data.player2_name,
            player_game_id: data.player2_game_id,
            slot_position: 1
          },
          {
            player_name: data.player3_name,
            player_game_id: data.player3_game_id,
            slot_position: 2
          },
          {
            player_name: data.player4_name,
            player_game_id: data.player4_game_id,
            slot_position: 3
          }
        ]
      })

      if (!result.success) throw new Error(result.error)

      return result
    },
    onSuccess: (data) => {
      handleSuccess(data.registration_id, data.slots_remaining)
    },
    onError: (error: Error) => {
      handleError(error)
    }
  })

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setValue('payment_screenshot', file, { shouldValidate: true })
      
      // Revoke old URL before creating new one to prevent memory leak
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
      
      // Create new preview URL
      const previewUrl = URL.createObjectURL(file)
      setUploadedImageUrl(previewUrl)
    }
  }

  // Cleanup effect to revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  // Step validation
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return watchedFields.team_name && 
               watchedFields.leader_name && 
               watchedFields.leader_game_id && 
               watchedFields.leader_whatsapp &&
               watchedFields.player2_name && 
               watchedFields.player2_game_id &&
               watchedFields.player3_name && 
               watchedFields.player3_game_id &&
               watchedFields.player4_name && 
               watchedFields.player4_game_id
      case 2:
        return watchedFields.transaction_id && watchedFields.payment_screenshot
      case 3:
        return watchedFields.terms
      default:
        return false
    }
  }

  // Handle form submission
  const onSubmit = (data: FreefireSquadFormData) => {
    if (isFull) {
      alert('Tournament is full!')
      return
    }
    registerMutation.mutate(data)
  }

  // Step navigation
  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Reset form and start over
  const startOver = () => {
    reset()
    setCurrentStep(1)
    setUploadedImageUrl(null)
  }

  const stepTitles = [
    'Squad Information',
    'Payment Details', 
    'Review & Submit',
    'Registration Complete'
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tournament Info Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Free Fire Squad Tournament
              </h3>
              <p className="text-sm text-muted-foreground">Team competition • {tournamentDetails.capacity} teams • 4 players per team</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-500">
                {formatCurrency(tournamentDetails.entryFee)}
              </div>
              <div className="text-sm text-muted-foreground">Entry Fee per team</div>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
              <div className="font-semibold text-yellow-500">{formatCurrency(tournamentDetails.winnerPrize)}</div>
              <div className="text-muted-foreground">Winner</div>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">{formatCurrency(tournamentDetails.runnerPrize)}</Badge>
              <div className="text-muted-foreground">Runner-up</div>
            </div>
            <div className="text-center">
              <Target className="h-4 w-4 mx-auto mb-1 text-red-500" />
              <div className="font-semibold text-red-500">{formatCurrency(tournamentDetails.killPrize)}</div>
              <div className="text-muted-foreground">Per Kill</div>
            </div>
          </div>

          {/* Slot availability */}
          <div className="mt-4 p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Availability</span>
              <span className={`text-sm font-bold ${isFull ? 'text-red-500' : slotsRemaining < 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                {isFull ? 'FULL' : `${slotsRemaining} teams left`}
              </span>
            </div>
            <Progress 
              value={(slotData?.filled || 0) / tournamentDetails.capacity * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Step {currentStep} of 4: {stepTitles[currentStep - 1]}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / 4) * 100)}% Complete
            </div>
          </div>
          <Progress value={(currentStep / 4) * 100} className="mt-2" />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Squad Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {/* Team Name */}
                    <div className="space-y-2">
                      <Label htmlFor="team_name" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Squad Name
                      </Label>
                      <Input
                        id="team_name"
                        placeholder="Enter your squad name"
                        {...register('team_name')}
                        onKeyDown={playSound}
                        className={errors.team_name ? 'border-red-500' : ''}
                      />
                      {errors.team_name && (
                        <p className="text-sm text-red-500">{errors.team_name.message}</p>
                      )}
                    </div>

                    <Separator />

                    {/* Squad Leader Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Squad Leader (Player 1)
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="leader_name">Leader Name</Label>
                        <Input
                          id="leader_name"
                          placeholder="Enter squad leader name"
                          {...register('leader_name')}
                          onKeyDown={playSound}
                          className={errors.leader_name ? 'border-red-500' : ''}
                        />
                        {errors.leader_name && (
                          <p className="text-sm text-red-500">{errors.leader_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leader_game_id" className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          Leader Free Fire Game ID
                        </Label>
                        <Input
                          id="leader_game_id"
                          placeholder="Enter leader's Free Fire ID"
                          {...register('leader_game_id')}
                          onKeyDown={playSound}
                          className={errors.leader_game_id ? 'border-red-500' : ''}
                        />
                        {errors.leader_game_id && (
                          <p className="text-sm text-red-500">{errors.leader_game_id.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leader_whatsapp" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          WhatsApp Number
                        </Label>
                        <Input
                          id="leader_whatsapp"
                          placeholder="10-digit Indian mobile number"
                          {...register('leader_whatsapp')}
                          onKeyDown={playSound}
                          className={errors.leader_whatsapp ? 'border-red-500' : ''}
                        />
                        {errors.leader_whatsapp && (
                          <p className="text-sm text-red-500">{errors.leader_whatsapp.message}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          We'll send match details and results to this number
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Player 2 Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-secondary flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Player 2
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="player2_name">Player 2 Name</Label>
                        <Input
                          id="player2_name"
                          placeholder="Enter player 2 name"
                          {...register('player2_name')}
                          onKeyDown={playSound}
                          className={errors.player2_name ? 'border-red-500' : ''}
                        />
                        {errors.player2_name && (
                          <p className="text-sm text-red-500">{errors.player2_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="player2_game_id" className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          Player 2 Free Fire Game ID
                        </Label>
                        <Input
                          id="player2_game_id"
                          placeholder="Enter player 2's Free Fire ID"
                          {...register('player2_game_id')}
                          onKeyDown={playSound}
                          className={errors.player2_game_id ? 'border-red-500' : ''}
                        />
                        {errors.player2_game_id && (
                          <p className="text-sm text-red-500">{errors.player2_game_id.message}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Player 3 Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-secondary flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Player 3
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="player3_name">Player 3 Name</Label>
                        <Input
                          id="player3_name"
                          placeholder="Enter player 3 name"
                          {...register('player3_name')}
                          onKeyDown={playSound}
                          className={errors.player3_name ? 'border-red-500' : ''}
                        />
                        {errors.player3_name && (
                          <p className="text-sm text-red-500">{errors.player3_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="player3_game_id" className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          Player 3 Free Fire Game ID
                        </Label>
                        <Input
                          id="player3_game_id"
                          placeholder="Enter player 3's Free Fire ID"
                          {...register('player3_game_id')}
                          onKeyDown={playSound}
                          className={errors.player3_game_id ? 'border-red-500' : ''}
                        />
                        {errors.player3_game_id && (
                          <p className="text-sm text-red-500">{errors.player3_game_id.message}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Player 4 Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-secondary flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Player 4
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="player4_name">Player 4 Name</Label>
                        <Input
                          id="player4_name"
                          placeholder="Enter player 4 name"
                          {...register('player4_name')}
                          onKeyDown={playSound}
                          className={errors.player4_name ? 'border-red-500' : ''}
                        />
                        {errors.player4_name && (
                          <p className="text-sm text-red-500">{errors.player4_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="player4_game_id" className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          Player 4 Free Fire Game ID
                        </Label>
                        <Input
                          id="player4_game_id"
                          placeholder="Enter player 4's Free Fire ID (all Game IDs must be unique)"
                          {...register('player4_game_id')}
                          onKeyDown={playSound}
                          className={errors.player4_game_id ? 'border-red-500' : ''}
                        />
                        {errors.player4_game_id && (
                          <p className="text-sm text-red-500">{errors.player4_game_id.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!isStepValid(1)}
                    className="w-full"
                  >
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Payment Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Payment QR Code */}
                  <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-primary/20">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <QrCode className="h-6 w-6 text-primary animate-pulse" />
                          <h3 className="text-xl font-bold text-primary">Scan to Pay</h3>
                          <QrCode className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                          <img 
                            src="/assets/qr/payment-qr.png" 
                            alt="Payment QR Code - Scan to Pay" 
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                        
                        <div className="space-y-3 pt-2">
                          <div className="bg-primary/5 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Squad Entry Fee Amount</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(tournamentDetails.entryFee)}</p>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="font-medium">UPI ID: <span className="text-primary">gamearena@paytm</span></p>
                            <p className="text-muted-foreground">Scan QR code or use UPI ID to make payment</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {/* Transaction ID */}
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <CreditCard className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Important:</strong> After making the payment, enter your Transaction ID below. You can find this in your payment app's transaction history.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transaction_id" className="flex items-center gap-2 text-base font-semibold">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Transaction ID / UTR Number *
                      </Label>
                      <Input
                        id="transaction_id"
                        placeholder="Enter transaction ID from payment app"
                        {...register('transaction_id')}
                        onKeyDown={playSound}
                        className={`text-lg h-12 ${errors.transaction_id ? 'border-red-500' : 'border-primary/30 focus:border-primary'}`}
                      />
                      {errors.transaction_id && (
                        <p className="text-sm text-red-500 font-medium">{errors.transaction_id.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Example: 123456789012 or TXN123ABC456</p>
                    </div>

                    {/* Payment Screenshot */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Payment Screenshot
                      </Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="payment_screenshot"
                        />
                        <label 
                          htmlFor="payment_screenshot" 
                          className="cursor-pointer space-y-2"
                        >
                          {uploadedImageUrl ? (
                            <div className="space-y-2">
                              <img 
                                src={uploadedImageUrl} 
                                alt="Payment screenshot" 
                                className="max-w-48 mx-auto rounded"
                              />
                              <p className="text-sm text-green-600">Screenshot uploaded ✓</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload payment screenshot
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG up to 5MB
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                      {errors.payment_screenshot && (
                        <p className="text-sm text-red-500">{errors.payment_screenshot.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep} 
                      disabled={!isStepValid(2)}
                      className="flex-1"
                    >
                      Review Registration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Registration Summary */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Squad Registration Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Squad Name:</span>
                          <span className="font-medium">{watchedFields.team_name}</span>
                        </div>
                        <Separator />
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-primary">Squad Leader</h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{watchedFields.leader_name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Free Fire ID:</span>
                            <span>{watchedFields.leader_game_id}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">WhatsApp:</span>
                            <span>+91 {watchedFields.leader_whatsapp}</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <h5 className="font-medium text-secondary">Player 2</h5>
                            <p className="text-sm"><strong>Name:</strong> {watchedFields.player2_name}</p>
                            <p className="text-sm"><strong>Free Fire ID:</strong> {watchedFields.player2_game_id}</p>
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-medium text-secondary">Player 3</h5>
                            <p className="text-sm"><strong>Name:</strong> {watchedFields.player3_name}</p>
                            <p className="text-sm"><strong>Free Fire ID:</strong> {watchedFields.player3_game_id}</p>
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-medium text-secondary">Player 4</h5>
                            <p className="text-sm"><strong>Name:</strong> {watchedFields.player4_name}</p>
                            <p className="text-sm"><strong>Free Fire ID:</strong> {watchedFields.player4_game_id}</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transaction ID:</span>
                          <span className="font-medium">{watchedFields.transaction_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Fee:</span>
                          <span className="font-bold text-primary">{formatCurrency(tournamentDetails.entryFee)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms"
                        checked={watchedFields.terms}
                        onCheckedChange={(checked) => setValue('terms', checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the{' '}
                        <a href="/terms" className="text-primary hover:underline">
                          Terms and Conditions
                        </a>{' '}
                        and confirm that all information provided is accurate. I understand that 
                        registration is pending admin approval after payment verification.
                      </Label>
                    </div>
                    {errors.terms && (
                      <p className="text-sm text-red-500">{errors.terms.message}</p>
                    )}
                  </div>

                  {isFull && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        This tournament is now full. Registration is no longer available.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!isStepValid(3) || registerMutation.isPending || isFull}
                      className="flex-1"
                    >
                      {registerMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Submit Registration
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-green-600">Squad Registration Successful!</h3>
                      <p className="text-muted-foreground">
                        Your squad registration has been submitted and is pending admin approval.
                      </p>
                    </div>

                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="p-4 text-sm space-y-2">
                        <p><strong>What's next?</strong></p>
                        <ul className="text-left space-y-1 text-muted-foreground">
                          <li>• Admin will verify your payment screenshot</li>
                          <li>• Squad leader will receive WhatsApp notification once approved</li>
                          <li>• Match details will be shared 30 minutes before start</li>  
                          <li>• Prize distribution after match completion</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Button onClick={startOver} className="w-full">
                    Register Another Squad
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            {registerMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {registerMutation.error?.message || 'Registration failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default FreeFireSquadForm