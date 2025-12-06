/**
 * Dealer Analytics Dashboard
 * Premium feature - Advanced analytics and insights
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3, TrendingUp, Eye, Car, Calendar, MapPin,
  Star, Users, Clock, Crown, ArrowUp, ArrowDown
} from 'lucide-react'
import Link from 'next/link'

export default function DealerAnalyticsPage() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    viewsThisMonth: 0,
    viewsGrowth: 0,
    topCars: [],
    viewsByDay: [],
    popularMakes: [],
    popularLocations: []
  })

  useEffect(() => {
    checkAccessAndLoadData()
  }, [])

  const checkAccessAndLoadData = async () => {
    const supabase = createClient()

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
      await loadAnalytics(dealerData.id, supabase)

    } catch (error) {
      console.error('Error:', error)
      router.push('/dealer/login')
      setLoading(false)
    }
  }

  const loadAnalytics = async (dealerId, supabase) => {
    try {
      // Get all dealer cars with analytics
      const { data: cars } = await supabase
        .from('cars')
        .select('*')
        .eq('dealer_id', dealerId)

      if (!cars) {
        setLoading(false)
        return
      }

      // Calculate total views
      const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0)

      // Get this month's views (simplified - you'd track this separately in production)
      const viewsThisMonth = Math.floor(totalViews * 0.3) // Placeholder

      // Calculate growth
      const viewsGrowth = 15 // Placeholder percentage

      // Top performing cars
      const topCars = cars
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(car => ({
          id: car.id,
          name: `${car.year} ${car.make} ${car.model}`,
          views: car.views || 0,
          price: car.price
        }))

      // Popular makes
      const makesCounts = cars.reduce((acc, car) => {
        acc[car.make] = (acc[car.make] || 0) + 1
        return acc
      }, {})

      const popularMakes = Object.entries(makesCounts)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setAnalyticsData({
        totalViews,
        viewsThisMonth,
        viewsGrowth,
        topCars,
        viewsByDay: [], // Would be populated with actual time-series data
        popularMakes,
        popularLocations: []
      })

      setLoading(false)

    } catch (error) {
      console.error('Error loading analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
              <BarChart3 className="mr-3 text-purple-600" size={40} />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Advanced insights for your dealership</p>
          </div>
          <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white">
            <Crown size={18} className="mr-2" />
            <span className="text-sm font-bold">PREMIUM FEATURE</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <Eye className="text-purple-600" size={32} />
            <div className={`flex items-center text-sm font-semibold ${analyticsData.viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData.viewsGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="ml-1">{Math.abs(analyticsData.viewsGrowth)}%</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">Total Views</h3>
          <p className="text-4xl font-bold text-gray-900">{analyticsData.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">All-time</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="text-blue-600" size={32} />
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">This Month</h3>
          <p className="text-4xl font-bold text-gray-900">{analyticsData.viewsThisMonth.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Views in {new Date().toLocaleString('default', { month: 'long' })}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-green-600" size={32} />
            <Star className="text-yellow-500" size={20} />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">Avg. Views per Car</h3>
          <p className="text-4xl font-bold text-gray-900">
            {analyticsData.topCars.length > 0
              ? Math.floor(analyticsData.totalViews / analyticsData.topCars.length)
              : 0
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">Performance metric</p>
        </div>
      </div>

      {/* Top Performing Cars */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Star className="text-yellow-500 mr-3" size={28} />
          Top Performing Cars
        </h2>

        {analyticsData.topCars.length === 0 ? (
          <div className="text-center py-12">
            <Car size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No data available yet. Add some cars to see analytics!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyticsData.topCars.map((car, index) => (
              <div key={car.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900">{car.name}</h3>
                    <p className="text-sm text-blue-600 font-semibold">₦{parseFloat(car.price).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{car.views.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Makes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Car className="text-blue-600 mr-3" size={28} />
            Popular Makes
          </h2>

          {analyticsData.popularMakes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {analyticsData.popularMakes.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{item.make}</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-3 mr-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                        style={{ width: `${(item.count / analyticsData.popularMakes[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600 font-semibold w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Clock className="mr-3" size={28} />
            Quick Insights
          </h2>

          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Most Active Day</p>
              <p className="text-2xl font-bold">Coming Soon</p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Average Response Time</p>
              <p className="text-2xl font-bold">&lt; 2 hours</p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt (for Luxury features) */}
      {dealer?.subscription_tier === 'premium' && (
        <div className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown size={48} className="mr-4" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Unlock Luxury Analytics</h3>
                <p className="text-lg">Get advanced insights, custom reports, and dedicated support</p>
              </div>
            </div>
            <Link href="/dealer/subscription">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition">
                Upgrade to Luxury
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
