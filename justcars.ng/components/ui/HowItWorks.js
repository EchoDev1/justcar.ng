'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ShieldCheck, Phone, ArrowRight } from 'lucide-react'

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState([])
  const [arrowsVisible, setArrowsVisible] = useState([])
  const sectionRef = useRef(null)
  const stepsRef = useRef([])

  const steps = [
    {
      id: 1,
      icon: Search,
      title: 'Search & Filter',
      description: 'Browse through our extensive collection of verified vehicles. Use advanced filters to find cars that match your exact preferences - from make and model to price range and location.',
      color: 'blue',
      delay: 0
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: 'Verify & Inspect',
      description: 'Review detailed inspection reports and professional photographs. Every vehicle undergoes our rigorous 150-point verification process to ensure quality and transparency.',
      color: 'green',
      delay: 300
    },
    {
      id: 3,
      icon: Phone,
      title: 'Contact & Purchase',
      description: 'Connect directly with verified dealers through our secure platform. Schedule test drives, negotiate prices, and complete your purchase with confidence and peace of mind.',
      color: 'orange',
      delay: 600
    }
  ]

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger step animations
            steps.forEach((step, index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => [...new Set([...prev, step.id])])
              }, step.delay)
            })

            // Trigger arrow animations after steps
            setTimeout(() => {
              setArrowsVisible([1])
            }, 800)
            setTimeout(() => {
              setArrowsVisible([1, 2])
            }, 1400)
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

  return (
    <section ref={sectionRef} className="how-it-works-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="how-it-works-header">
          <h2 className="how-it-works-title">
            Your Journey to the <span className="gradient-text-animated">Perfect Car</span>
          </h2>
          <p className="how-it-works-subtitle">
            Three simple steps to find and purchase your dream vehicle with complete confidence
          </p>
        </div>

        {/* Steps Container */}
        <div className="steps-container">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isVisible = visibleSteps.includes(step.id)
            const showArrow = index < steps.length - 1 && arrowsVisible.includes(step.id)

            return (
              <div key={step.id} className="step-wrapper">
                {/* Step Card */}
                <div
                  ref={(el) => (stepsRef.current[index] = el)}
                  className={`step-card step-card-${step.color} ${
                    isVisible ? 'step-card-visible' : ''
                  }`}
                >
                  {/* Step Number Badge */}
                  <div className={`step-number step-number-${step.color}`}>
                    <span className="step-number-text">{step.id}</span>
                    <div className="step-number-glow"></div>
                  </div>

                  {/* Icon Container */}
                  <div className={`step-icon-container step-icon-${step.color}`}>
                    <Icon size={48} className="step-icon" strokeWidth={2} />
                    <div className="step-icon-bg"></div>
                    <div className="step-icon-ring"></div>
                  </div>

                  {/* Step Content */}
                  <div className="step-content">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>

                  {/* Glassmorphic Border */}
                  <div className={`step-border step-border-${step.color}`}></div>
                </div>

                {/* Connecting Arrow */}
                {index < steps.length - 1 && (
                  <div className={`connecting-arrow ${showArrow ? 'arrow-visible' : ''}`}>
                    {/* Desktop Arrow */}
                    <svg
                      className="arrow-svg arrow-desktop"
                      viewBox="0 0 100 50"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={`arrowGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(0, 217, 255, 0.6)" />
                          <stop offset="100%" stopColor="rgba(0, 255, 136, 0.6)" />
                        </linearGradient>
                      </defs>
                      <path
                        className="arrow-path"
                        d="M 0 25 L 90 25"
                        fill="none"
                        stroke={`url(#arrowGradient${index})`}
                        strokeWidth="2"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                      />
                      <path
                        className="arrow-head"
                        d="M 85 20 L 95 25 L 85 30"
                        fill="none"
                        stroke="rgba(0, 217, 255, 0.8)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Mobile Arrow */}
                    <svg
                      className="arrow-svg arrow-mobile"
                      viewBox="0 0 50 100"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={`arrowGradientMobile${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(0, 217, 255, 0.6)" />
                          <stop offset="100%" stopColor="rgba(0, 255, 136, 0.6)" />
                        </linearGradient>
                      </defs>
                      <path
                        className="arrow-path"
                        d="M 25 0 L 25 90"
                        fill="none"
                        stroke={`url(#arrowGradientMobile${index})`}
                        strokeWidth="2"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                      />
                      <path
                        className="arrow-head"
                        d="M 20 85 L 25 95 L 30 85"
                        fill="none"
                        stroke="rgba(0, 217, 255, 0.8)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Animated Glow */}
                    <div className="arrow-glow"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <div className="how-it-works-cta">
          <a href="/cars" className="start-journey-btn">
            <span>Start Your Journey</span>
            <ArrowRight size={20} className="btn-arrow" />
          </a>
        </div>
      </div>
    </section>
  )
}
