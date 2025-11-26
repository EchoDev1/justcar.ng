/**
 * Admin Dashboard
 * Overview statistics and recent activity
 */

import { createClient } from '@/lib/supabase/server'
import { Car, Users, CheckCircle, Clock, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    // Return demo data if Supabase is not configured
    return {
      totalCars: 0,
      verifiedCars: 0,
      totalDealers: 0,
      recentCars: 0,
      premiumVerifiedCars: 0,
      justArrivedCars: 0
    }
  }

  try {
    const supabase = await createClient()

    // Get total cars
    const { count: totalCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })

    // Get verified cars
    const { count: verifiedCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    // Get premium verified cars
    const { count: premiumVerifiedCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium_verified', true)

    // Get just arrived cars
    const { count: justArrivedCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('is_just_arrived', true)

    // Get total dealers
    const { count: totalDealers } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })

    // Get recent cars (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: recentCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    return {
      totalCars: totalCars || 0,
      verifiedCars: verifiedCars || 0,
      totalDealers: totalDealers || 0,
      recentCars: recentCars || 0,
      premiumVerifiedCars: premiumVerifiedCars || 0,
      justArrivedCars: justArrivedCars || 0
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalCars: 0,
      verifiedCars: 0,
      totalDealers: 0,
      recentCars: 0,
      premiumVerifiedCars: 0,
      justArrivedCars: 0
    }
  }
}

async function getRecentCars() {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    return []
  }

  try {
    const supabase = await createClient()

    const { data: cars } = await supabase
      .from('cars')
      .select(`
        *,
        dealers (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    return cars || []
  } catch (error) {
    console.error('Error fetching recent cars:', error)
    return []
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const recentCars = await getRecentCars()

  const statCards = [
    {
      title: 'Total Cars',
      value: stats.totalCars,
      icon: Car,
      color: 'bg-blue-500',
      link: '/admin/cars'
    },
    {
      title: 'Premium Verified',
      value: stats.premiumVerifiedCars,
      icon: Star,
      color: 'bg-purple-500',
      link: '/admin/premium-verified'
    },
    {
      title: 'Just Arrived',
      value: stats.justArrivedCars,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/admin/just-arrived'
    },
    {
      title: 'Verified Cars',
      value: stats.verifiedCars,
      icon: CheckCircle,
      color: 'bg-teal-500',
      link: '/admin/cars?verified=true'
    },
    {
      title: 'Total Dealers',
      value: stats.totalDealers,
      icon: Users,
      color: 'bg-indigo-500',
      link: '/admin/dealers'
    },
    {
      title: 'Recent (7 days)',
      value: stats.recentCars,
      icon: Clock,
      color: 'bg-orange-500',
      link: '/admin/cars?recent=true'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your car marketplace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.title}
              href={stat.link}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Cars */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Cars</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCars.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No cars found. <Link href="/admin/cars/new" className="text-blue-600 hover:text-blue-700">Add your first car</Link>
                  </td>
                </tr>
              ) : (
                recentCars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {car.year} {car.make} {car.model}
                      </div>
                      <div className="text-sm text-gray-500">{car.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car.dealers?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₦{parseInt(car.price).toLocaleString('en-NG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {car.is_verified && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                        {car.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/cars/${car.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/cars/${car.id}`}
                        className="text-gray-600 hover:text-gray-900"
                        target="_blank"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
