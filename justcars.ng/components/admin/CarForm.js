/**
 * Car Form Component for Admin
 * Create and edit car listings
 */

'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUploader from './ImageUploader'
import {
  CAR_MAKES,
  NIGERIAN_STATES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CONDITIONS,
  COLORS,
  CAR_FEATURES
} from '@/lib/utils'

export default function CarForm({ initialData, dealers, onSubmit, loading, isEdit }) {
  const [formData, setFormData] = useState(initialData || {
    dealer_id: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    condition: '',
    body_type: '',
    fuel_type: '',
    transmission: '',
    color: '',
    location: '',
    description: '',
    features: [],
    is_verified: false,
    is_featured: false,
    is_premium_verified: false,
    is_just_arrived: false,
    inspection_report: {
      engine: '',
      transmission: '',
      body: '',
      interior: '',
      ac_condition: '',
      documents: '',
      notes: '',
      inspector_name: '',
      inspection_date: ''
    }
  })

  const [images, setImages] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [deletedImageIds, setDeletedImageIds] = useState([])

  // Initialize images from initialData when editing
  useEffect(() => {
    if (initialData?.car_images) {
      const existingImages = initialData.car_images
        .sort((a, b) => a.display_order - b.display_order)
        .map(img => ({
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary
        }))
      setImages(existingImages)
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleInspectionChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      inspection_report: {
        ...formData.inspection_report,
        [name]: value
      }
    })
  }

  const handleFeatureToggle = (feature) => {
    const features = formData.features || []
    const index = features.indexOf(feature)
    if (index > -1) {
      features.splice(index, 1)
    } else {
      features.push(feature)
    }
    setFormData({ ...formData, features: [...features] })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ formData, images, videoFile, deletedImageIds })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Dealer"
            name="dealer_id"
            value={formData.dealer_id}
            onChange={handleChange}
            options={dealers?.map(d => ({ value: d.id, label: d.name })) || []}
            placeholder="Select dealer"
            required
          />

          <Select
            label="Make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            options={CAR_MAKES}
            placeholder="Select make"
            required
          />

          <Input
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., Camry, Accord, C-Class"
            required
          />

          <Input
            label="Year"
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="2024"
            required
          />

          <Input
            label="Price (₦)"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="15500000"
            required
          />

          <Input
            label="Mileage (km)"
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            placeholder="45000"
            required
          />

          <Select
            label="Condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            options={CONDITIONS}
            placeholder="Select condition"
            required
          />

          <Select
            label="Body Type"
            name="body_type"
            value={formData.body_type}
            onChange={handleChange}
            options={BODY_TYPES}
            placeholder="Select body type"
            required
          />

          <Select
            label="Fuel Type"
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleChange}
            options={FUEL_TYPES}
            placeholder="Select fuel type"
            required
          />

          <Select
            label="Transmission"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            options={TRANSMISSIONS}
            placeholder="Select transmission"
            required
          />

          <Select
            label="Color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            options={COLORS}
            placeholder="Select color"
            required
          />

          <Select
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            options={NIGERIAN_STATES}
            placeholder="Select location"
            required
          />
        </div>

        <div className="mt-6">
          <Input
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the vehicle..."
            rows={6}
            required
          />
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Car Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {CAR_FEATURES.map((feature) => (
            <label key={feature} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features?.includes(feature) || false}
                onChange={() => handleFeatureToggle(feature)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Images</h2>
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          onImageDelete={(imageId) => {
            if (imageId) setDeletedImageIds([...deletedImageIds, imageId])
          }}
        />
      </div>

      {/* Video (Optional) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Video (Optional)</h2>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {videoFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Selected: {videoFile.name}
          </p>
        )}
      </div>

      {/* Inspection Report */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Inspection Report (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Engine Condition"
            name="engine"
            value={formData.inspection_report.engine}
            onChange={handleInspectionChange}
            placeholder="e.g., Excellent, Good, Fair"
          />

          <Input
            label="Transmission Condition"
            name="transmission"
            value={formData.inspection_report.transmission}
            onChange={handleInspectionChange}
            placeholder="e.g., Excellent, Good, Fair"
          />

          <Input
            label="Body Condition"
            name="body"
            value={formData.inspection_report.body}
            onChange={handleInspectionChange}
            placeholder="e.g., Excellent, Good, Fair"
          />

          <Input
            label="Interior Condition"
            name="interior"
            value={formData.inspection_report.interior}
            onChange={handleInspectionChange}
            placeholder="e.g., Excellent, Good, Fair"
          />

          <Input
            label="AC Condition"
            name="ac_condition"
            value={formData.inspection_report.ac_condition}
            onChange={handleInspectionChange}
            placeholder="e.g., Working, Not Working"
          />

          <Input
            label="Documents"
            name="documents"
            value={formData.inspection_report.documents}
            onChange={handleInspectionChange}
            placeholder="e.g., Complete, Incomplete"
          />

          <Input
            label="Inspector Name"
            name="inspector_name"
            value={formData.inspection_report.inspector_name}
            onChange={handleInspectionChange}
            placeholder="John Doe"
          />

          <Input
            label="Inspection Date"
            type="date"
            name="inspection_date"
            value={formData.inspection_report.inspection_date}
            onChange={handleInspectionChange}
          />

          <div className="md:col-span-2">
            <Input
              label="Additional Notes"
              type="textarea"
              name="notes"
              value={formData.inspection_report.notes}
              onChange={handleInspectionChange}
              placeholder="Any additional notes about the inspection..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Status & Placement</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Verified Car</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mark this car as verified and inspected</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Featured Car</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Display this car in featured section</p>
            </div>
          </label>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Premium Sections</h3>

            <label className="flex items-center space-x-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                name="is_premium_verified"
                checked={formData.is_premium_verified}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Premium Verified Collection</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add to exclusive premium verified collection with enhanced visibility</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_just_arrived"
                checked={formData.is_just_arrived}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Just Arrived</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display in Just Arrived section (auto-expires after 30 days)</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Car' : 'Create Car'}
        </Button>
      </div>
    </form>
  )
}
