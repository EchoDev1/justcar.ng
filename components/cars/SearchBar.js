/**
 * Search Bar Component
 * Real-time search for cars with debouncing
 */

'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { debounce } from '@/lib/utils'

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  // Debounced search function
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      onSearch(searchTerm)
    }, 300)

    debouncedSearch()
  }, [searchTerm, onSearch])

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-blue" size={20} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by brand, model, or location..."
        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 transition-colors"
      />
    </div>
  )
}
