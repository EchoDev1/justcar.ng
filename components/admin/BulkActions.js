'use client'

import { useState } from 'react'
import {
  CheckSquare,
  Square,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  AlertTriangle
} from 'lucide-react'

export default function BulkActions({
  items,
  selectedIds,
  onSelectAll,
  onSelectItem,
  onAction,
  entityType = 'item',
  actions = ['approve', 'suspend', 'delete']
}) {
  const [loading, setLoading] = useState(null)
  const [showConfirm, setShowConfirm] = useState(null)

  const allSelected = items.length > 0 && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length

  const handleAction = async (action) => {
    if (selectedIds.length === 0) {
      alert(`Please select at least one ${entityType}`)
      return
    }

    setShowConfirm(null)
    setLoading(action)

    try {
      await onAction(action, selectedIds)
    } finally {
      setLoading(null)
    }
  }

  const actionButtons = {
    approve: {
      label: 'Approve',
      icon: CheckCircle,
      color: 'bg-green-600 hover:bg-green-700',
      confirmMessage: `Are you sure you want to approve ${selectedIds.length} ${entityType}(s)?`
    },
    suspend: {
      label: 'Suspend',
      icon: Ban,
      color: 'bg-orange-600 hover:bg-orange-700',
      confirmMessage: `Are you sure you want to suspend ${selectedIds.length} ${entityType}(s)?`
    },
    activate: {
      label: 'Activate',
      icon: CheckCircle,
      color: 'bg-green-600 hover:bg-green-700',
      confirmMessage: `Are you sure you want to activate ${selectedIds.length} ${entityType}(s)?`
    },
    delete: {
      label: 'Delete',
      icon: Trash2,
      color: 'bg-red-600 hover:bg-red-700',
      confirmMessage: `Are you sure you want to delete ${selectedIds.length} ${entityType}(s)? This cannot be undone.`
    },
    verify: {
      label: 'Verify',
      icon: CheckCircle,
      color: 'bg-blue-600 hover:bg-blue-700',
      confirmMessage: `Are you sure you want to verify ${selectedIds.length} ${entityType}(s)?`
    },
    reject: {
      label: 'Reject',
      icon: XCircle,
      color: 'bg-red-600 hover:bg-red-700',
      confirmMessage: `Are you sure you want to reject ${selectedIds.length} ${entityType}(s)?`
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          <button
            onClick={onSelectAll}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : someSelected ? (
              <div className="w-5 h-5 border-2 border-blue-600 rounded flex items-center justify-center bg-blue-600">
                <div className="w-2 h-0.5 bg-white" />
              </div>
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : 'Select all'}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const config = actionButtons[action]
              if (!config) return null

              const Icon = config.icon
              return (
                <button
                  key={action}
                  onClick={() => setShowConfirm(action)}
                  disabled={loading !== null}
                  className={`flex items-center gap-2 px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${config.color}`}
                >
                  {loading === action ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {config.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
            </div>

            <p className="text-gray-600 mb-6">
              {actionButtons[showConfirm]?.confirmMessage}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showConfirm)}
                className={`flex-1 py-2 text-white rounded-lg ${actionButtons[showConfirm]?.color}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Checkbox component for table rows
export function BulkSelectCheckbox({ checked, onChange }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className="p-1"
    >
      {checked ? (
        <CheckSquare className="w-5 h-5 text-blue-600" />
      ) : (
        <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
      )}
    </button>
  )
}
