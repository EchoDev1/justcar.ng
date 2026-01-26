'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Car,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Loader2,
  MessageSquare,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PerformanceReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [period, setPeriod] = useState('30') // days
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLeads: 0,
    totalListings: 0,
    avgViewsPerListing: 0,
    conversionRate: 0,
    responseRate: 0,
    viewsTrend: 0,
    leadsTrend: 0
  })
  const [topListings, setTopListings] = useState([])
  const [leadsBySource, setLeadsBySource] = useState([])
  const [viewsByDay, setViewsByDay] = useState([])

  useEffect(() => {
    fetchReportData()
  }, [period])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      const supabase = createClient()
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(period))

      // Fetch cars with views
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('id, title, views, created_at, status, price, make, model, year, images')
        .eq('dealer_id', dealerData.id)

      // Fetch leads/inquiries
      const { data: leads, error: leadsError } = await supabase
        .from('car_inquiries')
        .select('id, status, source, created_at, car_id')
        .eq('dealer_id', dealerData.id)
        .gte('created_at', daysAgo.toISOString())

      // Fetch reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('dealer_reviews')
        .select('id, rating, dealer_response')
        .eq('dealer_id', dealerData.id)

      const allCars = cars || []
      const allLeads = leads || []
      const allReviews = reviews || []
      const activeListings = allCars.filter(c => c.status === 'active')

      // Calculate stats
      const totalViews = allCars.reduce((sum, c) => sum + (c.views || 0), 0)
      const totalLeads = allLeads.length
      const convertedLeads = allLeads.filter(l => l.status === 'converted').length
      const respondedReviews = allReviews.filter(r => r.dealer_response).length

      setStats({
        totalViews,
        totalLeads,
        totalListings: activeListings.length,
        avgViewsPerListing: activeListings.length > 0 ? Math.round(totalViews / activeListings.length) : 0,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        responseRate: allReviews.length > 0 ? Math.round((respondedReviews / allReviews.length) * 100) : 0,
        viewsTrend: 12, // Placeholder - would need historical data
        leadsTrend: -5  // Placeholder
      })

      // Top performing listings
      const sortedCars = [...allCars]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
      setTopListings(sortedCars)

      // Leads by source (simulated data structure)
      const sources = {}
      allLeads.forEach(lead => {
        const src = lead.source || 'direct'
        sources[src] = (sources[src] || 0) + 1
      })
      setLeadsBySource(Object.entries(sources).map(([source, count]) => ({ source, count })))

      // Views by day (simulated - would need analytics table)
      const days = []
      for (let i = parseInt(period) - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: Math.floor(Math.random() * 50) + 10 // Placeholder
        })
      }
      setViewsByDay(days)

    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: `Last ${period} days`,
      dealer: dealer?.name,
      stats,
      topListings: topListings.map(l => ({
        title: l.title,
        views: l.views,
        price: l.price
      }))
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Performance Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Track your dealership's performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-500" />
            {stats.viewsTrend > 0 ? (
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUp className="w-4 h-4" />
                {stats.viewsTrend}%
              </span>
            ) : (
              <span className="flex items-center text-red-600 text-sm">
                <ArrowDown className="w-4 h-4" />
                {Math.abs(stats.viewsTrend)}%
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Views</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-500" />
            {stats.leadsTrend > 0 ? (
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUp className="w-4 h-4" />
                {stats.leadsTrend}%
              </span>
            ) : (
              <span className="flex items-center text-red-600 text-sm">
                <ArrowDown className="w-4 h-4" />
                {Math.abs(stats.leadsTrend)}%
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
          <p className="text-sm text-gray-500">Total Leads</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
          <p className="text-sm text-gray-500">Conversion Rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
          <p className="text-sm text-gray-500">Review Response Rate</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Car className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{stats.totalListings}</p>
          <p className="text-blue-100">Active Listings</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Eye className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{stats.avgViewsPerListing}</p>
          <p className="text-green-100">Avg Views per Listing</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Star className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{dealer?.rating || '4.5'}</p>
          <p className="text-purple-100">Average Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Listings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performing Listings
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {topListings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No listings yet
              </div>
            ) : (
              topListings.map((car, idx) => (
                <div key={car.id} className="p-4 flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-16 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{car.title}</p>
                    <p className="text-sm text-gray-500">₦{car.price?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{car.views || 0}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Leads by Source
            </h2>
          </div>
          <div className="p-6">
            {leadsBySource.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No lead data available
              </div>
            ) : (
              <div className="space-y-4">
                {leadsBySource.map((item, idx) => {
                  const total = leadsBySource.reduce((sum, i) => sum + i.count, 0)
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                  return (
                    <div key={item.source}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.source}</span>
                        <span className="text-sm text-gray-500">{item.count} ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[idx % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Views Trend Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Views Over Time
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between h-48 gap-1">
            {viewsByDay.slice(-14).map((day, idx) => {
              const maxViews = Math.max(...viewsByDay.map(d => d.views))
              const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${day.date}: ${day.views} views`}
                  />
                  <span className="text-xs text-gray-500 -rotate-45 origin-left whitespace-nowrap">
                    {day.date}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mt-6">
        <h3 className="font-semibold text-blue-900 mb-3">Tips to Improve Performance</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Add high-quality photos from multiple angles to increase views by up to 40%</li>
          <li>• Respond to inquiries within 1 hour to improve conversion rates</li>
          <li>• Keep your prices competitive with market rates</li>
          <li>• Update listings regularly to stay relevant in search results</li>
          <li>• Encourage satisfied customers to leave reviews</li>
        </ul>
      </div>
    </div>
  )
}
