'use client'

import Link from 'next/link'
import { ArrowRight, Car } from 'lucide-react'

export default function FloatingCTAButton() {
  return (
    <Link href="/cars">
      <div className="floating-cta-wrapper">
        <button className="floating-cta-button">
          <span className="floating-cta-icon">
            <Car size={20} />
          </span>
          <span className="floating-cta-text">Explore Cars</span>
          <span className="floating-cta-arrow">
            <ArrowRight size={18} />
          </span>
        </button>
      </div>
    </Link>
  )
}
