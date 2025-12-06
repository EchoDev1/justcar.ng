/**
 * Dealer Sidebar Navigation
 * Premium navigation with subscription tier badges
 */

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Car, Home, Plus, List, Star, Clock, LogOut,
  CreditCard, TrendingUp, User, MessageSquare,
  BarChart3, Crown, Shield, Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function DealerSidebar({ dealer }) {
  const pathname = usePathname()
  const router = useRouter()

  // Get subscription tier badge
  const getTierBadge = () => {
    if (dealer?.subscription_tier === 'luxury') {
      return (
        <div className="flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
          <Crown size={14} className="text-white mr-1" />
          <span className="text-xs font-bold text-white">LUXURY DEALER</span>
        </div>
      )
    } else if (dealer?.subscription_tier === 'premium') {
      return (
        <div className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
          <Star size={14} className="text-white mr-1" />
          <span className="text-xs font-bold text-white">PREMIUM DEALER</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center px-3 py-1 bg-gray-600 rounded-full">
          <Shield size={14} className="text-white mr-1" />
          <span className="text-xs font-bold text-white">VERIFIED DEALER</span>
        </div>
      )
    }
  }

  const navItems = [
    { href: '/dealer', label: 'Dashboard', icon: Home, requiresTier: null },
    { href: '/dealer/subscription', label: 'Subscription', icon: Crown, requiresTier: null, highlight: !dealer?.subscription_tier || dealer?.subscription_tier === 'basic' },
    { href: '/dealer/cars', label: 'My Inventory', icon: List, requiresTier: null },
    { href: '/dealer/cars/new', label: 'Add New Car', icon: Plus, requiresTier: null },
    { href: '/dealer/analytics', label: 'Analytics', icon: BarChart3, requiresTier: 'premium' },
    { href: '/dealer/messages', label: 'Messages', icon: MessageSquare, requiresTier: 'premium' },
    { href: '/dealer/payments', label: 'Earnings', icon: CreditCard, requiresTier: 'premium' },
    { href: '/dealer/profile', label: 'Profile & Settings', icon: Settings, requiresTier: null },
  ]

  const handleLogout = async () => {
    try {
      const supabase = createClient()

      // Clear storage immediately
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      await supabase.auth.signOut()

      // Fast redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/dealer/login'
      } else {
        router.push('/dealer/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/dealer/login'
      }
    }
  }

  const canAccessFeature = (requiresTier) => {
    if (!requiresTier) return true

    const tierLevel = {
      'basic': 0,
      'premium': 1,
      'luxury': 2
    }

    const userLevel = tierLevel[dealer?.subscription_tier] || 0
    const requiredLevel = tierLevel[requiresTier] || 0

    return userLevel >= requiredLevel
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen flex flex-col shadow-2xl">
      {/* Logo & Dealer Info */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/dealer" className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Car size={28} />
          </div>
          <div>
            <span className="text-xl font-bold">JustCars.ng</span>
            <p className="text-xs text-gray-400">Dealer Portal</p>
          </div>
        </Link>

        {/* Dealer Info Card */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mt-4">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
              {dealer?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <p className="font-semibold text-sm truncate">{dealer?.name}</p>
              <p className="text-xs text-gray-400 truncate">{dealer?.email}</p>
            </div>
          </div>
          {getTierBadge()}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const hasAccess = canAccessFeature(item.requiresTier)

            return (
              <li key={item.href}>
                {hasAccess ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg transition-all group',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                      item.highlight && !isActive && 'ring-2 ring-yellow-500 ring-opacity-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} className={item.highlight && !isActive ? 'text-yellow-400' : ''} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="text-xs bg-yellow-500 text-gray-900 px-2 py-1 rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-500 cursor-not-allowed opacity-60 relative group"
                    title="Upgrade to Premium or Luxury to access this feature"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Crown size={16} className="text-yellow-500" />

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
                      <div className="font-bold mb-1">Premium Feature</div>
                      <div>Upgrade to unlock</div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {/* Upgrade Banner (for non-premium dealers) */}
        {(!dealer?.subscription_tier || dealer?.subscription_tier === 'basic') && (
          <div className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-gray-900">
            <Crown className="w-8 h-8 mb-2" />
            <h3 className="font-bold text-sm mb-1">Upgrade to Premium!</h3>
            <p className="text-xs mb-3 opacity-90">
              Get analytics, messaging, and more premium features
            </p>
            <Link
              href="/dealer/subscription"
              className="block text-center bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition"
            >
              View Plans
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white w-full transition-all group"
        >
          <LogOut size={20} className="group-hover:animate-pulse" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center border-t border-gray-700">
        <p className="text-xs text-gray-500">
          © 2025 JustCars.ng
        </p>
      </div>
    </aside>
  )
}
