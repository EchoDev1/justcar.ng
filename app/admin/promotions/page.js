'use client'

import { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PromotionsPage() {
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount: '',
    min_purchase: '0',
    start_date: '',
    end_date: '',
    max_uses: '',
    max_uses_per_user: '1',
    applies_to: 'all',
    user_type: 'all',
    is_active: true
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') console.error('Error:', error)
      setPromotions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const supabase = createClient()

      const promoData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: parseInt(formData.max_uses_per_user) || 1
      }

      if (editingPromo) {
        await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', editingPromo.id)
      } else {
        await supabase.from('promotions').insert([promoData])
      }

      setShowModal(false)
      setEditingPromo(null)
      resetForm()
      fetchPromotions()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save promotion')
    }
  }

  const handleEdit = (promo) => {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      max_discount: promo.max_discount?.toString() || '',
      min_purchase: promo.min_purchase?.toString() || '0',
      start_date: promo.start_date.split('T')[0],
      end_date: promo.end_date.split('T')[0],
      max_uses: promo.max_uses?.toString() || '',
      max_uses_per_user: promo.max_uses_per_user?.toString() || '1',
      applies_to: promo.applies_to,
      user_type: promo.user_type,
      is_active: promo.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion?')) return
    try {
      const supabase = createClient()
      await supabase.from('promotions').delete().eq('id', id)
      fetchPromotions()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleActive = async (promo) => {
    try {
      const supabase = createClient()
      await supabase
        .from('promotions')
        .update({ is_active: !promo.is_active })
        .eq('id', promo.id)
      fetchPromotions()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert('Code copied!')
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      max_discount: '',
      min_purchase: '0',
      start_date: '',
      end_date: '',
      max_uses: '',
      max_uses_per_user: '1',
      applies_to: 'all',
      user_type: 'all',
      is_active: true
    })
  }

  const generateCode = () => {
    const code = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData({ ...formData, code })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Promotions & Coupons</h1>
                <p className="text-sm sm:text-base text-gray-500">Create and manage discount codes</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setEditingPromo(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Promotion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Promotions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No promotions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-blue-600">{promo.code}</span>
                      <button onClick={() => copyCode(promo.code)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium text-gray-900 mt-1">{promo.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {promo.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    {promo.discount_type === 'percentage' ? (
                      <><Percent className="w-6 h-6 text-green-500" />{promo.discount_value}%</>
                    ) : (
                      <><DollarSign className="w-6 h-6 text-green-500" />₦{promo.discount_value.toLocaleString()}</>
                    )}
                  </div>
                  {promo.max_discount && (
                    <span className="text-sm text-gray-500">Max: ₦{promo.max_discount.toLocaleString()}</span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {promo.current_uses || 0} / {promo.max_uses || '∞'} uses
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      promo.is_active
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {promo.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(promo)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPromo ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="PROMO2024"
                  />
                </div>
                <button type="button" onClick={generateCode} className="mt-6 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                  Generate
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uses Per User</label>
                  <input
                    type="number"
                    value={formData.max_uses_per_user}
                    onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
                  <select
                    value={formData.applies_to}
                    onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All</option>
                    <option value="featured_listing">Featured Listings</option>
                    <option value="badge_subscription">Badge Subscription</option>
                    <option value="escrow_fee">Escrow Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Users</option>
                    <option value="dealers">Dealers Only</option>
                    <option value="buyers">Buyers Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingPromo(null); }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPromo ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
