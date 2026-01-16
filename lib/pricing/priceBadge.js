/**
 * Price Intelligence Library
 * Calculate price badges and market comparisons
 */

// Price badge types
export const PRICE_BADGES = {
  GOOD_DEAL: 'good_deal',
  FAIR_PRICE: 'fair_price',
  OVERPRICED: 'overpriced',
  UNKNOWN: 'unknown'
}

// Badge configurations
export const BADGE_CONFIG = {
  [PRICE_BADGES.GOOD_DEAL]: {
    label: 'Good Deal',
    shortLabel: 'Deal',
    description: 'Below market average',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    icon: '💰'
  },
  [PRICE_BADGES.FAIR_PRICE]: {
    label: 'Fair Price',
    shortLabel: 'Fair',
    description: 'Around market average',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    icon: '✓'
  },
  [PRICE_BADGES.OVERPRICED]: {
    label: 'Above Market',
    shortLabel: 'High',
    description: 'Above market average',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    icon: '⚠️'
  },
  [PRICE_BADGES.UNKNOWN]: {
    label: 'Price Unknown',
    shortLabel: '?',
    description: 'Insufficient market data',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    icon: '?'
  }
}

// Threshold percentages
const THRESHOLDS = {
  GOOD_DEAL: -0.15,    // 15% or more below market
  FAIR_PRICE_MIN: -0.15,
  FAIR_PRICE_MAX: 0.20,
  OVERPRICED: 0.20     // 20% or more above market
}

/**
 * Calculate price badge for a car
 * @param {number} carPrice - The car's listed price
 * @param {object} marketData - Market price data
 * @returns {object} - Price badge information
 */
export function calculatePriceBadge(carPrice, marketData) {
  if (!carPrice || !marketData?.avg_price) {
    return {
      badge: PRICE_BADGES.UNKNOWN,
      config: BADGE_CONFIG[PRICE_BADGES.UNKNOWN],
      variance: null,
      variancePercent: null,
      marketAvg: null
    }
  }

  const variance = carPrice - marketData.avg_price
  const variancePercent = variance / marketData.avg_price

  let badge = PRICE_BADGES.FAIR_PRICE

  if (variancePercent <= THRESHOLDS.GOOD_DEAL) {
    badge = PRICE_BADGES.GOOD_DEAL
  } else if (variancePercent >= THRESHOLDS.OVERPRICED) {
    badge = PRICE_BADGES.OVERPRICED
  }

  return {
    badge,
    config: BADGE_CONFIG[badge],
    variance,
    variancePercent: Math.round(variancePercent * 100),
    marketAvg: marketData.avg_price,
    marketMin: marketData.min_price,
    marketMax: marketData.max_price
  }
}

/**
 * Get price comparison text
 * @param {number} variancePercent - Variance percentage (e.g., -15 for 15% below)
 * @returns {string} - Human-readable comparison text
 */
export function getPriceComparisonText(variancePercent) {
  if (variancePercent === null || variancePercent === undefined) {
    return 'Price comparison unavailable'
  }

  const absVariance = Math.abs(variancePercent)

  if (variancePercent <= -30) {
    return `${absVariance}% below market - Exceptional deal!`
  } else if (variancePercent <= -15) {
    return `${absVariance}% below market - Good deal`
  } else if (variancePercent < 0) {
    return `${absVariance}% below market average`
  } else if (variancePercent === 0) {
    return 'At market average'
  } else if (variancePercent <= 10) {
    return `${absVariance}% above market - Still reasonable`
  } else if (variancePercent <= 20) {
    return `${absVariance}% above market average`
  } else {
    return `${absVariance}% above market - Consider negotiating`
  }
}

/**
 * Calculate savings compared to market
 * @param {number} carPrice - Listed price
 * @param {number} marketAvg - Market average
 * @returns {object} - Savings information
 */
export function calculateSavings(carPrice, marketAvg) {
  if (!carPrice || !marketAvg) {
    return { hasSavings: false, amount: 0, percent: 0 }
  }

  const savings = marketAvg - carPrice

  if (savings <= 0) {
    return { hasSavings: false, amount: 0, percent: 0 }
  }

  return {
    hasSavings: true,
    amount: savings,
    percent: Math.round((savings / marketAvg) * 100)
  }
}

/**
 * Get price range category
 * @param {number} price - Car price in Naira
 * @returns {object} - Price category
 */
