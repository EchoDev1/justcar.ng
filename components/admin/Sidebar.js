/**
 * Admin Sidebar Navigation
 * Provides navigation for admin panel
 */

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Car, Home, Users, LogOut, Plus, List, Star, Clock, Shield, DollarSign, MessageSquare, ClipboardCheck, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/cars', label: 'All Cars', icon: List },
    { href: '/admin/cars/new', label: 'Add New Car', icon: Plus },
    { href: '/admin/premium-verified', label: 'Premium Verified', icon: Star },
    { href: '/admin/just-arrived', label: 'Just Arrived', icon: Clock },
    { href: '/admin/dealers', label: 'Dealers', icon: Users },
    { href: '/admin/dealer-permissions', label: 'Permissions', icon: Shield },
    { href: '/admin/escrow', label: 'Escrow Management', icon: DollarSign },
    { href: '/admin/payment-accounts', label: 'Payment Accounts', icon: Settings },
    { href: '/admin/chats', label: 'Chats', icon: MessageSquare },
    { href: '/admin/inspections', label: 'Inspections', icon: ClipboardCheck },
  ]

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()

      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      router.push('/admin/login')
      router.refresh()
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
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
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
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
  )
}
