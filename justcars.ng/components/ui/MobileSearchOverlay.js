'use client'

import { useState, useEffect } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MobileSearchOverlay({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/cars?q=${encodeURIComponent(searchQuery)}`)
      onClose()
      setSearchQuery('')
    }
  }

  const trendingSearches = [
    'Toyota Camry',
    'Mercedes-Benz',
    'Honda Accord',
    'Range Rover',
    'Lexus ES350',
  ]

  const handleTrendingClick = (query) => {
    setSearchQuery(query)
    router.push(`/cars?q=${encodeURIComponent(query)}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={`mobile-search-overlay ${isOpen ? 'mobile-search-overlay-open' : ''}`}>
      {/* Backdrop */}
      <div className="mobile-search-backdrop" onClick={onClose}></div>

      {/* Content */}
      <div className="mobile-search-content">
        {/* Header */}
        <div className="mobile-search-header">
          <h2 className="text-white text-xl font-bold">Search Cars</h2>
          <button
            onClick={onClose}
            className="mobile-search-close"
            aria-label="Close search"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mobile-search-form">
          <div className="mobile-search-input-wrapper">
            <Search size={20} className="mobile-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by make, model, or keyword..."
              className="mobile-search-input"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mobile-search-clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="mobile-search-button">
            Search
          </button>
        </form>

        {/* Trending Searches */}
        <div className="mobile-search-trending">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-accent-blue" />
            <h3 className="text-white font-semibold">Trending Searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((query) => (
              <button
                key={query}
                onClick={() => handleTrendingClick(query)}
                className="mobile-trending-tag"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
