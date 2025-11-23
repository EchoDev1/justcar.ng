/**
 * Admin Layout
 * Wraps all admin pages with sidebar navigation
 */

import Sidebar from '@/components/admin/Sidebar'

export const metadata = {
  title: 'Admin Panel | JustCars.ng',
  description: 'Manage your car marketplace'
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
