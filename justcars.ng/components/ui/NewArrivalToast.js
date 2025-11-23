'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, X, Sparkles } from 'lucide-react'

export default function NewArrivalToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [progress, setProgress] = useState(100)

  // Auto-dismiss duration in milliseconds
  const DISMISS_DURATION = 8000

  useEffect(() => {
    // Check if user has already dismissed today
    const dismissedToday = localStorage.getItem('newArrivalToastDismissed')
    const today = new Date().toDateString()

    if (dismissedToday === today) {
      return
    }

    // Show toast after 3 seconds
    const showTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(showTimeout)
  }, [])

  useEffect(() => {
    if (!isVisible || isDismissed) return

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          handleDismiss()
          return 0
        }
        return prev - (100 / (DISMISS_DURATION / 100))
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isVisible, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)

    // Store dismissal in localStorage
    const today = new Date().toDateString()
    localStorage.setItem('newArrivalToastDismissed', today)
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className={`new-arrival-toast ${isVisible ? 'new-arrival-toast-visible' : ''}`}>
      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="toast-close-button"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>

      {/* Icon */}
      <div className="toast-icon">
        <Sparkles size={24} className="toast-sparkle" />
        <Car size={20} />
      </div>

      {/* Content */}
      <div className="toast-content">
        <h4 className="toast-title">New Arrivals!</h4>
        <p className="toast-message">3 luxury cars just added</p>
      </div>

      {/* Action */}
      <Link
        href="/cars?sort=newest"
        onClick={handleDismiss}
        className="toast-action-button"
      >
        View Now
      </Link>

      {/* Progress Bar */}
      <div className="toast-progress-container">
        <div
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
