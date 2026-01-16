'use client'

import { Shield, ShieldCheck, Award, Crown, Star, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Verification Tier Badge Component
 * Displays dealer verification status: Basic, Verified, or Trusted Seller
 */

const TIER_CONFIG = {
  basic: {
    label: 'Basic',
    description: 'Unverified account',
    icon: Shield,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    iconColor: 'text-gray-400'
  },
  verified: {
    label: 'Verified',
    description: 'Identity verified',
    icon: ShieldCheck,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-500'
  },
  trusted_seller: {
    label: 'Trusted Seller',
    description: 'Fully verified business',
    icon: Award,
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-500'
  }
}

// Compact badge for card displays
export function VerificationTierBadge({ tier = 'basic', size = 'md', showLabel = true, className = '' }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.basic
  const Icon = config.icon

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

// Just the icon for minimal displays
export function VerificationTierIcon({ tier = 'basic', size = 'md', className = '' }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.basic
  const Icon = config.icon

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <Icon className={`${iconSizes[size]} ${config.iconColor} ${className}`} />
  )
}

// Detailed badge with tooltip for hover states
export function VerificationTierBadgeWithTooltip({ tier = 'basic', size = 'md', className = '' }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.basic

  return (
    <div className={`group relative inline-block ${className}`}>
      <VerificationTierBadge tier={tier} size={size} />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          <p className="font-semibold">{config.label}</p>
          <p className="text-gray-300">{config.description}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  )
}

// Large verification status card
export function VerificationStatusCard({
  tier = 'basic',
  ninVerified = false,
  bvnVerified = false,
  cacVerified = false,
  score = 0,
  className = ''
}) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.basic
  const Icon = config.icon

  const verificationItems = [
    { label: 'NIN Verified', verified: ninVerified, points: 35 },
    { label: 'BVN Verified', verified: bvnVerified, points: 35 },
    { label: 'CAC Verified', verified: cacVerified, points: 25 }
  ]

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full bg-white/80 ${config.iconColor}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${config.textColor}`}>{config.label}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>

        {/* Score badge */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${config.textColor}`}>{score}</div>
          <div className="text-xs text-gray-500">Trust Score</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Verification Progress</span>
          <span>{score}/100</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              tier === 'trusted_seller'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                : tier === 'verified'
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Verification items */}
      <div className="space-y-3">
        {verificationItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between p-3 rounded-lg ${
              item.verified ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              {item.verified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={item.verified ? 'text-green-700' : 'text-gray-500'}>
                {item.label}
              </span>
            </div>
            <span className={`text-sm font-medium ${item.verified ? 'text-green-600' : 'text-gray-400'}`}>
              +{item.points} pts
            </span>
          </div>
        ))}
      </div>

      {/* Tier progress indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {['basic', 'verified', 'trusted_seller'].map((t, index) => (
              <div key={t} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    t === tier
                      ? t === 'trusted_seller'
                        ? 'bg-amber-500'
                        : t === 'verified'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      : score >= (index + 1) * 35
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                />
                {index < 2 && (
                  <div
                    className={`w-8 h-0.5 ${
                      score >= (index + 1) * 35 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500">
            {tier === 'trusted_seller'
              ? 'Maximum tier achieved!'
              : tier === 'verified'
                ? 'Verify CAC for Trusted Seller'
                : 'Verify NIN or BVN to level up'}
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline verification indicators
export function VerificationIndicators({
  ninVerified = false,
  bvnVerified = false,
  cacVerified = false,
  size = 'sm',
  className = ''
}) {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  const indicators = [
    { label: 'NIN', verified: ninVerified },
    { label: 'BVN', verified: bvnVerified },
    { label: 'CAC', verified: cacVerified }
  ]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {indicators.map((item) => (
        <div
          key={item.label}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
            item.verified
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-400'
          }`}
          title={`${item.label} ${item.verified ? 'Verified' : 'Not Verified'}`}
        >
          {item.verified ? (
            <CheckCircle className={iconSizes[size]} />
          ) : (
            <AlertCircle className={iconSizes[size]} />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default {
  VerificationTierBadge,
  VerificationTierIcon,
  VerificationTierBadgeWithTooltip,
  VerificationStatusCard,
  VerificationIndicators
}
