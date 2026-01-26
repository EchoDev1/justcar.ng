/**
 * Buyer Dashboard
 * Main landing page for authenticated buyers
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Heart,
  MessageCircle,
  Car,
  Bell,
  Tag,
  Calendar,
  History,
  Star,
  Shield,
  Calculator,
  Settings,
  TrendingUp,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BuyerDashboard() {
  const [stats, setStats] = useState({
    savedCars: 0,
    activeChats: 0,
    activeOffers: 0,
    upcomingAppointments: 0,
    activeAlerts: 0
  })
  const [savedCars, setSavedCars] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyer, setBuyer] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      // Fetch buyer info
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      setBuyer(buyerData)

      // Fetch saved cars
      const { data: savedCarsData } = await supabase
        .from('buyer_saved_cars')
        .select(`
          *,
          car:cars(
            *,
            dealer:dealers(name),
            car_images(image_url, is_primary)
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4)

      setSavedCars(savedCarsData || [])

      // Fetch counts
      const [savedCount, chatsCount, offersCount, appointmentsCount, alertsCount] = await Promise.all([
        supabase.from('buyer_saved_cars').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).eq('status', 'active'),
        supabase.from('car_offers').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).in('status', ['pending', 'viewed', 'counter']),
        supabase.from('test_drive_appointments').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).in('status', ['pending', 'confirmed']),
        supabase.from('buyer_car_alerts').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).eq('is_active', true)
      ])

      setStats({
        savedCars: savedCount.count || 0,
        activeChats: chatsCount.count || 0,
        activeOffers: offersCount.count || 0,
        upcomingAppointments: appointmentsCount.count || 0,
        activeAlerts: alertsCount.count || 0
      })

      // Fetch recent alert matches
      const { data: matchesData } = await supabase
        .from('buyer_alert_matches')
        .select(`
          *,
          car:cars(id, make, model, year, price, car_images(image_url, is_primary))
        `)
        .eq('buyer_id', user.id)
        .eq('is_viewed', false)
        .order('matched_at', { ascending: false })
        .limit(3)

      setRecentMatches(matchesData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Menu items organized by category
  const menuItems = [
    {
      category: 'My Activity',
      items: [
        { href: '/buyer/saved', icon: Heart, label: 'Saved Cars', count: stats.savedCars, color: 'text-red-500', bg: 'bg-red-100' },
        { href: '/buyer/chats', icon: MessageCircle, label: 'Messages', count: stats.activeChats, color: 'text-blue-500', bg: 'bg-blue-100' },
        { href: '/buyer/offers', icon: Tag, label: 'My Offers', count: stats.activeOffers, color: 'text-green-500', bg: 'bg-green-100' },
        { href: '/buyer/appointments', icon: Calendar, label: 'Test Drives', count: stats.upcomingAppointments, color: 'text-orange-500', bg: 'bg-orange-100' },
        { href: '/buyer/history', icon: History, label: 'Recently Viewed', color: 'text-purple-500', bg: 'bg-purple-100' }
      ]
    },
    {
      category: 'Tools & Alerts',
      items: [
        { href: '/buyer/alerts', icon: Bell, label: 'Car Alerts', count: stats.activeAlerts, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { href: '/buyer/reviews', icon: Star, label: 'My Reviews', color: 'text-amber-500', bg: 'bg-amber-100' },
        { href: '/buyer/insurance', icon: Shield, label: 'Insurance Quotes', color: 'text-teal-500', bg: 'bg-teal-100' }
      ]
    },
    {
      category: 'Account',
      items: [
        { href: '/buyer/settings', icon: Settings, label: 'Settings', color: 'text-gray-500', bg: 'bg-gray-100' },
        { href: '/buyer/escrow/transactions', icon: Calculator, label: 'Escrow Transactions', color: 'text-indigo-500', bg: 'bg-indigo-100' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome{buyer?.full_name ? `, ${buyer.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-white/80">Here's what's happening with your car search</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/buyer/saved">
            <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Heart className="text-red-500" size={22} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.savedCars}</h3>
              <p className="text-sm text-gray-600">Saved Cars</p>
            </div>
          </Link>

          <Link href="/buyer/offers">
            <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Tag className="text-green-500" size={22} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeOffers}</h3>
              <p className="text-sm text-gray-600">Active Offers</p>
            </div>
          </Link>

          <Link href="/buyer/appointments">
            <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Calendar className="text-orange-500" size={22} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</h3>
              <p className="text-sm text-gray-600">Test Drives</p>
            </div>
          </Link>

          <Link href="/buyer/alerts">
            <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Bell className="text-yellow-600" size={22} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</h3>
              <p className="text-sm text-gray-600">Car Alerts</p>
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Menu */}
          <div className="lg:col-span-1 space-y-6">
            {menuItems.map((section) => (
              <div key={section.category} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-semibold text-gray-800">{section.category}</h3>
                </div>
                <div className="divide-y">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon className={item.color} size={20} />
                          </div>
                          <span className="font-medium text-gray-900">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.count !== undefined && item.count > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-0.5 rounded-full">
                              {item.count}
                            </span>
                          )}
                          <ChevronRight className="text-gray-400" size={18} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Matches */}
            {recentMatches.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Bell className="text-yellow-600" size={24} />
                    <span>New Alert Matches!</span>
                  </h2>
                  <Link href="/buyer/alerts" className="text-yellow-700 hover:text-yellow-800 font-medium text-sm">
                    View All →
                  </Link>
                </div>
                <div className="grid gap-3">
                  {recentMatches.map((match) => {
                    const car = match.car
                    if (!car) return null
                    const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]

                    return (
                      <Link key={match.id} href={`/cars/${car.id}`}>
                        <div className="bg-white p-3 rounded-lg flex items-center space-x-4 hover:shadow-md transition-all">
                          <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden relative">
                            {primaryImage && (
                              <Image
                                src={primaryImage.image_url}
                                alt={`${car.make} ${car.model}`}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {car.year} {car.make} {car.model}
                            </p>
                            <p className="text-blue-600 font-bold">{formatNaira(car.price)}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">New</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recently Saved Cars */}
            {savedCars.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Heart className="text-red-500" size={24} />
                    <span>Saved Cars</span>
                  </h2>
                  <Link href="/buyer/saved" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {savedCars.map((saved) => {
                    const car = saved.car
                    if (!car) return null
                    const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
                    const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'

                    return (
                      <Link key={saved.id} href={`/cars/${car.id}`}>
                        <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                          <div className="relative h-32">
                            <Image
                              src={imageUrl}
                              alt={`${car.year} ${car.make} ${car.model}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {car.year} {car.make} {car.model}
                            </h3>
                            <p className="text-blue-600 font-bold">{formatNaira(car.price)}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cars">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all">
                    <Car size={20} />
                    <span>Browse Cars</span>
                  </button>
                </Link>

                <Link href="/buyer/alerts">
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all">
                    <Bell size={20} />
                    <span>Create Alert</span>
                  </button>
                </Link>

                <Link href="/luxury">
                  <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all">
                    <TrendingUp size={20} />
                    <span>Luxury Cars</span>
                  </button>
                </Link>

                <Link href="/buyer/insurance">
                  <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all">
                    <Shield size={20} />
                    <span>Get Insurance</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Empty State */}
            {savedCars.length === 0 && recentMatches.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Car className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Car Search</h3>
                <p className="text-gray-600 mb-6">
                  Browse our collection and save cars you like, or set up alerts to get notified about new listings.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/cars">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold">
                      Browse Cars
                    </button>
                  </Link>
                  <Link href="/buyer/alerts">
                    <button className="border-2 border-blue-500 text-blue-600 px-6 py-3 rounded-lg font-semibold">
                      Set Up Alerts
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
