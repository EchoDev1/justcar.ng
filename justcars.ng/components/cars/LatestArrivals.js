'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Clock, Eye, Heart } from 'lucide-react'
import Image from 'next/image'

export default function LatestArrivals({ cars = [] }) {
  const [visibleCards, setVisibleCards] = useState([])
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  // Default demo cars if none provided
  const displayCars = cars.length > 0 ? cars.slice(0, 6) : [
    {
      id: 1,
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2024,
      price: 45000000,
      imageUrl: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80',
      addedTime: '2 hours ago',
      location: 'Lagos',
      mileage: '0 km'
    },
    {
      id: 2,
      make: 'Toyota',
      model: 'Land Cruiser',
      year: 2024,
      price: 52000000,
      imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
      addedTime: '4 hours ago',
      location: 'Abuja',
      mileage: '100 km'
    },
    {
      id: 3,
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 38000000,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      addedTime: '6 hours ago',
      location: 'Lagos',
      mileage: '2,500 km'
    },
    {
      id: 4,
      make: 'Lexus',
      model: 'RX 350',
      year: 2024,
      price: 42000000,
      imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      addedTime: '8 hours ago',
      location: 'Port Harcourt',
      mileage: '500 km'
    },
    {
      id: 5,
      make: 'Range Rover',
      model: 'Sport',
      year: 2023,
      price: 65000000,
      imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      addedTime: '12 hours ago',
      location: 'Lagos',
      mileage: '1,200 km'
    },
    {
      id: 6,
      make: 'Porsche',
      model: 'Cayenne',
      year: 2024,
      price: 78000000,
      imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      addedTime: '1 day ago',
      location: 'Abuja',
      mileage: '300 km'
    }
  ]

  // Format price in Naira
  const formatPrice = (price) => {
    return `₦${(price / 1000000).toFixed(1)}M`
  }

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardsRef.current.findIndex((ref) => ref === entry.target)
            if (index !== -1 && !visibleCards.includes(index)) {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index])
              }, index * 200) // Stagger by 200ms
            }
          }
        })
      },
      { threshold: 0.2 }
    )

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card)
    })

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card)
      })
    }
  }, [visibleCards])

  return (
    <section ref={sectionRef} className="latest-arrivals-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="latest-arrivals-header">
          <div className="latest-arrivals-title-wrapper">
            <h2 className="latest-arrivals-title">Just Added</h2>
            <div className="new-badge">
              <span className="new-badge-text">NEW</span>
              <div className="new-badge-pulse"></div>
            </div>
          </div>
          <p className="latest-arrivals-subtitle">
            Fresh arrivals from verified dealers - be the first to explore!
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="timeline-container">
          {/* Vertical Timeline Line */}
          <div className="timeline-line">
            <div className="timeline-line-glow"></div>
          </div>

          {/* Timeline Items */}
          <div className="timeline-items">
            {displayCars.map((car, index) => (
              <div
                key={car.id}
                ref={(el) => (cardsRef.current[index] = el)}
                className={`timeline-item ${
                  index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right'
                } ${visibleCards.includes(index) ? 'timeline-item-visible' : ''}`}
              >
                {/* Glowing Node */}
                <div className="timeline-node">
                  <div className="timeline-node-inner"></div>
                  <div className="timeline-node-ring"></div>
                  <div className="timeline-node-glow"></div>
                </div>

                {/* Car Card */}
                <Link href={`/cars/${car.id}`} className="timeline-card">
                  {/* Date Badge */}
                  <div className="timeline-date-badge">
                    <Clock size={14} />
                    <span>{car.addedTime}</span>
                  </div>

                  {/* Car Image */}
                  <div className="timeline-card-image-wrapper">
                    <div
                      className="timeline-card-image"
                      style={{ backgroundImage: `url(${car.imageUrl})` }}
                    />

                    {/* Gradient Overlay */}
                    <div className="timeline-card-gradient"></div>

                    {/* Quick Actions */}
                    <div className="timeline-card-actions">
                      <button className="timeline-action-btn">
                        <Heart size={18} />
                      </button>
                      <button className="timeline-action-btn">
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="timeline-card-content">
                    <h3 className="timeline-card-title">
                      {car.year} {car.make} {car.model}
                    </h3>

                    <div className="timeline-card-meta">
                      <span className="timeline-card-location">{car.location}</span>
                      <span className="timeline-card-divider">•</span>
                      <span className="timeline-card-mileage">{car.mileage}</span>
                    </div>

                    <div className="timeline-card-price">
                      {formatPrice(car.price)}
                    </div>
                  </div>

                  {/* Glassmorphic Border */}
                  <div className="timeline-card-border"></div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="latest-arrivals-footer">
          <Link href="/cars?sort=latest" className="view-all-btn">
            <span>View All Latest Arrivals</span>
            <div className="view-all-arrow">→</div>
          </Link>
        </div>
      </div>
    </section>
  )
}
