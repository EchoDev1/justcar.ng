/**
 * Toast Notification Component
 * Reusable toast with multiple variants
 */

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function Toast({
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    const showTimer = setTimeout(() => setShow(true), 100)

    // Auto-dismiss after duration
    const hideTimer = setTimeout(() => {
      setShow(false)
      setTimeout(() => onClose?.(), 500)
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[variant] || icons.info

  const handleClose = () => {
    setShow(false)
    setTimeout(() => onClose?.(), 500)
  }

  return (
    <div
      className={`toast-notification toast-${variant} ${show ? 'toast-show' : ''}`}
      onClick={handleClose}
    >
      <div className="flex items-center">
        <div className="toast-icon">
          <Icon size={24} />
        </div>
        <div className="toast-content">
          <div className="toast-title">{title}</div>
          <div className="toast-message">{message}</div>
        </div>
        <button
          onClick={handleClose}
          className="toast-close"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (options) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...options }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return {
    toasts,
    showToast,
    removeToast,
    success: (title, message) => showToast({ title, message, variant: 'success' }),
    error: (title, message) => showToast({ title, message, variant: 'error' }),
    warning: (title, message) => showToast({ title, message, variant: 'warning' }),
    info: (title, message) => showToast({ title, message, variant: 'info' })
  }
}
