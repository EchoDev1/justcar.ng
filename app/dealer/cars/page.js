/**
 * Dealer Cars Management Page
 * View and manage all car listings
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Car, Plus, Edit, Trash2, Eye, Star, Clock } from 'lucide-react'

export default function DealerCarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)

  useEffect(() => {
    fetchDealerAndCars()
  }, [])

  const fetchDealerAndCars = async () => {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/dealer/login')
      return
    }

    // Get dealer profile
    const { data: dealerData } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!dealerData) {
      alert('Dealer profile not found')
      router.push('/')
      return
    }

    setDealer(dealerData)

    // Fetch dealer's cars
    const { data: carsData } = await supabase
      .from('cars')
      .select(`
        *,
        car_images (image_url, is_primary)
      `)
      .eq('dealer_id', dealerData.id)
      .order('created_at', { ascending: false })

    setCars(carsData || [])
    setLoading(false)
  }

  const getPrimaryImage = (car) => {
    const primaryImg = car.car_images?.find(img => img.is_primary)
    return primaryImg?.image_url || car.car_images?.[0]?.image_url || '/images/placeholder-car.svg'
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your cars...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Car Listings</h1>
          <p className="text-gray-600 mt-2">
            Manage your car inventory ({cars.length} listing{cars.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Link href="/dealer/cars/new">
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
            <Plus size={20} />
            Add New Car
          </button>
        </Link>
      </div>

      {/* Cars Grid */}
      {cars.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Car className="mx-auto text-gray-300 mb-4" size={80} />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No cars listed yet</h3>
          <p className="text-gray-600 mb-6">
            Start adding cars to your inventory to attract buyers!
          </p>
          <Link href="/dealer/cars/new">
            <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
              Add Your First Car
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Car Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={getPrimaryImage(car)}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {car.is_verified && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Star size={12} fill="white" />
                      Verified
                    </span>
                  )}
                  {car.is_just_arrived && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Clock size={12} />
                      Just Arrived
                    </span>
                  )}
                </div>
              </div>

              {/* Car Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">
                  {formatPrice(car.price)}
                </p>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>{car.mileage?.toLocaleString()} km • {car.condition}</p>
                  <p>{car.location}</p>
                  <p className="flex items-center gap-1">
                    <Eye size={14} />
                    {car.views || 0} views
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/cars/${car.id}`} className="flex-1">
                    <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition flex items-center justify-center gap-2">
                      <Eye size={16} />
                      View
                    </button>
                  </Link>
                  <Link href={`/dealer/cars/${car.id}/edit`} className="flex-1">
                    <button className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition flex items-center justify-center gap-2">
                      <Edit size={16} />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
