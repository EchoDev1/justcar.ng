'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Minus, History, Loader2, Bell, BellPlus, Check } from 'lucide-react'
import { formatNaira } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

/**
 * Price History Section Component
 * Displays price change history for a car and allows setting price drop alerts
 */
export default function PriceHistorySection({ carId, currentPrice }) {
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasAlert, setHasAlert] = useState(false)
  const [settingAlert, setSettingAlert] = useState(false)
  const [alertSuccess, setAlertSuccess] = useState(false)
  const [user, setUser] = useState(null)

  const supabase = createClient()

  useEffect(() => {
    fetchPriceHistory()
    checkUser()
  }, [carId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      // Check if user has a price alert for this car
      const { data: alerts } = await supabase
        .from('buyer_car_alerts')
        .select('id')
        .eq('buyer_id', user.id)
        .contains('criteria', { car_id: carId })
        .limit(1)

      setHasAlert(alerts && alerts.length > 0)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('car_price_history')
        .select('*')
        .eq('car_id', carId)
        .order('changed_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setPriceHistory(data || [])
    } catch (error) {
      console.error('Error fetching price history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetPriceAlert = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = `/buyer/auth?action=alert&carId=${carId}`
      return
    }

    try {
      setSettingAlert(true)

      // Create an alert specifically for this car's price drops
      const { error } = await supabase
        .from('buyer_car_alerts')
        .insert({
          buyer_id: user.id,
          name: 'Price Drop Alert',
          criteria: { car_id: carId, max_price: currentPrice },
          max_price: currentPrice,
          notify_email: true,
          notify_push: true,
          notify_in_app: true,
          frequency: 'instant'
        })

      if (error) throw error

      setHasAlert(true)
      setAlertSuccess(true)
      setTimeout(() => setAlertSuccess(false), 3000)
    } catch (error) {
      console.error('Error setting price alert:', error)
    } finally {
      setSettingAlert(false)
    }
  }

  // Calculate stats
  const totalPriceChange = priceHistory.length > 0
    ? priceHistory.reduce((sum, h) => sum + (h.price_change || 0), 0)
    : 0

  const hasDropped = totalPriceChange < 0
  const lowestPrice = priceHistory.length > 0
    ? Math.min(...priceHistory.map(h => h.new_price), currentPrice)
    : currentPrice
  const highestPrice = priceHistory.length > 0
    ? Math.max(...priceHistory.map(h => h.old_price || h.new_price), currentPrice)
    : currentPrice

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading price history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <History className="text-blue-600" size={24} />
          Price History
        </h2>

        {/* Price Alert Button */}
        {!hasAlert ? (
          <button
            onClick={handleSetPriceAlert}
            disabled={settingAlert}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            {settingAlert ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BellPlus size={18} />
            )}
            Get Price Drop Alerts
          </button>
        ) : alertSuccess ? (
          <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            <Check size={18} />
            Alert Set!
          </span>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
            <Bell size={18} />
            Alert Active
          </span>
        )}
      </div>

      {/* Price Summary */}
      {priceHistory.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Original Price</p>
            <p className="font-semibold text-gray-900">
              {formatNaira(highestPrice)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Current Price</p>
            <p className="font-bold text-blue-700">
              {formatNaira(currentPrice)}
            </p>
          </div>
          <div className={`text-center p-3 rounded-lg ${hasDropped ? 'bg-green-50' : totalPriceChange > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500 mb-1">Total Change</p>
            <p className={`font-semibold flex items-center justify-center gap-1 ${hasDropped ? 'text-green-700' : totalPriceChange > 0 ? 'text-orange-700' : 'text-gray-600'}`}>
              {hasDropped ? (
                <TrendingDown size={16} />
              ) : totalPriceChange > 0 ? (
                <TrendingUp size={16} />
              ) : (
                <Minus size={16} />
              )}
              {formatNaira(Math.abs(totalPriceChange))}
            </p>
          </div>
        </div>
      )}

      {/* Price History Timeline */}
      {priceHistory.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <History className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-gray-500">No price changes recorded</p>
          <p className="text-sm text-gray-400 mt-1">
            This price has remained stable since listing
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">Recent Price Changes</p>
          {priceHistory.map((record, index) => {
            const isDecrease = record.price_change < 0
            const isIncrease = record.price_change > 0

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isDecrease ? 'bg-green-100' :
                    isIncrease ? 'bg-orange-100' : 'bg-gray-200'
                  }`}>
                    {isDecrease ? (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    ) : isIncrease ? (
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through text-sm">
                        {formatNaira(record.old_price)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold text-gray-900">
                        {formatNaira(record.new_price)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(record.changed_at).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className={`text-right ${
                  isDecrease ? 'text-green-600' :
                  isIncrease ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  <p className="font-semibold">
                    {isDecrease ? '-' : isIncrease ? '+' : ''}
                    {formatNaira(Math.abs(record.price_change))}
                  </p>
                  <p className="text-xs">
                    {record.price_change_percent > 0 ? '+' : ''}
                    {record.price_change_percent?.toFixed(1)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Price Drop Alert Info */}
      {hasDropped && priceHistory.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Good news!</span> The price has dropped{' '}
            {formatNaira(Math.abs(totalPriceChange))} since it was first listed.
          </p>
        </div>
      )}
    </div>
  )
}
