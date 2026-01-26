'use client'

import { useState, useEffect } from 'react'
import {
  Ticket,
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Loader2,
  RefreshCw,
  Send
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['general', 'payment', 'escrow', 'verification', 'listing', 'account', 'technical', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['open', 'in_progress', 'waiting_response', 'resolved', 'closed']

export default function SupportTicketsPage() {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState('open')
  const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0 })

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.limit(100)

      if (error && error.code !== 'PGRST116') {
        console.error('Error:', error)
      }

      setTickets(data || [])

      // Get stats
      const { data: allTickets } = await supabase.from('support_tickets').select('status')
      if (allTickets) {
        setStats({
          open: allTickets.filter(t => t.status === 'open').length,
          in_progress: allTickets.filter(t => t.status === 'in_progress').length,
          resolved: allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (ticketId) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('support_ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      setReplies(data || [])
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket)
    await fetchReplies(ticket.id)
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return

    try {
      const supabase = createClient()

      await supabase.from('support_ticket_replies').insert([{
        ticket_id: selectedTicket.id,
        sender_type: 'admin',
        message: replyText,
        created_at: new Date().toISOString()
      }])

      // Update ticket status
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', selectedTicket.id)

      setReplyText('')
      await fetchReplies(selectedTicket.id)
      fetchTickets()
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const supabase = createClient()
      await supabase
        .from('support_tickets')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'waiting_response': return 'bg-purple-100 text-purple-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Tickets</h1>
                <p className="text-sm sm:text-base text-gray-500">Manage customer support requests</p>
              </div>
            </div>
            <button onClick={fetchTickets} className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                <p className="text-sm text-gray-500">Open Tickets</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                <p className="text-sm text-gray-500">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', ...STATUSES].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  filter === status ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Tickets</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No tickets found</div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-500">{ticket.ticket_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.submitter_email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{selectedTicket.ticket_number}</p>
                      <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
                      <p className="text-sm text-gray-500">{selectedTicket.submitter_email}</p>
                    </div>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Category: {selectedTicket.category}</span>
                    <span>Priority: {selectedTicket.priority}</span>
                  </div>
                </div>

                {/* Replies */}
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3 rounded-lg ${
                        reply.sender_type === 'admin' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {reply.sender_type === 'admin' ? 'Admin' : 'User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(reply.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
