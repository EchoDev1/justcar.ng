/**
 * Enhanced Dealer Dashboard
 * Beautiful dashboard with subscription-based features
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Car, Eye, TrendingUp, Star, Plus, Calendar, DollarSign,
  MessageSquare, BarChart3, Crown, Shield, Zap, ArrowRight,
  CheckCircle, Clock, Users
} from 'lucide-react'

export default function DealerDashboard() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [stats, setStats] = useState({
    totalCars: 0,
    totalViews: 0,
    justArrivedCars: 0,
    recentCars: 0,
    totalMessages: 0,
    activeBuyers: 0
  })
  const [recentCars, setRecentCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    try {
      // Get current dealer from custom auth
      const response = await fetch('/api/dealer/me', {
        credentials: 'include'
      })

      if (!response.ok) {
        router.push('/dealer/login')
        return
      }

      const { dealer: dealerData } = await response.json()
      if (!dealerData) {
        router.push('/dealer/login')
        return
      }

      // Set dealer data from API
      setDealer(dealerData)

      // Get stats
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // OPTIMIZED: Parallel queries with only necessary fields
      const [
        { count: totalCars },
        { count: justArrivedCars },
        { count: recentCars },
        { data: carsWithViews },
        { data: latestCars }
      ] = await Promise.all([
        supabase.from('cars').select('id', { count: 'exact', head: true }).eq('dealer_id', dealerData.id),
        supabase.from('cars').select('id', { count: 'exact', head: true }).eq('dealer_id', dealerData.id).eq('is_just_arrived', true),
        supabase.from('cars').select('id', { count: 'exact', head: true }).eq('dealer_id', dealerData.id).gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('cars').select('views').eq('dealer_id', dealerData.id),
        supabase.from('cars').select('id, year, make, model, price, views, is_just_arrived').eq('dealer_id', dealerData.id).order('created_at', { ascending: false }).limit(5)
      ])

      const totalViews = carsWithViews?.reduce((sum, car) => sum + (car.views || 0), 0) || 0

      setStats({
        totalCars: totalCars || 0,
        totalViews,
        justArrivedCars: justArrivedCars || 0,
        recentCars: recentCars || 0,
        totalMessages: 0, // TODO: implement messaging
        activeBuyers: 0 // TODO: implement buyer tracking
      })

      setRecentCars(latestCars || [])
      setLoading(false)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const getTierBadge = () => {
    if (dealer?.subscription_tier === 'luxury') {
      return (
        <div className="dealer-tier-badge" style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
          <Crown size={20} className="text-white relative z-10" />
          <span className="relative z-10 text-white">LUXURY DEALER</span>
        </div>
      )
    } else if (dealer?.subscription_tier === 'premium') {
      return (
        <div className="dealer-tier-badge" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
          <Star size={20} className="text-white relative z-10" />
          <span className="relative z-10 text-white">PREMIUM DEALER</span>
        </div>
      )
    } else {
      return (
        <div className="dealer-tier-badge" style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}>
          <Shield size={20} className="text-white relative z-10" />
          <span className="relative z-10 text-white">VERIFIED DEALER</span>
        </div>
      )
    }
  }

  const isPremiumOrLuxury = dealer?.subscription_tier === 'premium' || dealer?.subscription_tier === 'luxury'

  if (loading) {
    return (
      <>
        {/* Futuristic Background */}
        <div className="dealer-dash-bg">
          <div className="dealer-dash-gradient-orb dealer-orb-1"></div>
          <div className="dealer-dash-gradient-orb dealer-orb-2"></div>
          <div className="dealer-dash-gradient-orb dealer-orb-3"></div>
          <div className="dealer-grid-overlay"></div>
        </div>

        <div className="dealer-loading">
          <div className="dealer-spinner"></div>
          <p className="dealer-loading-text">Loading your futuristic dashboard...</p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Futuristic Animated Background */}
      <div className="dealer-dash-bg">
        <div className="dealer-dash-gradient-orb dealer-orb-1"></div>
        <div className="dealer-dash-gradient-orb dealer-orb-2"></div>
        <div className="dealer-dash-gradient-orb dealer-orb-3"></div>
        <div className="dealer-grid-overlay"></div>

        {/* Floating Particles */}
        <div className="dealer-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="dealer-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="dealer-dash-container max-w-7xl mx-auto">
      {/* Header */}
      <div className="dealer-dash-header">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="dealer-dash-title">
              Welcome back, {dealer?.name || 'Dealer'}! 👋
            </h1>
            <p className="dealer-dash-subtitle">
              Here's your dealership overview
            </p>
          </div>
          {getTierBadge()}
        </div>
      </div>

      {/* Upgrade Banner (for non-premium) */}
      {(!dealer?.subscription_tier || dealer?.subscription_tier === 'basic') && (
        <div className="dealer-upgrade-banner dealer-animate-on-scroll dealer-delay-1">
          <div className="dealer-upgrade-content">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <div className="dealer-upgrade-crown">
                  <Crown size={32} />
                </div>
                <div>
                  <h2 className="dealer-upgrade-title">Unlock Premium Features!</h2>
                  <p className="dealer-upgrade-description">
                    Get analytics, messaging, featured listings, and more
                  </p>
                  <ul className="dealer-upgrade-features">
                    <li className="dealer-upgrade-feature">
                      <CheckCircle size={20} />
                      <span>Advanced Analytics Dashboard</span>
                    </li>
                    <li className="dealer-upgrade-feature">
                      <CheckCircle size={20} />
                      <span>Direct Buyer Messaging</span>
                    </li>
                    <li className="dealer-upgrade-feature">
                      <CheckCircle size={20} />
                      <span>Priority Search Rankings</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <Link href="/dealer/subscription">
                  <button className="dealer-upgrade-btn flex items-center gap-2">
                    Upgrade Now
                    <ArrowRight size={20} />
                  </button>
                </Link>
                <p className="dealer-upgrade-price">Starting at ₦25,000/month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action */}
      <div className="mb-8 dealer-animate-on-scroll dealer-delay-2">
        <Link href="/dealer/cars/new">
          <button className="dealer-action-btn flex items-center justify-center gap-3">
            <Plus size={28} />
            Add New Car Listing
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/dealer/cars" className="dealer-stat-card blue dealer-animate-on-scroll dealer-delay-1 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="dealer-stat-icon">
              <Car className="text-blue-500" size={32} />
            </div>
            <span className="dealer-stat-value">{stats.totalCars}</span>
          </div>
          <h3 className="dealer-stat-label">Total Listings</h3>
          <p className="dealer-stat-sublabel">Active inventory</p>
        </Link>

        <Link href="/dealer/analytics" className="dealer-stat-card green dealer-animate-on-scroll dealer-delay-2 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="dealer-stat-icon">
              <Eye className="text-green-500" size={32} />
            </div>
            <span className="dealer-stat-value">{stats.totalViews}</span>
          </div>
          <h3 className="dealer-stat-label">Total Views</h3>
          <p className="dealer-stat-sublabel">All-time visibility</p>
        </Link>

        <Link href="/dealer/cars?justArrived=true" className="dealer-stat-card purple dealer-animate-on-scroll dealer-delay-3 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="dealer-stat-icon">
              <TrendingUp className="text-purple-500" size={32} />
            </div>
            <span className="dealer-stat-value">{stats.justArrivedCars}</span>
          </div>
          <h3 className="dealer-stat-label">Just Arrived</h3>
          <p className="dealer-stat-sublabel">Fresh inventory</p>
        </Link>

        <Link href="/dealer/cars?recent=true" className="dealer-stat-card orange dealer-animate-on-scroll dealer-delay-4 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="dealer-stat-icon">
              <Calendar className="text-orange-500" size={32} />
            </div>
            <span className="dealer-stat-value">{stats.recentCars}</span>
          </div>
          <h3 className="dealer-stat-label">Last 7 Days</h3>
          <p className="dealer-stat-sublabel">New additions</p>
        </Link>
      </div>

      {/* Premium Stats (only for premium/luxury) */}
      {isPremiumOrLuxury && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dealer-premium-stat gradient-blue-purple dealer-animate-on-scroll dealer-delay-1">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="dealer-premium-icon" />
              <span className="dealer-premium-value">{stats.totalMessages}</span>
            </div>
            <h3 className="dealer-premium-label">Messages</h3>
            <p className="dealer-premium-sublabel">Buyer inquiries</p>
          </div>

          <div className="dealer-premium-stat gradient-green-teal dealer-animate-on-scroll dealer-delay-2">
            <div className="flex items-center justify-between mb-4">
              <Users className="dealer-premium-icon" />
              <span className="dealer-premium-value">{stats.activeBuyers}</span>
            </div>
            <h3 className="dealer-premium-label">Active Buyers</h3>
            <p className="dealer-premium-sublabel">Interested users</p>
          </div>

          <div className="dealer-premium-stat gradient-yellow-orange dealer-animate-on-scroll dealer-delay-3">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="dealer-premium-icon" />
              <span className="dealer-premium-value">+{Math.floor(stats.totalViews / stats.totalCars) || 0}%</span>
            </div>
            <h3 className="dealer-premium-label">Growth</h3>
            <p className="dealer-premium-sublabel">This month</p>
          </div>
        </div>
      )}

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/dealer/cars">
          <div className="dealer-quick-link blue dealer-animate-on-scroll dealer-delay-1">
            <Car className="dealer-quick-icon text-blue-500" />
            <h3 className="dealer-quick-title">Manage Cars</h3>
            <p className="dealer-quick-description">View and edit your inventory</p>
          </div>
        </Link>

        <Link href="/dealer/bank-details">
          <div className="dealer-quick-link orange dealer-animate-on-scroll dealer-delay-2">
            <DollarSign className="dealer-quick-icon text-orange-500" />
            <h3 className="dealer-quick-title">Bank Details</h3>
            <p className="dealer-quick-description">Manage payment information</p>
          </div>
        </Link>

        <Link href={isPremiumOrLuxury ? "/dealer/analytics" : "/dealer/subscription"}>
          <div className="dealer-quick-link purple dealer-animate-on-scroll dealer-delay-3">
            {!isPremiumOrLuxury && (
              <div className="dealer-premium-badge">
                PREMIUM
              </div>
            )}
            <BarChart3 className="dealer-quick-icon text-purple-500" />
            <h3 className="dealer-quick-title">Analytics</h3>
            <p className="dealer-quick-description">
              {isPremiumOrLuxury ? 'View detailed insights' : 'Unlock with Premium'}
            </p>
          </div>
        </Link>

        <Link href={isPremiumOrLuxury ? "/dealer/messages" : "/dealer/subscription"}>
          <div className="dealer-quick-link green dealer-animate-on-scroll dealer-delay-4">
            {!isPremiumOrLuxury && (
              <div className="dealer-premium-badge">
                PREMIUM
              </div>
            )}
            <MessageSquare className="dealer-quick-icon text-green-500" />
            <h3 className="dealer-quick-title">Messages</h3>
            <p className="dealer-quick-description">
              {isPremiumOrLuxury ? 'Chat with buyers' : 'Unlock with Premium'}
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Cars */}
      <div className="dealer-glass-card dealer-animate-on-scroll">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Listings</h2>
          <Link href="/dealer/cars">
            <button className="text-blue-400 hover:text-blue-300 font-semibold flex items-center transition">
              View All
              <ArrowRight size={18} className="ml-1" />
            </button>
          </Link>
        </div>

        {recentCars.length === 0 ? (
          <div className="text-center py-12">
            <Car size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No cars listed yet</p>
            <Link href="/dealer/cars/new">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                Add Your First Car
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCars.map((car, index) => (
              <Link
                key={car.id}
                href={`/dealer/cars/${car.id}/edit`}
                className={`dealer-car-card dealer-animate-on-scroll dealer-delay-${index + 1} block hover:scale-105 transition-transform duration-300 cursor-pointer`}
              >
                <div className="dealer-car-image">
                  {car.is_just_arrived && (
                    <div className="dealer-just-arrived-badge">
                      JUST ARRIVED
                    </div>
                  )}
                </div>
                <div className="dealer-car-content">
                  <h3 className="dealer-car-title">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p className="dealer-car-price">
                    ₦{parseFloat(car.price).toLocaleString()}
                  </p>
                  <div className="dealer-car-stats">
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {car.views || 0} views
                    </span>
                    <span className="dealer-car-edit-btn">
                      Edit →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
