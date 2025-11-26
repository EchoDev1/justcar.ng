/**
 * Payment Warning Slide Component
 * Displays a sliding warning about payment moderation
 */

'use client'

import { useState, useEffect } from 'react'
import { X, ShieldAlert } from 'lucide-react'

export default function PaymentWarning() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Show warning after 2 seconds (always show on page load)
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <div className={`payment-warning-container ${isVisible ? 'visible' : ''}`}>
      <div className="payment-warning-card">
        {/* Icon */}
        <div className="payment-warning-icon">
          <ShieldAlert size={28} />
        </div>

        {/* Content */}
        <div className="payment-warning-content">
          <h3 className="payment-warning-title">Important Payment Notice</h3>
          <p className="payment-warning-text">
            All payment should be made only directly to admin for proper moderation.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="payment-warning-close"
          aria-label="Dismiss warning"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
