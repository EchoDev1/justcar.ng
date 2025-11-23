'use client'

/**
 * Advanced Search Bar with Glassmorphism
 * Features: Auto-suggest, filter pills, animated interactions
 */

import { useState, useRef, useEffect } from 'react'
import { Search, Car, DollarSign, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

const budgetRanges = [
  { label: 'Under ₦5M', value: '0-5000000', icon: DollarSign },
  { label: '₦5M-₦10M', value: '5000000-10000000', icon: TrendingUp },
  { label: '₦10M+', value: '10000000+', icon: TrendingUp },
]

const popularMakes = [
  { label: 'Toyota', value: 'toyota', color: '#EB0A1E' },
  { label: 'Honda', value: 'honda', color: '#CC0000' },
  { label: 'Mercedes', value: 'mercedes-benz', color: '#00ADEF' },
  { label: 'Lexus', value: 'lexus', color: '#000000' },
  { label: 'BMW', value: 'bmw', color: '#1C69D4' },
]

const bodyTypes = [
  { label: 'SUV', value: 'suv', icon: '🚙' },
  { label: 'Sedan', value: 'sedan', icon: '🚗' },
  { label: 'Coupe', value: 'coupe', icon: '🏎️' },
  { label: 'Truck', value: 'truck', icon: '🚚' },
]

export default function AdvancedSearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    budget: null,
    make: null,
    bodyType: null,
  })
  const searchRef = useRef(null)
  const router = useRouter()

  // Mock suggestions (replace with actual API call)
  const suggestions = searchQuery.length > 1 ? [
    { type: 'make', label: 'Toyota Camry 2020' },
    { type: 'make', label: 'Toyota Corolla 2021' },
    { type: 'location', label: 'Cars in Lagos' },
    { type: 'location', label: 'Cars in Abuja' },
  ] : []

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedFilters.budget) params.set('price', selectedFilters.budget)
    if (selectedFilters.make) params.set('make', selectedFilters.make)
    if (selectedFilters.bodyType) params.set('body_type', selectedFilters.bodyType)

    router.push(`/cars?${params.toString()}`)
  }

  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }))
  }

  return (
    <div className="max-w-5xl mx-auto" ref={searchRef}>
      {/* Main Search Bar */}
      <div
        className={`
          search-bar-glass
          rounded-2xl p-2
          transition-all duration-300
          ${isFocused ? 'search-bar-focused' : ''}
        `}
        style={{
          background: 'rgba(20, 25, 58, 0.6)',
          backdropFilter: 'blur(20px)',
          border: isFocused
            ? '2px solid rgba(0, 217, 255, 0.6)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isFocused
            ? '0 0 40px rgba(0, 217, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex items-center gap-4 px-4">
          {/* Search Icon with Pulse */}
          <div className="relative">
            <Search
              className={`text-accent-blue ${isFocused ? 'animate-pulse-slow' : ''}`}
              size={28}
            />
            {isFocused && (
              <div
                className="absolute inset-0 animate-ping"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 217, 255, 0.4) 0%, transparent 70%)',
                }}
              />
            )}
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(e.target.value.length > 1)
            }}
            onFocus={() => {
              setIsFocused(true)
              setShowSuggestions(searchQuery.length > 1)
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            placeholder="Search by make, model, year, or location..."
            className="flex-1 bg-transparent text-white text-lg md:text-xl placeholder-muted outline-none py-4"
            style={{
              caretColor: '#00D9FF',
            }}
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="btn-primary px-6 py-3 rounded-xl hover-glow-blue hover-scale flex items-center gap-2"
          >
            <span className="hidden md:inline">Search</span>
            <Search size={20} />
          </button>
        </div>

        {/* Auto-suggest Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="mt-2 rounded-xl overflow-hidden animate-fade-in"
            style={{
              background: 'rgba(20, 25, 58, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-6 py-3 text-left text-white hover:bg-primary-light transition-all flex items-center gap-3"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setSearchQuery(suggestion.label)
                  setShowSuggestions(false)
                  handleSearch()
                }}
              >
                <Car size={18} className="text-accent-blue" />
                <span>{suggestion.label}</span>
                <span className="ml-auto text-xs text-muted uppercase">{suggestion.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filter Pills */}
      <div className="mt-6 space-y-4">
        {/* Budget Ranges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted font-medium uppercase tracking-wider">Budget:</span>
          {budgetRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => toggleFilter('budget', range.value)}
              className={`
                filter-pill
                ${selectedFilters.budget === range.value ? 'filter-pill-active' : ''}
              `}
            >
              <DollarSign size={16} />
              <span>{range.label}</span>
            </button>
          ))}
        </div>

        {/* Popular Makes */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted font-medium uppercase tracking-wider">Brand:</span>
          {popularMakes.map((make) => (
            <button
              key={make.value}
              onClick={() => toggleFilter('make', make.value)}
              className={`
                filter-pill
                ${selectedFilters.make === make.value ? 'filter-pill-active' : ''}
              `}
              style={{
                borderColor: selectedFilters.make === make.value ? make.color : undefined,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: make.color }}
              />
              <span>{make.label}</span>
            </button>
          ))}
        </div>

        {/* Body Types */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted font-medium uppercase tracking-wider">Type:</span>
          {bodyTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleFilter('bodyType', type.value)}
              className={`
                filter-pill
                ${selectedFilters.bodyType === type.value ? 'filter-pill-active' : ''}
              `}
            >
              <span className="text-lg">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedFilters.budget || selectedFilters.make || selectedFilters.bodyType) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-accent-blue font-medium">Active filters:</span>
          {selectedFilters.budget && (
            <span className="px-3 py-1 rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
              {budgetRanges.find(r => r.value === selectedFilters.budget)?.label}
            </span>
          )}
          {selectedFilters.make && (
            <span className="px-3 py-1 rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/30 capitalize">
              {selectedFilters.make}
            </span>
          )}
          {selectedFilters.bodyType && (
            <span className="px-3 py-1 rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/30 capitalize">
              {selectedFilters.bodyType}
            </span>
          )}
          <button
            onClick={() => setSelectedFilters({ budget: null, make: null, bodyType: null })}
            className="ml-2 text-muted hover:text-secondary transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <style jsx>{`
        .filter-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: rgba(20, 25, 58, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .filter-pill:hover {
          background: rgba(0, 217, 255, 0.15);
          border-color: rgba(0, 217, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 217, 255, 0.2);
        }

        .filter-pill-active {
          background: rgba(0, 217, 255, 0.2);
          border-color: rgba(0, 217, 255, 0.8);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
        }

        .search-bar-focused {
          animation: border-glow 2s ease-in-out infinite;
        }

        @keyframes border-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(0, 217, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 60px rgba(0, 217, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.4);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
