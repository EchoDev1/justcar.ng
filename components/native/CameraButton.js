'use client'

import { useState, useCallback } from 'react'
import { Camera, ImagePlus, Images, Loader2, X, AlertCircle } from 'lucide-react'
import { takePhoto, pickFromGallery, pickMultiplePhotos, promptForPhoto, isNative } from '@/lib/native/camera'

/**
 * Camera Button Component
 * Provides native camera and gallery access for car photos
 */

// Single photo capture button
export function CameraButton({
  onCapture,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCapture = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dataUrl = await takePhoto()
      onCapture?.(dataUrl)
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        setError('Failed to capture photo')
        console.error('Camera capture error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [onCapture])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleCapture}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <Camera size={iconSizes[size]} />
        )}
        <span>Take Photo</span>
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// Gallery picker button
export function GalleryButton({
  onSelect,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSelect = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dataUrl = await pickFromGallery()
      onSelect?.(dataUrl)
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        setError('Failed to select photo')
        console.error('Gallery select error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [onSelect])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <ImagePlus size={iconSizes[size]} />
        )}
        <span>From Gallery</span>
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// Multi-photo picker button
export function MultiPhotoButton({
  onSelect,
  limit = 10,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSelect = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dataUrls = await pickMultiplePhotos(limit)
      onSelect?.(dataUrls)
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        setError('Failed to select photos')
        console.error('Multi-photo select error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [onSelect, limit])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <Images size={iconSizes[size]} />
        )}
        <span>Select Photos ({limit} max)</span>
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// Combined photo prompt (shows camera/gallery choice on native, file picker on web)
export function PhotoPromptButton({
  onCapture,
  variant = 'primary',
  size = 'md',
  label = 'Add Photo',
  disabled = false,
  className = ''
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePrompt = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dataUrl = await promptForPhoto()
      onCapture?.(dataUrl)
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        setError('Failed to add photo')
        console.error('Photo prompt error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [onCapture])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handlePrompt}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <Camera size={iconSizes[size]} />
        )}
        <span>{label}</span>
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// Photo upload zone with preview
export function PhotoUploadZone({
  onPhotosChange,
  photos = [],
  maxPhotos = 10,
  className = ''
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAddPhotos = useCallback(async () => {
    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const remaining = maxPhotos - photos.length
      const dataUrls = await pickMultiplePhotos(remaining)
      onPhotosChange?.([...photos, ...dataUrls])
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        setError('Failed to add photos')
        console.error('Photo upload error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [photos, maxPhotos, onPhotosChange])

  const handleTakePhoto = useCallback(async () => {
    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const dataUrl = await takePhoto()
      onPhotosChange?.([...photos, dataUrl])
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        setError('Failed to capture photo')
        console.error('Camera error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [photos, maxPhotos, onPhotosChange])

  const handleRemovePhoto = useCallback((index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange?.(newPhotos)
  }, [photos, onPhotosChange])

  const native = isNative()

  return (
    <div className={className}>
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Buttons */}
      {photos.length < maxPhotos && (
        <div className="flex flex-wrap gap-3">
          {native && (
            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={loading}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Camera size={20} />
              )}
              <span>Take Photo</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddPhotos}
            disabled={loading}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Images size={20} />
            )}
            <span>{native ? 'From Gallery' : 'Upload Photos'}</span>
          </button>
        </div>
      )}

      {/* Status */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {photos.length} of {maxPhotos} photos
        </span>
        {error && (
          <span className="text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </span>
        )}
      </div>

      {/* Hint */}
      {photos.length === 0 && (
        <p className="text-gray-400 text-xs mt-2">
          Add at least one photo. The first photo will be the primary image.
        </p>
      )}
    </div>
  )
}

export default {
  CameraButton,
  GalleryButton,
  MultiPhotoButton,
  PhotoPromptButton,
  PhotoUploadZone
}
