/**
 * Main Header Component for Public Pages
 * Responsive with mobile hamburger menu
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, Menu, X, Search } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Browse Cars' },
    { href: '/luxury', label: 'Luxury' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' }
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen)
  }

  return (
    <>
      <header className="header-modern">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 logo-link">
              <Car className="text-accent-blue icon-animated" size={32} />
              <span className="text-2xl font-bold text-white">
                JustCars<span className="text-accent-blue">.ng</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="header-nav-link"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Admin Login
                </Button>
              </Link>
            </div>

            {/* Mobile Menu & Search Icons */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={toggleMobileSearch}
                className="mobile-icon-button"
                aria-label="Open Search"
              >
                <Search size={24} />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="mobile-icon-button"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div
          className={`mobile-menu-panel ${mobileMenuOpen ? 'mobile-menu-panel-open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-menu-header">
            <div className="flex items-center space-x-2">
              <Car className="text-accent-blue" size={28} />
              <span className="text-xl font-bold text-white">
                JustCars<span className="text-accent-blue">.ng</span>
              </span>
            </div>
            <button onClick={toggleMobileMenu} className="mobile-close-button">
              <X size={24} />
            </button>
          </div>

          <nav className="mobile-menu-nav">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={toggleMobileMenu}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            <Link href="/login" onClick={toggleMobileMenu}>
              <Button variant="primary" size="md" className="w-full">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div className={`mobile-search-overlay ${mobileSearchOpen ? 'mobile-search-open' : ''}`}>
        <div className="mobile-search-header">
          <h2 className="text-xl font-bold text-white">Search Cars</h2>
          <button onClick={toggleMobileSearch} className="mobile-close-button">
            <X size={24} />
          </button>
        </div>

        <div className="mobile-search-content">
          <div className="search-input-group">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by make, model, or keyword..."
              className="mobile-search-input"
              autoFocus
            />
          </div>

          <div className="quick-filters">
            <h3 className="quick-filter-title">Quick Filters</h3>
            <div className="quick-filter-grid">
              {['Toyota', 'Mercedes', 'BMW', 'Honda', 'Lexus', 'Ford'].map((make) => (
                <button key={make} className="quick-filter-pill">
                  {make}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
