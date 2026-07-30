/**
 * Filter Sidebar Component
 * Advanced filtering options for car listings
 */

'use client'

import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { CAR_MAKES, NIGERIAN_STATES, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, CONDITIONS } from '@/lib/utils'

export default function FilterSidebar({ filters, onFilterChange, onResetFilters }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value })
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-accent-blue" />
          Filter Inventory
        </h2>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-accent-blue hover:underline font-semibold"
        >
          Reset All
        </button>
      </div>

      {/* Make */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Make (Brand)
        </label>
        <Select
          name="make"
          value={filters.make || ''}
          onChange={(e) => handleChange('make', e.target.value)}
          options={CAR_MAKES}
          placeholder="All Makes"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Price Range (₦)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            placeholder="Min Price"
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 text-sm"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="Max Price"
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Year Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minYear"
            value={filters.minYear || ''}
            onChange={(e) => handleChange('minYear', e.target.value)}
            placeholder="Min Year"
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 text-sm"
          />
          <input
            type="number"
            name="maxYear"
            value={filters.maxYear || ''}
            onChange={(e) => handleChange('maxYear', e.target.value)}
            placeholder="Max Year"
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Location */}
      <Select
        label="Location"
        name="location"
        value={filters.location || ''}
        onChange={(e) => handleChange('location', e.target.value)}
        options={NIGERIAN_STATES}
        placeholder="All Locations"
      />

      {/* Condition */}
      <Select
        label="Condition"
        name="condition"
        value={filters.condition || ''}
        onChange={(e) => handleChange('condition', e.target.value)}
        options={CONDITIONS}
        placeholder="All Conditions"
      />

      {/* Body Type */}
      <Select
        label="Body Type"
        name="bodyType"
        value={filters.bodyType || ''}
        onChange={(e) => handleChange('bodyType', e.target.value)}
        options={BODY_TYPES}
        placeholder="All Body Types"
      />

      {/* Fuel Type */}
      <Select
        label="Fuel Type"
        name="fuelType"
        value={filters.fuelType || ''}
        onChange={(e) => handleChange('fuelType', e.target.value)}
        options={FUEL_TYPES}
        placeholder="All Fuel Types"
      />

      {/* Transmission */}
      <Select
        label="Transmission"
        name="transmission"
        value={filters.transmission || ''}
        onChange={(e) => handleChange('transmission', e.target.value)}
        options={TRANSMISSIONS}
        placeholder="All Transmissions"
      />

      {/* Verified Only */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="verifiedOnly"
          checked={filters.verifiedOnly || false}
          onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-white/20 rounded focus:ring-blue-500 bg-white/10"
        />
        <label htmlFor="verifiedOnly" className="ml-2 text-sm font-medium text-white/90">
          Verified Cars Only
        </label>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-semibold backdrop-blur-xl hover:bg-white/10 transition-colors"
        >
          <SlidersHorizontal size={20} className="text-accent-blue" />
          Filter Vehicles
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <FilterContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-primary/95 backdrop-blur-2xl overflow-y-auto p-6 text-white">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-accent-blue" />
              Filter Inventory
            </h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <FilterContent />
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  )
}
