'use client'

import { TrendingUp, Users, Car, Shield, Star, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function GlassmorphicStats() {
  const sectionRef = useRef(null)

  useEffect(() => {
    // Add random particles
    const section = sectionRef.current
    if (!section) return

    const particlesContainer = section.querySelector('.glassmorphic-particles')
    if (!particlesContainer) return

    // Create random particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div')
      particle.className = 'glassmorphic-particle'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * -20}s`
      particle.style.animationDuration = `${20 + Math.random() * 10}s`
      particlesContainer.appendChild(particle)
    }

    return () => {
      if (particlesContainer) {
        particlesContainer.innerHTML = ''
      }
    }
  }, [])

  const stats = [
    {
      icon: Car,
      number: '5,000+',
      label: 'Cars Available',
      variant: 'primary'
    },
    {
      icon: Users,
      number: '50,000+',
      label: 'Happy Customers',
      variant: 'secondary'
    },
    {
      icon: Shield,
      number: '100%',
      label: 'Verified Dealers',
      variant: 'success'
    },
    {
      icon: Star,
      number: '4.9',
      label: 'Average Rating',
      variant: 'primary'
    }
  ]

  const features = [
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'All vehicles are verified within 24 hours of listing',
      variant: 'primary'
    },
    {
      icon: Shield,
      title: 'Buyer Protection',
      description: 'Secure transactions with money-back guarantee',
      variant: 'secondary'
    },
    {
      icon: TrendingUp,
      title: 'Best Prices',
      description: 'Competitive pricing with transparent dealer costs',
      variant: 'success'
    }
  ]

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="glassmorphic-particles"></div>

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 hero-gradient-mesh opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by{' '}
            <span className="gradient-text-animated">Thousands</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join Nigeria's fastest-growing car marketplace with verified dealers and premium vehicles
          </p>
        </div>

        {/* Glassmorphic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="glassmorphic-stat-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`glassmorphic-stat-number ${stat.variant}`}>
                  {stat.number}
                </div>
                <div className="glassmorphic-stat-label">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Features with Glassmorphic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`glassmorphic-card glassmorphic-card-${feature.variant}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="glassmorphic-icon-container">
                  <Icon size={40} className={`text-accent-${feature.variant === 'primary' ? 'blue' : feature.variant === 'secondary' ? 'secondary' : 'green'}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 glassmorphic-card px-8 py-4">
            <Shield className="text-accent-green" size={32} />
            <div className="text-left">
              <div className="text-white font-bold text-lg">100% Secure Platform</div>
              <div className="text-gray-300 text-sm">SSL Encrypted & PCI Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
