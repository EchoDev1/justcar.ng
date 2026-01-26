'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  RefreshCw,
  ExternalLink,
  Car,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Filter,
  Plus,
  Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CompetitorPricingPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [inventory, setInventory] = useState([])
  const [comparisons, setComparisons] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      const supabase = createClient()

      // Fetch dealer's inventory
      const { data: cars } = await supabase
        .from('cars')
        .select('id, title, make, model, year, price, mileage, images, status')
        .eq('dealer_id', dealerData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setInventory(cars || [])

      // Fetch existing price comparisons
      const { data: priceData } = await supabase
        .from('competitor_pricing')
        .select('*')
        .eq('dealer_id', dealerData.id)
        .order('last_checked', { ascending: false })

      setComparisons(priceData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeMarketPricing = async (car) => {
    setAnalyzing(true)
    setSelectedCar(car)

    try {
      // Simulate market analysis (in production, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate simulated competitor data
      const competitors = [
        {
          name: 'AutoMart Nigeria',
          price: car.price * (0.9 + Math.random() * 0.2),
          url: '#'
        },
        {
          name: 'Cars45',
          price: car.price * (0.85 + Math.random() * 0.3),
          url: '#'
        },
        {
          name: 'Jiji Motors',
          price: car.price * (0.92 + Math.random() * 0.16),
          url: '#'
        },
        {
          name: 'Cheki Nigeria',
          price: car.price * (0.88 + Math.random() * 0.24),
          url: '#'
        }
      ]

      const supabase = createClient()

      // Save comparison data
      for (const comp of competitors) {
        await supabase.from('competitor_pricing').upsert({
          dealer_id: dealer.id,
          car_id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          competitor_name: comp.name,
          competitor_price: Math.round(comp.price),
          competitor_url: comp.url,
          price_difference: car.price - Math.round(comp.price),
          last_checked: new Date().toISOString()
        }, { onConflict: 'car_id,competitor_name' })
      }

      fetchData()
    } catch (error) {
      console.error('Error analyzing pricing:', error)
    } finally {
      setAnalyzing(false)
      setSelectedCar(null)
    }
  }

  const getCarComparisons = (carId) => {
    return comparisons.filter(c => c.car_id === carId)
  }

  const getPricingInsight = (carPrice, comparisons) => {
    if (comparisons.length === 0) return null

    const avgCompetitorPrice = comparisons.reduce((sum, c) => sum + c.competitor_price, 0) / comparisons.length
    const diff = carPrice - avgCompetitorPrice
    const percentDiff = ((diff / avgCompetitorPrice) * 100).toFixed(1)

    if (diff > avgCompetitorPrice * 0.1) {
      return { type: 'high', message: `${percentDiff}% above market`, color: 'text-red-600 bg-red-100' }
    } else if (diff < -avgCompetitorPrice * 0.1) {
      return { type: 'low', message: `${Math.abs(percentDiff)}% below market`, color: 'text-green-600 bg-green-100' }
    } else {
      return { type: 'competitive', message: 'Competitively priced', color: 'text-blue-600 bg-blue-100' }
    }
  }

  const filteredInventory = inventory.filter(car => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      car.make?.toLowerCase().includes(search) ||
      car.model?.toLowerCase().includes(search) ||
      car.title?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Competitor Pricing
        </h1>
        <p className="text-gray-600 mt-2">
          Compare your prices with the market and optimize your listings
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Competitively Priced</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventory.filter(car => {
                  const comps = getCarComparisons(car.id)
                  const insight = getPricingInsight(car.price, comps)
                  return insight?.type === 'competitive'
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Priced Above Market</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventory.filter(car => {
                  const comps = getCarComparisons(car.id)
                  const insight = getPricingInsight(car.price, comps)
                  return insight?.type === 'high'
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Not Yet Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventory.filter(car => getCarComparisons(car.id).length === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search your inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Inventory List with Comparisons */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500">Add vehicles to your inventory to start comparing prices.</p>
          </div>
        ) : (
          filteredInventory.map((car) => {
            const carComparisons = getCarComparisons(car.id)
            const insight = getPricingInsight(car.price, carComparisons)
            const avgCompetitorPrice = carComparisons.length > 0
              ? Math.round(carComparisons.reduce((sum, c) => sum + c.competitor_price, 0) / carComparisons.length)
              : null

            return (
              <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {car.images?.[0] ? (
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-24 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{car.title}</h3>
                          <p className="text-sm text-gray-500">
                            {car.year} • {car.mileage?.toLocaleString()} km
                          </p>
                        </div>
                        {insight && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${insight.color}`}>
                            {insight.message}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Your Price</p>
                          <p className="text-xl font-bold text-gray-900">₦{car.price?.toLocaleString()}</p>
                        </div>
                        {avgCompetitorPrice && (
                          <div>
                            <p className="text-xs text-gray-500">Market Average</p>
                            <p className="text-xl font-bold text-blue-600">₦{avgCompetitorPrice.toLocaleString()}</p>
                          </div>
                        )}
                        <div className="ml-auto">
                          <button
                            onClick={() => analyzeMarketPricing(car)}
                            disabled={analyzing && selectedCar?.id === car.id}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {analyzing && selectedCar?.id === car.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                {carComparisons.length > 0 ? 'Refresh' : 'Analyze'}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitor Details */}
                  {carComparisons.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Competitor Prices</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {carComparisons.map((comp, idx) => {
                          const diff = car.price - comp.competitor_price
                          const isHigher = diff > 0
                          return (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 truncate">{comp.competitor_name}</p>
                              <p className="font-semibold text-gray-900">
                                ₦{comp.competitor_price?.toLocaleString()}
                              </p>
                              <p className={`text-xs flex items-center gap-1 ${isHigher ? 'text-red-600' : 'text-green-600'}`}>
                                {isHigher ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                ₦{Math.abs(diff).toLocaleString()} {isHigher ? 'higher' : 'lower'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Last updated: {new Date(carComparisons[0]?.last_checked).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mt-8">
        <h3 className="font-semibold text-blue-900 mb-3">Pricing Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Vehicles priced within 10% of market average sell 2x faster</li>
          <li>• Consider offering slight discounts during slow seasons</li>
          <li>• Highlight unique features to justify premium pricing</li>
          <li>• Monitor competitor prices weekly for market changes</li>
          <li>• Lower mileage and better condition justify higher prices</li>
        </ul>
      </div>
    </div>
  )
}
