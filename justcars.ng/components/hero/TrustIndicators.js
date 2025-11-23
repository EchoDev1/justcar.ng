'use client'

/**
 * Trust Indicators with Animated Counters
 * Features: Number counting animation, glassmorphic cards, floating icons
 */

import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Star, Clock } from 'lucide-react'

const trustStats = [
  {
    icon: CheckCircle,
    value: 1247,
    suffix: '+',
    label: 'Verified Cars',
    color: '#00FF88',
    duration: 2000,
  },
  {
    icon: Star,
    value: 98,
    suffix: '%',
    label: 'Customer Satisfaction',
    color: '#FFD700',
    duration: 1500,
  },
  {
    icon: Clock,
    value: 24,
    suffix: 'hr',
    label: 'Response Time',
    color: '#00D9FF',
    duration: 1000,
  },
]

function AnimatedCounter({ value, duration, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const countRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = Date.now()
    const endValue = value

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(easeOutQuart * endValue)

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(updateCount)
  }, [hasStarted, value, duration])

  return (
    <span ref={countRef} className="number-counter tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function TrustIndicators() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trustStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="trust-indicator-card"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {/* Floating Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className="relative animate-float"
                  style={{
                    animationDelay: `${index * 0.3}s`,
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
                    }}
                  >
                    <Icon
                      size={32}
                      style={{ color: stat.color }}
                      className="drop-shadow-glow"
                    />
                  </div>
                  {/* Pulsing ring */}
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{
                      background: stat.color,
                    }}
                  />
                </div>
              </div>

              {/* Animated Counter */}
              <div
                className="text-4xl md:text-5xl font-bold mb-2 font-heading"
                style={{
                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}aa 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: `drop-shadow(0 0 10px ${stat.color}40)`,
                }}
              >
                <AnimatedCounter
                  value={stat.value}
                  duration={stat.duration}
                  suffix={stat.suffix}
                />
              </div>

              {/* Label */}
              <p
                className="text-sm md:text-base font-medium uppercase tracking-wider"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textShadow: `0 0 10px ${stat.color}30`,
                }}
              >
                {stat.label}
              </p>

              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 hover-glow-effect transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${stat.color}15, transparent)`,
                }}
              />
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .trust-indicator-card {
          position: relative;
          background: rgba(20, 25, 58, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
          overflow: hidden;
        }

        .trust-indicator-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .trust-indicator-card:hover .hover-glow-effect {
          opacity: 1;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }

        /* Tabular numbers for consistent width during animation */
        .number-counter {
          font-variant-numeric: tabular-nums;
        }

        /* Floating animation for icons */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .trust-indicator-card {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  )
}
