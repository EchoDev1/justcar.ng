'use client'

/**
 * Hero Section with Advanced Animations
 * Features: Particle system, parallax scrolling, word reveals, floating elements
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AdvancedSearchBar from './AdvancedSearchBar'
import TrustIndicators from './TrustIndicators'

export default function AnimatedHero({
  enableVideo = false,
  videoSrc = null,
  title = "Discover Your Dream Car in Nigeria",
  subtitle = "Nigeria's Most Trusted Car Marketplace"
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [particles, setParticles] = useState([])
  const heroRef = useRef(null)

  // Initialize particles
  useEffect(() => {
    const particleCount = 50
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
    setParticles(newParticles)
  }, [])

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setMousePosition({ x, y })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(particle => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
        }))
      )
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Split title into words for reveal animation
  const titleWords = title.split(' ')

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary"
      style={{
        transform: `translateY(${scrollY * 0.5}px)`,
      }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary-dark animate-gradient-shift" />

      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-blue-400 animate-particle-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-blue-400 rounded-full animate-float"
          style={{
            animationDelay: '0s',
            transform: `translate(${(mousePosition.x - 0.5) * 30}px, ${(mousePosition.y - 0.5) * 30}px)`,
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-48 h-48 border-2 border-orange-400 rotate-45 animate-float"
          style={{
            animationDelay: '2s',
            transform: `translate(${(mousePosition.x - 0.5) * -40}px, ${(mousePosition.y - 0.5) * -40}px)`,
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-56 h-56 border-2 border-purple-400 rounded-full animate-float"
          style={{
            animationDelay: '4s',
            transform: `translate(${(mousePosition.x - 0.5) * 25}px, ${(mousePosition.y - 0.5) * 25}px)`,
          }}
        />
      </div>

      {/* Video Background (Optional) */}
      {enableVideo && videoSrc && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary" />
        </div>
      )}

      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 animate-gradient-mesh-move" />
      </div>

      {/* Hero Content */}
      <div
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <div>
          {/* Main Headline with Word Reveal Animation */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
            {titleWords.map((word, index) => (
              <span
                key={index}
                className="inline-block animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards',
                  marginRight: '0.3em',
                }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Tagline with Gradient Animation */}
          <p className="text-lg md:text-xl lg:text-2xl mb-4 font-medium text-white/85 animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent animate-gradient-text-flow">
              Every car verified. Every detail authentic. Every deal transparent.
            </span>
          </p>

          {/* Subtitle with Pulse Effect */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 font-semibold text-white animate-fade-in opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
            <span className="inline-block animate-pulse-slow">
              {subtitle}
            </span>
          </p>

          {/* Advanced Search Bar with Slide-Up Animation */}
          <div className="mb-12 animate-fade-in opacity-0" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <AdvancedSearchBar />
            </div>
          </div>

          {/* Trust Indicators with Stagger Animation */}
          <div className="mb-12 animate-fade-in opacity-0" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
            <TrustIndicators />
          </div>

          {/* CTA Buttons with Hover Effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in opacity-0" style={{ animationDelay: '1.3s', animationFillMode: 'forwards' }}>
            <Link href="/cars">
              <button className="group relative bg-blue-600 text-white px-8 py-4 text-lg rounded-lg font-medium overflow-hidden transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95">
                <span className="relative z-10">Browse All Cars</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
            </Link>
            <Link href="/dealers">
              <button className="group relative bg-white/10 backdrop-blur-md text-white border-2 border-white/20 px-8 py-4 text-lg rounded-lg font-medium overflow-hidden transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95">
                <span className="relative z-10">Find Dealers</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator with Bounce Animation */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in opacity-0"
        style={{
          animationDelay: '1.5s',
          animationFillMode: 'forwards',
        }}
      >
        <div className="flex flex-col items-center gap-2 text-blue-400 opacity-70 animate-pulse-slow">
          <p className="text-sm uppercase tracking-wider font-medium">Scroll Down</p>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Floating Orbs with Glow Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-float-orb"
          style={{
            animationDelay: '0s',
            transform: `translate(${(mousePosition.x - 0.5) * 50}px, ${(mousePosition.y - 0.5) * 50}px)`,
          }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-80 h-80 bg-purple-500 rounded-full blur-3xl animate-float-orb"
          style={{
            animationDelay: '2s',
            transform: `translate(${(mousePosition.x - 0.5) * -60}px, ${(mousePosition.y - 0.5) * -60}px)`,
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-orange-500 rounded-full blur-3xl animate-float-orb"
          style={{
            animationDelay: '4s',
            transform: `translate(${(mousePosition.x - 0.5) * 40}px, ${(mousePosition.y - 0.5) * 40}px)`,
          }}
        />
      </div>

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%" className="animate-gradient-mesh-move">
          <defs>
            <radialGradient id="grad1" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="grad2" cx="70%" cy="60%">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="grad3" cx="50%" cy="80%">
              <stop offset="0%" stopColor="#00FF88" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="30%" cy="30%" r="40%" fill="url(#grad1)" />
          <circle cx="70%" cy="60%" r="35%" fill="url(#grad2)" />
          <circle cx="50%" cy="80%" r="30%" fill="url(#grad3)" />
        </svg>
      </div>
    </section>
  )
}
