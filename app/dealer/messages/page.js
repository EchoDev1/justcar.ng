/**
 * Dealer Messages
 * Premium feature - Direct buyer messaging
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  MessageSquare, Send, User, Clock, Check, CheckCheck,
  Crown, Search, Filter, Star
} from 'lucide-react'

export default function DealerMessagesPage() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    checkAccessAndLoadData()
  }, [])

  const checkAccessAndLoadData = async () => {
    try {
      // OPTIMIZED: Use custom dealer auth API
      const response = await fetch('/api/dealer/me', {
        credentials: 'include'
      })

      if (!response.ok) {
        router.push('/dealer/login')
        setLoading(false)
        return
      }

      const { dealer: dealerData } = await response.json()
      if (!dealerData) {
        router.push('/dealer/login')
        setLoading(false)
        return
      }

      // Check if dealer has premium or luxury access
      if (!dealerData.subscription_tier || dealerData.subscription_tier === 'basic') {
        router.push('/dealer/subscription')
        setLoading(false)
        return
      }

      setDealer(dealerData)
      // Load messages (placeholder data for now)
      setMessages([
        {
          id: 1,
          buyer: 'John Doe',
          lastMessage: 'Is this car still available?',
          time: '2 hours ago',
          unread: 2,
          car: '2023 Toyota Camry'
        },
        {
          id: 2,
          buyer: 'Sarah Smith',
          lastMessage: 'Can I schedule a test drive?',
          time: '5 hours ago',
          unread: 0,
          car: '2024 Honda Accord'
        }
      ])

      setLoading(false)

    } catch (error) {
      console.error('Error:', error)
      router.push('/dealer/login')
      setLoading(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // TODO: Implement actual message sending
    alert('Message sent: ' + newMessage)
    setNewMessage('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <MessageSquare className="mr-3 text-purple-600" size={40} />
              Messages
            </h1>
            <p className="text-gray-600">Chat with interested buyers</p>
          </div>
          <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white">
            <Crown size={18} className="mr-2" />
            <span className="text-sm font-bold">PREMIUM FEATURE</span>
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedChat(msg)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedChat?.id === msg.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {msg.buyer.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-bold text-gray-900">{msg.buyer}</h3>
                          <p className="text-xs text-gray-500">{msg.car}</p>
                        </div>
                      </div>
                      {msg.unread > 0 && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {msg.unread}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{msg.lastMessage}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {msg.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedChat.buyer.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-bold text-gray-900">{selectedChat.buyer}</h3>
                        <p className="text-xs text-gray-500">Interested in {selectedChat.car}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                  <div className="space-y-4">
                    {/* Sample messages */}
                    <div className="flex">
                      <div className="max-w-md">
                        <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow">
                          <p className="text-gray-800">{selectedChat.lastMessage}</p>
                          <p className="text-xs text-gray-500 mt-2">{selectedChat.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-md">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-none p-4 shadow">
                          <p>Yes, it's still available! Would you like to schedule a viewing?</p>
                          <div className="flex items-center justify-end mt-2">
                            <p className="text-xs opacity-80 mr-2">Just now</p>
                            <CheckCheck size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="ml-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center"
                    >
                      <Send size={20} className="mr-2" />
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center">
          <Star className="text-yellow-500 mr-4" size={32} />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Premium Messaging</h3>
            <p className="text-gray-600 text-sm">
              Respond quickly to buyer inquiries and increase your chances of making a sale. Premium dealers see 3x more conversions!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
