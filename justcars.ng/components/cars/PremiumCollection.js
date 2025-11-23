'use client'

import { CheckCircle, Shield } from 'lucide-react'
import CarCard from './CarCard'

export default function PremiumCollection({ cars }) {
  if (!cars || cars.length === 0) {
    return null
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 hero-gradient-mesh opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title with Animated Underline */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <h2 className="premium-collection-title">
              Premium Verified Collection
            </h2>
            <span className="premium-collection-badge">
              <Shield size={16} />
              <span>Verified</span>
            </span>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Hand-picked luxury vehicles with complete verification and dealer guarantee.
            Experience the finest cars Nigeria has to offer.
          </p>
        </div>

        {/* 3D Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} is3D={true} />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 glass rounded-xl">
            <div className="flex justify-center mb-3">
              <CheckCircle className="text-accent-green" size={32} />
            </div>
            <h4 className="text-white font-bold mb-2">100% Verified</h4>
            <p className="text-gray-400 text-sm">
              Every vehicle undergoes rigorous inspection
            </p>
          </div>

          <div className="text-center p-6 glass rounded-xl">
            <div className="flex justify-center mb-3">
              <Shield className="text-accent-blue" size={32} />
            </div>
            <h4 className="text-white font-bold mb-2">Dealer Guarantee</h4>
            <p className="text-gray-400 text-sm">
              All dealers are certified and trusted
            </p>
          </div>

          <div className="text-center p-6 glass rounded-xl">
            <div className="flex justify-center mb-3">
              <svg className="text-secondary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h4 className="text-white font-bold mb-2">Premium Quality</h4>
            <p className="text-gray-400 text-sm">
              Only the finest vehicles make the cut
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
