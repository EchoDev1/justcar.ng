/**
 * Admin Dealer Permissions Page
 * Manage dealer access to premium features
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Check, X, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function DealerPermissionsPage() {
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDealer, setEditingDealer] = useState(null)
  const [permissionsForm, setPermissionsForm] = useState({
    can_upload_premium_verified: false,
    can_upload_just_arrived: false,
    can_upload_featured: false,
    premium_verified_limit: 0,
    just_arrived_limit: 0,
    featured_limit: 0
  })

  useEffect(() => {
    fetchDealersWithPermissions()
  }, [])

  const fetchDealersWithPermissions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch dealers with their permissions
      const { data: dealersData, error: dealersError } = await supabase
        .from('dealers')
        .select(`
          *,
          dealer_permissions (
            id,
            can_upload_premium_verified,
            can_upload_just_arrived,
            can_upload_featured,
            premium_verified_limit,
            just_arrived_limit,
            featured_limit
          )
        `)
        .order('name')

      if (dealersError) throw dealersError

      // Get car counts for each dealer
      const dealersWithCounts = await Promise.all(
        (dealersData || []).map(async (dealer) => {
          const { count: premiumCount } = await supabase
            .from('cars')
            .select('id', { count: 'exact', head: true })
            .eq('dealer_id', dealer.id)
            .eq('is_premium_verified', true)

          const { count: justArrivedCount } = await supabase
            .from('cars')
            .select('id', { count: 'exact', head: true })
            .eq('dealer_id', dealer.id)
            .eq('is_just_arrived', true)

          const { count: featuredCount } = await supabase
            .from('cars')
            .select('id', { count: 'exact', head: true })
            .eq('dealer_id', dealer.id)
            .eq('is_featured', true)

          return {
            ...dealer,
            premium_count: premiumCount || 0,
            just_arrived_count: justArrivedCount || 0,
            featured_count: featuredCount || 0
          }
        })
      )

      setDealers(dealersWithCounts)
    } catch (error) {
      console.error('Error fetching dealers:', error)
      alert('Error loading dealers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPermissions = (dealer) => {
    setEditingDealer(dealer)
    const permissions = dealer.dealer_permissions?.[0] || {}
    setPermissionsForm({
      can_upload_premium_verified: permissions.can_upload_premium_verified || false,
      can_upload_just_arrived: permissions.can_upload_just_arrived || false,
      can_upload_featured: permissions.can_upload_featured || false,
      premium_verified_limit: permissions.premium_verified_limit || 0,
      just_arrived_limit: permissions.just_arrived_limit || 0,
      featured_limit: permissions.featured_limit || 0
    })
  }

  const handleSavePermissions = async () => {
    if (!editingDealer) return

    try {
      const supabase = createClient()

      const existingPermission = editingDealer.dealer_permissions?.[0]

      if (existingPermission) {
        // Update existing permissions
        const { error } = await supabase
          .from('dealer_permissions')
          .update(permissionsForm)
          .eq('dealer_id', editingDealer.id)

        if (error) throw error
      } else {
        // Insert new permissions
        const { error } = await supabase
          .from('dealer_permissions')
          .insert([{
            dealer_id: editingDealer.id,
            ...permissionsForm
          }])

        if (error) throw error
      }

      alert('Permissions updated successfully!')
      setEditingDealer(null)
      fetchDealersWithPermissions()
    } catch (error) {
      console.error('Error saving permissions:', error)
      alert('Error saving permissions: ' + error.message)
    }
  }

  const handleRevokeAllPermissions = async (dealer) => {
    if (!confirm(`Revoke all permissions for ${dealer.name}?`)) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('dealer_permissions')
        .update({
          can_upload_premium_verified: false,
          can_upload_just_arrived: false,
          can_upload_featured: false,
          premium_verified_limit: 0,
          just_arrived_limit: 0,
          featured_limit: 0
        })
        .eq('dealer_id', dealer.id)

      if (error) throw error

      alert('Permissions revoked successfully!')
      fetchDealersWithPermissions()
    } catch (error) {
      console.error('Error revoking permissions:', error)
      alert('Error revoking permissions: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dealer permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dealer Permissions</h1>
        <p className="text-gray-600 mt-2">
          Grant or revoke dealer access to premium features
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex">
          <Shield className="text-blue-500 mr-3" size={24} />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Permission Management</h3>
            <p className="text-sm text-blue-700 mt-1">
              Control which dealers can add cars to Premium Verified Collection, Just Arrived section,
              and Featured listings. Set limits to control the number of cars per section.
            </p>
          </div>
        </div>
      </div>

      {/* Dealers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Just Arrived
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dealers.map((dealer) => {
                const permissions = dealer.dealer_permissions?.[0] || {}

                return (
                  <tr key={dealer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                      <div className="text-sm text-gray-500">{dealer.email}</div>
                      {dealer.is_verified && (
                        <Badge variant="success" size="sm" className="mt-1">Verified</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {permissions.can_upload_premium_verified ? (
                        <div>
                          <div className="flex items-center text-green-600">
                            <Check size={16} className="mr-1" />
                            <span className="text-sm font-medium">Enabled</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {dealer.premium_count} / {permissions.premium_verified_limit || '∞'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <X size={16} className="mr-1" />
                          <span className="text-sm">No Access</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {permissions.can_upload_just_arrived ? (
                        <div>
                          <div className="flex items-center text-green-600">
                            <Check size={16} className="mr-1" />
                            <span className="text-sm font-medium">Enabled</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {dealer.just_arrived_count} / {permissions.just_arrived_limit || '∞'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <X size={16} className="mr-1" />
                          <span className="text-sm">No Access</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {permissions.can_upload_featured ? (
                        <div>
                          <div className="flex items-center text-green-600">
                            <Check size={16} className="mr-1" />
                            <span className="text-sm font-medium">Enabled</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {dealer.featured_count} / {permissions.featured_limit || '∞'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <X size={16} className="mr-1" />
                          <span className="text-sm">No Access</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditPermissions(dealer)}
                        >
                          <Settings size={16} className="mr-1" />
                          Manage
                        </Button>
                        {(permissions.can_upload_premium_verified ||
                          permissions.can_upload_just_arrived ||
                          permissions.can_upload_featured) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeAllPermissions(dealer)}
                          >
                            Revoke All
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {editingDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Manage Permissions: {editingDealer.name}
            </h2>

            <div className="space-y-6">
              {/* Premium Verified */}
              <div className="border-b border-gray-200 pb-4">
                <label className="flex items-center space-x-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={permissionsForm.can_upload_premium_verified}
                    onChange={(e) => setPermissionsForm({
                      ...permissionsForm,
                      can_upload_premium_verified: e.target.checked
                    })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Premium Verified Collection
                    </span>
                    <p className="text-xs text-gray-500">
                      Allow dealer to add cars to premium verified collection
                    </p>
                  </div>
                </label>
                {permissionsForm.can_upload_premium_verified && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={permissionsForm.premium_verified_limit}
                      onChange={(e) => setPermissionsForm({
                        ...permissionsForm,
                        premium_verified_limit: parseInt(e.target.value) || 0
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Just Arrived */}
              <div className="border-b border-gray-200 pb-4">
                <label className="flex items-center space-x-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={permissionsForm.can_upload_just_arrived}
                    onChange={(e) => setPermissionsForm({
                      ...permissionsForm,
                      can_upload_just_arrived: e.target.checked
                    })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Just Arrived Section
                    </span>
                    <p className="text-xs text-gray-500">
                      Allow dealer to add cars to just arrived section
                    </p>
                  </div>
                </label>
                {permissionsForm.can_upload_just_arrived && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={permissionsForm.just_arrived_limit}
                      onChange={(e) => setPermissionsForm({
                        ...permissionsForm,
                        just_arrived_limit: parseInt(e.target.value) || 0
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>

              {/* Featured */}
              <div className="pb-4">
                <label className="flex items-center space-x-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={permissionsForm.can_upload_featured}
                    onChange={(e) => setPermissionsForm({
                      ...permissionsForm,
                      can_upload_featured: e.target.checked
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Featured Listings
                    </span>
                    <p className="text-xs text-gray-500">
                      Allow dealer to feature cars
                    </p>
                  </div>
                </label>
                {permissionsForm.can_upload_featured && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={permissionsForm.featured_limit}
                      onChange={(e) => setPermissionsForm({
                        ...permissionsForm,
                        featured_limit: parseInt(e.target.value) || 0
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingDealer(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePermissions}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
