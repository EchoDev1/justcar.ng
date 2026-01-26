'use client'

import { useState, useEffect } from 'react'
import {
  ScrollText,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Eye,
  Download,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ACTION_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'car', label: 'Cars' },
  { value: 'dealer', label: 'Dealers' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'escrow', label: 'Escrow' },
  { value: 'settings', label: 'Settings' },
  { value: 'auth', label: 'Authentication' }
]

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 50

  useEffect(() => {
    fetchLogs()
  }, [categoryFilter, dateRange, page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      let query = supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

      if (categoryFilter !== 'all') {
        query = query.eq('action_category', categoryFilter)
      }

      const { data, error, count } = await query

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching logs:', error)
      }

      setLogs(data || [])
      setTotalPages(Math.ceil((count || 0) / perPage))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = () => {
    const csv = [
      ['Date', 'Admin', 'Action', 'Category', 'Entity', 'Description'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.admin_email || 'System',
        log.action_type,
        log.action_category,
        `${log.entity_type || ''} ${log.entity_id || ''}`,
        `"${(log.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getActionColor = (action) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-700'
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-700'
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-700'
    if (action.includes('ban') || action.includes('suspend')) return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-700'
  }

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      log.description?.toLowerCase().includes(query) ||
      log.admin_email?.toLowerCase().includes(query) ||
      log.action_type?.toLowerCase().includes(query) ||
      log.entity_name?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ScrollText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-sm sm:text-base text-gray-500">Track all admin actions and system events</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchLogs}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ACTION_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">{log.admin_email || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-gray-700">{log.entity_type || '-'}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[150px]">{log.entity_name || log.entity_id?.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700 truncate max-w-xs">{log.description}</p>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-medium text-sm sm:text-base">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admin</p>
                  <p className="font-medium text-sm sm:text-base break-all">{selectedLog.admin_email || 'System'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Action</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action_type)}`}>
                    {selectedLog.action_type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedLog.action_category}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{selectedLog.description}</p>
              </div>

              {selectedLog.entity_type && (
                <div>
                  <p className="text-sm text-gray-500">Entity</p>
                  <p className="text-gray-700">
                    {selectedLog.entity_type}: {selectedLog.entity_name || selectedLog.entity_id}
                  </p>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <p className="text-sm text-gray-500">Previous Values</p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <p className="text-sm text-gray-500">New Values</p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.ip_address && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedLog(null)}
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
