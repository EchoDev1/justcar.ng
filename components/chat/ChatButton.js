/**
 * Chat Button Component
 * Button to initiate chat with dealer from car listing
 */

'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ChatButton({ car, dealer, variant = 'primary' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChatClick = async () => {
    try {
      setLoading(true)

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Store car info in localStorage to redirect after login
        localStorage.setItem('pendingChatCar', JSON.stringify({
          carId: car.id,
          dealerId: dealer.id
        }))

        // Redirect to buyer login/register page
        router.push(`/buyer/auth?carId=${car.id}&action=chat`)
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
        localStorage.setItem('pendingChatCar', JSON.stringify({
          carId: car.id,
          dealerId: dealer.id
        }))
        router.push(`/buyer/auth?carId=${car.id}&action=chat`)
        return
      }

      // Check if buyer has paid verification fee (immediate access after payment)
      if (!buyerData.verification_paid) {
        // Buyer hasn't paid verification fee, redirect to verification page
        localStorage.setItem('pendingChatCar', JSON.stringify({
          carId: car.id,
          dealerId: dealer.id
        }))

        // Show alert explaining why verification is needed
        const shouldVerify = confirm(
          'Chat with dealers is only available to verified buyers.\n\n' +
          'Benefits of verification:\n' +
          '• Chat directly with dealers immediately after payment\n' +
          '• Build trust and credibility\n' +
          '• Priority treatment from dealers\n' +
          '• Access to escrow services\n\n' +
          `Verification fee: ₦2,000 (One-time payment)\n\n` +
          'Would you like to get verified now?'
        )

        if (shouldVerify) {
          router.push('/buyer/verify')
        }

        setLoading(false)
        return
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', buyerData.id)
        .eq('dealer_id', dealer.id)
        .eq('car_id', car.id)
        .eq('conversation_type', 'buyer_dealer')
        .single()

      if (existingConv) {
        // Redirect to chat page with existing conversation
        router.push(`/buyer/chats?conversationId=${existingConv.id}`)
        return
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: buyerData.id,
          dealer_id: dealer.id,
          car_id: car.id,
          conversation_type: 'buyer_dealer',
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to chat page
      router.push(`/buyer/chats?conversationId=${newConv.id}`)
    } catch (error) {
      console.error('Error starting chat:', error)
      alert('Failed to start chat. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleChatClick}
        disabled={loading}
        className="p-3 bg-white text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Chat with dealer"
      >
        <MessageCircle size={20} />
      </button>
    )
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleChatClick}
        disabled={loading}
        className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        <MessageCircle size={20} />
        <span>{loading ? 'Starting...' : 'Chat with Dealer'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleChatClick}
      disabled={loading}
      className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
    >
      <MessageCircle size={20} />
      <span>{loading ? 'Starting...' : 'Chat with Dealer'}</span>
    </button>
  )
}
