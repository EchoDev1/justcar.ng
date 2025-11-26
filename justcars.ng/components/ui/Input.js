/**
 * Reusable Input Component
 * Supports text, number, email, password, textarea
 */

import { cn } from '@/lib/utils'

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  className = '',
  rows = 4,
  ...props
}) {
  const baseStyles = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white'

  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : ''

  const InputElement = type === 'textarea' ? 'textarea' : 'input'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <InputElement
        type={type === 'textarea' ? undefined : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={type === 'textarea' ? rows : undefined}
        className={cn(baseStyles, errorStyles, className)}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
