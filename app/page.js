/**
 * Homepage - Futuristic Design
 * Landing page with mind-blowing hero section
 */

'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Search, Car as CarIcon, CheckCircle, Shield, Clock, TrendingUp, Award, Sparkles, ChevronRight, Star, Camera, Clipboard, Tag, ArrowRight, Zap, Filter, Eye, Phone, Send, ChevronUp } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Button from '@/components/ui/Button'
import PaymentWarning from '@/components/ui/PaymentWarning'
import { getBrandAbbreviation } from '@/lib/utils'

// Lazy load below-the-fold components for faster initial page load
const FeaturedCarCard = dynamic(() => import('@/components/cars/FeaturedCarCard'), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false // Disable SSR for this component to reduce initial load time
})

const Testimonials = dynamic(() => import('@/components/ui/Testimonials'), {
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />,
  ssr: false
})

const JustArrivedSection = dynamic(() => import('@/components/homepage/JustArrivedSection'), {
  loading: () => <div className="h-96 bg-gray-800/50 animate-pulse rounded-lg" />,
  ssr: false
})

export default function HomePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)
  const [trustCardsVisible, setTrustCardsVisible] = useState([false, false, false, false])
  const [stepCardsVisible, setStepCardsVisible] = useState([false, false, false])
  const [progressLineVisible, setProgressLineVisible] = useState(false)
  const [testimonialsVisible, setTestimonialsVisible] = useState([false, false, false])
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [featuredCars, setFeaturedCars] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  // Handle search submission - searches for exact brand matches
  const handleSearch = (e) => {
    e?.preventDefault()
    if (searchTerm.trim() || activeFilter) {
      const params = new URLSearchParams()
      // For homepage search, treat search term as brand/make search for better UX
      if (searchTerm.trim()) {
        params.set('make', searchTerm.trim())
      }
      if (activeFilter) params.set('filter', activeFilter)
      router.push(`/cars?${params.toString()}`)
    } else {
      router.push('/cars')
    }
  }

  // Handle filter click
  const handleFilterClick = (filterValue) => {
    setActiveFilter(filterValue)
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    params.set('filter', filterValue)
    router.push(`/cars?${params.toString()}`)
  }



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

  // Particles are now memoized above for better performance

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

  // Fetch Premium Verified Cars
  useEffect(() => {
    const fetchPremiumCars = async () => {
      try {
        setLoadingFeatured(true)
        const response = await fetch('/api/cars/premium?limit=12')
        const data = await response.json()

        // Always show real premium cars if available
        if (data.cars && data.cars.length > 0) {
          setFeaturedCars(data.cars)
        } else {
          // Show sample/dummy data only if NO premium cars available
          setFeaturedCars(sampleFeaturedCars)
        }
      } catch (error) {
        console.error('Error fetching premium cars:', error)
        // Fallback to sample data on error
        setFeaturedCars(sampleFeaturedCars)
      } finally {
        setLoadingFeatured(false)
      }
    }

    fetchPremiumCars()
  }, [])

  // Sample featured cars data (fallback)
  const sampleFeaturedCars = [
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


  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Calculate time ago from timestamp
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently'

    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    } else {
      return 'Recently'
    }
  }

  // Get primary image from car
  const getPrimaryImage = (car) => {
    if (!car.car_images || car.car_images.length === 0) {
      return '/images/placeholder-car.jpg'
    }
    const primaryImage = car.car_images.find(img => img.is_primary) || car.car_images[0]
    return primaryImage.image_url || '/images/placeholder-car.jpg'
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
      {/* Payment Warning Slide */}
      <PaymentWarning />

      {/* Futuristic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary pt-16">
        {/* Animated Background Elements */}
        <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
        <div className="hero-grid absolute inset-0" />

        {/* Top Right Big White Luxury Rotating Stamp Badge */}
        <div className="absolute top-20 right-4 sm:right-8 md:right-16 z-30 group cursor-pointer">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[2px] bg-gradient-to-tr from-white via-slate-200 to-white shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform duration-500">
            {/* Glassmorphic Outer Badge Ring - White Theme */}
            <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-2xl border-2 border-white/20 flex items-center justify-center relative overflow-hidden">
              
              {/* Dual Ring Inner Concentric Circle Guide */}
              <div className="absolute inset-2.5 rounded-full border border-dashed border-white/30 pointer-events-none" />
              <div className="absolute inset-5 rounded-full border border-white/20 pointer-events-none" />

              {/* Rotating Ring with White "WHEN LUXURY MEETS MOTION" Text */}
              <div className="absolute inset-0 w-full h-full animate-[spin_22s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    id="topRightWhiteStampTextPath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[6.2px] font-black uppercase tracking-[1.8px] fill-white">
                    <textPath href="#topRightWhiteStampTextPath">
                      JUSTCARS.NG • WHEN LUXURY MEETS MOTION •
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Center Ring with 3D Rotating White Car Icon */}
              <div className="relative z-10 p-3.5 sm:p-4 rounded-full bg-white text-slate-950 shadow-2xl border-2 border-white ring-4 ring-white/20 animate-[spin_12s_linear_infinite]">
                <CarIcon size={26} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center" suppressHydrationWarning>
          <div className="mx-auto flex flex-col items-center translate-x-6 md:translate-x-12" suppressHydrationWarning>
            {/* Main Headline - Animated */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              <span className="gradient-text-hero block mb-2">
                Discover Your Dream
              </span>
              <span className="gradient-text-hero block mb-4">
                Car
              </span>
              <span className="inline-flex items-center justify-center gap-3 text-xl md:text-2xl lg:text-3xl font-semibold text-white/70 tracking-wide mt-1">
                <span>with JustCars.ng</span>

                {/* Inline Small Rotating Stamp Badge */}
                <div className="inline-block align-middle group cursor-pointer ml-1">
                  <div className="relative w-14 h-14 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 w-full h-full animate-[spin_18s_linear_infinite]">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <path
                            id="inlineSmallBadgeTextPath"
                            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                            fill="none"
                          />
                          <text className="text-[7.5px] font-bold uppercase tracking-[2.2px] fill-amber-300">
                            <textPath href="#inlineSmallBadgeTextPath">
                              JUSTCARS.NG • VERIFIED • AUTHENTIC •
                            </textPath>
                          </text>
                        </svg>
                      </div>
                      <div className="relative z-10 p-1.5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-md">
                        <CheckCircle size={12} className="stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </span>
            </h1>

            {/* Subheadline with Glow */}
            <p className="text-xl md:text-2xl mb-4 subheadline-glow max-w-3xl mx-auto text-reveal" style={{ animationDelay: '0.3s' }}>
              Every car verified. Every detail authentic. Every deal transparent.
            </p>

            {/* Advanced Glassmorphic Search Bar */}
            <div className="max-w-4xl mx-auto mb-8 text-reveal" style={{ animationDelay: '0.6s' }}>
              <form onSubmit={handleSearch} className="search-bar-hero">
                <div className="flex items-center gap-4">
                  <Search className="text-accent-blue search-icon-pulse flex-shrink-0" size={28} />
                  <input
                    type="text"
                    placeholder="Search by car brand (e.g., Toyota, Mercedes)..."
                    className="search-input-hero"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex-shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

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
                        onClick={() => handleFilterClick(filter.value)}
                      >
                        <TrendingUp size={16} />
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>


              </div>
            </div>

            {/* Trust Indicators with Animated Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 text-reveal" style={{ animationDelay: '0.9s' }}>
              <div className="trust-card text-center flex flex-col items-center justify-center relative overflow-hidden">
                <div className="icon-float mb-3">
                  <CheckCircle className="text-accent-green mx-auto" size={40} />
                </div>
                <div className="mb-2">
                  <AnimatedCounter end={1247} suffix="+" separator="," />
                </div>
                <p className="text-muted text-sm">Verified Cars</p>
              </div>

              <div className="trust-card text-center flex flex-col items-center justify-center relative overflow-hidden">
                <div className="icon-float mb-3" style={{ animationDelay: '0.5s' }}>
                  <Award className="text-accent-blue mx-auto" size={40} />
                </div>
                <div className="mb-2">
                  <AnimatedCounter end={98} suffix="%" />
                </div>
                <p className="text-muted text-sm">Customer Satisfaction</p>
              </div>

              <div className="trust-card text-center flex flex-col items-center justify-center relative overflow-hidden">
                <div className="icon-float mb-3" style={{ animationDelay: '1s' }}>
                  <Clock className="text-secondary mx-auto" size={40} />
                </div>
                <div className="mb-2">
                  <AnimatedCounter end={24} suffix="hr" />
                </div>
                <p className="text-muted text-sm">Response Time</p>
              </div>
            </div>


          </div>
        </div>

        {/* Scroll Indicator */}
        <button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer group p-4 rounded-xl hover:bg-white/5 transition-all" aria-label="Scroll to features">
  <div className="flex flex-col items-center gap-2 text-accent-blue group-hover:text-white transition-colors">
    <p className="text-lg uppercase tracking-wider font-bold">Scroll Down</p>
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</button>
      </section>

      {/* Features Section - Glassmorphic */}
      <section id="features-section" className="py-20 relative overflow-hidden bg-primary">
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
            <Link href="/premium-verified">
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



      {/* Just Arrived Section - New Functional Component */}
      <JustArrivedSection />

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
      <section className="testimonials-section py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--primary-light)' }}>
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
