/**
 * Public Just Arrived Cars Page
 * Browse all newly arrived cars
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import CarCard from '@/components/cars/CarCard'
import SearchBar from '@/components/cars/SearchBar'
import Loading from '@/components/ui/Loading'
import { Clock, Zap } from 'lucide-react'

function JustArrivedContent() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchJustArrivedCars()
  }, [searchTerm])

  const fetchJustArrivedCars = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('cars')
      .select(`
        *,
        dealers (name, badge_type, is_verified),
        car_images (image_url, is_primary)
      `)
      .eq('is_just_arrived', true)

    // Apply search if provided
    if (searchTerm) {
      query = query.or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
    }

    // Order by just_arrived_date descending (newest first)
    query = query.order('just_arrived_date', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching just arrived cars:', error)
      setCars([])
      setLoading(false)
      return
    }

    setCars(data || [])
    setLoading(false)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-accent-blue" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Just Arrived</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Fresh arrivals updated daily. Be the first to discover these premium vehicles.
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>{cars.length} newly arrived car{cars.length !== 1 ? 's' : ''} available</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
          <div className="flex">
            <Zap className="text-blue-500 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-900">New Arrivals</h3>
              <p className="text-sm text-gray-700 mt-1">
                These cars have just arrived in our inventory. Don't miss out on these fresh listings!
              </p>
            </div>
          </div>
        </div>

        {/* Cars Grid - Full Width Display with 4 columns on large screens */}
        {loading ? (
          <Loading text="Loading just arrived cars..." />
        ) : cars.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="mx-auto text-gray-300 mb-4" size={80} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Just Arrived Cars</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'No cars match your search. Try different keywords.'
                : 'Check back soon for new arrivals!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function JustArrivedPage() {
  return (
    <Suspense fallback={<Loading text="Loading just arrived cars..." />}>
      <JustArrivedContent />
    </Suspense>
  )
}
