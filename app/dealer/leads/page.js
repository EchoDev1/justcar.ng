'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Phone,
  Mail,
  MessageSquare,
  Car,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  TrendingUp,
  UserPlus,
  Loader2,
  ExternalLink,
  Tag
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const LEAD_STATUSES = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: UserPlus },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700', icon: Phone },
  interested: { label: 'Interested', color: 'bg-purple-100 text-purple-700', icon: Star },
  negotiating: { label: 'Negotiating', color: 'bg-orange-100 text-orange-700', icon: MessageSquare },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export default function LeadManagementPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    conversionRate: 0
  })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchDealerAndLeads()
  }, [filter])

  const fetchDealerAndLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      const supabase = createClient()

      // Fetch leads/inquiries for this dealer
      let query = supabase
        .from('car_inquiries')
        .select(`
          *,
          cars (
            id,
            title,
            make,
            model,
            year,
            price,
            images
          )
        `)
        .eq('dealer_id', dealerData.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: leadsData, error } = await query

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching leads:', error)
      }

      const allLeads = leadsData || []
      setLeads(allLeads)

      // Calculate stats
      const newLeads = allLeads.filter(l => l.status === 'new').length
      const contactedLeads = allLeads.filter(l => l.status === 'contacted').length
      const convertedLeads = allLeads.filter(l => l.status === 'converted').length

      setStats({
        total: allLeads.length,
        new: newLeads,
        contacted: contactedLeads,
        converted: convertedLeads,
        conversionRate: allLeads.length > 0 ? Math.round((convertedLeads / allLeads.length) * 100) : 0
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId, newStatus) => {
    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('car_inquiries')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('dealer_id', dealer.id)

      if (error) throw error

      fetchDealerAndLeads()
      setShowModal(false)
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Failed to update lead status')
    } finally {
      setUpdating(false)
    }
  }

  const addNote = async (leadId, note) => {
    try {
      const supabase = createClient()
      const lead = leads.find(l => l.id === leadId)
      const existingNotes = lead?.notes || []

      const { error } = await supabase
        .from('car_inquiries')
        .update({
          notes: [...existingNotes, {
            text: note,
            created_at: new Date().toISOString()
          }]
        })
        .eq('id', leadId)
        .eq('dealer_id', dealer.id)

      if (error) throw error
      fetchDealerAndLeads()
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.includes(search) ||
      lead.cars?.title?.toLowerCase().includes(search)
    )
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Lead Management
        </h1>
        <p className="text-gray-600 mt-2">
          Track and manage customer inquiries for your vehicles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">New Leads</p>
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Contacted</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Converted</p>
          <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          {Object.entries(LEAD_STATUSES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500">
              {filter !== 'all'
                ? `No leads with status "${LEAD_STATUSES[filter]?.label}"`
                : 'When customers inquire about your vehicles, they\'ll appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => {
              const status = LEAD_STATUSES[lead.status] || LEAD_STATUSES.new
              const StatusIcon = status.icon
              return (
                <div
                  key={lead.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedLead(lead)
                    setShowModal(true)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {lead.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{lead.name || 'Unknown'}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                        {lead.cars && (
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {lead.cars.year} {lead.cars.make} {lead.cars.model}
                            </span>
                            <span className="text-green-600 font-medium">
                              ₦{lead.cars.price?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {lead.message && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            "{lead.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lead.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedLead.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
                    <p className="text-gray-500">Lead #{selectedLead.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{selectedLead.email}</span>
                    </a>
                  )}
                  {selectedLead.phone && (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{selectedLead.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Vehicle Interest */}
              {selectedLead.cars && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Vehicle Interest</h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {selectedLead.cars.images?.[0] && (
                      <img
                        src={selectedLead.cars.images[0]}
                        alt={selectedLead.cars.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedLead.cars.year} {selectedLead.cars.make} {selectedLead.cars.model}
                      </p>
                      <p className="text-green-600 font-bold">
                        ₦{selectedLead.cars.price?.toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={`/cars/${selectedLead.cars.id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                  <p className="p-4 bg-blue-50 rounded-lg text-gray-700 italic">
                    "{selectedLead.message}"
                  </p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(LEAD_STATUSES).map(([key, value]) => {
                    const StatusIcon = value.icon
                    const isActive = selectedLead.status === key
                    return (
                      <button
                        key={key}
                        onClick={() => updateLeadStatus(selectedLead.id, key)}
                        disabled={updating || isActive}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? value.color + ' ring-2 ring-offset-2 ring-blue-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {value.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-500">
                      Created {new Date(selectedLead.created_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedLead.updated_at && selectedLead.updated_at !== selectedLead.created_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-500">
                        Updated {new Date(selectedLead.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
