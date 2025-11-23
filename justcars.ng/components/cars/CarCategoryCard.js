'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CarCategoryCard({ category, count, imageUrl, href }) {
  const [displayCount, setDisplayCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef(null)

  // Animated counter effect
  useEffect(() => {
    if (!isVisible || count === 0) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = count / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= count) {
        setDisplayCount(count)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, count])

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <Link href={href || '#'}>
      <div
        ref={cardRef}
        className={`category-card ${isVisible ? 'category-card-visible' : ''}`}
      >
        {/* Background Image with Zoom Effect */}
        <div className="category-card-image-wrapper">
          <div
            className="category-card-image"
            style={{
              backgroundImage: `url(${imageUrl || '/placeholder-car.jpg'})`
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="category-card-gradient" />

        {/* Content */}
        <div className="category-card-content">
          {/* Category Name */}
          <h3 className="category-card-title">{category}</h3>

          {/* Car Count with Animated Counter */}
          <div className="category-card-count">
            <span className="category-count-number">{displayCount}</span>
            <span className="category-count-label"> Available</span>
          </div>

          {/* Arrow Icon - Slides in on Hover */}
          <div className="category-card-arrow">
            <ArrowRight size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Glowing Border Effect */}
        <div className="category-card-border" />
      </div>
    </Link>
  )
}
