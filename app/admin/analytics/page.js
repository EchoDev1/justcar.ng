'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  DollarSign,
  Eye,
  ShoppingCart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalUsers: 0,
    userGrowth: 0,
    totalCars: 0,
    carGrowth: 0,
    totalViews: 0,
    viewGrowth: 0,
    totalDealers: 0,
    dealerGrowth: 0,
    totalEscrow: 0,
    escrowGrowth: 0
  })
  const [userGrowthData, setUserGrowthData] = useState([])
  const [carListingsData, setCarListingsData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [carsByMake, setCarsByMake] = useState([])
  const [carsByLocation, setCarsByLocation] = useState([])
  const [escrowStatusData, setEscrowStatusData] = useState([])
  const [topDealers, setTopDealers] = useState([])
  const [conversionData, setConversionData] = useState({
    viewsToInquiries: 0,
    inquiriesToEscrow: 0,
    escrowToCompleted: 0
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const days = parseInt(timeRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const previousStartDate = new Date()
      previousStartDate.setDate(previousStartDate.getDate() - (days * 2))

      // Fetch all data in parallel
      const [
        carsResult,
        buyersResult,
        dealersResult,
        escrowResult,
        viewsResult,
        paymentsResult
      ] = await Promise.all([
        supabase.from('cars').select('id, created_at, make, location, price, views_count'),
        supabase.from('buyers').select('id, created_at'),
        supabase.from('dealers').select('id, created_at, name, status'),
        supabase.from('escrow_transactions').select('id, created_at, status, total_amount, car_price'),
        supabase.from('car_views').select('id, created_at'),
        supabase.from('payment_transactions').select('id, created_at, amount, status')
      ])

      const cars = carsResult.data || []
      const buyers = buyersResult.data || []
      const dealers = dealersResult.data || []
      const escrows = escrowResult.data || []
      const views = viewsResult.data || []
      const payments = paymentsResult.data || []

      // Calculate current period stats
      const currentCars = cars.filter(c => new Date(c.created_at) >= startDate)
      const previousCars = cars.filter(c => new Date(c.created_at) >= previousStartDate && new Date(c.created_at) < startDate)

      const currentBuyers = buyers.filter(b => new Date(b.created_at) >= startDate)
      const previousBuyers = buyers.filter(b => new Date(b.created_at) >= previousStartDate && new Date(b.created_at) < startDate)

      const currentDealers = dealers.filter(d => new Date(d.created_at) >= startDate)
      const previousDealers = dealers.filter(d => new Date(d.created_at) >= previousStartDate && new Date(d.created_at) < startDate)

      const currentViews = views.filter(v => new Date(v.created_at) >= startDate)
      const previousViews = views.filter(v => new Date(v.created_at) >= previousStartDate && new Date(v.created_at) < startDate)

      const currentEscrows = escrows.filter(e => new Date(e.created_at) >= startDate)
      const previousEscrows = escrows.filter(e => new Date(e.created_at) >= previousStartDate && new Date(e.created_at) < startDate)

      const currentPayments = payments.filter(p => new Date(p.created_at) >= startDate && p.status === 'successful')
      const previousPayments = payments.filter(p => new Date(p.created_at) >= previousStartDate && new Date(p.created_at) < startDate && p.status === 'successful')

      const currentRevenue = currentPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      const previousRevenue = previousPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

      // Calculate growth percentages
      const calcGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
      }

      setStats({
        totalRevenue: currentRevenue,
        revenueGrowth: calcGrowth(currentRevenue, previousRevenue),
        totalUsers: buyers.length,
        userGrowth: calcGrowth(currentBuyers.length, previousBuyers.length),
        totalCars: cars.length,
        carGrowth: calcGrowth(currentCars.length, previousCars.length),
        totalViews: views.length,
        viewGrowth: calcGrowth(currentViews.length, previousViews.length),
        totalDealers: dealers.length,
        dealerGrowth: calcGrowth(currentDealers.length, previousDealers.length),
        totalEscrow: escrows.filter(e => e.status === 'funded' || e.status === 'released').length,
        escrowGrowth: calcGrowth(currentEscrows.length, previousEscrows.length)
      })

      // Generate time series data
      const generateTimeSeriesData = (data, dateField = 'created_at') => {
        const grouped = {}
        const dayCount = Math.min(days, 30)

        for (let i = dayCount - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          grouped[key] = 0
        }

        data.forEach(item => {
          const date = new Date(item[dateField])
          if (date >= startDate) {
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (grouped[key] !== undefined) {
              grouped[key]++
            }
          }
        })

        return Object.entries(grouped).map(([date, count]) => ({ date, count }))
      }

      setUserGrowthData(generateTimeSeriesData(buyers))
      setCarListingsData(generateTimeSeriesData(cars))

      // Revenue time series
      const revenueByDay = {}
      const dayCount = Math.min(days, 30)
      for (let i = dayCount - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        revenueByDay[key] = 0
      }
      payments.filter(p => p.status === 'successful' && new Date(p.created_at) >= startDate).forEach(p => {
        const date = new Date(p.created_at)
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (revenueByDay[key] !== undefined) {
          revenueByDay[key] += p.amount || 0
        }
      })
      setRevenueData(Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })))

      // Cars by make (top 8)
      const makeCount = {}
      cars.forEach(car => {
        const make = car.make || 'Unknown'
        makeCount[make] = (makeCount[make] || 0) + 1
      })
      const sortedMakes = Object.entries(makeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
      setCarsByMake(sortedMakes)

      // Cars by location (top 6)
      const locationCount = {}
      cars.forEach(car => {
        const location = car.location || 'Unknown'
        locationCount[location] = (locationCount[location] || 0) + 1
      })
      const sortedLocations = Object.entries(locationCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))
      setCarsByLocation(sortedLocations)

      // Escrow status distribution
      const escrowStatus = {}
      escrows.forEach(e => {
        const status = e.status || 'unknown'
        escrowStatus[status] = (escrowStatus[status] || 0) + 1
      })
      setEscrowStatusData(Object.entries(escrowStatus).map(([name, value]) => ({ name, value })))

      // Top dealers by listings
      const dealerListings = {}
      cars.forEach(car => {
        if (car.dealer_id) {
          dealerListings[car.dealer_id] = (dealerListings[car.dealer_id] || 0) + 1
        }
      })
      const topDealerIds = Object.entries(dealerListings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const topDealerData = topDealerIds.map(([id, count]) => {
        const dealer = dealers.find(d => d.id === id)
        return {
          name: dealer?.name || 'Unknown',
          listings: count,
          status: dealer?.status || 'unknown'
        }
      })
      setTopDealers(topDealerData)

      // Conversion funnel
      const totalViewsCount = views.length
      const totalInquiries = escrows.length // Using escrow as proxy for serious inquiries
      const completedEscrows = escrows.filter(e => e.status === 'released').length

      setConversionData({
        viewsToInquiries: totalViewsCount > 0 ? ((totalInquiries / totalViewsCount) * 100).toFixed(2) : 0,
        inquiriesToEscrow: totalInquiries > 0 ? ((escrows.filter(e => e.status === 'funded').length / totalInquiries) * 100).toFixed(2) : 0,
        escrowToCompleted: escrows.filter(e => e.status === 'funded').length > 0
          ? ((completedEscrows / escrows.filter(e => e.status === 'funded').length) * 100).toFixed(2) : 0
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const StatCard = ({ title, value, growth, icon: Icon, color, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(growth)}% vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-500">Track performance, revenue, and growth metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            growth={stats.revenueGrowth}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            growth={stats.userGrowth}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Cars"
            value={stats.totalCars}
            growth={stats.carGrowth}
            icon={Car}
            color="bg-purple-500"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            growth={stats.viewGrowth}
            icon={Eye}
            color="bg-orange-500"
          />
          <StatCard
            title="Total Dealers"
            value={stats.totalDealers}
            growth={stats.dealerGrowth}
            icon={Users}
            color="bg-indigo-500"
          />
          <StatCard
            title="Escrow Transactions"
            value={stats.totalEscrow}
            growth={stats.escrowGrowth}
            icon={ShoppingCart}
            color="bg-pink-500"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Car Listings Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Car Listings</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={carListingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cars by Make */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cars by Make</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={carsByMake}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {carsByMake.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Views to Inquiries</span>
                  <span className="font-medium">{conversionData.viewsToInquiries}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(conversionData.viewsToInquiries, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Inquiries to Escrow</span>
                  <span className="font-medium">{conversionData.inquiriesToEscrow}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(conversionData.inquiriesToEscrow, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Escrow Completion</span>
                  <span className="font-medium">{conversionData.escrowToCompleted}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(conversionData.escrowToCompleted, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Escrow Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={escrowStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {escrowStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Dealers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Dealers</h3>
            <div className="space-y-3">
              {topDealers.length === 0 ? (
                <p className="text-gray-500 text-sm">No dealer data available</p>
              ) : (
                topDealers.map((dealer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{dealer.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{dealer.listings} cars</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cars by Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cars by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carsByLocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
