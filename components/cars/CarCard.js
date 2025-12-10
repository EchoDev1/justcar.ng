/**
 * Car Card Component with Advanced 3D Effects
 * Features: 3D parallax, image zoom, animated badges, gradient overlays
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Gauge, Calendar, CheckCircle, Heart, MessageCircle, Eye, Fuel, Settings, Star, Crown } from 'lucide-react'
import { formatNaira, formatNumber } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import DealerBadge, { DealerBadgeIcon } from '@/components/ui/DealerBadge'
import ChatButton from '@/components/chat/ChatButton'
import EscrowButton from '@/components/escrow/EscrowButton'
import { useState, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeGetUser } from '@/lib/supabase/auth-utils'

function CarCard({ car, is3D = true }) {
  const [isSaved, setIsSaved] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Get primary image or first image
  const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
  const imageUrl = primaryImage?.image_url || '/images/placeholder-car.svg'

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Check if user is authenticated - handle session missing gracefully using safe wrapper
      const user = await safeGetUser(supabase)

      // If no user, redirect to login
      if (!user) {
        localStorage.setItem('pendingSaveCar', car.id)
        router.push(`/buyer/auth?carId=${car.id}&action=save`)
        return
      }

      // Check if user is a buyer
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('id')
        .eq('id', user.id)
        .single()

      if (buyerError || !buyerData) {
        localStorage.setItem('pendingSaveCar', car.id)
        router.push(`/buyer/auth?carId=${car.id}&action=save`)
        return
      }

      if (isSaved) {
        // Unsave
        await supabase
          .from('buyer_saved_cars')
          .delete()
          .eq('buyer_id', buyerData.id)
          .eq('car_id', car.id)
        setIsSaved(false)
      } else {
        // Save
        await supabase
          .from('buyer_saved_cars')
          .insert({
            buyer_id: buyerData.id,
            car_id: car.id,
            interest_level: 'interested'
          })
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving car:', error)
      // Redirect to login on any error
      localStorage.setItem('pendingSaveCar', car.id)
      router.push(`/buyer/auth?carId=${car.id}&action=save`)
    }
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
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUIyNTMyIi8+PC9zdmc+"
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

              {/* Luxury Badge - For cars ≥150M (displayed on luxury page) */}
              {(car.is_luxury_page || car.price >= 150000000) && (
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-yellow-400 z-20 flex items-center gap-1.5 animate-pulse-slow">
                  <Crown size={14} fill="currentColor" />
                  <span>LUXURY</span>
                </div>
              )}

              {/* Premium Verified Badge - Only show if NOT luxury (< 150M) */}
              {!car.is_luxury_page && car.price < 150000000 && car.is_premium_verified && (
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-yellow-300 z-20 flex items-center gap-1.5">
                  <Star size={14} fill="currentColor" />
                  <span>PREMIUM</span>
                </div>
              )}

              {/* Heart Icon (Save) - Repositioned to avoid conflict with badges */}
              <button
                onClick={handleSave}
                className={`absolute ${(car.is_luxury_page || car.price >= 150000000 || car.is_premium_verified) ? 'bottom-3 right-20' : 'bottom-3 right-3'} bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95`}
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

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {/* Escrow Protection Button */}
                {car.dealers && (
                  <div onClick={(e) => e.preventDefault()}>
                    <div className="w-full">
                      <EscrowButton
                        car={car}
                        dealer={car.dealers}
                        variant="primary"
                      />
                    </div>
                  </div>
                )}

                {/* Chat with Dealer */}
                {car.dealers && (
                  <div onClick={(e) => e.preventDefault()}>
                    <ChatButton
                      car={car}
                      dealer={car.dealers}
                      variant="secondary"
                    />
                  </div>
                )}
              </div>

              {/* Dealer Info */}
              {car.dealers && (
                <div className="pt-3 border-t border-white/10 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{car.dealers.name}</span>
                      {car.dealers.badge_type && car.dealers.badge_type !== 'none' && (
                        <DealerBadgeIcon badgeType={car.dealers.badge_type} size={16} />
                      )}
                    </div>
                    <button
                      onClick={handleWhatsApp}
                      className="text-green-400 hover:text-green-300 transition-colors text-sm"
                    >
                      WhatsApp
                    </button>
                  </div>
                  {car.dealers.badge_type && car.dealers.badge_type !== 'none' && (
                    <DealerBadge badgeType={car.dealers.badge_type} size="xs" />
                  )}
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
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRTVFN0VCIi8+PC9zdmc+"
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
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{car.dealers.name}</span>
                  {car.dealers.badge_type && car.dealers.badge_type !== 'none' && (
                    <DealerBadgeIcon badgeType={car.dealers.badge_type} size={14} />
                  )}
                </div>
              </div>
              {car.dealers.badge_type && car.dealers.badge_type !== 'none' && (
                <div className="mt-1">
                  <DealerBadge badgeType={car.dealers.badge_type} size="xs" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default memo(CarCard)
