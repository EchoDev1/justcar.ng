/**
 * Buyer Chats Page
 * Where buyers can chat with dealers and admin support
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatList from '@/components/chat/ChatList'
import ChatWindow from '@/components/chat/ChatWindow'
import { ChatProvider } from '@/components/chat/ChatContext'
import { MessageCircle, Headphones } from 'lucide-react'

function BuyerChatsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [user, setUser] = useState(null)
  const supabase = createClient()

  const conversationId = searchParams.get('conversationId')
  const carId = searchParams.get('carId')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/buyer/auth')
      return
    }

    // Check if user is a buyer
    const { data: buyerData } = await supabase
      .from('buyers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!buyerData) {
      router.push('/buyer/auth')
      return
    }

    setUser(user)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ChatProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <MessageCircle size={28} />
            <span>My Chats</span>
          </h1>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop: Show both chat list and window */}
          {/* Mobile: Show either list or window based on state */}
          <div className={`lg:flex ${showMobileChat ? 'hidden' : 'flex'} flex-1`}>
            <ChatList />
          </div>

          <div className={`lg:flex ${showMobileChat ? 'flex' : 'hidden'} flex-1`}>
            <ChatWindow onBack={() => setShowMobileChat(false)} />
          </div>
        </div>

        {/* Contact Admin Support Button (Floating) */}
        <ContactAdminButton />
      </div>
    </ChatProvider>
  )
}

function ContactAdminButton() {
  const [showModal, setShowModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleContactAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/buyer/auth')
        return
      }

      // Create buyer-admin conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          conversation_type: 'buyer_admin',
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // Send initial message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'buyer',
          sender_id: user.id,
          sender_name: user.user_metadata?.full_name || 'Buyer',
          message_text: `Subject: ${subject}\n\nI need assistance with this matter.`,
          message_type: 'text'
        })

      setShowModal(false)
      router.push(`/buyer/chats?conversationId=${conversation.id}`)
    } catch (error) {
      console.error('Error contacting admin:', error)
      alert('Failed to create support ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-4 shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-110 z-50"
        title="Contact Admin Support"
      >
        <Headphones size={28} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <Headphones className="text-red-600" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
                <p className="text-gray-600 text-sm">We're here to help!</p>
              </div>
            </div>

            <form onSubmit={handleContactAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you need help with?
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                >
                  <option value="">Select a topic...</option>
                  <option value="Dispute with Dealer">Dispute with Dealer</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Car Verification">Car Verification</option>
                  <option value="Account Problem">Account Problem</option>
                  <option value="Report Fraud">Report Fraud</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function BuyerChatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    }>
      <BuyerChatsContent />
    </Suspense>
  )
}