export function getPriceCategory(price) {
  if (!price) return { category: 'unknown', label: 'Unknown' }

  if (price <= 3000000) {
    return { category: 'budget', label: 'Budget-Friendly', range: '₦0 - ₦3M' }
  } else if (price <= 7000000) {
    return { category: 'economy', label: 'Economy', range: '₦3M - ₦7M' }
  } else if (price <= 15000000) {
    return { category: 'mid-range', label: 'Mid-Range', range: '₦7M - ₦15M' }
  } else if (price <= 30000000) {
    return { category: 'premium', label: 'Premium', range: '₦15M - ₦30M' }
  } else if (price <= 50000000) {
    return { category: 'luxury', label: 'Luxury', range: '₦30M - ₦50M' }
  } else {
    return { category: 'ultra-luxury', label: 'Ultra Luxury', range: '₦50M+' }
  }
}

/**
 * Suggest a fair price based on market data
 * @param {object} marketData - Market price data
 * @param {string} condition - Car condition (brand_new, foreign_used, nigerian_used)
 * @returns {object} - Price suggestion
 */
export function suggestFairPrice(marketData, condition = 'foreign_used') {
  if (!marketData?.avg_price) {
    return { suggested: null, range: null }
  }

  // Condition adjustments
  const conditionMultipliers = {
    brand_new: 1.1,      // 10% above average
    foreign_used: 1.0,   // At average
    nigerian_used: 0.85  // 15% below average
  }

  const multiplier = conditionMultipliers[condition] || 1.0
  const suggested = Math.round(marketData.avg_price * multiplier)

  // Calculate fair range (±10% of suggested)
  const rangeMin = Math.round(suggested * 0.9)
  const rangeMax = Math.round(suggested * 1.1)

  return {
    suggested,
    range: { min: rangeMin, max: rangeMax },
    condition,
    basedOn: {
      marketAvg: marketData.avg_price,
      sampleCount: marketData.sample_count
    }
  }
}

/**
 * Calculate price trend indicator
 * @param {object} marketData - Market data with trend info
 * @returns {object} - Trend information
 */
export function getPriceTrend(marketData) {
  if (!marketData?.price_trend) {
    return { trend: 'stable', icon: '→', label: 'Stable' }
  }

  const trends = {
    rising: { icon: '↑', label: 'Rising', color: 'red' },
    stable: { icon: '→', label: 'Stable', color: 'gray' },
    falling: { icon: '↓', label: 'Falling', color: 'green' }
  }

  const trendInfo = trends[marketData.price_trend] || trends.stable

  return {
    trend: marketData.price_trend,
    change30d: marketData.price_change_30d,
    ...trendInfo
  }
}

/**
 * Generate price insights for a car
 * @param {number} carPrice - Car price
 * @param {object} marketData - Market data
 * @returns {object} - Price insights
 */
export function generatePriceInsights(carPrice, marketData) {
  const badge = calculatePriceBadge(carPrice, marketData)
  const savings = calculateSavings(carPrice, marketData?.avg_price)
  const category = getPriceCategory(carPrice)
  const trend = getPriceTrend(marketData)

  const insights = []

  // Add relevant insights
  if (badge.badge === PRICE_BADGES.GOOD_DEAL) {
    insights.push({
      type: 'positive',
      message: `This ${category.label} car is priced ${Math.abs(badge.variancePercent)}% below market average`
    })
  }

  if (savings.hasSavings && savings.amount >= 1000000) {
    insights.push({
      type: 'positive',
      message: `You could save ₦${(savings.amount / 1000000).toFixed(1)}M compared to market average`
    })
  }

  if (trend.trend === 'falling') {
    insights.push({
      type: 'info',
      message: 'Prices for this model have been falling - good time to buy'
    })
  } else if (trend.trend === 'rising') {
    insights.push({
      type: 'warning',
      message: 'Prices for this model have been rising'
    })
  }

  if (badge.badge === PRICE_BADGES.OVERPRICED) {
    insights.push({
      type: 'warning',
      message: `This car is priced ${badge.variancePercent}% above market average`
    })
  }

  return {
    badge,
    savings,
    category,
    trend,
    insights,
    marketData: marketData ? {
      avg: marketData.avg_price,
      min: marketData.min_price,
      max: marketData.max_price,
      samples: marketData.sample_count
    } : null
  }
}

export default {
  calculatePriceBadge,
  getPriceComparisonText,
  calculateSavings,
  getPriceCategory,
  suggestFairPrice,
  getPriceTrend,
  generatePriceInsights,
  PRICE_BADGES,
  BADGE_CONFIG
}
