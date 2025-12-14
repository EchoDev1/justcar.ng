/**
 * Block/Unblock Car Button Component
 * Allows admin to block/unblock cars for moderation
 */

'use client'

import { useState } from 'react'
import { Ban, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BlockCarButton({ carId, isBlocked }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggleBlock = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(isBlocked ? 'Are you sure you want to unblock this car?' : 'Are you sure you want to block this car?')) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cars')
        .update({ is_blocked: !isBlocked })
        .eq('id', carId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error toggling block status:', error)
      alert('Failed to update car status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleBlock}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isBlocked
          ? 'text-green-600 hover:bg-green-50'
          : 'text-red-600 hover:bg-red-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isBlocked ? 'Unblock Car' : 'Block Car'}
    >
      {loading ? (
        <div className="w-[18px] h-[18px] border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : isBlocked ? (
        <ShieldCheck size={18} />
      ) : (
        <Ban size={18} />
      )}
    </button>
  )
}
