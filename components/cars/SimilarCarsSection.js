'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Gauge, Calendar, ArrowRight, Percent, Loader2 } from 'lucide-react'
import { formatNaira, formatNumber } from '@/lib/utils'

/**
 * Similar Cars Section Component
 * Displays similar cars with similarity scores from the API
 */
export default function SimilarCarsSection({ carId, limit = 6 }) {
  const [similarCars, setSimilarCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSimilarCars() {
      try {
        setLoading(true)
        const response = await fetch(`/api/cars/similar/${carId}?limit=${limit}`)
        const data = await response.json()

        if (data.success) {
          setSimilarCars(data.similarCars)
        } else {
          setError(data.error)
        }
      } catch (err) {
        console.error('Error fetching similar cars:', err)
        setError('Failed to load similar cars')
      } finally {
        setLoading(false)
      }
    }

    if (carId) {
      fetchSimilarCars()
    }
  }, [carId, limit])

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Cars</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Finding similar cars...</span>
        </div>
      </div>
    )
  }

  if (error || similarCars.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Similar Cars</h2>
        <Link
          href={`/cars?make=${similarCars[0]?.make || ''}`}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarCars.map((car) => (
          <SimilarCarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  )
}

function SimilarCarCard({ car }) {
  const matchPercentage = car.matchPercentage || Math.round(car.similarityScore)

  return (
    <Link href={`/cars/${car.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          <Image
            src={car.primaryImage || '/images/placeholder-car.svg'}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Match Percentage Badge */}
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <Percent size={14} />
            <span>{matchPercentage}% Match</span>
          </div>

          {/* Condition Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-md text-xs font-medium">
            {car.condition}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {car.year} {car.make} {car.model}
          </h3>

          <p className="text-xl font-bold text-blue-600 mb-3">
            {formatNaira(car.price)}
          </p>

          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge size={14} className="text-gray-400" />
              <span>{formatNumber(car.mileage)} km</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-gray-400" />
              <span className="truncate">{car.location}</span>
            </div>
          </div>

          {/* Dealer */}
          {car.dealer && (
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              <span>{car.dealer.name}</span>
              {car.dealer.is_verified && (
                <span className="ml-2 text-green-600 font-medium">Verified</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
