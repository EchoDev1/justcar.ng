/**
 * Car Listing Page
 * Browse and filter all cars
 */

'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
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
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12
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

  // Memoize supabase client for better performance
  const supabase = useMemo(() => createClient(), [])

  const fetchCars = useCallback(async () => {
    setLoading(true)

    // Optimized query - only select necessary fields for faster loading
    let query = supabase
      .from('cars')
      .select(`
        id,
        make,
        model,
        year,
        price,
        mileage,
        location,
        fuel_type,
        transmission,
        condition,
        is_verified,
        is_featured,
        is_premium_verified,
        views,
        dealer_id,
        body_type,
        dealers (
          name,
          badge_type
        ),
        car_images (
          image_url,
          is_primary
        )
      `, { count: 'exact' })

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
    if (sortField === 'price') {
      query = query.order('price', { ascending: sortOrder === 'asc' })
    } else if (sortField === 'year') {
      query = query.order('year', { ascending: sortOrder === 'asc' })
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching cars:', error)
      setCars([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    setTotalCount(count || 0)
    setCars(data || [])
    setLoading(false)
  }, [supabase, filters, searchTerm, sortBy, currentPage])

  // Handle URL search params from homepage
  useEffect(() => {
    const search = searchParams.get('search')
    const filter = searchParams.get('filter')
    const bodyType = searchParams.get('body_type')
    const make = searchParams.get('make')
    const price = searchParams.get('price')

    // Apply search term
    if (search) {
      setSearchTerm(search)
    }

    // Handle direct body_type parameter (from category cards)
    if (bodyType) {
      setFilters(prev => ({ ...prev, bodyType: bodyType }))
    }

    // Handle direct make parameter (from brand logos)
    if (make) {
      setFilters(prev => ({ ...prev, make: make }))
    }

    // Handle direct price parameter (from category cards)
    if (price) {
      if (price.includes('+')) {
        // Format: 50000000+ (luxury)
        const minPrice = price.replace('+', '')
        setFilters(prev => ({ ...prev, minPrice: minPrice, maxPrice: '' }))
      } else if (price.includes('-')) {
        // Format: 0-10000000 (budget)
        const [min, max] = price.split('-')
        setFilters(prev => ({ ...prev, minPrice: min !== '0' ? min : '', maxPrice: max }))
      }
    }

    // Handle filter parameter (from search bar pills)
    if (filter) {
      const filterLower = filter.toLowerCase()

      // Check if it's a make (brand)
      const makes = ['toyota', 'mercedes', 'bmw', 'audi', 'lexus', 'honda', 'nissan', 'ford']
      if (makes.some(make => filterLower.includes(make))) {
        setFilters(prev => ({ ...prev, make: filter }))
      }
      // Check if it's a body type
      else if (['suv', 'sedan', 'coupe', 'truck', 'van', 'hatchback'].includes(filterLower)) {
        setFilters(prev => ({ ...prev, bodyType: filter }))
      }
      // Check if it's a budget filter
      else if (filterLower.includes('luxury') || filterLower.includes('premium')) {
        setFilters(prev => ({ ...prev, minPrice: '150000000' }))
      }
      else if (filterLower.includes('affordable') || filterLower.includes('budget')) {
        setFilters(prev => ({ ...prev, maxPrice: '10000000' }))
      }
      else if (filterLower.includes('mid')) {
        setFilters(prev => ({ ...prev, minPrice: '10000000', maxPrice: '150000000' }))
      }
    }
  }, [searchParams])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
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
    setCurrentPage(1)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when search changes
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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
              {loading ? 'Loading...' : `${totalCount} car${totalCount !== 1 ? 's' : ''} found`}
            </p>
            <div className="w-64">
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setCurrentPage(1)
                }}
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
              <>
                <CarGrid cars={cars} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, idx) => {
                        const page = idx + 1
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-lg ${
                                currentPage === page
                                  ? 'bg-primary text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="px-2 py-2">...</span>
                        }
                        return null
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
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
