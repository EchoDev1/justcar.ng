/**
 * Car Card Component with Advanced 3D Effects
 * Features: 3D parallax, image zoom, animated badges, gradient overlays
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Gauge, Calendar, CheckCircle, Heart, MessageCircle, Eye, Fuel, Settings } from 'lucide-react'
import { formatNaira, formatNumber } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { useState, useRef } from 'react'

export default function CarCard({ car, is3D = true }) {
  const [isSaved, setIsSaved] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  // Get primary image or first image
  const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
  const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaved(!isSaved)
  }

  const handleWhatsApp = (e) => {
    e.preventDefault()
    const message = `Hi, I'm interested in the ${car.year} ${car.make} ${car.model}`
    const phoneNumber = car.dealers?.phone || '2348000000000'
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // 3D Tilt Effect on Mouse Move
  const handleMouseMove = (e) => {
    if (!is3D || !cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  // 3D Enhanced card style
  if (is3D) {
    return (
      <Link href={`/cars/${car.id}`}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
            transition: 'transform 0.3s ease-out',
          }}
        >
          {/* Gradient Overlay Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Glass Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

          <div className="relative">
            {/* Image Container with Zoom Effect */}
            <div className="relative h-64 bg-gray-900 overflow-hidden">
              <Image
                src={imageUrl}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Gradient Overlay on Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Animated Verified Badge */}
              {car.is_verified && (
                <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg animate-fade-in border border-green-400/50 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle size={16} className="animate-pulse-slow" />
                  <span className="drop-shadow-md">Verified</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              )}

              {/* Featured Ribbon */}
              {car.is_featured && (
                <div className="absolute top-0 right-0 overflow-hidden">
                  <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-1 text-xs font-bold shadow-lg transform rotate-45 translate-x-6 translate-y-4 animate-pulse-slow">
                    <span className="relative z-10">FEATURED</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                  </div>
                </div>
              )}

              {/* Condition Badge */}
              <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-blue-400/50 group-hover:scale-110 transition-transform duration-300">
                {car.condition}
              </div>

              {/* Heart Icon (Save) */}
              <button
                onClick={handleSave}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Heart
                  size={20}
                  className={`${isSaved ? 'fill-red-500 text-red-500 animate-heart-beat' : 'text-gray-700'} transition-colors duration-200`}
                />
              </button>

              {/* View Count */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-white/20">
                <Eye size={14} />
                <span>{car.views || 0}</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 relative z-10">
              {/* Car Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 drop-shadow-md">
                {car.year} {car.make} {car.model}
              </h3>

              {/* Price with Glow Effect */}
              <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent mb-4 drop-shadow-lg animate-price-pulse">
                {formatNaira(car.price)}
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10">
                  <Calendar size={18} className="text-blue-400" />
                  <span className="font-medium">{car.year}</span>
                </div>

                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10">
                  <Gauge size={18} className="text-green-400" />
                  <span className="font-medium">{formatNumber(car.mileage)} km</span>
                </div>

                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10">
                  <MapPin size={18} className="text-orange-400" />
                  <span className="font-medium">{car.location}</span>
                </div>

                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10">
                  <Settings size={18} className="text-purple-400" />
                  <span className="font-medium">{car.transmission}</span>
                </div>

                {car.fuel_type && (
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10 col-span-2">
                    <Fuel size={18} className="text-yellow-400" />
                    <span className="font-medium">{car.fuel_type}</span>
                  </div>
                )}
              </div>

              {/* Dealer Info */}
              {car.dealers && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{car.dealers.name}</span>
                  </div>
                  <button
                    onClick={handleWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50"
                  >
                    <MessageCircle size={16} />
                    Contact
                  </button>
                </div>
              )}
            </div>

            {/* 3D Lighting Effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at ${50 + rotateY * 2}% ${50 + rotateX * 2}%, rgba(59, 130, 246, 0.15), transparent 70%)`,
              }}
            />
          </div>
        </div>
      </Link>
    )
  }

  // Classic card style (simplified fallback)
  return (
    <Link href={`/cars/${car.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative h-48 bg-gray-200">
          <Image
            src={imageUrl}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Verified Badge */}
          {car.is_verified && (
            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
              <CheckCircle size={14} />
              <span>Verified</span>
            </div>
          )}

          {/* Featured Badge */}
          {car.is_featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-gray-900 px-2 py-1 rounded-md text-xs font-bold">
              Featured
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            {car.condition}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {car.year} {car.make} {car.model}
          </h3>

          {/* Price */}
          <p className="text-2xl font-bold text-blue-600 mb-3">
            {formatNaira(car.price)}
          </p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge size={16} />
              <span>{formatNumber(car.mileage)} km</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{car.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{car.transmission}</span>
            </div>
          </div>

          {/* Dealer Info */}
          {car.dealers && (
            <div className="text-sm text-gray-500 border-t pt-2">
              {car.dealers.name}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
