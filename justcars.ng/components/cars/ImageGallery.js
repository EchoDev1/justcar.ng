/**
 * Image Gallery Component with Lightbox
 * Displays car images with full-screen view option
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  const openLightbox = (index) => {
    setSelectedImage(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div>
      {/* Main Image */}
      <div
        className="relative h-96 bg-gray-200 rounded-lg overflow-hidden cursor-pointer mb-4"
        onClick={() => openLightbox(selectedImage)}
      >
        <Image
          src={images[selectedImage].image_url}
          alt={`Car image ${selectedImage + 1}`}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative h-20 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
              index === selectedImage ? 'border-blue-600' : 'border-transparent hover:border-gray-400'
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image.image_url}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="150px"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto p-12">
            <Image
              src={images[selectedImage].image_url}
              alt={`Car image ${selectedImage + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight size={48} />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
