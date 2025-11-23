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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-blue-600"
        >
          Reset All
        </Button>
      </div>

      {/* Make */}
      <Select
        label="Make"
        name="make"
        value={filters.make || ''}
        onChange={(e) => handleChange('make', e.target.value)}
        options={CAR_MAKES}
        placeholder="All Makes"
      />

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            placeholder="Min"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minYear"
            value={filters.minYear || ''}
            onChange={(e) => handleChange('minYear', e.target.value)}
            placeholder="Min Year"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="maxYear"
            value={filters.maxYear || ''}
            onChange={(e) => handleChange('maxYear', e.target.value)}
            placeholder="Max Year"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="verifiedOnly" className="ml-2 text-sm font-medium text-gray-700">
          Verified Cars Only
        </label>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal size={20} />
          Filters
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>
            <FilterContent />
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
