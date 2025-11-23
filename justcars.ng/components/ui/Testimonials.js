'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Adebayo Ogunlesi',
      location: 'Lagos, Nigeria',
      rating: 5,
      quote: 'Found my dream Mercedes within days! The verification process was smooth, and the dealer was transparent about everything. Best car buying experience in Nigeria.',
      // Placeholder path for future real photo: /images/testimonials/customer1.jpg
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      carPurchased: 'Mercedes-Benz C300'
    },
    {
      id: 2,
      name: 'Chioma Nwosu',
      location: 'Abuja, Nigeria',
      rating: 5,
      quote: 'As a first-time buyer, I was nervous, but JustCars made everything easy. The payment process was secure, and I got exactly what I paid for. Highly recommended!',
      // Placeholder path for future real photo: /images/testimonials/customer2.jpg
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      carPurchased: 'Toyota Camry 2020'
    },
    {
      id: 3,
      name: 'Ibrahim Mohammed',
      location: 'Port Harcourt, Nigeria',
      rating: 5,
      quote: 'Exceptional service! I compared prices across different platforms, and JustCars had the most competitive rates. The verified dealer badge gave me confidence.',
      // Placeholder path for future real photo: /images/testimonials/customer3.jpg
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      carPurchased: 'Range Rover Sport'
    },
    {
      id: 4,
      name: 'Blessing Eze',
      location: 'Enugu, Nigeria',
      rating: 5,
      quote: 'The customer support team was incredibly helpful throughout my purchase journey. They answered all my questions promptly and professionally.',
      // Placeholder path for future real photo: /images/testimonials/customer4.jpg
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Blessing&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      carPurchased: 'Honda Accord 2019'
    },
    {
      id: 5,
      name: 'Tunde Bakare',
      location: 'Ibadan, Nigeria',
      rating: 5,
      quote: 'Sold my old car and bought a new one all on the same platform! The process was seamless, and I got fair value for my trade-in.',
      // Placeholder path for future real photo: /images/testimonials/customer5.jpg
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      carPurchased: 'Lexus ES350'
    },
    {
      id: 6,
      name: 'Amina Bello',
      location: 'Kano, Nigeria',
      rating: 5,
      quote: 'I appreciated the detailed vehicle history and inspection reports. No hidden issues, just transparency and professionalism.',
      // Placeholder path for future real photo: /images/testimonials/customer6.jpg
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amina&skinColor=brown,dark&backgroundColor=b6e3f4,c0aede,d1d4f9',
      carPurchased: 'BMW X5 2021'
    }
  ]

  // Auto-play carousel (pause on hover)
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
      }, 5000) // Change slide every 5 seconds

      return () => clearInterval(interval)
    }
  }, [isHovered, testimonials.length])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  // Get visible testimonials (show 3 at a time on desktop, 1 on mobile)
  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length
      visible.push({ ...testimonials[index], displayIndex: i })
    }
    return visible
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
    >
      {/* Floating Particles Background */}
      <div className="glassmorphic-particles"></div>

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 hero-gradient-mesh opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by{' '}
            <span className="gradient-text-animated">Thousands</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20
              glassmorphic-nav-button hidden md:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20
              glassmorphic-nav-button hidden md:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {getVisibleTestimonials().map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${currentIndex}`}
                className={`testimonial-card ${
                  isVisible ? 'testimonial-card-visible' : ''
                } ${idx === 1 ? 'md:scale-105' : ''}`}
                style={{
                  animationDelay: `${idx * 0.15}s`,
                  zIndex: idx === 1 ? 10 : 1
                }}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-20">
                  <Quote size={48} className="text-accent-blue" />
                </div>

                {/* Customer Photo */}
                <div className="flex justify-center mb-6">
                  <div className="testimonial-image-container">
                    <div className="testimonial-image-glow"></div>
                    <div className="testimonial-image">
                      {/* AI-generated avatar with African/Nigerian skin tone */}
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      size={20}
                      className={`testimonial-star ${
                        isVisible ? 'testimonial-star-animate' : ''
                      }`}
                      style={{
                        animationDelay: `${idx * 0.15 + starIdx * 0.1}s`,
                        fill: 'currentColor'
                      }}
                    />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-gray-300 text-center mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Customer Info */}
                <div className="text-center border-t border-white/10 pt-4">
                  <h4 className="text-white font-bold text-lg mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">
                    {testimonial.location}
                  </p>
                  <p className="text-accent-blue text-xs font-semibold">
                    Purchased: {testimonial.carPurchased}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8 md:hidden">
            <button
              onClick={prevSlide}
              className="glassmorphic-nav-button"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="glassmorphic-nav-button"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`testimonial-dot ${
                  idx === currentIndex ? 'testimonial-dot-active' : ''
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 glassmorphic-card px-8 py-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-secondary
                    border-2 border-primary flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg">
                50,000+ Happy Customers
              </div>
              <div className="text-gray-300 text-sm">
                Join thousands who trust JustCars
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
