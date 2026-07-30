/**
 * Car Listing Page
 * Browse and filter all cars
 */

'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CarGrid from '@/components/cars/CarGrid'
import FilterSidebar from '@/components/cars/FilterSidebar'
import SearchBar from '@/components/cars/SearchBar'
import Loading from '@/components/ui/Loading'
import Select from '@/components/ui/Select'
import { Crown, X, ChevronRight, Volume2, Sparkles, Zap, Gauge, Play, Pause, Flame, Trophy } from 'lucide-react'
import { LUXURY_PRICE_THRESHOLD, getBrandAbbreviation } from '@/lib/utils'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

// Popular brands data - using centralized brand abbreviations
const popularBrands = [
  { name: 'Toyota', count: 342 },
  { name: 'Honda', count: 218 },
  { name: 'Mercedes-Benz', count: 156 },
  { name: 'BMW', count: 124 },
  { name: 'Lexus', count: 189 },
  { name: 'Nissan', count: 203 },
  { name: 'Audi', count: 98 },
  { name: 'Ford', count: 167 }
].map(brand => ({ ...brand, logo: getBrandAbbreviation(brand.name) }))

function CarsPageContent() {
  const searchParams = useSearchParams()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  // Luxury mode - when true, only shows cars >= 150M
  const isLuxuryMode = searchParams.get('luxury') === 'true'

  const [filters, setFilters] = useState({
    make: searchParams.get('make') || '',
    brandLetter: searchParams.get('brandLetter') || '',
    minPrice: isLuxuryMode ? LUXURY_PRICE_THRESHOLD.toString() : '',
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

    // Apply filters - use ilike for exact brand matching on make
    if (filters.make) {
      // Map brand aliases for accurate matching (e.g. Mercedes -> Mercedes-Benz)
      const cleanMake = filters.make.trim()
      query = query.ilike('make', `%${cleanMake}%`)
    }
    if (filters.brandLetter) query = query.ilike('make', `${filters.brandLetter}%`)
    if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
    if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
    if (filters.minYear) query = query.gte('year', parseInt(filters.minYear))
    if (filters.maxYear) query = query.lte('year', parseInt(filters.maxYear))
    if (filters.location) query = query.ilike('location', filters.location)
    if (filters.condition) query = query.ilike('condition', filters.condition)
    if (filters.bodyType) query = query.ilike('body_type', filters.bodyType)
    if (filters.fuelType) query = query.ilike('fuel_type', filters.fuelType)
    if (filters.transmission) query = query.ilike('transmission', filters.transmission)
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
      console.error('Error fetching cars:', error?.message || error)
      // Don't clear cars on error - keep showing previous data
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
    const brandLetter = searchParams.get('brandLetter')
    const luxury = searchParams.get('luxury')

    // Apply search term
    if (search) {
      setSearchTerm(search)
    }

    // Handle luxury mode - ALWAYS set minPrice to 150M when luxury=true
    if (luxury === 'true') {
      setFilters(prev => ({
        ...prev,
        minPrice: LUXURY_PRICE_THRESHOLD.toString(),
        make: make || prev.make // Also set make if provided (for brand filtering)
      }))
      return // Skip other price handling in luxury mode
    }

    // Handle direct body_type parameter (from category cards)
    if (bodyType) {
      setFilters(prev => ({ ...prev, bodyType: bodyType }))
    }

    // Handle direct make parameter (from brand logos)
    if (make) {
      setFilters(prev => ({ ...prev, make: make }))
    }

    // Handle brandLetter parameter (from alphabet filter) - set as search term to filter by first letter
    if (brandLetter) {
      setSearchTerm(brandLetter)
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
      brandLetter: '',
      // Preserve luxury mode minimum price if in luxury mode
      minPrice: isLuxuryMode ? LUXURY_PRICE_THRESHOLD.toString() : '',
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sleek Brand Quick Selector Bar */}
      <section className="py-8 bg-primary border-b border-white/10 relative overflow-hidden">
        <div className="hero-gradient-mesh absolute inset-0 opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text-hero">
                {isLuxuryMode ? 'Luxury Collection' : 'Browse Verified Vehicles'}
              </h1>
              <p className="text-muted text-sm mt-1">
                {isLuxuryMode 
                  ? 'Ultra-exclusive luxury inventory (₦150M+)' 
                  : 'Filter by brand, model, price, or vehicle condition'}
              </p>
            </div>

            {/* Exit Luxury mode indicator if active */}
            {isLuxuryMode && (
              <Link
                href="/cars"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 rounded-xl text-sm font-semibold transition-all"
              >
                <Crown size={16} />
                <span>Exit Luxury Mode</span>
                <X size={14} className="ml-1" />
              </Link>
            )}
          </div>

          {/* Quick Brand Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <span className="text-xs uppercase tracking-wider text-accent-blue font-bold whitespace-nowrap flex items-center gap-1.5">
              Top Brands:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => handleFilterChange({ ...filters, make: '' })}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  !filters.make 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30' 
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                All Brands
              </button>
              {popularBrands.map((brand) => {
                const isSelected = filters.make.toLowerCase() === brand.name.toLowerCase()
                return (
                  <button 
                    key={brand.name} 
                    onClick={() => handleFilterChange({ ...filters, make: brand.name })}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{brand.name}</span>
                    {isSelected && <X size={12} className="ml-1 opacity-80" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIP Car Lovers Interactive Feature: Virtual Engine Sound Experience */}
        <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Subtle ambient light glow background */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Header info */}
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/30">
                <Gauge size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent flex items-center gap-1.5 font-mono">
                    <Flame size={14} className="text-amber-400" /> VIP Sound Studio
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold tracking-wider uppercase">
                    Interactive
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-wide">
                  Virtual Exhaust Sound Rev Simulator
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Experience raw horsepower — select an engine configuration below to hear the exhaust roar.
                </p>
              </div>
            </div>            {/* Interactive Engine Sound Buttons - Filter & Sound Generator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {[
                { 
                  name: 'V8 Twin-Turbo', 
                  tag: 'Pure Muscle', 
                  filterTerm: 'V8', 
                  gradient: 'from-red-600/90 to-amber-600/90 hover:from-red-500 hover:to-amber-500 border-red-500/40',
                  playAudio: () => {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)()
                    // Base rumble
                    const osc1 = ctx.createOscillator()
                    const osc2 = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc1.type = 'sawtooth'
                    osc2.type = 'square'
                    osc1.frequency.setValueAtTime(80, ctx.currentTime)
                    osc2.frequency.setValueAtTime(160, ctx.currentTime)
                    
                    // Rev up curve
                    osc1.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.5)
                    osc2.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.5)
                    osc1.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.4)
                    osc2.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.4)
                    
                    gain.gain.setValueAtTime(0.3, ctx.currentTime)
                    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.5)
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4)
                    
                    osc1.connect(gain)
                    osc2.connect(gain)
                    gain.connect(ctx.destination)
                    osc1.start()
                    osc2.start()
                    osc1.stop(ctx.currentTime + 1.4)
                    osc2.stop(ctx.currentTime + 1.4)
                  }
                },
                { 
                  name: 'V12 Atmospheric', 
                  tag: 'Supercar Roar', 
                  filterTerm: 'V12', 
                  gradient: 'from-amber-500/90 to-yellow-600/90 hover:from-amber-400 hover:to-yellow-500 border-amber-400/40',
                  playAudio: () => {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)()
                    const osc1 = ctx.createOscillator()
                    const osc2 = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc1.type = 'sawtooth'
                    osc2.type = 'triangle'
                    osc1.frequency.setValueAtTime(120, ctx.currentTime)
                    osc2.frequency.setValueAtTime(240, ctx.currentTime)
                    
                    osc1.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.6)
                    osc2.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.6)
                    osc1.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 1.6)
                    osc2.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 1.6)
                    
                    gain.gain.setValueAtTime(0.35, ctx.currentTime)
                    gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.6)
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6)
                    
                    osc1.connect(gain)
                    osc2.connect(gain)
                    gain.connect(ctx.destination)
                    osc1.start()
                    osc2.start()
                    osc1.stop(ctx.currentTime + 1.6)
                    osc2.stop(ctx.currentTime + 1.6)
                  }
                },
                { 
                  name: 'Inline 6 Turbo', 
                  tag: 'Precision Tuned', 
                  filterTerm: 'Turbo', 
                  gradient: 'from-blue-600/90 to-cyan-600/90 hover:from-blue-500 hover:to-cyan-500 border-blue-400/40',
                  playAudio: () => {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)()
                    const osc = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc.type = 'sawtooth'
                    osc.frequency.setValueAtTime(100, ctx.currentTime)
                    osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.45)
                    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.3)
                    
                    gain.gain.setValueAtTime(0.3, ctx.currentTime)
                    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.45)
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3)
                    
                    osc.connect(gain)
                    gain.connect(ctx.destination)
                    osc.start()
                    osc.stop(ctx.currentTime + 1.3)
                  }
                },
                { 
                  name: 'EV Supercharge', 
                  tag: 'Futuristic Hum', 
                  filterTerm: 'Electric', 
                  gradient: 'from-cyan-500/90 to-emerald-600/90 hover:from-cyan-400 hover:to-emerald-500 border-cyan-400/40',
                  playAudio: () => {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)()
                    const osc = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc.type = 'sine'
                    osc.frequency.setValueAtTime(250, ctx.currentTime)
                    osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.7)
                    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.5)
                    
                    gain.gain.setValueAtTime(0.2, ctx.currentTime)
                    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.7)
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
                    
                    osc.connect(gain)
                    gain.connect(ctx.destination)
                    osc.start()
                    osc.stop(ctx.currentTime + 1.5)
                  }
                }
              ].map((engine) => (
                <button
                  key={engine.name}
                  onClick={() => {
                    // Play realistic synthesized audio sound
                    try { engine.playAudio() } catch (e) {}
                    
                    // Instantly filter cars grid by engine category & scroll to results
                    handleSearch(engine.filterTerm)
                    const gridEl = document.querySelector('.lg\\:grid')
                    if (gridEl) {
                      gridEl.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl bg-gradient-to-b ${engine.gradient} border text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-center cursor-pointer group/btn`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-white font-bold text-xs">
                    <Volume2 size={15} className="group-hover/btn:animate-ping" />
                    <span>{engine.name}</span>
                  </div>
                  <span className="text-[10px] text-white/90 font-semibold tracking-tight">
                    {engine.tag}
                  </span>
                  <span className="mt-1 text-[9px] text-amber-200 uppercase font-bold tracking-wider">
                    Listen & View Cars →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Search & Control Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:flex-1">
              <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <p className="text-sm text-muted whitespace-nowrap">
                {loading ? 'Searching...' : `${totalCount} vehicle${totalCount !== 1 ? 's' : ''}`}
              </p>

              <div className="w-48">
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
