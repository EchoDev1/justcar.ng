'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User } from 'lucide-react'

export default function MobileBottomNav() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide nav when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/cars', icon: Search, label: 'Browse' },
    { href: '/favorites', icon: Heart, label: 'Saved' },
    { href: '/admin/login', icon: User, label: 'Account' },
  ]

  return (
    <nav className={`mobile-bottom-nav ${isVisible ? 'mobile-bottom-nav-visible' : ''}`}>
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
            >
              <div className="mobile-nav-icon-wrapper">
                <Icon size={24} className="mobile-nav-icon" />
                {isActive && <div className="mobile-nav-indicator"></div>}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
