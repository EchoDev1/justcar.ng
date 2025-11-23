'use client'

import { ShieldCheck, Camera, ClipboardCheck, Tag } from 'lucide-react'

export default function WhyChooseUs() {
  const features = [
    {
      id: 1,
      icon: ShieldCheck,
      iconClass: 'icon-shield-check',
      title: '100% Verified Cars',
      description: 'Every vehicle undergoes rigorous inspection and verification by our expert team before listing.'
    },
    {
      id: 2,
      icon: Camera,
      iconClass: 'icon-camera',
      title: 'Professional Photography',
      description: 'High-quality, detailed photos from every angle so you know exactly what you\'re getting.'
    },
    {
      id: 3,
      icon: ClipboardCheck,
      iconClass: 'icon-clipboard',
      title: 'Detailed Inspections',
      description: 'Comprehensive 150-point inspection reports available for all premium vehicles.'
    },
    {
      id: 4,
      icon: Tag,
      iconClass: 'icon-tag',
      title: 'Transparent Pricing',
      description: 'No hidden fees or surprises. What you see is what you pay, guaranteed.'
    }
  ]

  return (
    <section className="why-choose-us-section">
      {/* Title */}
      <h2 className="why-choose-title">
        Why Choose Us?
      </h2>

      {/* Feature Cards */}
      <div className="why-choose-cards-container">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.id} className="why-choose-card">
              {/* Card Number */}
              <div className="why-choose-card-number">{feature.id}</div>

              {/* Icon Container */}
              <div className="why-choose-icon-container">
                <Icon
                  size={40}
                  className={`why-choose-icon ${feature.iconClass}`}
                  strokeWidth={2}
                />
              </div>

              {/* Title */}
              <h3 className="why-choose-card-title">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="why-choose-card-description">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
