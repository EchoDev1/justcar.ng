'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Key,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  Crown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ROLES = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', description: 'Full access to all features' },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700', description: 'Manage inventory and leads' },
  staff: { label: 'Staff', color: 'bg-gray-100 text-gray-700', description: 'View and respond to leads' }
}

const PERMISSIONS = [
  { key: 'view_inventory', label: 'View Inventory', description: 'Can view all car listings' },
  { key: 'edit_inventory', label: 'Edit Inventory', description: 'Can add, edit, and delete car listings' },
  { key: 'manage_leads', label: 'Manage Leads', description: 'Can view and respond to customer inquiries' },
  { key: 'view_analytics', label: 'View Analytics', description: 'Access to reports and analytics' },
  { key: 'manage_settings', label: 'Manage Settings', description: 'Can change dealership settings' }
]

export default function StaffManagementPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [staff, setStaff] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    permissions: {
      view_inventory: true,
      edit_inventory: false,
      manage_leads: true,
      view_analytics: false,
      manage_settings: false
    }
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('dealer_staff')
        .select('*')
        .eq('dealer_id', dealerData.id)
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching staff:', error)
      }

      setStaff(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()

      const staffData = {
        dealer_id: dealer.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        permissions: formData.permissions,
        is_active: true
      }

      if (editingStaff) {
        const { error } = await supabase
          .from('dealer_staff')
          .update(staffData)
          .eq('id', editingStaff.id)
          .eq('dealer_id', dealer.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('dealer_staff')
          .insert([staffData])

        if (error) throw error
      }

      setShowModal(false)
      setEditingStaff(null)
      resetForm()
      fetchStaff()
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Failed to save staff member: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (member) => {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      permissions: member.permissions || {}
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    try {
      const supabase = createClient()
      await supabase
        .from('dealer_staff')
        .delete()
        .eq('id', id)
        .eq('dealer_id', dealer.id)

      fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }

  const toggleActive = async (member) => {
    try {
      const supabase = createClient()
      await supabase
        .from('dealer_staff')
        .update({ is_active: !member.is_active })
        .eq('id', member.id)
        .eq('dealer_id', dealer.id)

      fetchStaff()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'staff',
      permissions: {
        view_inventory: true,
        edit_inventory: false,
        manage_leads: true,
        view_analytics: false,
        manage_settings: false
      }
    })
  }

  const handleRoleChange = (role) => {
    let permissions = { ...formData.permissions }

    if (role === 'admin') {
      permissions = {
        view_inventory: true,
        edit_inventory: true,
        manage_leads: true,
        view_analytics: true,
        manage_settings: true
      }
    } else if (role === 'manager') {
      permissions = {
        view_inventory: true,
        edit_inventory: true,
        manage_leads: true,
        view_analytics: true,
        manage_settings: false
      }
    } else {
      permissions = {
        view_inventory: true,
        edit_inventory: false,
        manage_leads: true,
        view_analytics: false,
        manage_settings: false
      }
    }

    setFormData({ ...formData, role, permissions })
  }

  const filteredStaff = staff.filter(member => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      member.name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 sm:w-8 h-7 sm:h-8 text-blue-600 flex-shrink-0" />
            Staff Accounts
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Manage team members and their access permissions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingStaff(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {staff.filter(s => s.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-3xl font-bold text-purple-600">
                {staff.filter(s => s.role === 'admin').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
            <p className="text-gray-500 mb-4">
              Add team members to help manage your dealership
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Staff Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStaff.map((member) => {
              const role = ROLES[member.role] || ROLES.staff
              return (
                <div key={member.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      member.is_active ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                          {role.label}
                        </span>
                        {!member.is_active && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </span>
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {Object.entries(member.permissions || {}).map(([key, value]) => {
                          if (!value) return null
                          const perm = PERMISSIONS.find(p => p.key === key)
                          return (
                            <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {perm?.label || key}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(member)}
                      className={`p-2 rounded-lg ${
                        member.is_active
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={member.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {member.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="+234..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(ROLES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRoleChange(key)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.role === key
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${value.color}`}>
                        {value.label}
                      </span>
                      <p className="text-xs text-gray-500">{value.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                  {PERMISSIONS.map((perm) => (
                    <label key={perm.key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions[perm.key] || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, [perm.key]: e.target.checked }
                        })}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{perm.label}</p>
                        <p className="text-xs text-gray-500">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingStaff(null)
                    resetForm()
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingStaff ? 'Update' : 'Add Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
