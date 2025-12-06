/**
 * Admin Dealers List Page
 * View and manage all dealers
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import DealerActions from '@/components/admin/DealerActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDealers() {
  try {
    // CRITICAL: Use service role client to bypass RLS for admin access
    const supabase = createServiceRoleClient()

    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching dealers:', error)
      // Return empty array instead of crashing
      return []
    }

    return dealers || []
  } catch (error) {
    console.error('Fatal error fetching dealers:', error)
    return []
  }
}

export default async function DealersListPage() {
  const dealers = await getDealers()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dealers</h1>
          <p className="text-gray-600 mt-2">Manage all dealers</p>
        </div>
        <Link href="/admin/dealers/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={20} />
            Add New Dealer
          </Button>
        </Link>
      </div>

      {/* Dealers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dealers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-gray-500 mb-4">No dealers found</p>
                    <Link href="/admin/dealers/new">
                      <Button variant="primary">Add Your First Dealer</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                dealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                      <div className="text-sm text-gray-500">{dealer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{dealer.phone}</div>
                      <div className="text-sm text-gray-500">WhatsApp: {dealer.whatsapp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dealer.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dealer.status === 'active' ? (
                        <Badge variant="success" size="sm">Active</Badge>
                      ) : dealer.status === 'verified' ? (
                        <Badge variant="info" size="sm">Verified</Badge>
                      ) : dealer.status === 'pending' ? (
                        <Badge variant="warning" size="sm">Pending</Badge>
                      ) : dealer.status === 'suspended' ? (
                        <Badge variant="danger" size="sm">Suspended</Badge>
                      ) : (
                        <Badge variant="default" size="sm">{dealer.status || 'Unknown'}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <DealerActions dealer={dealer} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
