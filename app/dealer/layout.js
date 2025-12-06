/**
 * Dealer Layout
 * Protected layout with authentication and sidebar
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import DealerSidebar from '@/components/dealer/Sidebar'

export default function DealerLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  // Public paths that don't require authentication
  const publicPaths = ['/dealer/login', '/dealer/register', '/dealer/setup', '/dealer/verify-email', '/dealer/forgot-password']
  const isPublicPath = publicPaths.includes(pathname)

  const [loading, setLoading] = useState(!isPublicPath) // Don't show loading for public pages
  const [dealer, setDealer] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      // If on public path, no need to check authentication
      if (isPublicPath) {
        setLoading(false)
        return
      }

      // Check authentication via custom session cookie
      const response = await fetch('/api/dealer/me', {
        credentials: 'include',
        cache: 'no-store'
      })

      if (!response.ok) {
        // Not authenticated - redirect to login
        router.push('/dealer/login')
        setLoading(false)
        return
      }

      const { dealer: dealerData } = await response.json()

      if (!dealerData) {
        router.push('/dealer/login')
        setLoading(false)
        return
      }

      setDealer(dealerData)
      setLoading(false)

    } catch (error) {
      console.error('Auth check error:', error)
      if (!isPublicPath) {
        router.push('/dealer/login')
      }
      setLoading(false)
    }
  }

  // Show loading for protected routes
  if (loading && !isPublicPath) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading dealer portal...</p>
        </div>
      </div>
    )
  }

  // Public pages (login, setup) without sidebar
  if (isPublicPath) {
    return <>{children}</>
  }

  // Protected pages with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DealerSidebar dealer={dealer} />
      <main className="flex-1 overflow-x-hidden w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
