/**
 * Car Recommendation Scoring Library
 * Rule-based similarity and recommendation algorithms
 */

// Similarity scoring weights
const SIMILARITY_WEIGHTS = {
  SAME_MAKE: 25,        // Same brand (Toyota, Honda, etc.)
  SAME_MODEL: 20,       // Same model (Camry, Accord, etc.)
  SAME_BODY_TYPE: 15,   // Same body type (SUV, Sedan, etc.)
  PRICE_RANGE: 15,      // Within 20% of target price
  YEAR_PROXIMITY: 10,   // Within 2 years
  LOCATION_MATCH: 10,   // Same state/city
  SAME_FUEL_TYPE: 3,    // Same fuel type
  SAME_TRANSMISSION: 2  // Same transmission
}

// User preference weights (for personalized recommendations)
const USER_PREF_WEIGHTS = {
  VIEWED_MAKE: 5,       // User has viewed this make before
  VIEWED_BODY_TYPE: 4,  // User has viewed this body type before
  SAVED_SIMILAR: 8,     // User saved similar car
  PRICE_PREFERENCE: 6,  // Within user's typical price range
  LOCATION_PREFERENCE: 3 // In user's preferred location
}

/**
 * Calculate similarity score between two cars
 * @param {object} sourceCar - The reference car
 * @param {object} targetCar - The car to compare
 * @returns {number} - Similarity score (0-100)
 */
export function calculateSimilarityScore(sourceCar, targetCar) {
  if (!sourceCar || !targetCar) return 0
  if (sourceCar.id === targetCar.id) return 0 // Don't recommend same car

  let score = 0

  // Same make: +25 points
  if (sourceCar.make && targetCar.make &&
      sourceCar.make.toLowerCase() === targetCar.make.toLowerCase()) {
    score += SIMILARITY_WEIGHTS.SAME_MAKE
  }

  // Same model: +20 points
  if (sourceCar.model && targetCar.model &&
      sourceCar.model.toLowerCase() === targetCar.model.toLowerCase()) {
    score += SIMILARITY_WEIGHTS.SAME_MODEL
  }

  // Same body type: +15 points
  if (sourceCar.body_type && targetCar.body_type &&
      sourceCar.body_type.toLowerCase() === targetCar.body_type.toLowerCase()) {
    score += SIMILARITY_WEIGHTS.SAME_BODY_TYPE
  }

  // Price within 20%: +15 points (proportional)
  if (sourceCar.price && targetCar.price) {
    const priceDiff = Math.abs(sourceCar.price - targetCar.price)
    const pricePercent = priceDiff / sourceCar.price
    if (pricePercent <= 0.20) {
      // Full points if within 20%, proportionally less otherwise
      score += SIMILARITY_WEIGHTS.PRICE_RANGE * (1 - pricePercent / 0.20)
    }
  }

  // Year within 2 years: +10 points (proportional)
  if (sourceCar.year && targetCar.year) {
    const yearDiff = Math.abs(sourceCar.year - targetCar.year)
    if (yearDiff <= 2) {
      score += SIMILARITY_WEIGHTS.YEAR_PROXIMITY * (1 - yearDiff / 2)
    }
  }

  // Same location: +10 points
  if (sourceCar.location && targetCar.location &&
      sourceCar.location.toLowerCase() === targetCar.location.toLowerCase()) {
    score += SIMILARITY_WEIGHTS.LOCATION_MATCH
  }

  // Same fuel type: +3 points
  if (sourceCar.fuel_type && targetCar.fuel_type &&
      sourceCar.fuel_type.toLowerCase() === targetCar.fuel_type.toLowerCase()) {
    score += SIMILARITY_WEIGHTS.SAME_FUEL_TYPE
  }

  // Same transmission: +2 points
  if (sourceCar.transmission && targetCar.transmission &&
      sourceCar.transmission.toLowerCase() === targetCar.transmission.toLowerCase()) {
    score += SIMILARITY_WEIGHTS.SAME_TRANSMISSION
  }

  return Math.round(score * 10) / 10 // Round to 1 decimal
}

