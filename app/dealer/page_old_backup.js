/**
 * Dealer Dashboard
 * Main dashboard for dealers
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Car, Eye, TrendingUp, Star, Plus, Calendar } from 'lucide-react'

export default function DealerDashboard() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [stats, setStats] = useState({
    totalCars: 0,
    totalViews: 0,
    justArrivedCars: 0,
    recentCars: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDealerAndStats()
  }, [])

  const fetchDealerAndStats = async () => {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/dealer/login')
      return
    }

    // Get dealer profile
    const { data: dealerData } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!dealerData) {
      alert('Dealer profile not found')
      router.push('/')
      return
    }

    setDealer(dealerData)

    // Get stats
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      { count: totalCars },
      { count: justArrivedCars },
      { count: recentCars },
      { data: carsWithViews }
    ] = await Promise.all([
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerData.id),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerData.id).eq('is_just_arrived', true),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerData.id).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('cars').select('views').eq('dealer_id', dealerData.id)
    ])

    const totalViews = carsWithViews?.reduce((sum, car) => sum + (car.views || 0), 0) || 0

    setStats({
      totalCars: totalCars || 0,
      totalViews,
      justArrivedCars: justArrivedCars || 0,
      recentCars: recentCars || 0
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {dealer?.name || 'Dealer'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your dealership overview
          {dealer?.is_verified && <span className="ml-2 inline-flex items-center gap-1 text-green-600"><Star size={16} fill="currentColor" /> Verified Dealer</span>}
        </p>
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <Link href="/dealer/cars/new">
          <button className="w-full md:w-auto bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-3 text-lg font-semibold">
            <Plus size={24} />
            Add New Car Listing
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Car className="text-blue-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalCars}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Total Listings</h3>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="text-green-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalViews}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Total Views</h3>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.justArrivedCars}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Just Arrived</h3>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.recentCars}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Last 7 Days</h3>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dealer/cars">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <Car className="text-primary-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Cars</h3>
            <p className="text-gray-600 text-sm">View and edit your car listings</p>
          </div>
        </Link>

        <Link href="/dealer/badges">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <Star className="text-yellow-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upgrade Badge</h3>
            <p className="text-gray-600 text-sm">Get verified or premium status</p>
          </div>
        </Link>

        <Link href="/dealer/featured">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <TrendingUp className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Featured Listings</h3>
            <p className="text-gray-600 text-sm">Boost your car visibility</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
