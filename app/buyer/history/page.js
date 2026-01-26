'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  History,
  ChevronLeft,
  Eye,
  Heart,
  Clock,
  Trash2,
  Car,
  MessageCircle
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'

export default function BuyerHistory() {
  const [viewHistory, setViewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedCarIds, setSavedCarIds] = useState(new Set())

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      // Load browsing history
      const { data: history, error: historyError } = await supabase
        .from('user_browsing_history')
        .select(`
          *,
          car:cars(
            *,
            dealer:dealers(name, location),
            car_images(image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50)

      if (historyError) throw historyError

      // Filter out null cars (deleted) and deduplicate
      const seenCarIds = new Set()
      const uniqueHistory = (history || []).filter(h => {
        if (!h.car || seenCarIds.has(h.car_id)) return false
        seenCarIds.add(h.car_id)
        return true
      })

      setViewHistory(uniqueHistory)

      // Get saved car IDs
      const { data: savedCars } = await supabase
        .from('buyer_saved_cars')
        .select('car_id')
        .eq('buyer_id', user.id)

      if (savedCars) {
        setSavedCarIds(new Set(savedCars.map(s => s.car_id)))
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCar = async (carId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (savedCarIds.has(carId)) {
        // Unsave
        await supabase
          .from('buyer_saved_cars')
          .delete()
          .eq('buyer_id', user.id)
          .eq('car_id', carId)

        setSavedCarIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(carId)
          return newSet
        })
      } else {
        // Save
        await supabase
          .from('buyer_saved_cars')
          .insert({
            buyer_id: user.id,
            car_id: carId,
            interest_level: 'interested'
          })

        setSavedCarIds(prev => new Set([...prev, carId]))
      }
    } catch (error) {
      console.error('Error saving car:', error)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your viewing history?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_browsing_history')
        .delete()
        .eq('user_id', user.id)

      setViewHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  const formatViewTime = (date) => {
    const now = new Date()
    const viewDate = new Date(date)
    const diffMs = now - viewDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return viewDate.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your viewing history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/buyer" className="text-white/80 hover:text-white">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <History size={32} />
                  <span>Recently Viewed</span>
                </h1>
                <p className="text-white/80 mt-1">
                  {viewHistory.length} cars you've browsed recently
                </p>
              </div>
            </div>
            {viewHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
              >
                <Trash2 size={18} />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Eye className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Viewing History</h3>
            <p className="text-gray-600 mb-6">
              Start browsing cars to see them appear here.
            </p>
            <Link href="/cars">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold">
                Browse Cars
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viewHistory.map((item) => {
              const car = item.car
              if (!car) return null
              const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
              const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'
              const isSaved = savedCarIds.has(car.id)

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative">
                    <Link href={`/cars/${car.id}`}>
                      <div className="relative h-48">
                        <Image
                          src={imageUrl}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Save Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleSaveCar(car.id)
                      }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart
                        size={20}
                        className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                      />
                    </button>

                    {/* View Time Badge */}
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatViewTime(item.viewed_at)}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link href={`/cars/${car.id}`}>
                      <h3 className="font-bold text-gray-900 text-lg mb-1 hover:text-blue-600">
                        {car.year} {car.make} {car.model}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {formatNaira(car.price)}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{car.condition}</span>
                      <span>{car.location}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/cars/${car.id}`} className="flex-1">
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-600">
                          View Details
                        </button>
                      </Link>
                      <Link href={`/buyer/chats?carId=${car.id}`}>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <MessageCircle size={20} className="text-gray-600" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
