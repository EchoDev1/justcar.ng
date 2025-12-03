/**
 * Premium Verified Collection Page
 * Browse all premium verified cars (admin-marked OR from premium/luxury dealers)
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import CarCard from '@/components/cars/CarCard'
import SearchBar from '@/components/cars/SearchBar'
import Loading from '@/components/ui/Loading'
import { Star, Award, Shield } from 'lucide-react'

function PremiumVerifiedContent() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPremiumCars()
  }, [searchTerm])

  const fetchPremiumCars = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch premium cars from two sources:
    // 1. Admin-marked premium cars (is_premium_verified = true)
    // 2. Cars from premium/luxury dealers (badge_type IN ('premium', 'luxury'))

    // Step 1: Get admin-marked premium cars
    const { data: premiumMarkedCars } = await supabase
      .from('cars')
      .select(`
        *,
        dealers (name, badge_type, is_verified, phone, email),
        car_images (image_url, is_primary)
      `)
      .eq('is_premium_verified', true)

    // Step 2: Get cars from premium/luxury dealers
    const { data: premiumDealerCars } = await supabase
      .from('cars')
      .select(`
        *,
        dealers!inner (name, badge_type, is_verified, phone, email),
        car_images (image_url, is_primary)
      `)
      .in('dealers.badge_type', ['premium', 'luxury'])

    // Combine and deduplicate by car ID
    const allCars = [...(premiumMarkedCars || []), ...(premiumDealerCars || [])]
    let uniqueCars = Array.from(new Map(allCars.map(car => [car.id, car])).values())

    // Apply search filter if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      uniqueCars = uniqueCars.filter(car =>
        car.make?.toLowerCase().includes(searchLower) ||
        car.model?.toLowerCase().includes(searchLower) ||
        car.location?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by created_at descending (newest first)
    uniqueCars.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setCars(uniqueCars)
    setLoading(false)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl">
              <Star className="text-gray-900" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white">Premium Verified Collection</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Handpicked luxury vehicles from premium dealers and admin-verified cars. Each car meets our highest standards.
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
            <Award size={16} />
            <span>{cars.length} premium verified car{cars.length !== 1 ? 's' : ''} available</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-4 mb-8 rounded-lg backdrop-blur-sm">
          <div className="flex">
            <Shield className="text-yellow-400 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-medium text-white">Premium Verified</h3>
              <p className="text-sm text-gray-300 mt-1">
                Cars posted by premium and luxury dealers, plus admin-verified premium selections.
              </p>
            </div>
          </div>
        </div>

        {/* Cars Grid - Full Width Display with 4 columns on large screens */}
        {loading ? (
          <Loading text="Loading premium verified cars..." />
        ) : cars.length === 0 ? (
          <div className="text-center py-16">
            <Star className="mx-auto text-gray-600 mb-4" size={80} />
            <h3 className="text-2xl font-bold text-white mb-2">No Premium Verified Cars</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? 'No cars match your search. Try different keywords.'
                : 'Check back soon for premium verified listings!'}
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

export default function PremiumVerifiedPage() {
  return (
    <Suspense fallback={<Loading text="Loading premium verified cars..." />}>
      <PremiumVerifiedContent />
    </Suspense>
  )
}
