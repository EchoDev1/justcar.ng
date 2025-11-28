/**
 * Luxury Car Portal - Mind-Blowing Premium Experience
 * Ultra-premium experience for high-end vehicles with gold theme
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Crown, Shield, Star, Sparkles, TrendingUp, Award, Check, Zap, Eye, Diamond, Heart, ChevronRight, Gem, BadgeCheck, Users, CarFront, Clock } from 'lucide-react'
import CarGrid from '@/components/cars/CarGrid'
import Button from '@/components/ui/Button'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

const luxuryBrands = [
  { name: 'Rolls-Royce', letter: 'RR', color: '#8B4513' },
  { name: 'Bentley', letter: 'B', color: '#006341' },
  { name: 'Lamborghini', letter: 'L', color: '#FFC300' },
  { name: 'Ferrari', letter: 'F', color: '#DC0000' },
  { name: 'Porsche', letter: 'P', color: '#D5001C' },
  { name: 'Maserati', letter: 'M', color: '#0C2340' },
  { name: 'Aston Martin', letter: 'AM', color: '#004225' },
  { name: 'McLaren', letter: 'MC', color: '#FF8000' },
  { name: 'Bugatti', letter: 'BG', color: '#C40234' },
  { name: 'Maybach', letter: 'MB', color: '#000000' },
  { name: 'Range Rover', letter: 'RR', color: '#005A2B' },
  { name: 'Mercedes-AMG', letter: 'AMG', color: '#00ADEF' }
]

const luxuryTestimonials = [
  {
    id: 1,
    name: 'Chief Emeka Okafor',
    title: 'Business Mogul',
    location: 'Lagos Island',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChiefEmeka&skinColor=brown,dark&backgroundColor=FFD700',
    rating: 5,
    quote: 'Acquired my Rolls-Royce Phantom through JustCars Luxury. The concierge service was impeccable, and the vehicle authentication process gave me complete confidence.',
    vehicle: 'Rolls-Royce Phantom'
  },
  {
    id: 2,
    name: 'Mrs. Adaeze Nwosu',
    title: 'CEO, Tech Ventures',
    location: 'Abuja',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdaezeNwosu&skinColor=brown,dark&backgroundColor=FFD700',
    rating: 5,
    quote: 'The exclusive access to rare Bentley models and white-glove delivery service exceeded all expectations. This is luxury car buying redefined.',
    vehicle: 'Bentley Continental GT'
  },
  {
    id: 3,
    name: 'Alhaji Musa Ibrahim',
    title: 'Investor',
    location: 'Victoria Island',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlhajiMusa&skinColor=brown,dark&backgroundColor=FFD700',
    rating: 5,
    quote: 'From inquiry to delivery, every touchpoint radiated excellence. The detailed inspection report and provenance verification justified the premium.',
    vehicle: 'Mercedes-Maybach S680'
  }
]

export default function LuxuryPortalPage() {
  const [luxuryCars, setLuxuryCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [goldParticles, setGoldParticles] = useState([])
  const [statsVisible, setStatsVisible] = useState([false, false, false, false])
  const [brandsVisible, setBrandsVisible] = useState([])
  const [testimonialsVisible, setTestimonialsVisible] = useState([false, false, false])

  // Generate floating gold particles
  useEffect(() => {
    const particleCount = 50
    const newParticles = []

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`,
        duration: `${10 + Math.random() * 20}s`,
        size: Math.random() * 4 + 2
      })
    }

    setGoldParticles(newParticles)
  }, [])

  // Fetch luxury cars
  useEffect(() => {
    async function fetchLuxuryCars() {
      const supabase = createClient()

      const { data: cars } = await supabase
        .from('cars')
        .select(`
          *,
          dealers (name),
          car_images (image_url, is_primary)
        `)
        .gte('price', 100000000)
        .order('price', { ascending: false })
        .limit(12)

      setLuxuryCars(cars || [])
      setLoading(false)
    }

    fetchLuxuryCars()
  }, [])

  // Intersection Observer for stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.statIndex)
            setTimeout(() => {
              setStatsVisible(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 150)
          }
        })
      },
      { threshold: 0.3 }
    )

    const stats = document.querySelectorAll('.luxury-stat-card')
    stats.forEach(stat => observer.observe(stat))

    return () => {
      stats.forEach(stat => observer.unobserve(stat))
    }
  }, [])

  // Intersection Observer for brands
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.brandIndex)
            setTimeout(() => {
              setBrandsVisible(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 80)
          }
        })
      },
      { threshold: 0.2 }
    )

    const brands = document.querySelectorAll('.luxury-brand-card')
    brands.forEach(brand => observer.observe(brand))

    return () => {
      brands.forEach(brand => observer.unobserve(brand))
    }
  }, [])

  // Intersection Observer for testimonials
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.testimonialIndex)
            setTimeout(() => {
              setTestimonialsVisible(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 200)
          }
        })
      },
      { threshold: 0.2 }
    )

    const testimonials = document.querySelectorAll('.luxury-testimonial-card')
    testimonials.forEach(testimonial => observer.observe(testimonial))

    return () => {
      testimonials.forEach(testimonial => observer.unobserve(testimonial))
    }
  }, [])

  return (
    <div className="min-h-screen bg-primary luxury-page">
      {/* Ultra-Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden luxury-hero-section">
        {/* Cinematic Background Layers */}
        <div className="absolute inset-0">
          {/* Animated gradient mesh */}
          <div className="luxury-gradient-mesh" />

          {/* Gold grid overlay */}
          <div className="luxury-gold-grid" />

          {/* Radial gold glow */}
          <div className="luxury-radial-glow" />

          {/* Floating gold particles */}
          <div className="luxury-particles-container">
            {goldParticles.map((particle) => (
              <div
                key={particle.id}
                className="luxury-gold-particle"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`
                }}
              />
            ))}
          </div>

          {/* Geometric shapes */}
          <div className="luxury-geometric-bg">
            <div className="luxury-diamond-shape" style={{ top: '10%', left: '10%' }} />
            <div className="luxury-diamond-shape" style={{ top: '70%', right: '15%' }} />
            <div className="luxury-crown-shape" style={{ top: '30%', right: '20%' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          {/* Animated Crown Icon */}
          <div className="luxury-crown-container">
            <div className="luxury-crown-glow-ring"></div>
            <Crown className="luxury-crown-icon" size={80} />
            <div className="luxury-crown-pulse"></div>
          </div>

          {/* Main Headline with 3D Effect */}
          <h1 className="luxury-main-headline">
            <span className="luxury-headline-line">ULTRA</span>
            <span className="luxury-headline-line luxury-headline-gold">LUXURY</span>
            <span className="luxury-headline-line">COLLECTION</span>
          </h1>

          {/* Premium Tagline */}
          <div className="luxury-tagline-container">
            <div className="luxury-tagline-line"></div>
            <p className="luxury-tagline">WHERE EXCELLENCE MEETS EXCLUSIVITY</p>
            <div className="luxury-tagline-line"></div>
          </div>

          {/* Description */}
          <p className="luxury-hero-description">
            Nigeria's Most Prestigious Collection of Ultra-Premium Vehicles
            <br />
            <span className="luxury-price-badge">Starting from ₦100 Million</span>
          </p>

          {/* Premium Feature Pills */}
          <div className="luxury-feature-pills">
            <div className="luxury-pill">
              <BadgeCheck size={18} />
              <span>100% Verified</span>
            </div>
            <div className="luxury-pill">
              <Shield size={18} />
              <span>Certified Authentic</span>
            </div>
            <div className="luxury-pill">
              <Award size={18} />
              <span>White-Glove Service</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/cars?price=100000000+">
            <button className="luxury-cta-button">
              <Sparkles size={24} />
              <span>EXPLORE COLLECTION</span>
              <ChevronRight size={24} />
            </button>
          </Link>
        </div>

        {/* Elegant Scroll Indicator */}
        <div className="luxury-scroll-indicator">
          <div className="luxury-scroll-text">DISCOVER EXCELLENCE</div>
          <div className="luxury-scroll-line"></div>
          <ChevronRight className="luxury-scroll-icon" size={20} />
        </div>
      </section>

      {/* Premium Stats Section */}
      <section className="luxury-stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <CarFront size={32} />, value: 150, suffix: '+', label: 'Premium Vehicles' },
              { icon: <Users size={32} />, value: 500, suffix: '+', label: 'Elite Clients' },
              { icon: <Award size={32} />, value: 98, suffix: '%', label: 'Satisfaction Rate' },
              { icon: <Clock size={32} />, value: 24, suffix: 'hr', label: 'Concierge Support' }
            ].map((stat, index) => (
              <div
                key={index}
                data-stat-index={index}
                className={`luxury-stat-card ${statsVisible[index] ? 'visible' : ''}`}
              >
                <div className="luxury-stat-icon">{stat.icon}</div>
                <div className="luxury-stat-value">
                  {statsVisible[index] && (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="luxury-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prestigious Brands Showcase */}
      <section className="luxury-brands-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="luxury-section-header">
            <div className="luxury-section-badge">
              <Gem size={20} />
              <span>ELITE MARQUES</span>
            </div>
            <h2 className="luxury-section-title">
              The World's Most Coveted Brands
            </h2>
            <p className="luxury-section-subtitle">
              Curated collection from the pinnacle of automotive excellence
            </p>
          </div>

          {/* Brand Grid */}
          <div className="luxury-brand-grid">
            {luxuryBrands.map((brand, index) => (
              <Link
                key={brand.name}
                href={`/cars?make=${brand.name.toLowerCase()}`}
                data-brand-index={index}
                className={`luxury-brand-card ${brandsVisible[index] ? 'visible' : ''}`}
              >
                {/* Brand Circle */}
                <div className="luxury-brand-circle">
                  {/* Rotating border */}
                  <div className="luxury-brand-border"></div>
                  {/* Brand letter */}
                  <div className="luxury-brand-letter" style={{ color: brand.color }}>
                    {brand.letter}
                  </div>
                  {/* Glow effect */}
                  <div className="luxury-brand-glow"></div>
                </div>

                {/* Brand Name */}
                <div className="luxury-brand-name">{brand.name}</div>

                {/* Hover overlay */}
                <div className="luxury-brand-overlay">
                  <Eye size={24} className="luxury-brand-overlay-icon" />
                  <p className="luxury-brand-overlay-text">View Collection</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Luxury Cars */}
      <section className="luxury-cars-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="luxury-section-header">
            <div className="luxury-section-badge">
              <Star size={20} />
              <span>HANDPICKED SELECTION</span>
            </div>
            <h2 className="luxury-section-title">
              Featured Masterpieces
            </h2>
            <p className="luxury-section-subtitle">
              ₦100 Million and Above - Each Vehicle a Work of Art
            </p>
          </div>

          {loading ? (
            <div className="luxury-loading">
              <Crown className="luxury-loading-icon" size={64} />
              <p className="luxury-loading-text">Curating Excellence...</p>
            </div>
          ) : luxuryCars.length > 0 ? (
            <div className="luxury-car-grid">
              <CarGrid cars={luxuryCars} />
            </div>
          ) : (
            <div className="luxury-empty-state">
              <Crown className="luxury-empty-icon" size={80} />
              <h3 className="luxury-empty-title">Assembling Rare Treasures</h3>
              <p className="luxury-empty-description">
                Our curators are sourcing exceptional vehicles for your consideration.
                <br />
                New arrivals coming soon.
              </p>
              <Link href="/cars">
                <button className="luxury-secondary-button">
                  Browse Premium Collection
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Elite Testimonials */}
      <section className="luxury-testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="luxury-section-header">
            <div className="luxury-section-badge">
              <Heart size={20} />
              <span>CLIENT EXPERIENCES</span>
            </div>
            <h2 className="luxury-section-title">
              Trusted by Nigeria's Elite
            </h2>
            <p className="luxury-section-subtitle">
              Stories from distinguished clients who've found their dream vehicles
            </p>
          </div>

          <div className="luxury-testimonials-grid">
            {luxuryTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                data-testimonial-index={index}
                className={`luxury-testimonial-card ${testimonialsVisible[index] ? 'visible' : ''}`}
              >
                {/* Gold accent top */}
                <div className="luxury-testimonial-accent"></div>

                {/* Client Photo */}
                <div className="luxury-testimonial-photo-wrapper">
                  <div className="luxury-testimonial-photo-ring"></div>
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="luxury-testimonial-photo"
                  />
                </div>

                {/* 5-Star Rating */}
                <div className="luxury-testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="luxury-star-icon"
                      fill="#FFD700"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="luxury-testimonial-quote">
                  "{testimonial.quote}"
                </p>

                {/* Client Info */}
                <div className="luxury-testimonial-info">
                  <div className="luxury-testimonial-name">{testimonial.name}</div>
                  <div className="luxury-testimonial-title">{testimonial.title}</div>
                  <div className="luxury-testimonial-vehicle">
                    <CarFront size={14} />
                    {testimonial.vehicle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Luxury Difference */}
      <section className="luxury-difference-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="luxury-section-header">
            <h2 className="luxury-section-title">
              The JustCars Luxury Difference
            </h2>
            <p className="luxury-section-subtitle">
              Uncompromising standards in every aspect of your acquisition journey
            </p>
          </div>

          <div className="luxury-features-grid">
            {[
              {
                icon: <BadgeCheck size={40} />,
                title: 'Certified Provenance',
                description: 'Complete vehicle history, ownership records, and documentation verified by industry experts and legal professionals'
              },
              {
                icon: <Eye size={40} />,
                title: 'Expert Inspection',
                description: 'Comprehensive 200-point inspection by certified luxury car specialists covering mechanical, electrical, and aesthetic conditions'
              },
              {
                icon: <Shield size={40} />,
                title: 'Secure Transactions',
                description: 'Bank-grade escrow services, secure payment processing, and legal documentation support for complete peace of mind'
              },
              {
                icon: <Award size={40} />,
                title: 'Concierge Delivery',
                description: 'White-glove delivery service to your preferred location with full insurance coverage and professional detailing'
              }
            ].map((feature, index) => (
              <div key={index} className="luxury-feature-card">
                <div className="luxury-feature-icon">{feature.icon}</div>
                <h3 className="luxury-feature-title">{feature.title}</h3>
                <p className="luxury-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="luxury-cta-section">
        <div className="luxury-cta-background">
          <div className="luxury-cta-glow luxury-cta-glow-1"></div>
          <div className="luxury-cta-glow luxury-cta-glow-2"></div>
          <div className="luxury-cta-glow luxury-cta-glow-3"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Crown className="luxury-cta-crown" size={80} />

          <h2 className="luxury-cta-headline">
            Begin Your Journey to Excellence
          </h2>

          <p className="luxury-cta-subtitle">
            Connect with our luxury car specialists for personalized consultation
            <br />
            and exclusive access to arriving inventory
          </p>

          <div className="luxury-cta-buttons">
            <Link href="/cars?price=100000000+">
              <button className="luxury-cta-primary">
                <Sparkles size={20} />
                View Collection
              </button>
            </Link>
            <Link href="/contact">
              <button className="luxury-cta-secondary">
                <Crown size={20} />
                Contact Specialist
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="luxury-trust-indicators">
            <div className="luxury-trust-item">
              <Check size={16} />
              <span>Verified Authentic</span>
            </div>
            <div className="luxury-trust-item">
              <Check size={16} />
              <span>Secure Transactions</span>
            </div>
            <div className="luxury-trust-item">
              <Check size={16} />
              <span>Premium Service</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
