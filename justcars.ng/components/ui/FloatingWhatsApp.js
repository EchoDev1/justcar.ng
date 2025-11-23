'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false)
  const whatsappNumber = '2348012345678' // Replace with actual number
  const defaultMessage = 'Hi! I\'m interested in buying a car from JustCars.ng'

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
        className="whatsapp-button"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  )
}
