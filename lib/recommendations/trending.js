/**
 * Trending Cars Calculation Library
 * Algorithms for calculating trending scores and rankings
 */

// Trending score weights
const TRENDING_WEIGHTS = {
  VIEWS_24H: 1.0,        // Views in last 24 hours
  VIEWS_7D: 0.3,         // Views in last 7 days (weighted less)
  SAVES_24H: 5.0,        // Saves/favorites in last 24 hours
  SAVES_7D: 2.0,         // Saves in last 7 days
  INQUIRIES_24H: 10.0,   // Inquiries/contacts in last 24 hours
  INQUIRIES_7D: 3.0,     // Inquiries in last 7 days
  SHARES_24H: 3.0,       // Social shares in last 24 hours
  SHARES_7D: 1.0         // Shares in last 7 days
}

// Time decay factor (newer = higher score)
const TIME_DECAY_HOURS = 72 // Hours after which score starts decaying

/**
 * Calculate trending score for a car
 * @param {object} metrics - Car engagement metrics
 * @returns {number} - Trending score
 */
export function calculateTrendingScore(metrics) {
  if (!metrics) return 0

  const {
    views_24h = 0,
    views_7d = 0,
    saves_24h = 0,
    saves_7d = 0,
    inquiries_24h = 0,
    inquiries_7d = 0,
    shares_24h = 0,
    shares_7d = 0,
    created_at
  } = metrics

  // Base score from engagement
  let score = (
    (views_24h * TRENDING_WEIGHTS.VIEWS_24H) +
    (views_7d * TRENDING_WEIGHTS.VIEWS_7D) +
    (saves_24h * TRENDING_WEIGHTS.SAVES_24H) +
    (saves_7d * TRENDING_WEIGHTS.SAVES_7D) +
    (inquiries_24h * TRENDING_WEIGHTS.INQUIRIES_24H) +
    (inquiries_7d * TRENDING_WEIGHTS.INQUIRIES_7D) +
    (shares_24h * TRENDING_WEIGHTS.SHARES_24H) +
    (shares_7d * TRENDING_WEIGHTS.SHARES_7D)
  )

  // Apply time decay for newer listings (boost)
  if (created_at) {
    const hoursOld = (Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60)
    if (hoursOld < TIME_DECAY_HOURS) {
      // Boost new listings by up to 50%
      const newBoost = 1 + (0.5 * (1 - hoursOld / TIME_DECAY_HOURS))
      score *= newBoost
    }
  }

  return Math.round(score * 100) / 100
}

/**
 * Calculate velocity score (rate of engagement growth)
 * @param {object} currentMetrics - Current period metrics
 * @param {object} previousMetrics - Previous period metrics
 * @returns {number} - Velocity score (-100 to 100)
 */
export function calculateVelocityScore(currentMetrics, previousMetrics) {
  if (!currentMetrics || !previousMetrics) return 0

  // Calculate growth rates for each metric
  const viewsGrowth = calculateGrowthRate(
    currentMetrics.views_24h || 0,
    previousMetrics.views_24h || 0
  )
  const savesGrowth = calculateGrowthRate(
    currentMetrics.saves_24h || 0,
    previousMetrics.saves_24h || 0
  )
  const inquiriesGrowth = calculateGrowthRate(
    currentMetrics.inquiries_24h || 0,
    previousMetrics.inquiries_24h || 0
  )

  // Weighted average of growth rates
  const velocity = (
    (viewsGrowth * 0.3) +
    (savesGrowth * 0.4) +
    (inquiriesGrowth * 0.3)
  )

  return Math.round(velocity * 10) / 10
}

/**
 * Calculate growth rate between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} - Growth rate percentage
 */
function calculateGrowthRate(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}

/**
 * Rank cars by trending score
 * @param {array} cars - Cars with metrics
 * @returns {array} - Ranked cars with positions
 */
export function rankTrendingCars(cars) {
  if (!cars || !cars.length) return []

  // Calculate trending scores
  const scoredCars = cars.map(car => ({
    ...car,
    trendingScore: calculateTrendingScore(car.metrics || car)
  }))

  // Sort by score descending
  scoredCars.sort((a, b) => b.trendingScore - a.trendingScore)

  // Assign ranks
  return scoredCars.map((car, index) => ({
    ...car,
    trendingRank: index + 1
  }))
}

