/**
 * Luxury Car Portal
 * Premium experience for high-end vehicles
 */

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Crown, Shield, Star, Sparkles, TrendingUp, Award, Check } from 'lucide-react'
import CarGrid from '@/components/cars/CarGrid'
import Button from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

const luxuryBrands = [
  'Rolls-Royce', 'Bentley', 'Lamborghini', 'Ferrari',
  'Porsche', 'Maserati', 'Aston Martin', 'McLaren',
  'Bugatti', 'Maybach', 'Range Rover'
]

async function getLuxuryCars() {
  const supabase = await createClient()

  const { data: cars } = await supabase
    .from('cars')
    .select(`
      *,
      dealers (name),
      car_images (image_url, is_primary)
    `)
    .gte('price', 50000000) // ₦50M and above
    .order('price', { ascending: false })
    .limit(12)

  return cars || []
}

export default async function LuxuryPortalPage() {
  const luxuryCars = await getLuxuryCars()

  return (
    <div className="min-h-screen bg-primary">
      {/* Luxury Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 hero-gradient-mesh opacity-30" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="fade-in">
            {/* Crown Icon */}
            <div className="flex justify-center mb-8 animate-float">
              <div className="relative">
                <Crown className="text-secondary w-20 h-20" style={{ color: '#FFD700' }} />
                <div className="absolute inset-0 animate-ping opacity-50">
                  <Crown className="w-20 h-20" style={{ color: '#FFD700' }} />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 font-heading"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
                animation: 'gradient-flow 4s ease infinite',
              }}
            >
              Luxury Collection
            </h1>

            {/* Subheadline */}
            <p className="text-2xl md:text-3xl mb-4 font-medium" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
              letterSpacing: '0.05em',
            }}>
              Where Excellence Meets Exclusivity
            </p>

            <p className="text-xl md:text-2xl mb-12 text-muted max-w-3xl mx-auto">
              Discover Nigeria's finest collection of ultra-premium vehicles, starting from ₦50M
            </p>

            {/* Premium Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="card-glass p-6 hover-lift">
                <Shield className="w-12 h-12 mx-auto mb-4 text-accent-green" />
                <h3 className="text-lg font-bold mb-2">Verified Authentic</h3>
                <p className="text-muted text-sm">Every vehicle thoroughly inspected and certified</p>
              </div>
              <div className="card-glass p-6 hover-lift">
                <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#FFD700' }} />
                <h3 className="text-lg font-bold mb-2">Concierge Service</h3>
                <p className="text-muted text-sm">White-glove treatment from inquiry to delivery</p>
              </div>
              <div className="card-glass p-6 hover-lift">
                <Star className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-lg font-bold mb-2">Exclusive Access</h3>
                <p className="text-muted text-sm">First look at rare and limited edition models</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-float">
          <div className="flex flex-col items-center gap-2" style={{ color: '#FFD700' }}>
            <p className="text-sm uppercase tracking-wider font-body-alt">Explore Collection</p>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Luxury Brands Section */}
      <section className="py-16 bg-primary-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
              <Sparkles className="inline-block mr-2 mb-1" size={32} />
              Premium Brands
            </h2>
            <p className="text-muted text-lg">The world's most prestigious automotive marques</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {luxuryBrands.map((brand) => (
              <Link
                key={brand}
                href={`/cars?make=${brand.toLowerCase()}`}
                className="card-glass p-6 text-center hover-lift hover-glow-orange transition-all"
              >
                <p className="font-semibold text-white">{brand}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Luxury Cars */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>
                Featured Collection
              </h2>
              <p className="text-muted">₦50 Million and above</p>
            </div>
            <Link href="/cars?price=50000000+">
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                View All Luxury Cars
              </Button>
            </Link>
          </div>

          {luxuryCars.length > 0 ? (
            <CarGrid cars={luxuryCars} />
          ) : (
            <div className="text-center py-20 card-glass rounded-2xl">
              <Crown className="mx-auto mb-6" style={{ color: '#FFD700' }} size={64} />
              <h3 className="text-2xl font-bold mb-4">Curating Exceptional Vehicles</h3>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Our luxury collection is being carefully assembled. Check back soon for exclusive listings.
              </p>
              <Link href="/cars">
                <Button variant="primary">Browse All Cars</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Luxury Portal */}
      <section className="py-20 bg-primary-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
              The Luxury Difference
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Experience unparalleled service and authenticity in Nigeria's premier luxury car marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Certified Provenance',
                description: 'Complete vehicle history and documentation verified by experts',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Inspection Reports',
                description: 'Detailed 200-point inspection by certified luxury car specialists',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Secure Transactions',
                description: 'Escrow services and secure payment processing for your peace of mind',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Delivery Service',
                description: 'White-glove delivery to your location with full insurance coverage',
              },
            ].map((feature, index) => (
              <div key={index} className="card-glass p-8 hover-lift flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 0, 0.2))' }}>
                  <span style={{ color: '#FFD700' }}>{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient-mesh opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Crown className="mx-auto mb-6 animate-float" style={{ color: '#FFD700' }} size={64} />
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#FFD700' }}>
            Ready to Elevate Your Drive?
          </h2>
          <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
            Connect with our luxury car specialists for personalized assistance and exclusive previews
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cars?price=50000000+">
              <button className="btn-secondary px-8 py-4 text-lg" style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#0A0E27',
              }}>
                Browse Collection
              </button>
            </Link>
            <Link href="/contact">
              <button className="btn-glass px-8 py-4 text-lg hover-glow-orange">
                Contact Specialist
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