/**
 * Calculate personalized recommendation score based on user history
 * @param {object} car - The car to score
 * @param {object} userHistory - User's browsing history and preferences
 * @returns {number} - Recommendation score bonus (0-50)
 */
export function calculateUserPreferenceScore(car, userHistory) {
  if (!car || !userHistory) return 0

  let score = 0

  const { viewedMakes = [], viewedBodyTypes = [], savedCars = [], priceRange = {}, preferredLocations = [] } = userHistory

  // User has viewed this make before: +5 points per view (max 20)
  const makeViews = viewedMakes.filter(m => m.toLowerCase() === car.make?.toLowerCase()).length
  score += Math.min(makeViews * USER_PREF_WEIGHTS.VIEWED_MAKE, 20)

  // User has viewed this body type: +4 points per view (max 16)
  const bodyViews = viewedBodyTypes.filter(b => b.toLowerCase() === car.body_type?.toLowerCase()).length
  score += Math.min(bodyViews * USER_PREF_WEIGHTS.VIEWED_BODY_TYPE, 16)

  // User saved similar car: +8 points
  const hasSavedSimilar = savedCars.some(saved =>
    saved.make?.toLowerCase() === car.make?.toLowerCase() ||
    saved.body_type?.toLowerCase() === car.body_type?.toLowerCase()
  )
  if (hasSavedSimilar) {
    score += USER_PREF_WEIGHTS.SAVED_SIMILAR
  }

  // Within user's typical price range: +6 points
  if (priceRange.min && priceRange.max && car.price) {
    if (car.price >= priceRange.min && car.price <= priceRange.max) {
      score += USER_PREF_WEIGHTS.PRICE_PREFERENCE
    }
  }

  // In user's preferred location: +3 points
  if (preferredLocations.some(loc => loc.toLowerCase() === car.location?.toLowerCase())) {
    score += USER_PREF_WEIGHTS.LOCATION_PREFERENCE
  }

  return score
}

/**
 * Get similar cars with scores
 * @param {object} sourceCar - The reference car
 * @param {array} allCars - All available cars
 * @param {number} limit - Maximum number of results
 * @returns {array} - Similar cars with scores, sorted by similarity
 */
export function getSimilarCars(sourceCar, allCars, limit = 6) {
  if (!sourceCar || !allCars || !allCars.length) return []

  const scoredCars = allCars
    .filter(car => car.id !== sourceCar.id) // Exclude source car
    .map(car => ({
      ...car,
      similarityScore: calculateSimilarityScore(sourceCar, car)
    }))
    .filter(car => car.similarityScore > 0) // Only include cars with some similarity
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)

  return scoredCars
}

/**
 * Get personalized recommendations for a user
 * @param {array} allCars - All available cars
 * @param {object} userHistory - User's browsing history
 * @param {number} limit - Maximum number of results
 * @returns {array} - Recommended cars with scores
 */
export function getPersonalizedRecommendations(allCars, userHistory, limit = 12) {
  if (!allCars || !allCars.length) return []

  const scoredCars = allCars.map(car => {
    const baseScore = 50 // Base score for all cars
    const userPrefScore = calculateUserPreferenceScore(car, userHistory)

    // Boost verified and featured cars slightly
    let boostScore = 0
    if (car.is_verified) boostScore += 5
    if (car.is_featured) boostScore += 3
    if (car.is_premium_verified) boostScore += 8

    return {
      ...car,
      recommendationScore: baseScore + userPrefScore + boostScore,
      matchReasons: getMatchReasons(car, userHistory)
    }
  })

  return scoredCars
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit)
}

/**
 * Get human-readable match reasons
 * @param {object} car - The car
 * @param {object} userHistory - User's history
 * @returns {array} - Array of reason strings
 */
