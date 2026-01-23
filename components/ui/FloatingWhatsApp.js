'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const whatsappNumber = '2348148527697'
  const defaultMessage = 'Hi! I\'m interested in buying a car from JustCars.ng'

  useEffect(() => {
    // Show button after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!isVisible) return null

  return (
    <div className="floating-whatsapp-container">
      {/* Tooltip */}
      {showTooltip && (
        <div className="whatsapp-tooltip">
          <span>Chat with us on WhatsApp</span>
          <div className="whatsapp-tooltip-arrow"></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="whatsapp-button"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle />
      </button>
    </div>
  )
}
