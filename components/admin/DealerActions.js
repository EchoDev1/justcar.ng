/**
 * Dealer Actions Component
 * Admin actions for dealer management (verify, suspend, etc.)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Copy, Edit, Trash2, Ban, Play } from 'lucide-react'
import Link from 'next/link'

export default function DealerActions({ dealer }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSetupLink, setShowSetupLink] = useState(false)
  const [setupLink, setSetupLink] = useState('')

  const handleApproveDealer = async () => {
    if (!confirm(`Approve dealer "${dealer.business_name || dealer.name}"?\n\nThis will activate their account and allow them to login immediately.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/approve-dealer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealerId: dealer.id,
          notes: 'Approved by admin'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve dealer')
      }

      alert(`✅ Dealer approved successfully!\n\n${dealer.business_name || dealer.name} can now login to their account.`)

      // Refresh the page to show updated status
      router.refresh()

    } catch (error) {
      console.error('Error approving dealer:', error)
      alert('Error approving dealer: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Removed - no longer need setup links!

  return (
    <div className="flex items-center gap-2">
      {/* Approve Button (for pending dealers) */}
      {dealer.status === 'pending' && (
        <button
          onClick={handleApproveDealer}
          disabled={loading}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          title="Approve Dealer"
        >
          <CheckCircle size={14} />
          {loading ? 'Approving...' : 'Approve'}
        </button>
      )}

      {/* Suspend/Reactivate Button */}
      {(dealer.status === 'active' || dealer.status === 'suspended') && (
        <button
          onClick={() => alert('Suspend/Reactivate functionality coming soon')}
          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
            dealer.status === 'active'
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          title={dealer.status === 'active' ? 'Suspend Dealer' : 'Reactivate Dealer'}
        >
          {dealer.status === 'active' ? (
            <>
              <Ban size={14} />
              Suspend
            </>
          ) : (
            <>
              <Play size={14} />
              Reactivate
            </>
          )}
        </button>
      )}

      {/* Edit Button */}
      <Link
        href={`/admin/dealers/${dealer.id}/edit`}
        className="text-blue-600 hover:text-blue-900"
        title="Edit"
      >
        <Edit size={18} />
      </Link>

      {/* Delete Button */}
      <button
        onClick={() => alert('Delete functionality coming soon')}
        className="text-red-600 hover:text-red-900"
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
