'use client'

import { TrendingDown, TrendingUp, Minus, BadgeDollarSign, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'
import { PRICE_BADGES, BADGE_CONFIG } from '@/lib/pricing/priceBadge'

/**
 * Price Badge Component
 * Displays price intelligence badges (Good Deal, Fair Price, Overpriced)
 */

// Compact badge for car cards
export function PriceBadge({ badge, size = 'sm', showIcon = true, className = '' }) {
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG[PRICE_BADGES.UNKNOWN]

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5'
  }

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const Icon = badge === PRICE_BADGES.GOOD_DEAL
    ? TrendingDown
    : badge === PRICE_BADGES.OVERPRICED
      ? TrendingUp
      : badge === PRICE_BADGES.FAIR_PRICE
        ? CheckCircle
        : HelpCircle

  if (badge === PRICE_BADGES.UNKNOWN) return null

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.shortLabel}</span>
    </span>
  )
}

// Detailed price badge with variance info
export function PriceBadgeDetailed({
  badge,
  variancePercent,
  marketAvg,
  className = ''
}) {
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG[PRICE_BADGES.UNKNOWN]

  if (badge === PRICE_BADGES.UNKNOWN) return null

  const formatPrice = (price) => {
    if (!price) return 'N/A'
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`
    return `₦${(price / 1000).toFixed(0)}K`
  }

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {badge === PRICE_BADGES.GOOD_DEAL && <TrendingDown className={`w-5 h-5 ${config.textColor}`} />}
          {badge === PRICE_BADGES.FAIR_PRICE && <CheckCircle className={`w-5 h-5 ${config.textColor}`} />}
          {badge === PRICE_BADGES.OVERPRICED && <AlertTriangle className={`w-5 h-5 ${config.textColor}`} />}
          <span className={`font-semibold ${config.textColor}`}>{config.label}</span>
        </div>
        {variancePercent !== null && (
          <span className={`text-sm font-medium ${config.textColor}`}>
            {variancePercent > 0 ? '+' : ''}{variancePercent}%
          </span>
        )}
      </div>

      <p className="text-xs text-gray-600">
        {badge === PRICE_BADGES.GOOD_DEAL && (
          <>Priced {Math.abs(variancePercent)}% below market average of {formatPrice(marketAvg)}</>
        )}
        {badge === PRICE_BADGES.FAIR_PRICE && (
          <>Price is around the market average of {formatPrice(marketAvg)}</>
        )}
        {badge === PRICE_BADGES.OVERPRICED && (
          <>Priced {variancePercent}% above market average of {formatPrice(marketAvg)}</>
        )}
      </p>
    </div>
  )
}

// Price comparison tooltip
export function PriceComparisonTooltip({
  badge,
  variancePercent,
  marketAvg,
  marketMin,
  marketMax,
  className = ''
}) {
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG[PRICE_BADGES.UNKNOWN]

  const formatPrice = (price) => {
    if (!price) return 'N/A'
    return `₦${price.toLocaleString()}`
  }

  if (badge === PRICE_BADGES.UNKNOWN) {
    return (
      <div className={`bg-gray-800 text-white text-xs rounded-lg p-3 max-w-xs ${className}`}>
        <p className="font-medium">Price Data Unavailable</p>
        <p className="text-gray-300 mt-1">
          We don't have enough market data for this specific make/model/year combination.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 text-white text-xs rounded-lg p-3 max-w-xs ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <PriceBadge badge={badge} size="sm" />
        <span className="font-medium">{config.label}</span>
      </div>

      <div className="space-y-1.5 text-gray-300">
        <div className="flex justify-between">
          <span>Market Average:</span>
          <span className="text-white">{formatPrice(marketAvg)}</span>
        </div>
        <div className="flex justify-between">
          <span>Market Range:</span>
          <span className="text-white">{formatPrice(marketMin)} - {formatPrice(marketMax)}</span>
        </div>
        {variancePercent !== null && (
          <div className="flex justify-between pt-1 border-t border-gray-700">
            <span>Difference:</span>
            <span className={variancePercent <= 0 ? 'text-green-400' : 'text-red-400'}>
              {variancePercent > 0 ? '+' : ''}{variancePercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Price badge with hover tooltip
export function PriceBadgeWithTooltip({
  badge,
  variancePercent,
  marketAvg,
  marketMin,
  marketMax,
  size = 'sm',
  className = ''
}) {
  if (badge === PRICE_BADGES.UNKNOWN) return null

  return (
    <div className={`group relative inline-block ${className}`}>
      <PriceBadge badge={badge} size={size} />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <PriceComparisonTooltip
          badge={badge}
          variancePercent={variancePercent}
          marketAvg={marketAvg}
          marketMin={marketMin}
          marketMax={marketMax}
        />
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  )
}

// Market price indicator bar
export function PriceIndicatorBar({
  price,
  marketMin,
  marketMax,
  marketAvg,
  className = ''
}) {
  if (!price || !marketMin || !marketMax) return null

  // Calculate position on the bar (0-100%)
  const range = marketMax - marketMin
  const position = Math.min(Math.max(((price - marketMin) / range) * 100, 0), 100)
  const avgPosition = ((marketAvg - marketMin) / range) * 100

  return (
    <div className={`w-full ${className}`}>
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>₦{(marketMin / 1000000).toFixed(1)}M</span>
        <span>Market Range</span>
        <span>₦{(marketMax / 1000000).toFixed(1)}M</span>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-gradient-to-r from-green-200 via-gray-200 to-red-200 rounded-full">
        {/* Average marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-gray-400"
          style={{ left: `${avgPosition}%` }}
        />

        {/* Price marker */}
        <div
          className="absolute -top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow transform -translate-x-1/2"
          style={{ left: `${position}%` }}
        />
      </div>

      {/* This car price */}
      <div
        className="relative mt-1"
        style={{ marginLeft: `calc(${position}% - 30px)` }}
      >
        <span className="text-xs font-medium text-blue-600">
          This car
        </span>
      </div>
    </div>
  )
}

// Savings badge
export function SavingsBadge({ savings, className = '' }) {
  if (!savings || !savings.hasSavings || savings.amount < 100000) return null

  const formatSavings = (amount) => {
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`
    return `₦${Math.round(amount / 1000)}K`
  }

  return (
    <div className={`inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full ${className}`}>
      <BadgeDollarSign className="w-3.5 h-3.5" />
      <span>Save {formatSavings(savings.amount)}</span>
    </div>
  )
}

export default {
  PriceBadge,
  PriceBadgeDetailed,
  PriceComparisonTooltip,
  PriceBadgeWithTooltip,
  PriceIndicatorBar,
  SavingsBadge
}
