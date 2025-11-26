/**
 * Car Listing Page
 * Browse and filter all cars
 */

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import CarGrid from '@/components/cars/CarGrid'
import FilterSidebar from '@/components/cars/FilterSidebar'
import SearchBar from '@/components/cars/SearchBar'
import Loading from '@/components/ui/Loading'
import Select from '@/components/ui/Select'

function CarsPageContent() {
  const searchParams = useSearchParams()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    make: searchParams.get('make') || '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    location: '',
    condition: '',
    bodyType: '',
    fuelType: '',
    transmission: '',
    verifiedOnly: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at_desc')

  const fetchCars = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('cars')
      .select(`
        *,
        dealers (name),
        car_images (image_url, is_primary)
      `)

    // Apply filters
    if (filters.make) query = query.eq('make', filters.make)
    if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
    if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
    if (filters.minYear) query = query.gte('year', parseInt(filters.minYear))
    if (filters.maxYear) query = query.lte('year', parseInt(filters.maxYear))
    if (filters.location) query = query.eq('location', filters.location)
    if (filters.condition) query = query.eq('condition', filters.condition)
    if (filters.bodyType) query = query.eq('body_type', filters.bodyType)
    if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType)
    if (filters.transmission) query = query.eq('transmission', filters.transmission)
    if (filters.verifiedOnly) query = query.eq('is_verified', true)

    // Apply search
    if (searchTerm) {
      query = query.or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
    }

    // Apply sorting
    const [sortField, sortOrder] = sortBy.split('_')
    if (sortField === 'created') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else {
      query = query.order(sortField, { ascending: sortOrder === 'asc' })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cars:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      setCars([])
    } else {
      setCars(data || [])
    }

    setLoading(false)
  }, [filters, searchTerm, sortBy])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      make: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      location: '',
      condition: '',
      bodyType: '',
      fuelType: '',
      transmission: '',
      verifiedOnly: false
    })
    setSearchTerm('')
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Cars</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
          </div>

          {/* Results Count and Sort */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${cars.length} car${cars.length !== 1 ? 's' : ''} found`}
            </p>
            <div className="w-64">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'created_at_desc', label: 'Recently Added' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'year_desc', label: 'Year: Newest First' },
                  { value: 'year_asc', label: 'Year: Oldest First' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Cars Grid */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
            {loading ? (
              <Loading text="Loading cars..." />
            ) : (
              <CarGrid cars={cars} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CarsPage() {
  return (
    <Suspense fallback={<Loading text="Loading cars..." />}>
      <CarsPageContent />
    </Suspense>
  )
}
