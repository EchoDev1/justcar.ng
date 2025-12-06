/**
 * Dealer Payments & Earnings
 * Premium feature - Track earnings and payment history
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DollarSign, TrendingUp, Calendar, Download, Eye,
  Crown, CheckCircle, Clock, CreditCard
} from 'lucide-react'

export default function DealerPaymentsPage() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)

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
      setLoading(false)

    } catch (error) {
      console.error('Error:', error)
      router.push('/dealer/login')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    )
  }

  const mockTransactions = [
    {
      id: 1,
      car: '2023 Toyota Camry',
      amount: 15000000,
      buyer: 'John Doe',
      date: '2025-01-15',
      status: 'completed'
    },
    {
      id: 2,
      car: '2024 Honda Accord',
      amount: 18000000,
      buyer: 'Sarah Smith',
      date: '2025-01-10',
      status: 'pending'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <DollarSign className="mr-3 text-green-600" size={40} />
              Payments & Earnings
            </h1>
            <p className="text-gray-600">Track your sales and earnings</p>
          </div>
          <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white">
            <Crown size={18} className="mr-2" />
            <span className="text-sm font-bold">PREMIUM FEATURE</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Total Earnings</h3>
          <p className="text-4xl font-bold">₦0</p>
          <p className="text-sm opacity-80 mt-2">All-time</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm opacity-90 mb-1">This Month</h3>
          <p className="text-4xl font-bold">₦0</p>
          <p className="text-sm opacity-80 mt-2">{new Date().toLocaleString('default', { month: 'long' })}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Completed Sales</h3>
          <p className="text-4xl font-bold">0</p>
          <p className="text-sm opacity-80 mt-2">Successful transactions</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-semibold">
            <Download size={16} className="mr-2" />
            Export Report
          </button>
        </div>

        <div className="text-center py-12">
          <CreditCard size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No transactions yet</p>
          <p className="text-gray-400 text-sm">Your sales history will appear here</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">Add your bank account to receive payments</p>
          <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            Add Bank Account
          </button>
        </div>
      </div>
    </div>
  )
}
