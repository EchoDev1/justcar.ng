/**
 * Enhanced Footer Component
 * Modern glassmorphic design with newsletter signup and social links
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Shield, CheckCircle, Lock } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const currentYear = new Date().getFullYear()

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()

    // Newsletter subscription functionality
    // In production, integrate with email service (Mailchimp, SendGrid, etc.)
    try {
      // Placeholder for newsletter API integration
      // await fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) })

      alert('Thank you for subscribing! We\'ll keep you updated.')
      setEmail('')
    } catch (error) {
      alert('Failed to subscribe. Please try again.')
    }
  }

  return (
    <footer className="footer-enhanced">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Signup */}
        <div className="newsletter-container text-center">
          <h3 className="newsletter-title">Stay Updated</h3>
          <p className="newsletter-subtitle">Get the latest car listings delivered to your inbox</p>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
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