function getMatchReasons(car, userHistory) {
  if (!userHistory) return []

  const reasons = []
  const { viewedMakes = [], viewedBodyTypes = [], savedCars = [] } = userHistory

  if (viewedMakes.some(m => m.toLowerCase() === car.make?.toLowerCase())) {
    reasons.push(`You've viewed ${car.make} before`)
  }

  if (viewedBodyTypes.some(b => b.toLowerCase() === car.body_type?.toLowerCase())) {
    reasons.push(`Popular ${car.body_type} choice`)
  }

  if (savedCars.some(s => s.make?.toLowerCase() === car.make?.toLowerCase())) {
    reasons.push(`Similar to your saved cars`)
  }

  if (car.is_premium_verified) {
    reasons.push('Premium Verified')
  }

  if (car.is_just_arrived) {
    reasons.push('Just Arrived')
  }

  return reasons.slice(0, 2) // Return max 2 reasons
}

/**
 * Calculate relevance score for search results
 * @param {object} car - The car
 * @param {object} searchFilters - Applied search filters
 * @returns {number} - Relevance score
 */
export function calculateSearchRelevance(car, searchFilters) {
  if (!searchFilters) return 50 // Default relevance

  let score = 50
  let matches = 0
  let totalFilters = 0

  // Check each filter
  if (searchFilters.make) {
    totalFilters++
    if (car.make?.toLowerCase() === searchFilters.make.toLowerCase()) {
      matches++
      score += 20
    }
  }

  if (searchFilters.model) {
    totalFilters++
    if (car.model?.toLowerCase().includes(searchFilters.model.toLowerCase())) {
      matches++
      score += 15
    }
  }

  if (searchFilters.body_type) {
    totalFilters++
    if (car.body_type?.toLowerCase() === searchFilters.body_type.toLowerCase()) {
      matches++
      score += 10
    }
  }

  if (searchFilters.min_price && searchFilters.max_price) {
    totalFilters++
    if (car.price >= searchFilters.min_price && car.price <= searchFilters.max_price) {
      matches++
      score += 10
    }
  }

  if (searchFilters.location) {
    totalFilters++
    if (car.location?.toLowerCase() === searchFilters.location.toLowerCase()) {
      matches++
      score += 10
    }
  }

  // Bonus for matching all filters
  if (totalFilters > 0 && matches === totalFilters) {
    score += 15
  }

  return Math.min(score, 100)
}

/**
 * Sort cars by multiple criteria with weights
 * @param {array} cars - Cars to sort
 * @param {string} sortBy - Primary sort field
 * @param {object} options - Additional sorting options
 * @returns {array} - Sorted cars
 */
export function sortCarsWithWeights(cars, sortBy = 'relevance', options = {}) {
  const { userHistory, searchFilters } = options

  return [...cars].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        const scoreA = calculateSearchRelevance(a, searchFilters) +
                      calculateUserPreferenceScore(a, userHistory)
        const scoreB = calculateSearchRelevance(b, searchFilters) +
                      calculateUserPreferenceScore(b, userHistory)
        return scoreB - scoreA

      case 'price_low':
        return (a.price || 0) - (b.price || 0)

      case 'price_high':
        return (b.price || 0) - (a.price || 0)

      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)

      case 'year_new':
        return (b.year || 0) - (a.year || 0)

      case 'year_old':
        return (a.year || 0) - (b.year || 0)

      case 'trending':
        return (b.view_count || 0) - (a.view_count || 0)

      default:
        return 0
    }
  })
}

export default {
  calculateSimilarityScore,
  calculateUserPreferenceScore,
  getSimilarCars,
  getPersonalizedRecommendations,
  calculateSearchRelevance,
  sortCarsWithWeights,
  SIMILARITY_WEIGHTS,
  USER_PREF_WEIGHTS
}
