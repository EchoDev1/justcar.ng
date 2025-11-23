'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Car,
  DollarSign,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react'

export default function CTABanner() {
  const bannerRef = useRef(null)

  useEffect(() => {
    // Add floating particles
    const banner = bannerRef.current
    if (!banner) return

    const particlesContainer = banner.querySelector('.cta-particles')
    if (!particlesContainer) return

    // Create random particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.className = 'cta-particle'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * -30}s`
      particle.style.animationDuration = `${25 + Math.random() * 15}s`
      particle.style.width = `${4 + Math.random() * 8}px`
      particle.style.height = particle.style.width
      particlesContainer.appendChild(particle)
    }

    // Add glowing orbs
    for (let i = 0; i < 5; i++) {
      const orb = document.createElement('div')
      orb.className = 'cta-glow-orb'
      orb.style.left = `${Math.random() * 100}%`
      orb.style.top = `${Math.random() * 100}%`
      orb.style.animationDelay = `${Math.random() * -20}s`
      orb.style.animationDuration = `${15 + Math.random() * 10}s`
      particlesContainer.appendChild(orb)
    }

    return () => {
      if (particlesContainer) {
        particlesContainer.innerHTML = ''
      }
    }
  }, [])

  // Animated icons data
  const floatingIcons = [
    { Icon: Car, position: 'top-1/4 left-10', delay: '0s' },
    { Icon: Shield, position: 'top-1/3 right-20', delay: '0.5s' },
    { Icon: Star, position: 'bottom-1/4 left-20', delay: '1s' },
    { Icon: Zap, position: 'bottom-1/3 right-10', delay: '1.5s' },
    { Icon: TrendingUp, position: 'top-1/2 left-1/4', delay: '2s' },
    { Icon: CheckCircle, position: 'top-1/2 right-1/4', delay: '2.5s' },
  ]

  return (
    <section ref={bannerRef} className="cta-banner-section">
      {/* Particles Background */}
      <div className="cta-particles"></div>

      {/* Animated Gradient Mesh */}
      <div className="cta-gradient-mesh"></div>

      {/* Floating Icons (Hidden on mobile) */}
      <div className="hidden lg:block">
        {floatingIcons.map(({ Icon, position, delay }, index) => (
          <div
            key={index}
            className={`cta-floating-icon ${position}`}
            style={{ animationDelay: delay }}
          >
            <Icon size={32} />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Headline */}
          <h2 className="cta-headline">
            Ready to Find{' '}
            <span className="cta-headline-gradient">Your Dream Car?</span>
          </h2>

          {/* Subtext */}
          <p className="cta-subtext">
            Join thousands of satisfied buyers and sellers on Nigeria's most trusted car marketplace
          </p>

          {/* CTA Buttons Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
            {/* Primary CTA - Browse Cars */}
            <Link href="/cars" className="cta-button-wrapper">
              <button className="cta-button-primary group">
                <span className="relative z-10 flex items-center gap-3">
                  <Car size={24} className="cta-button-icon" />
                  <span className="font-bold text-lg">Browse Cars</span>
                  <ArrowRight size={20} className="cta-arrow-icon" />
                </span>
                <div className="cta-button-glow-primary"></div>
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="cta-trust-badge">
              <Shield size={20} className="text-accent-green" />
              <span className="text-sm font-semibold text-white">100% Verified</span>
            </div>
            <div className="cta-trust-badge">
              <Star size={20} className="text-accent-blue" />
              <span className="text-sm font-semibold text-white">4.9 Rating</span>
            </div>
            <div className="cta-trust-badge">
              <TrendingUp size={20} className="text-secondary" />
              <span className="text-sm font-semibold text-white">50k+ Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="cta-wave-decoration"></div>
    </section>
  )
}
