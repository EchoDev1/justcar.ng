'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Send,
  Users,
  User,
  Mail,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationCenterPage() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0
  })

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    title: '',
    message: '',
    recipientType: 'all', // all, dealers, buyers, specific
    specificRecipients: [],
    channels: ['email'], // email, push, sms
    scheduledAt: ''
  })

  const [recipients, setRecipients] = useState({ dealers: [], buyers: [] })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchNotifications()
    fetchRecipients()
  }, [filter])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.limit(100)

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notifications:', error)
      }

      setNotifications(data || [])

      // Calculate stats
      const { data: allNotifications } = await supabase
        .from('admin_notifications')
        .select('status')

      if (allNotifications) {
        setStats({
          total: allNotifications.length,
          sent: allNotifications.filter(n => n.status === 'sent').length,
          pending: allNotifications.filter(n => n.status === 'pending' || n.status === 'scheduled').length,
          failed: allNotifications.filter(n => n.status === 'failed').length
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      const supabase = createClient()

      const [dealersResult, buyersResult] = await Promise.all([
        supabase.from('dealers').select('id, name, email, status').eq('status', 'active'),
        supabase.from('buyers').select('id, full_name, email').eq('is_banned', false)
      ])

      setRecipients({
        dealers: dealersResult.data || [],
        buyers: buyersResult.data || []
      })
    } catch (error) {
      console.error('Error fetching recipients:', error)
    }
  }

  const handleSendNotification = async () => {
    if (!composeForm.title || !composeForm.message) {
      alert('Please fill in title and message')
      return
    }

    setSending(true)
    try {
      const supabase = createClient()

      // Determine recipient count
      let recipientCount = 0
      let recipientEmails = []

      if (composeForm.recipientType === 'all') {
        recipientCount = recipients.dealers.length + recipients.buyers.length
        recipientEmails = [
          ...recipients.dealers.map(d => d.email),
          ...recipients.buyers.map(b => b.email)
        ]
      } else if (composeForm.recipientType === 'dealers') {
        recipientCount = recipients.dealers.length
        recipientEmails = recipients.dealers.map(d => d.email)
      } else if (composeForm.recipientType === 'buyers') {
        recipientCount = recipients.buyers.length
        recipientEmails = recipients.buyers.map(b => b.email)
      } else if (composeForm.recipientType === 'specific') {
        recipientCount = composeForm.specificRecipients.length
        recipientEmails = composeForm.specificRecipients
      }

      // Save notification record
      const { data: notification, error: insertError } = await supabase
        .from('admin_notifications')
        .insert([{
          title: composeForm.title,
          message: composeForm.message,
          recipient_type: composeForm.recipientType,
          recipient_count: recipientCount,
          channels: composeForm.channels,
          status: composeForm.scheduledAt ? 'scheduled' : 'pending',
          scheduled_at: composeForm.scheduledAt || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Send emails via API
      if (composeForm.channels.includes('email') && !composeForm.scheduledAt) {
        const response = await fetch('/api/admin/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: notification.id,
            title: composeForm.title,
            message: composeForm.message,
            emails: recipientEmails
          })
        })

        if (response.ok) {
          await supabase
            .from('admin_notifications')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', notification.id)
        } else {
          await supabase
            .from('admin_notifications')
            .update({ status: 'failed' })
            .eq('id', notification.id)
        }
      }

      setShowComposeModal(false)
      setComposeForm({
        title: '',
        message: '',
        recipientType: 'all',
        specificRecipients: [],
        channels: ['email'],
        scheduledAt: ''
      })
      fetchNotifications()

    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteNotification = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    try {
      const supabase = createClient()
      await supabase.from('admin_notifications').delete().eq('id', id)
      fetchNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Sent</span>
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
      case 'scheduled':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Scheduled</span>
      case 'failed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Failed</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const getRecipientLabel = (type) => {
    switch (type) {
      case 'all': return 'All Users'
      case 'dealers': return 'All Dealers'
      case 'buyers': return 'All Buyers'
      case 'specific': return 'Specific Users'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notification Center</h1>
                <p className="text-sm sm:text-base text-gray-500">Send notifications to dealers and buyers</p>
              </div>
            </div>
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Send Notification
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Sent</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                <p className="text-sm text-gray-500">Delivered</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending/Scheduled</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium text-sm sm:text-base">{recipients.dealers.length} Active Dealers</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-blue-300" />
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium text-sm sm:text-base">{recipients.buyers.length} Active Buyers</span>
              </div>
            </div>
            <button
              onClick={fetchRecipients}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm text-gray-500 w-full sm:w-auto">Filter:</span>
            {['all', 'sent', 'pending', 'scheduled', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications sent yet</p>
              <button
                onClick={() => setShowComposeModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send First Notification
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channels</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-700">{getRecipientLabel(notification.recipient_type)}</p>
                        <p className="text-xs text-gray-500">{notification.recipient_count || 0} recipients</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {(notification.channels || ['email']).map((channel) => (
                          <span key={channel} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedNotification(notification)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
                  <p className="text-sm text-gray-500">Compose and send to dealers or buyers</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notification title"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your message here..."
                />
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Users', count: recipients.dealers.length + recipients.buyers.length },
                    { value: 'dealers', label: 'All Dealers', count: recipients.dealers.length },
                    { value: 'buyers', label: 'All Buyers', count: recipients.buyers.length },
                    { value: 'specific', label: 'Specific Users', count: null }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setComposeForm({ ...composeForm, recipientType: option.value })}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        composeForm.recipientType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{option.label}</p>
                      {option.count !== null && (
                        <p className="text-sm text-gray-500">{option.count} recipients</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific recipients selector */}
              {composeForm.recipientType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Recipients</label>
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {[...recipients.dealers, ...recipients.buyers]
                      .filter(r => (r.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 20)
                      .map((recipient) => (
                        <label
                          key={recipient.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={composeForm.specificRecipients.includes(recipient.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setComposeForm({
                                  ...composeForm,
                                  specificRecipients: [...composeForm.specificRecipients, recipient.email]
                                })
                              } else {
                                setComposeForm({
                                  ...composeForm,
                                  specificRecipients: composeForm.specificRecipients.filter(e => e !== recipient.email)
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{recipient.name || recipient.full_name}</span>
                          <span className="text-xs text-gray-500">{recipient.email}</span>
                        </label>
                      ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {composeForm.specificRecipients.length} selected
                  </p>
                </div>
              )}

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                <div className="flex gap-3">
                  {[
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'push', label: 'Push', icon: Smartphone }
                  ].map((channel) => (
                    <label
                      key={channel.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                        composeForm.channels.includes(channel.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={composeForm.channels.includes(channel.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setComposeForm({
                              ...composeForm,
                              channels: [...composeForm.channels, channel.value]
                            })
                          } else {
                            setComposeForm({
                              ...composeForm,
                              channels: composeForm.channels.filter(c => c !== channel.value)
                            })
                          }
                        }}
                        className="hidden"
                      />
                      <channel.icon className="w-4 h-4" />
                      {channel.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={composeForm.scheduledAt}
                  onChange={(e) => setComposeForm({ ...composeForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sending || !composeForm.title || !composeForm.message}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {composeForm.scheduledAt ? 'Schedule' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Notification Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
                {getStatusBadge(selectedNotification.status)}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{selectedNotification.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <p className="text-gray-700">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Recipients</p>
                  <p className="text-gray-700">{getRecipientLabel(selectedNotification.recipient_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Count</p>
                  <p className="text-gray-700">{selectedNotification.recipient_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-gray-700">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sent At</p>
                  <p className="text-gray-700">
                    {selectedNotification.sent_at
                      ? new Date(selectedNotification.sent_at).toLocaleString()
                      : 'Not sent yet'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
