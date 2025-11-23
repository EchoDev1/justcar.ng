'use client'

import { useState, useEffect } from 'react'
import { Car } from 'lucide-react'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          // Start hiding animation
          setTimeout(() => {
            setIsHiding(true)
            // Remove loading screen after animation
            setTimeout(() => {
              setIsLoading(false)
            }, 800)
          }, 300)
          return 100
        }
        // Accelerate progress towards end
        const increment = prev < 70 ? 2 : prev < 90 ? 5 : 10
        return Math.min(prev + increment, 100)
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [])

  if (!isLoading) return null

  return (
    <div className={`loading-screen ${isHiding ? 'loading-screen-hiding' : ''}`}>
      {/* Animated Background */}
      <div className="loading-background">
        <div className="loading-orb loading-orb-1"></div>
        <div className="loading-orb loading-orb-2"></div>
        <div className="loading-orb loading-orb-3"></div>
      </div>

      {/* Loading Content */}
      <div className="loading-content">
        {/* Animated Logo */}
        <div className="loading-logo">
          <div className="loading-logo-icon">
            <Car size={48} />
          </div>
          <div className="loading-logo-text">
            <span className="loading-logo-just">Just</span>
            <span className="loading-logo-cars">Cars</span>
            <span className="loading-logo-ng">.ng</span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="loading-text">
          <span className="loading-dot">.</span>
          <span className="loading-dot">.</span>
          <span className="loading-dot">.</span>
        </div>

        {/* Progress Bar */}
        <div className="loading-progress-container">
          <div
            className="loading-progress-bar"
            style={{ width: `${progress}%` }}
          >
            <div className="loading-progress-shimmer"></div>
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="loading-percentage">{progress}%</div>
      </div>
    </div>
  )
}
