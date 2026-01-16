'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, CheckCircle, BarChart3, Loader2, Info, AlertCircle } from 'lucide-react'
import { formatNaira } from '@/lib/utils'
import { PRICE_BADGES, BADGE_CONFIG } from '@/lib/pricing/priceBadge'
import { PriceIndicatorBar } from '@/components/cars/PriceBadge'

/**
 * Price Intelligence Section Component
 * Displays detailed price analysis for a car
 */
export default function PriceIntelligenceSection({ carId, make, model, year, price }) {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPriceIntelligence() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (carId) params.set('carId', carId)
        if (make) params.set('make', make)
        if (model) params.set('model', model)
        if (year) params.set('year', year.toString())
        if (price) params.set('price', price.toString())

        const response = await fetch(`/api/cars/price-check?${params}`)
        const data = await response.json()

        if (data.success) {
          setPriceData(data)
        } else {
          setError(data.error)
        }
      } catch (err) {
        console.error('Error fetching price intelligence:', err)
        setError('Failed to load price data')
      } finally {
        setLoading(false)
      }
    }

    fetchPriceIntelligence()
  }, [carId, make, model, year, price])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Analyzing price...</span>
        </div>
      </div>
    )
  }

  if (error || !priceData?.hasMarketData) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Price Analysis Unavailable</p>
            <p className="text-sm text-gray-500 mt-1">
              We don't have enough market data for this specific vehicle to provide price intelligence.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { priceIntelligence } = priceData
  const badge = priceIntelligence.badge
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG[PRICE_BADGES.UNKNOWN]

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={24} />
          Price Analysis
        </h2>
        {priceIntelligence.sampleCount && (
          <span className="text-xs text-gray-500">
            Based on {priceIntelligence.sampleCount} similar listings
          </span>
        )}
      </div>

      {/* Main Badge Display */}
      <div className={`rounded-lg p-4 mb-6 ${config.bgColor} ${config.borderColor} border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {badge === PRICE_BADGES.GOOD_DEAL && (
              <div className="p-2 bg-green-200 rounded-full">
                <TrendingDown className="w-6 h-6 text-green-700" />
              </div>
            )}
            {badge === PRICE_BADGES.FAIR_PRICE && (
              <div className="p-2 bg-blue-200 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
            )}
            {badge === PRICE_BADGES.OVERPRICED && (
              <div className="p-2 bg-orange-200 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-700" />
              </div>
            )}
            <div>
              <p className={`text-lg font-bold ${config.textColor}`}>
                {priceIntelligence.badgeLabel || config.label}
              </p>
              <p className="text-sm text-gray-600">
                {badge === PRICE_BADGES.GOOD_DEAL && 'This car is priced below market average'}
                {badge === PRICE_BADGES.FAIR_PRICE && 'This car is fairly priced for the market'}
                {badge === PRICE_BADGES.OVERPRICED && 'This car is priced above market average'}
              </p>
            </div>
          </div>
          {priceIntelligence.variancePercent !== null && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${config.textColor}`}>
                {priceIntelligence.variancePercent > 0 ? '+' : ''}
                {priceIntelligence.variancePercent}%
              </p>
              <p className="text-xs text-gray-500">vs market avg</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Comparison Bar */}
      {priceIntelligence.marketMin && priceIntelligence.marketMax && (
        <div className="mb-6">
          <PriceIndicatorBar
            price={price}
            marketMin={priceIntelligence.marketMin}
            marketMax={priceIntelligence.marketMax}
            marketAvg={priceIntelligence.marketAvg}
          />
        </div>
      )}

      {/* Market Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Market Low</p>
          <p className="font-semibold text-gray-900">
            {priceIntelligence.marketMin ? formatNaira(priceIntelligence.marketMin) : 'N/A'}
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Market Average</p>
          <p className="font-bold text-blue-700">
            {priceIntelligence.marketAvg ? formatNaira(priceIntelligence.marketAvg) : 'N/A'}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Market High</p>
          <p className="font-semibold text-gray-900">
            {priceIntelligence.marketMax ? formatNaira(priceIntelligence.marketMax) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Savings Info */}
      {priceIntelligence.savings?.hasSavings && priceIntelligence.savings.amount > 100000 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                Potential Savings: {formatNaira(priceIntelligence.savings.amount)}
              </p>
              <p className="text-sm text-green-700">
                {priceIntelligence.savings.percentageSaved}% below market average
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {priceIntelligence.insights && priceIntelligence.insights.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Insights</p>
          <ul className="space-y-1">
            {priceIntelligence.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-400 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          Price analysis is based on similar listings and market data. Actual value may vary based on condition, history, and negotiation.
        </p>
      </div>
    </div>
  )
}