/**
 * Get trending cars by category
 * @param {array} cars - All cars with metrics
 * @param {string} category - Category to filter by
 * @param {number} limit - Max results
 * @returns {array} - Trending cars in category
 */
export function getTrendingByCategory(cars, category, limit = 10) {
  if (!cars || !cars.length) return []

  // Filter by category (body_type, make, price_range, etc.)
  let filteredCars = cars

  if (category && category !== 'all') {
    filteredCars = cars.filter(car => {
      const categoryLower = category.toLowerCase()

      // Check body type
      if (car.body_type?.toLowerCase() === categoryLower) return true

      // Check make
      if (car.make?.toLowerCase() === categoryLower) return true

      // Check price categories
      if (categoryLower === 'budget' && car.price <= 5000000) return true
      if (categoryLower === 'mid-range' && car.price > 5000000 && car.price <= 20000000) return true
      if (categoryLower === 'luxury' && car.price > 20000000) return true

      // Check special flags
      if (categoryLower === 'premium' && car.is_premium_verified) return true
      if (categoryLower === 'just-arrived' && car.is_just_arrived) return true

      return false
    })
  }

  // Rank and limit
  const ranked = rankTrendingCars(filteredCars)
  return ranked.slice(0, limit)
}

/**
 * Calculate hot streak bonus
 * Cars with consistent high engagement get a bonus
 * @param {array} dailyMetrics - Array of daily metrics for past 7 days
 * @returns {number} - Hot streak multiplier (1.0 - 1.5)
 */
export function calculateHotStreakBonus(dailyMetrics) {
  if (!dailyMetrics || dailyMetrics.length < 3) return 1.0

  // Check for consecutive days of above-average engagement
  const avgViews = dailyMetrics.reduce((sum, d) => sum + (d.views || 0), 0) / dailyMetrics.length
  const avgSaves = dailyMetrics.reduce((sum, d) => sum + (d.saves || 0), 0) / dailyMetrics.length

  let consecutiveHotDays = 0
  for (let i = dailyMetrics.length - 1; i >= 0; i--) {
    const day = dailyMetrics[i]
    if ((day.views || 0) >= avgViews && (day.saves || 0) >= avgSaves) {
      consecutiveHotDays++
    } else {
      break
    }
  }

  // Bonus: 5% per consecutive hot day, max 50%
  return 1 + Math.min(consecutiveHotDays * 0.05, 0.5)
}

/**
 * Detect trending momentum
 * @param {array} historicalScores - Array of historical trending scores
 * @returns {string} - 'rising', 'stable', or 'falling'
 */
export function detectMomentum(historicalScores) {
  if (!historicalScores || historicalScores.length < 2) return 'stable'

  const recentAvg = historicalScores.slice(-3).reduce((a, b) => a + b, 0) / 3
  const olderAvg = historicalScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100

  if (changePercent > 20) return 'rising'
  if (changePercent < -20) return 'falling'
  return 'stable'
}

/**
 * Generate trending insights for a car
 * @param {object} car - Car with metrics
 * @returns {object} - Trending insights
 */
export function generateTrendingInsights(car) {
  if (!car) return null

  const score = calculateTrendingScore(car.metrics || car)

  let badge = null
  let message = null

  if (score >= 100) {
    badge = 'hot'
    message = 'Very popular right now!'
  } else if (score >= 50) {
    badge = 'trending'
    message = 'Getting lots of attention'
  } else if (score >= 20) {
    badge = 'rising'
    message = 'Interest is growing'
  }

  return {
    score,
    badge,
    message,
    viewsToday: car.metrics?.views_24h || car.views_24h || 0,
    savesToday: car.metrics?.saves_24h || car.saves_24h || 0
  }
}

export default {
  calculateTrendingScore,
  calculateVelocityScore,
  rankTrendingCars,
  getTrendingByCategory,
  calculateHotStreakBonus,
  detectMomentum,
  generateTrendingInsights,
  TRENDING_WEIGHTS
}
