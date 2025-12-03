/**
 * Admin Layout
 * Wraps all admin pages with sidebar navigation and authentication protection
 */

import Sidebar from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/supabase/auth-utils'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Admin Panel | JustCars.ng',
  description: 'Manage your car marketplace'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
}

export default async function AdminLayout({ children }) {
  // Get the current pathname
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Don't check authentication for login page to prevent redirect loop
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  if (!isLoginPage) {
    // Check admin authentication only for non-login pages
    const supabase = await createClient()
    const admin = await getAdminUser(supabase)

    // If not an admin, redirect to admin login
    if (!admin) {
      redirect('/admin/login')
    }

    // Render with sidebar for authenticated admin pages
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    )
  }

  // For login page, render without sidebar
  return children
}
