/**
 * Homepage - Futuristic Design
 * Landing page with mind-blowing hero section
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Car as CarIcon, CheckCircle, Shield, Clock, TrendingUp, Award, Sparkles, ChevronRight, Star, Camera, Clipboard, Tag, ArrowRight, Zap, Filter, Eye, Phone, Send, ChevronUp } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Button from '@/components/ui/Button'
import FeaturedCarCard from '@/components/cars/FeaturedCarCard'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)
  const [particles, setParticles] = useState([])
  const [trustCardsVisible, setTrustCardsVisible] = useState([false, false, false, false])
  const [timelineItemsVisible, setTimelineItemsVisible] = useState([false, false, false, false, false])
  const [stepCardsVisible, setStepCardsVisible] = useState([false, false, false])
  const [progressLineVisible, setProgressLineVisible] = useState(false)
  const [testimonialsVisible, setTestimonialsVisible] = useState([false, false, false])
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Handle scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate random particles for the hero background
  useEffect(() => {
    const particleCount = 30
    const newParticles = []

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 20}s`,
        duration: `${15 + Math.random() * 10}s`
      })
    }

    setParticles(newParticles)
  }, [])

  // Intersection Observer for trust cards animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index)
            setTimeout(() => {
              setTrustCardsVisible(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 200) // Stagger animation
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = document.querySelectorAll('.trust-feature-card')
    cards.forEach(card => observer.observe(card))

    return () => {
      cards.forEach(card => observer.unobserve(card))
    }
  }, [])

  // Intersection Observer for timeline items
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.timelineIndex)
            setTimeout(() => {
              setTimelineItemsVisible(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 300) // Stagger animation
          }
        })
      },
      { threshold: 0.3 }
    )

    const items = document.querySelectorAll('.timeline-item')
    items.forEach(item => observer.observe(item))

    return () => {
      items.forEach(item => observer.unobserve(item))
    }
  }, [])

  // Intersection Observer for How It Works step cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.stepIndex)
            setTimeout(() => {
              setStepCardsVisible(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 200) // Stagger animation
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = document.querySelectorAll('.step-card')
    cards.forEach(card => observer.observe(card))

    return () => {
      cards.forEach(card => observer.unobserve(card))
    }
  }, [])

  // Intersection Observer for progress line
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setProgressLineVisible(true)
            }, 800)
          }
        })
      },
      { threshold: 0.5 }
    )

    const container = document.querySelector('.how-it-works-container')
    if (container) {
      observer.observe(container)
    }

    return () => {
      if (container) {
        observer.unobserve(container)
      }
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
            }, index * 150) // Stagger animation
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = document.querySelectorAll('.testimonial-card')
    cards.forEach(card => observer.observe(card))

    return () => {
      cards.forEach(card => observer.unobserve(card))
    }
  }, [])

  // Sample featured cars data
  const featuredCars = [
    {
      id: 1,
      make: 'Toyota',
      model: 'Camry XLE',
      year: 2022,
      price: 18500000,
      mileage: 25000,
      location: 'Lagos',
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      condition: 'Foreign Used',
      is_verified: true,
      is_featured: true,
      car_images: [{ image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', is_primary: true }]
    },
    {
      id: 2,
      make: 'Mercedes-Benz',
      model: 'GLE 450',
      year: 2023,
      price: 45000000,
      mileage: 12000,
      location: 'Abuja',
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      condition: 'Brand New',
      is_verified: true,
      is_featured: true,
      car_images: [{ image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', is_primary: true }]
    },
    {
      id: 3,
      make: 'Honda',
      model: 'Accord Sport',
      year: 2021,
      price: 15200000,
      mileage: 38000,
      location: 'Port Harcourt',
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      condition: 'Foreign Used',
      is_verified: true,
      is_featured: true,
      car_images: [{ image_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', is_primary: true }]
    },
    {
      id: 4,
      make: 'Lexus',
      model: 'RX 350',
      year: 2022,
      price: 32000000,
      mileage: 18000,
      location: 'Lagos',
      fuel_type: 'Hybrid',
      transmission: 'Automatic',
      condition: 'Foreign Used',
      is_verified: true,
      is_featured: true,
      car_images: [{ image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', is_primary: true }]
    },
    {
      id: 5,
      make: 'BMW',
      model: 'X5 M Sport',
      year: 2023,
      price: 52000000,
      mileage: 8000,
      location: 'Abuja',
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      condition: 'Foreign Used',
      is_verified: true,
      is_featured: true,
      car_images: [{ image_url: 'https://images.unsplash.com/photo-1617531653520-bd4f656d1173?w=800', is_primary: true }]
    },
    {
      id: 6,
      make: 'Range Rover',
      model: 'Sport HSE',
      year: 2022,
      price: 65000000,
      mileage: 15000,
      location: 'Lagos',
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      condition: 'Foreign Used',
      is_verified: true,
      is_featured: true,
      car_images: [{ image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', is_primary: true }]
    }
  ]

  const budgetFilters = [
    { label: 'Under ₦5M', value: '0-5000000' },
    { label: '₦5M - ₦10M', value: '5000000-10000000' },
    { label: '₦10M+', value: '10000000+' }
  ]

  const popularMakes = [
    { label: 'Toyota', value: 'toyota' },
    { label: 'Honda', value: 'honda' },
    { label: 'Mercedes', value: 'mercedes' }
  ]

  const bodyTypes = [
    { label: 'SUV', value: 'suv' },
    { label: 'Sedan', value: 'sedan' },
    { label: 'Coupe', value: 'coupe' }
  ]

  // Trust features data
  const trustFeatures = [
    {
      icon: <Shield size={40} className="text-accent-green" />,
      title: '100% Verified Cars',
      description: 'Every vehicle undergoes comprehensive verification and authentication by our expert team before listing.'
    },
    {
      icon: <Camera size={40} className="text-accent-blue" />,
      title: 'Professional Photography',
      description: 'High-quality photos from every angle, showcasing the true condition and features of each vehicle.'
    },
    {
      icon: <Clipboard size={40} className="text-secondary" />,
      title: 'Detailed Inspections',
      description: '200-point inspection reports covering mechanical, electrical, and cosmetic aspects of every car.'
    },
    {
      icon: <Tag size={40} className="text-accent-green" />,
      title: 'Transparent Pricing',
      description: 'No hidden fees. Clear, competitive pricing with complete breakdown of costs and market value analysis.'
    }
  ]

  // Categories data
  const categories = [
    {
      id: 1,
      name: 'SUVs',
      count: 247,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
      query: 'body_type=suv'
    },
    {
      id: 2,
      name: 'Sedans',
      count: 189,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      query: 'body_type=sedan'
    },
    {
      id: 3,
      name: 'Coupes',
      count: 92,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      query: 'body_type=coupe'
    },
    {
      id: 4,
      name: 'Luxury',
      count: 156,
      image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800',
      query: 'price=50000000+'
    },
    {
      id: 5,
      name: 'Budget-Friendly',
      count: 324,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      query: 'price=0-10000000'
    }
  ]

  // Popular brands data
  const popularBrands = [
    { name: 'Toyota', count: 342, logo: 'T' },
    { name: 'Honda', count: 218, logo: 'H' },
    { name: 'Mercedes-Benz', count: 156, logo: 'M' },
    { name: 'BMW', count: 124, logo: 'B' },
    { name: 'Lexus', count: 189, logo: 'L' },
    { name: 'Nissan', count: 203, logo: 'N' },
    { name: 'Audi', count: 98, logo: 'A' },
    { name: 'Ford', count: 167, logo: 'F' }
  ]

  // Latest arrivals data
  const latestArrivals = [
    {
      id: 1,
      make: 'Porsche',
      model: '911 Carrera',
      year: 2023,
      price: 89000000,
      addedAgo: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200'
    },
    {
      id: 2,
      make: 'Tesla',
      model: 'Model S Plaid',
      year: 2024,
      price: 95000000,
      addedAgo: '5 hours ago',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200'
    },
    {
      id: 3,
      make: 'Land Rover',
      model: 'Defender 110',
      year: 2023,
      price: 72000000,
      addedAgo: '8 hours ago',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200'
    },
    {
      id: 4,
      make: 'Audi',
      model: 'RS7 Sportback',
      year: 2023,
      price: 85000000,
      addedAgo: '1 day ago',
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=200'
    },
    {
      id: 5,
      make: 'Jaguar',
      model: 'F-Type R',
      year: 2022,
      price: 68000000,
      addedAgo: '1 day ago',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=200'
    }
  ]

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Chukwudi Okonkwo',
      location: 'Lagos',
      // Placeholder path for future real photo: /images/testimonials/customer-chukwudi.jpg
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chukwudi&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      rating: 5,
      quote: 'I found my dream car on JustCars.ng! The verification process gave me complete peace of mind. The dealer was professional and the entire experience was seamless.'
    },
    {
      id: 2,
      name: 'Amina Mohammed',
      location: 'Abuja',
      // Placeholder path for future real photo: /images/testimonials/customer-amina.jpg
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AminaMohammed&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      rating: 5,
      quote: 'Outstanding service! The detailed inspection reports and transparent pricing made it easy to make an informed decision. Highly recommend JustCars.ng to anyone looking to buy a car.'
    },
    {
      id: 3,
      name: 'Tunde Adebayo',
      location: 'Port Harcourt',
      // Placeholder path for future real photo: /images/testimonials/customer-tunde.jpg
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TundeAdebayo&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      rating: 5,
      quote: 'Best car buying platform in Nigeria! The WhatsApp support was incredibly responsive and helpful. Got my Mercedes within a week of finding it on the platform.'
    }
  ]

  return (
    <div>
      {/* Futuristic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
        {/* Animated Background Elements */}
        <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
        <div className="hero-grid absolute inset-0" />

        {/* Particle System */}
        <div className="particle-system">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle-orb"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Headline - Animated */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-reveal">
              <span className="gradient-text-hero block mb-2">
                Discover Your
              </span>
              <span className="gradient-text-hero">
                Dream Car
              </span>
            </h1>

            {/* Subheadline with Glow */}
            <p className="text-xl md:text-2xl mb-4 subheadline-glow max-w-3xl mx-auto text-reveal" style={{ animationDelay: '0.3s' }}>
              Every car verified. Every detail authentic. Every deal transparent.
            </p>

            {/* Advanced Glassmorphic Search Bar */}
            <div className="max-w-4xl mx-auto mb-8 text-reveal" style={{ animationDelay: '0.6s' }}>
              <div className="search-bar-hero">
                <div className="flex items-center gap-4">
                  <Search className="text-accent-blue search-icon-pulse flex-shrink-0" size={28} />
                  <input
                    type="text"
                    placeholder="Search by make, model, or location..."
                    className="search-input-hero"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="mt-6 space-y-4">
                {/* Budget Filters */}
                <div>
                  <p className="text-sm text-muted mb-2 uppercase tracking-wider">Budget</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {budgetFilters.map((filter) => (
                      <button
                        key={filter.value}
                        className={`filter-pill ${activeFilter === filter.value ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter.value)}
                      >
                        <TrendingUp size={16} />
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Makes */}
                <div>
                  <p className="text-sm text-muted mb-2 uppercase tracking-wider">Popular Makes</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {popularMakes.map((make) => (
                      <button
                        key={make.value}
                        className={`filter-pill ${activeFilter === make.value ? 'active' : ''}`}
                        onClick={() => setActiveFilter(make.value)}
                      >
                        <CarIcon size={16} />
                        {make.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Types */}
                <div>
                  <p className="text-sm text-muted mb-2 uppercase tracking-wider">Body Type</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {bodyTypes.map((type) => (
                      <button
                        key={type.value}
                        className={`filter-pill ${activeFilter === type.value ? 'active' : ''}`}
                        onClick={() => setActiveFilter(type.value)}
                      >
                        <Sparkles size={16} />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators with Animated Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 text-reveal" style={{ animationDelay: '0.9s' }}>
              <div className="trust-card">
                <div className="icon-float mb-3">
                  <CheckCircle className="text-accent-green mx-auto" size={40} />
                </div>
                <div className="mb-2">
                  <AnimatedCounter end={1247} suffix="+" separator="," />
                </div>
                <p className="text-muted text-sm">Verified Cars</p>
              </div>

              <div className="trust-card">
                <div className="icon-float mb-3" style={{ animationDelay: '0.5s' }}>
                  <Award className="text-accent-blue mx-auto" size={40} />
                </div>
                <div className="mb-2">
                  <AnimatedCounter end={98} suffix="%" />
                </div>
                <p className="text-muted text-sm">Customer Satisfaction</p>
              </div>

              <div className="trust-card">
                <div className="icon-float mb-3" style={{ animationDelay: '1s' }}>
                  <Clock className="text-secondary mx-auto" size={40} />
                </div>
                <div className="mb-2">
                  <AnimatedCounter end={24} suffix="hr" />
                </div>
                <p className="text-muted text-sm">Response Time</p>
              </div>
            </div>

            {/* 3D CTA Button */}
            <div className="text-reveal" style={{ animationDelay: '1.2s' }}>
              <Link href="/cars">
                <button className="cta-button-3d pulse-shadow inline-flex items-center gap-3">
                  Explore Cars
                  <ChevronRight size={24} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-accent-blue opacity-60">
            <p className="text-xs uppercase tracking-wider">Scroll Down</p>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section - Glassmorphic */}
      <section className="py-20 relative overflow-hidden bg-primary">
        <div className="hero-gradient-mesh absolute inset-0 opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-hero">
              Why Choose JustCars.ng
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Experience the future of car buying with cutting-edge technology and unparalleled service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glassmorphic-card group">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))',
                    border: '1px solid rgba(0, 255, 136, 0.3)'
                  }}>
                  <CheckCircle className="text-accent-green icon-float" size={32} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Verified Cars</h3>
              <p className="text-muted leading-relaxed">
                Every vehicle undergoes rigorous inspection. Only authenticated cars make it to our platform.
              </p>
            </div>

            <div className="glassmorphic-card group">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 217, 255, 0.1))',
                    border: '1px solid rgba(0, 217, 255, 0.3)'
                  }}>
                  <Shield className="text-accent-blue icon-float" size={32} style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Trusted Dealers</h3>
              <p className="text-muted leading-relaxed">
                We partner only with verified dealers who meet our strict standards of excellence.
              </p>
            </div>

            <div className="glassmorphic-card group">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 107, 0, 0.1))',
                    border: '1px solid rgba(255, 107, 0, 0.3)'
                  }}>
                  <Clock className="text-secondary icon-float" size={32} style={{ animationDelay: '1s' }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">24/7 Support</h3>
              <p className="text-muted leading-relaxed">
                Our dedicated team is always available to assist you throughout your car buying journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Verified Collection - Featured Cars */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="hero-gradient-mesh absolute inset-0 opacity-25" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h2 className="text-4xl md:text-6xl font-bold mb-2 section-title-underline gradient-text-hero">
                <Star className="inline-block mr-3 mb-2 text-secondary" size={42} />
                Premium Verified Collection
              </h2>
            </div>
            <p className="text-muted text-lg mt-6 max-w-2xl mx-auto">
              Hand-picked luxury vehicles with verified authenticity. Each car undergoes rigorous inspection for your peace of mind.
            </p>
          </div>

          {/* Featured Cars Grid - Mobile Carousel, Desktop Grid */}
          <div className="mobile-carousel md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 mb-12">
            {featuredCars.map((car, index) => (
              <div
                key={car.id}
                className="text-reveal"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <FeaturedCarCard car={car} />
              </div>
            ))}
          </div>

          {/* View All Button with Arrow Animation */}
          <div className="text-center">
            <Link href="/cars">
              <button className="view-all-button">
                View All Premium Cars
                <ChevronRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-24 trust-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text-hero">
              Why Choose Us?
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              We go above and beyond to ensure every car meets our rigorous standards of quality and authenticity
            </p>
          </div>

          {/* Trust Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {trustFeatures.map((feature, index) => (
              <div
                key={index}
                data-index={index}
                className={`trust-feature-card ${trustCardsVisible[index] ? 'visible' : ''}`}
              >
                {/* Connecting Line (hidden on mobile and last card) */}
                {index < trustFeatures.length - 1 && (
                  <div className={`connecting-line hidden lg:block ${trustCardsVisible[index] ? 'visible' : ''}`} />
                )}

                {/* Icon */}
                <div
                  className="trust-icon-container"
                  style={{
                    background: `linear-gradient(135deg, ${
                      index === 0 ? 'rgba(0, 255, 136, 0.15)' :
                      index === 1 ? 'rgba(0, 217, 255, 0.15)' :
                      index === 2 ? 'rgba(255, 107, 0, 0.15)' :
                      'rgba(0, 255, 136, 0.15)'
                    }, rgba(20, 25, 58, 0.5))`
                  }}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-muted text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search by Category Section */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="hero-gradient-mesh absolute inset-0 opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text-hero">
              Find Your Perfect Match
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Browse by category to discover the ideal vehicle that fits your lifestyle and budget
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.slice(0, 3).map((category, index) => (
              <Link key={category.id} href={`/cars?${category.query}`}>
                <div
                  className="category-card text-reveal"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Background Image */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                  />

                  {/* Gradient Overlay */}
                  <div className="category-gradient" />

                  {/* Border Glow */}
                  <div className="category-border-glow" />

                  {/* Content */}
                  <div className="category-content">
                    <h3 className="category-name">{category.name}</h3>
                    <div className="category-count">
                      <AnimatedCounter end={category.count} suffix=" Available" />
                    </div>
                    <div className="category-arrow">
                      Explore Now
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Second Row - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.slice(3).map((category, index) => (
              <Link key={category.id} href={`/cars?${category.query}`}>
                <div
                  className="category-card text-reveal"
                  style={{ animationDelay: `${(index + 3) * 0.15}s` }}
                >
                  {/* Background Image */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                  />

                  {/* Gradient Overlay */}
                  <div className="category-gradient" />

                  {/* Border Glow */}
                  <div className="category-border-glow" />

                  {/* Content */}
                  <div className="category-content">
                    <h3 className="category-name">{category.name}</h3>
                    <div className="category-count">
                      <AnimatedCounter end={category.count} suffix=" Available" />
                    </div>
                    <div className="category-arrow">
                      Explore Now
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Makes - Brand Logos */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="hero-gradient-mesh absolute inset-0 opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text-hero">
              Browse by Brand
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Explore premium vehicles from the world's most trusted automotive manufacturers
            </p>
          </div>

          {/* Brand Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {popularBrands.map((brand, index) => (
              <Link key={brand.name} href={`/cars?make=${brand.name}`}>
                <div
                  className="brand-logo-container text-reveal"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Circular Container */}
                  <div className="brand-circle">
                    {/* Brand Logo Placeholder */}
                    <span className="brand-logo-letter">{brand.logo}</span>
                  </div>

                  {/* Brand Name (appears on hover) */}
                  <div className="brand-name-label">
                    {brand.name}
                  </div>

                  {/* Car Count Badge (appears on hover) */}
                  <div className="brand-count-badge">
                    <AnimatedCounter end={brand.count} suffix=" cars" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link href="/cars">
              <button className="view-all-button">
                View All Brands
                <ChevronRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Arrivals - Timeline */}
      <section className="py-24 relative overflow-hidden bg-primary-light">
        <div className="hero-gradient-mesh absolute inset-0 opacity-15" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title with NEW Badge */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text-hero inline-flex items-center gap-4 flex-wrap justify-center">
              Just Arrived
              <span className="new-badge"></span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Fresh arrivals updated daily. Be the first to discover these premium vehicles.
            </p>
          </div>

          {/* Timeline Container */}
          <div className="timeline-container">
            {/* Vertical Timeline Line */}
            <div className="timeline-line" />

            {/* Timeline Items */}
            {latestArrivals.map((car, index) => (
              <div
                key={car.id}
                data-timeline-index={index}
                className={`timeline-item ${index % 2 === 0 ? 'timeline-left' : 'timeline-right'} ${timelineItemsVisible[index] ? 'visible' : ''}`}
              >
                {/* Timeline Node (Glowing Dot) */}
                <div className="timeline-node">
                  <Zap size={16} className="text-accent-blue" />
                </div>

                {/* Timeline Card */}
                <div className="timeline-card">
                  {/* Date Badge */}
                  <div className="timeline-date-badge">
                    {car.addedAgo}
                  </div>

                  {/* Mini Car Card */}
                  <Link href={`/cars/${car.id}`}>
                    <div className="timeline-mini-car-card">
                      {/* Car Image */}
                      <div className="timeline-car-image-wrapper">
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="timeline-car-image"
                        />
                        <div className="timeline-image-overlay" />
                      </div>

                      {/* Car Details */}
                      <div className="timeline-car-details">
                        <h3 className="timeline-car-name">
                          {car.year} {car.make} {car.model}
                        </h3>
                        <div className="timeline-car-price">
                          {formatPrice(car.price)}
                        </div>
                        <div className="timeline-view-details">
                          View Details
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Recent Arrivals Button */}
          <div className="text-center mt-16">
            <Link href="/cars?sort=latest">
              <button className="view-all-button">
                View All New Arrivals
                <ChevronRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="hero-gradient-mesh absolute inset-0 opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text-hero">
              Your Journey to the Perfect Car
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Three simple steps to finding and purchasing your dream vehicle
            </p>
          </div>

          {/* Steps Container */}
          <div className="how-it-works-container">
            {/* Progress Line (Desktop only) */}
            <div className="progress-line-container">
              <div className="progress-line-bg" />
              <div className={`progress-line-fill ${progressLineVisible ? 'animated' : ''}`} />
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1: Search & Filter */}
              <div
                data-step-index={0}
                className={`step-card ${stepCardsVisible[0] ? 'visible' : ''}`}
              >
                {/* Step Number */}
                <div className="step-number">01</div>

                {/* Icon with Floating Animation */}
                <div className="step-icon-container">
                  <Filter className="text-accent-blue" size={36} />
                </div>

                {/* Title */}
                <h3 className="step-title">Search & Filter</h3>

                {/* Description */}
                <p className="step-description">
                  Browse thousands of verified cars using our advanced search filters. Find exactly what you need by make, model, price, and location.
                </p>

                {/* Connecting Arrow (Desktop only) */}
                <div className="connecting-arrow">
                  <div className="arrow-line">
                    <div className="arrow-head" />
                  </div>
                </div>
              </div>

              {/* Step 2: Verify & Inspect */}
              <div
                data-step-index={1}
                className={`step-card ${stepCardsVisible[1] ? 'visible' : ''}`}
              >
                {/* Step Number */}
                <div className="step-number">02</div>

                {/* Icon with Floating Animation */}
                <div className="step-icon-container">
                  <Eye className="text-accent-green" size={36} />
                </div>

                {/* Title */}
                <h3 className="step-title">Verify & Inspect</h3>

                {/* Description */}
                <p className="step-description">
                  Review detailed photos, inspection reports, and vehicle history. Every car is verified and authenticated by our expert team.
                </p>

                {/* Connecting Arrow (Desktop only) */}
                <div className="connecting-arrow">
                  <div className="arrow-line">
                    <div className="arrow-head" />
                  </div>
                </div>
              </div>

              {/* Step 3: Contact & Purchase */}
              <div
                data-step-index={2}
                className={`step-card ${stepCardsVisible[2] ? 'visible' : ''}`}
              >
                {/* Step Number */}
                <div className="step-number">03</div>

                {/* Icon with Floating Animation */}
                <div className="step-icon-container">
                  <Phone className="text-secondary" size={36} />
                </div>

                {/* Title */}
                <h3 className="step-title">Contact & Purchase</h3>

                {/* Description */}
                <p className="step-description">
                  Connect directly with verified dealers via WhatsApp or phone. Schedule viewings and complete your purchase with confidence.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Link href="/cars">
              <button className="cta-button-3d inline-flex items-center gap-3">
                Start Your Journey
                <ChevronRight size={24} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-24 relative overflow-hidden bg-primary-light">
        <div className="hero-gradient-mesh absolute inset-0 opacity-15" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text-hero">
              Trusted by Thousands
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              See what our satisfied customers have to say about their car buying experience
            </p>
          </div>

          {/* Testimonials Carousel */}
          <div className="testimonials-carousel">
            <div className="testimonials-track">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  data-testimonial-index={index}
                  className={`testimonial-card ${testimonialsVisible[index] ? 'visible' : ''}`}
                >
                  {/* Customer Photo */}
                  <div className="testimonial-photo-wrapper">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="testimonial-photo"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`star-icon ${i < testimonial.rating ? 'filled' : ''}`}
                        fill={i < testimonial.rating ? '#FFB700' : 'none'}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="testimonial-quote">
                    {testimonial.quote}
                  </p>

                  {/* Customer Info */}
                  <div>
                    <p className="testimonial-customer-name">{testimonial.name}</p>
                    <p className="testimonial-customer-location">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots (Mobile only) */}
            <div className="carousel-dots">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-dot ${index === 0 ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Banner */}
      <section className="cta-banner-enhanced relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="cta-background-mesh" />

        {/* Glowing Orbs */}
        <div className="cta-glow-orb" />
        <div className="cta-glow-orb" />
        <div className="cta-glow-orb" />

        {/* Content */}
        <div className="cta-content-wrapper">
          <h2 className="cta-headline">
            Ready to Find Your Car?
          </h2>
          <p className="cta-subtext">
            Join thousands of satisfied buyers across Nigeria
          </p>

          {/* CTA Buttons */}
          <div className="cta-buttons-container">
            <Link href="/cars">
              <button className="cta-btn-primary inline-flex items-center gap-2">
                <Search size={20} />
                Browse Cars
              </button>
            </Link>
          </div>

          {/* Floating Icons */}
          <div className="cta-floating-icons">
            <div className="cta-icon">
              <CarIcon size={32} className="text-accent-blue opacity-30" />
            </div>
            <div className="cta-icon">
              <Shield size={32} className="text-accent-green opacity-30" />
            </div>
            <div className="cta-icon">
              <Star size={32} className="text-secondary opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  )
}
