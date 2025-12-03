/**
 * Featured Car Card with 3D Effects
 * Includes parallax, hover effects, and animations
 * Optimized with React.memo and lazy loading
 */

'use client'

import { useState, useRef, memo, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle, Calendar, Gauge, MapPin, Fuel, Settings, Heart, MessageCircle, Eye, Star } from 'lucide-react'

function FeaturedCarCard({ car }) {
  const [isSaved, setIsSaved] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  // Handle mouse move for parallax effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -10 // Invert for natural feel
    const rotateY = ((x - centerX) / centerX) * 10

    setMousePosition({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Get primary image or placeholder
  const getPrimaryImage = () => {
    if (car.car_images && car.car_images.length > 0) {
      const primaryImage = car.car_images.find(img => img.is_primary) || car.car_images[0]
      return primaryImage.image_url
    }
    return '/images/placeholder-car.svg'
  }

  return (
    <Link href={`/cars/${car.id}`} className="block">
      <div
        ref={cardRef}
        className="car-card-3d-featured car-card-parallax cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)`
        }}
      >
        {/* Shimmer Effect */}
        <div className="card-shimmer" />

        {/* Car Image */}
        <div className="car-image-container">
          <img
            src={getPrimaryImage()}
            alt={`${car.make} ${car.model}`}
            className="car-image"
          />
          <div className="image-gradient-overlay" />

          {/* Verified Badge */}
          {car.is_verified && (
            <div className="verified-badge">
              <CheckCircle size={16} />
              Verified
            </div>
          )}

          {/* Premium Verified Badge - Bottom Right */}
          {car.is_premium_verified && (
            <div className="absolute bottom-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-yellow-300 z-10">
              <Star size={14} className="inline mr-1" />
              PREMIUM
            </div>
          )}

          {/* Featured Ribbon */}
          {car.is_featured && (
            <div className="featured-ribbon">
              Featured
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="car-card-content">
          {/* Car Name */}
          <h3 className="car-name">
            {car.year} {car.make} {car.model}
          </h3>

          {/* Price */}
          <div className="car-price">
            {formatPrice(car.price)}
          </div>

          {/* Specs */}
          <div className="car-specs">
            <div className="spec-item">
              <Calendar className="spec-icon text-accent-blue" size={18} />
              <span className="spec-label">Year</span>
              <span className="spec-value">{car.year}</span>
            </div>

            <div className="spec-item">
              <Gauge className="spec-icon text-accent-green" size={18} />
              <span className="spec-label">Mileage</span>
              <span className="spec-value">
                {car.mileage ? `${(car.mileage / 1000).toFixed(0)}K km` : 'N/A'}
              </span>
            </div>

            <div className="spec-item">
              <MapPin className="spec-icon text-secondary" size={18} />
              <span className="spec-label">Location</span>
              <span className="spec-value">{car.location}</span>
            </div>

            <div className="spec-item">
              <Fuel className="spec-icon text-accent-blue" size={18} />
              <span className="spec-label">Fuel</span>
              <span className="spec-value">{car.fuel_type || 'Petrol'}</span>
            </div>

            <div className="spec-item">
              <Settings className="spec-icon text-accent-green" size={18} />
              <span className="spec-label">Trans.</span>
              <span className="spec-value">{car.transmission || 'Auto'}</span>
            </div>

            <div className="spec-item">
              <CheckCircle className="spec-icon text-secondary" size={18} />
              <span className="spec-label">Condition</span>
              <span className="spec-value">{car.condition}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="car-actions">
            <button
              className="action-button action-button-whatsapp"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const message = `Hi, I'm interested in the ${car.year} ${car.make} ${car.model}`
                const phoneNumber = car.dealers?.phone || '2348000000000'
                window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
              }}
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>

            <button
              className="action-button action-button-view"
              onClick={(e) => {
                // Allow default link behavior
              }}
            >
              <Eye size={18} />
              View Details
            </button>

            <button
              className={`action-button action-button-save ${isSaved ? 'heart-fill' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSave()
              }}
            >
              <Heart
                size={20}
                fill={isSaved ? '#FF6B00' : 'none'}
                className={isSaved ? 'heart-fill' : ''}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(FeaturedCarCard)
