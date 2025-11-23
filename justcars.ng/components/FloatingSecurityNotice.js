'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function FloatingSecurityNotice() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (isDismissed) return

    // Slide in after 3 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    // Slide out after 10 seconds (visible for 7 seconds)
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 10000)

    // Repeat the cycle every 20 seconds
    const interval = setInterval(() => {
      setIsVisible(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 7000) // Visible for 7 seconds
    }, 20000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearInterval(interval)
    }
  }, [isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-700 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'
      }`}
    >
      <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-lg shadow-2xl p-4 relative">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="pr-6">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold mb-1">⚠️ SECURITY ALERT</h3>
              <p className="text-xs font-semibold leading-relaxed">
                NEVER PAY DEALERS DIRECTLY!
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded p-3 mb-3">
            <p className="text-xs leading-relaxed">
              All payments must go through{' '}
              <span className="font-bold">JustCars.ng Admin</span> for your protection.
            </p>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex gap-2">
            <a
              href="https://wa.me/2348148527697"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-3 rounded transition-colors text-center"
            >
              WhatsApp Admin
            </a>
            <a
              href="tel:+2348148527697"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded transition-colors text-center"
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
