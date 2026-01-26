/**
 * Admin Sidebar Navigation
 * Provides navigation for admin panel
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Car, Home, Users, LogOut, Plus, List, Star, Clock, Shield, DollarSign, MessageSquare, ClipboardCheck, Settings, CreditCard, UserCheck, AlertTriangle, FileText, UserCircle, BarChart3, Bell, MessageCircle, ScrollText, Layers, Download, Sliders, Ticket, Tag, Search, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/cars', label: 'All Cars', icon: List },
    { href: '/admin/cars/new', label: 'Add New Car', icon: Plus },
    { href: '/admin/premium-verified', label: 'Premium Verified', icon: Star },
    { href: '/admin/just-arrived', label: 'Just Arrived', icon: Clock },
    { href: '/admin/dealers', label: 'Dealers', icon: Users },
    { href: '/admin/buyers', label: 'Buyers / Users', icon: UserCircle },
    { href: '/admin/dealer-reviews', label: 'Dealer Reviews', icon: MessageCircle },
    { href: '/admin/verification', label: 'Dealer Verification', icon: UserCheck },
    { href: '/admin/dealer-permissions', label: 'Permissions', icon: Shield },
    { href: '/admin/dealer-bank-details', label: 'Dealer Bank Details', icon: CreditCard },
    { href: '/admin/fraud', label: 'Fraud Detection', icon: AlertTriangle },
    { href: '/admin/escrow', label: 'Escrow Management', icon: DollarSign },
    { href: '/admin/payment-accounts', label: 'Payment Accounts', icon: Settings },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/support-tickets', label: 'Support Tickets', icon: Ticket },
    { href: '/admin/chats', label: 'Chats', icon: MessageSquare },
    { href: '/admin/inspections', label: 'Inspections', icon: ClipboardCheck },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { href: '/admin/reports', label: 'Reports', icon: Download },
    { href: '/admin/promotions', label: 'Promotions', icon: Tag },
    { href: '/admin/settings', label: 'System Settings', icon: Sliders },
    { href: '/admin/seo', label: 'SEO Management', icon: Search },
    { href: '/admin/blog', label: 'Blog', icon: FileText },
  ]

  const handleLogout = async () => {
    try {
      const supabase = createClient()

      // Show immediate feedback
      if (typeof window !== 'undefined') {
        // Clear storage immediately for instant logout feel
        localStorage.clear()
        sessionStorage.clear()
      }

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Use window.location for instant redirect (faster than router.push)
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login'
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if error occurs
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/admin/login'
      }
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 p-3 rounded-lg shadow-lg text-white hover:bg-gray-800 transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed lg:relative z-40 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center space-x-2">
            <Car size={32} />
            <div>
              <span className="text-xl font-bold">JustCars.ng</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
