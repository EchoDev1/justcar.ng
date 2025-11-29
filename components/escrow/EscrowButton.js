/**
 * Escrow Button Component
 * Initiates escrow transaction from car listing
 */

'use client'

import { Shield } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EscrowButton({ car, dealer, variant = 'primary' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEscrowClick = async () => {
    try {
      setLoading(true)

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Store car info in localStorage to redirect after login
        localStorage.setItem('pendingEscrowCar', JSON.stringify({
          carId: car.id,
          dealerId: dealer.id
        }))

        // Redirect to buyer login/register page
        router.push(`/buyer/auth?carId=${car.id}&action=escrow`)
        return
      }

      // Check if user is a buyer and get verification status
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('id, verification_status, verification_paid')
        .eq('id', user.id)
        .single()

      if (!buyerData) {
        // User is not a buyer, redirect to buyer registration
        localStorage.setItem('pendingEscrowCar', JSON.stringify({
          carId: car.id,
          dealerId: dealer.id
        }))
        router.push(`/buyer/auth?carId=${car.id}&action=escrow`)
        return
      }

      // Check if buyer has paid verification fee (immediate access after payment)
      if (!buyerData.verification_paid) {
        // Buyer hasn't paid verification fee, redirect to verification page
        localStorage.setItem('pendingEscrowCar', JSON.stringify({
          carId: car.id,
          dealerId: dealer.id
        }))

        // Show alert explaining why verification is needed
        const shouldVerify = confirm(
          'Escrow services are only available to verified buyers.\n\n' +
          'Benefits of escrow:\n' +
          '• Secure payment protection\n' +
          '• Money held safely until you approve the car\n' +
          '• Optional vehicle inspection\n' +
          '• Fraud protection\n' +
          '• Immediate access after payment\n\n' +
          'You must be verified to use escrow.\n' +
          'Verification fee: ₦2,000 (One-time payment)\n\n' +
          'Would you like to get verified now?'
        )

        if (shouldVerify) {
          router.push('/buyer/verify')
        }

        setLoading(false)
        return
      }

      // Check if car is still available
      if (car.status !== 'available') {
        alert('This car is no longer available for purchase.')
        setLoading(false)
        return
      }

      // Check if there's already an active escrow for this car
      const { data: existingEscrow } = await supabase
        .from('escrow_transactions')
        .select('id, escrow_status')
        .eq('car_id', car.id)
        .in('escrow_status', ['initiated', 'funded', 'inspection_scheduled', 'inspection_completed'])
        .single()

      if (existingEscrow) {
        const shouldView = confirm(
          'There is already an active escrow transaction for this car.\n\n' +
          'Would you like to view the existing transaction?'
        )

        if (shouldView) {
          router.push(`/buyer/escrow/transactions`)
        }

        setLoading(false)
        return
      }

      // Redirect to escrow initiation page
      router.push(`/buyer/escrow/${car.id}`)
    } catch (error) {
      console.error('Error initiating escrow:', error)
      alert('Failed to initiate escrow. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleEscrowClick}
        disabled={loading}
        className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Buy with Escrow Protection"
      >
        <Shield size={20} />
      </button>
    )
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleEscrowClick}
        disabled={loading}
        className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        <Shield size={20} />
        <span>{loading ? 'Loading...' : 'Buy with Escrow'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleEscrowClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Shield size={18} />
      <span>{loading ? 'Loading...' : 'Buy with Escrow Protection'}</span>
    </button>
  )
}
