/**
 * Image Uploader Component for Admin
 * Drag-and-drop multiple image upload with preview
 */

'use client'

import { useState } from 'react'
import { Upload, X, Star } from 'lucide-react'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function ImageUploader({ images, onImagesChange }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList) => {
    const files = Array.from(fileList)
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    // Convert files to preview URLs
    const newImages = imageFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: images.length === 0 && index === 0,
      display_order: images.length + index
    }))

    onImagesChange([...images, ...newImages])
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    // If removed image was primary, make first image primary
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }
    onImagesChange(newImages)
  }

  const setPrimaryImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }))
    onImagesChange(newImages)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Car Images
        <span className="text-red-500 ml-1">*</span>
      </label>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-2">
          Drag and drop images here, or click to select
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Upload multiple images (JPG, PNG, WebP)
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('image-upload').click()}
        >
          Select Images
        </Button>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {images.length} image{images.length !== 1 ? 's' : ''} selected
            {images.some(img => img.is_primary) && ' (Click star to set primary image)'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={image.preview || image.image_url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Primary
                    </div>
                  )}

                  {/* Overlay Buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Set as primary image"
                    >
                      <Star
                        size={20}
                        className={image.is_primary ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                      title="Remove image"
                    >
                      <X size={20} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
