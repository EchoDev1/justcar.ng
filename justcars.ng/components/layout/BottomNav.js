/**
 * Bottom Navigation Bar for Mobile
 * Sticky navigation with large touch targets
 */

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, Heart, User, Car } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/cars', icon: Search, label: 'Browse' },
    { href: '/luxury', icon: Car, label: 'Luxury' },
    { href: '/favorites', icon: Heart, label: 'Saved' },
    { href: '/login', icon: User, label: 'Account' }
  ]

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
            >
              <Icon className="bottom-nav-icon" size={24} />
              <span className="bottom-nav-label">{item.label}</span>
              {isActive && <div className="bottom-nav-indicator" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
