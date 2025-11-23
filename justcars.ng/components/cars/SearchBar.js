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
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by make, model, or location..."
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
