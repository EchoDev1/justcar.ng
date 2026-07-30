/**
 * Enhanced Footer Component
 * Modern glassmorphic design with newsletter signup and social links
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Shield, CheckCircle, Lock } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-container relative pt-16 pb-8 border-t border-white/10 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="newsletter-card mb-12 p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/20 to-blue-900/40 border border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Mail className="text-accent-blue" size={24} />
                Stay Updated on Exclusive Deals
              </h3>
              <p className="text-muted text-sm">
                Subscribe to get new car listings, price drop alerts, and automotive market insights delivered to your inbox.
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!') }} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue text-sm"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & About */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Car className="text-accent-blue" size={32} />
              <span className="text-2xl font-bold text-white">
                JustCars<span className="text-accent-blue">.ng</span>
              </span>
            </Link>
            <p className="text-sm text-muted mb-4">
              Nigeria's trusted platform for buying quality cars. Find your dream car today with verified listings and transparent pricing.
            </p>

            {/* Official Brand Badges */}
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/justcars_official_seal.jpg" 
                alt="JustCars Official Seal" 
                width={50} 
                height={50} 
                className="rounded-full border border-yellow-500/50"
              />
              <Image 
                src="/justcars_verified_stamp.jpg" 
                alt="100% Verified Stamp" 
                width={50} 
                height={50} 
                className="rounded-full border border-cyan-500/50"
              />
            </div>

            {/* Social Icons */}
            <div className="social-icons-container">
              <a href="#" className="social-icon" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-column-title">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="footer-link">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/luxury" className="footer-link">
                  Luxury Collection
                </Link>
              </li>
              <li>
                <Link href="#about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#faq" className="footer-link">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Makes */}
          <div>
            <h3 className="footer-column-title">Popular Makes</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cars?make=Toyota" className="footer-link">
                  Toyota
                </Link>
              </li>
              <li>
                <Link href="/cars?make=Honda" className="footer-link">
                  Honda
                </Link>
              </li>
              <li>
                <Link href="/cars?make=Mercedes-Benz" className="footer-link">
                  Mercedes-Benz
                </Link>
              </li>
              <li>
                <Link href="/cars?make=Lexus" className="footer-link">
                  Lexus
                </Link>
              </li>
              <li>
                <Link href="/cars?make=BMW" className="footer-link">
                  BMW
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="footer-column-title">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-accent-blue mt-1 flex-shrink-0" />
                <span className="text-sm text-muted">Abuja, Nigeria</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-accent-green flex-shrink-0" />
                <span className="text-sm text-muted">08148527697</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-secondary flex-shrink-0" />
                <span className="text-sm text-muted">Admin@justcars.ng</span>
              </li>
              <li className="flex items-center space-x-3">
                <MessageCircle size={20} className="text-accent-green flex-shrink-0" />
                <span className="text-sm text-muted">WhatsApp Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="trust-badges justify-center">
          <div className="trust-badge">
            <Shield size={18} />
            SSL Secured
          </div>
          <div className="trust-badge">
            <CheckCircle size={18} />
            Verified Dealers
          </div>
          <div className="trust-badge">
            <Lock size={18} />
            Safe Payments
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            &copy; {currentYear} <span className="footer-bottom-gradient">JustCars.ng</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
