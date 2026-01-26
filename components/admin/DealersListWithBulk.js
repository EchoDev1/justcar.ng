'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import DealerActions from '@/components/admin/DealerActions'
import BulkActions, { BulkSelectCheckbox } from '@/components/admin/BulkActions'
import { createClient } from '@/lib/supabase/client'

export default function DealersListWithBulk({ initialDealers }) {
  const router = useRouter()
  const [dealers, setDealers] = useState(initialDealers)
  const [selectedIds, setSelectedIds] = useState([])

  const handleSelectAll = () => {
    if (selectedIds.length === dealers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(dealers.map(d => d.id))
    }
  }

  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkAction = async (action, ids) => {
    const supabase = createClient()

    try {
      switch (action) {
        case 'approve':
          await supabase
            .from('dealers')
            .update({ status: 'active', is_verified: true })
            .in('id', ids)
          break

        case 'suspend':
          await supabase
            .from('dealers')
            .update({ status: 'suspended' })
            .in('id', ids)
          break

        case 'activate':
          await supabase
            .from('dealers')
            .update({ status: 'active' })
            .in('id', ids)
          break

        case 'delete':
          await supabase
            .from('dealers')
            .delete()
            .in('id', ids)
          break
      }

      // Refresh the page to get updated data
      setSelectedIds([])
      router.refresh()
    } catch (error) {
      console.error('Bulk action error:', error)
      alert('Failed to perform bulk action: ' + error.message)
    }
  }

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

      {/* Bulk Actions Bar */}
      {dealers.length > 0 && (
        <BulkActions
          items={dealers}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onAction={handleBulkAction}
          entityType="dealer"
          actions={['approve', 'suspend', 'activate', 'delete']}
        />
      )}

      {/* Dealers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <BulkSelectCheckbox
                    checked={dealers.length > 0 && selectedIds.length === dealers.length}
                    onChange={handleSelectAll}
                  />
                </th>
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-500 mb-4">No dealers found</p>
                    <Link href="/admin/dealers/new">
                      <Button variant="primary">Add Your First Dealer</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                dealers.map((dealer) => (
                  <tr key={dealer.id} className={`hover:bg-gray-50 ${selectedIds.includes(dealer.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4">
                      <BulkSelectCheckbox
                        checked={selectedIds.includes(dealer.id)}
                        onChange={() => handleSelectItem(dealer.id)}
                      />
                    </td>
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
