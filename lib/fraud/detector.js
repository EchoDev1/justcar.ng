/**
 * Fraud Detection Library
 * Rule-based fraud detection for car listings and dealers
 */

// Fraud severity levels
export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Fraud flag types
export const FLAG_TYPES = {
  PRICE_ANOMALY_LOW: 'price_anomaly_low',
  PRICE_ANOMALY_HIGH: 'price_anomaly_high',
  DUPLICATE_LISTING: 'duplicate_listing',
  DUPLICATE_PHOTOS: 'duplicate_photos',
  SUSPICIOUS_PHOTOS: 'suspicious_photos',
  RAPID_RELISTING: 'rapid_relisting',
  FAKE_MILEAGE: 'fake_mileage',
  STOLEN_VEHICLE: 'stolen_vehicle',
  MULTIPLE_LOCATIONS: 'multiple_locations',
  SUSPICIOUS_DEALER: 'suspicious_dealer',
  USER_REPORT: 'user_report',
  DESCRIPTION_MISMATCH: 'description_mismatch'
}

/**
 * Fraud detection rules configuration
 */
const FRAUD_RULES = [
  {
    id: 'price_anomaly_low',
    name: 'Suspiciously Low Price',
    description: 'Price is significantly below market average',
    check: (car, marketData) => {
      if (!marketData?.avg_price || !car.price) return null

      const variance = (car.price - marketData.avg_price) / marketData.avg_price

      if (variance <= -0.40) {
        return {
          flagType: FLAG_TYPES.PRICE_ANOMALY_LOW,
          severity: variance <= -0.60 ? SEVERITY.CRITICAL : variance <= -0.50 ? SEVERITY.HIGH : SEVERITY.MEDIUM,
          confidence: Math.min(Math.abs(variance) * 100, 100),
          description: `Price is ${Math.abs(Math.round(variance * 100))}% below market average`,
          data: {
            carPrice: car.price,
            marketAvg: marketData.avg_price,
            variancePercent: Math.round(variance * 100)
          }
        }
      }
      return null
    }
  },
  {
    id: 'price_anomaly_high',
    name: 'Suspiciously High Price',
    description: 'Price is significantly above market average',
    check: (car, marketData) => {
      if (!marketData?.avg_price || !car.price) return null

      const variance = (car.price - marketData.avg_price) / marketData.avg_price

      if (variance >= 0.50) {
        return {
          flagType: FLAG_TYPES.PRICE_ANOMALY_HIGH,
          severity: variance >= 0.80 ? SEVERITY.HIGH : SEVERITY.MEDIUM,
          confidence: Math.min(variance * 80, 100),
          description: `Price is ${Math.round(variance * 100)}% above market average`,
          data: {
            carPrice: car.price,
            marketAvg: marketData.avg_price,
            variancePercent: Math.round(variance * 100)
          }
        }
      }
      return null
    }
  },
  {
    id: 'fake_mileage',
    name: 'Suspicious Mileage',
    description: 'Mileage seems inconsistent with vehicle age',
    check: (car) => {
      if (!car.mileage || !car.year) return null

      const currentYear = new Date().getFullYear()
      const carAge = currentYear - car.year

      // Average mileage: 12,000-15,000 km per year for Nigeria
      const expectedMinMileage = carAge * 8000
      const expectedMaxMileage = carAge * 25000

      // Very low mileage for old car (possible rollback)
      if (carAge >= 5 && car.mileage < expectedMinMileage * 0.3) {
        return {
          flagType: FLAG_TYPES.FAKE_MILEAGE,
          severity: SEVERITY.MEDIUM,
          confidence: 70,
          description: `Mileage (${car.mileage.toLocaleString()} km) seems too low for a ${carAge}-year-old vehicle`,
          data: {
            carMileage: car.mileage,
            carAge,
            expectedRange: `${expectedMinMileage.toLocaleString()} - ${expectedMaxMileage.toLocaleString()} km`
          }
        }
      }

      // New car with very high mileage
      if (carAge <= 2 && car.mileage > expectedMaxMileage * 2) {
        return {
          flagType: FLAG_TYPES.FAKE_MILEAGE,
          severity: SEVERITY.LOW,
          confidence: 50,
          description: `Mileage (${car.mileage.toLocaleString()} km) seems high for a ${carAge}-year-old vehicle`,
          data: {
            carMileage: car.mileage,
            carAge,
            expectedRange: `${expectedMinMileage.toLocaleString()} - ${expectedMaxMileage.toLocaleString()} km`
          }
        }
      }

      return null
    }
  },
  {
    id: 'rapid_relisting',
    name: 'Rapid Relisting',
    description: 'Same dealer listing same type of car repeatedly',
    check: (car, _, dealerHistory) => {
      if (!dealerHistory?.recentListings) return null

      const similarListings = dealerHistory.recentListings.filter(listing =>
        listing.make === car.make &&
        listing.model === car.model &&
        listing.year >= car.year - 1 &&
        listing.year <= car.year + 1 &&
        listing.id !== car.id
      )

      if (similarListings.length >= 3) {
        return {
          flagType: FLAG_TYPES.RAPID_RELISTING,
          severity: similarListings.length >= 5 ? SEVERITY.HIGH : SEVERITY.MEDIUM,
          confidence: Math.min(similarListings.length * 20, 90),
          description: `Dealer has listed ${similarListings.length} similar ${car.make} ${car.model} vehicles recently`,
          data: {
            similarCount: similarListings.length,
            make: car.make,
            model: car.model
          }
        }
      }

      return null
    }
  },
  {
    id: 'multiple_locations',
    name: 'Multiple Locations',
    description: 'Same car listed in different locations',
    check: (car, _, __, allListings) => {
      if (!allListings) return null

      // Find potential duplicates (same make, model, year, similar price)
      const potentialDuplicates = allListings.filter(listing =>
        listing.id !== car.id &&
        listing.make === car.make &&
        listing.model === car.model &&
        listing.year === car.year &&
        Math.abs(listing.price - car.price) / car.price < 0.1 && // Within 10% price
        listing.location !== car.location
      )

      if (potentialDuplicates.length > 0) {
        return {
          flagType: FLAG_TYPES.MULTIPLE_LOCATIONS,
          severity: SEVERITY.MEDIUM,
          confidence: 60,
          description: `Similar listing found in ${potentialDuplicates.length} other location(s)`,
          data: {
            otherLocations: potentialDuplicates.map(d => d.location),
            duplicateIds: potentialDuplicates.map(d => d.id)
          }
        }
      }

      return null
    }
  }
]

/**
 * Run fraud detection on a car listing
 * @param {object} car - The car listing to check
 * @param {object} marketData - Market price data for the car
 * @param {object} dealerHistory - Dealer's listing history
 * @param {array} allListings - All platform listings (for duplicate detection)
 * @returns {array} - Array of fraud flags
 */
export function detectFraud(car, marketData = null, dealerHistory = null, allListings = null) {
  if (!car) return []

  const flags = []

  for (const rule of FRAUD_RULES) {
    try {
      const result = rule.check(car, marketData, dealerHistory, allListings)
      if (result) {
        flags.push({
          ...result,
          ruleId: rule.id,
          ruleName: rule.name,
          carId: car.id,
          dealerId: car.dealer_id,
          detectedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error(`Error running fraud rule ${rule.id}:`, error)
    }
  }

  return flags
}

/**
 * Calculate overall risk score for a listing
 * @param {array} flags - Array of fraud flags
 * @returns {object} - Risk assessment
 */
export function calculateRiskScore(flags) {
  if (!flags || flags.length === 0) {
    return {
      score: 0,
      level: 'safe',
      flags: []
    }
  }

  // Weight by severity
  const severityWeights = {
    [SEVERITY.LOW]: 10,
    [SEVERITY.MEDIUM]: 25,
    [SEVERITY.HIGH]: 50,
    [SEVERITY.CRITICAL]: 100
  }

  let totalScore = 0
  for (const flag of flags) {
    const weight = severityWeights[flag.severity] || 10
    const confidence = flag.confidence || 50
    totalScore += (weight * confidence) / 100
  }

  // Cap at 100
  const score = Math.min(Math.round(totalScore), 100)

  // Determine risk level
  let level = 'safe'
  if (score >= 80) level = 'critical'
  else if (score >= 50) level = 'high'
  else if (score >= 25) level = 'medium'
  else if (score > 0) level = 'low'

  return {
    score,
    level,
    flags
  }
}

/**
 * Check if a dealer should be flagged
 * @param {object} dealer - Dealer information
 * @param {array} dealerFlags - Flags associated with dealer's listings
 * @returns {object|null} - Dealer flag or null
 */
export function checkDealerSuspicious(dealer, dealerFlags) {
  if (!dealerFlags || dealerFlags.length === 0) return null

  // Count critical and high severity flags
  const criticalCount = dealerFlags.filter(f => f.severity === SEVERITY.CRITICAL).length
  const highCount = dealerFlags.filter(f => f.severity === SEVERITY.HIGH).length

  // If multiple critical flags or many high flags, flag the dealer
  if (criticalCount >= 2 || highCount >= 5 || (criticalCount >= 1 && highCount >= 3)) {
    return {
      flagType: FLAG_TYPES.SUSPICIOUS_DEALER,
      severity: criticalCount >= 2 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
      confidence: Math.min(50 + criticalCount * 20 + highCount * 10, 100),
      description: `Dealer has ${criticalCount} critical and ${highCount} high-severity flags`,
      data: {
        criticalCount,
        highCount,
        totalFlags: dealerFlags.length,
        flagTypes: [...new Set(dealerFlags.map(f => f.flagType))]
      }
    }
  }

  return null
}

/**
 * Format flag for display
 * @param {object} flag - Fraud flag
 * @returns {object} - Formatted flag
 */
export function formatFlagForDisplay(flag) {
  const severityLabels = {
    [SEVERITY.LOW]: 'Low Risk',
    [SEVERITY.MEDIUM]: 'Medium Risk',
    [SEVERITY.HIGH]: 'High Risk',
    [SEVERITY.CRITICAL]: 'Critical'
  }

  const severityColors = {
    [SEVERITY.LOW]: 'yellow',
    [SEVERITY.MEDIUM]: 'orange',
    [SEVERITY.HIGH]: 'red',
    [SEVERITY.CRITICAL]: 'red'
  }

  return {
    ...flag,
    severityLabel: severityLabels[flag.severity] || 'Unknown',
    severityColor: severityColors[flag.severity] || 'gray',
    confidenceLabel: `${flag.confidence}% confident`
  }
}

/**
 * Get recommended action for a flag
 * @param {object} flag - Fraud flag
 * @returns {string} - Recommended action
 */
export function getRecommendedAction(flag) {
  switch (flag.flagType) {
    case FLAG_TYPES.PRICE_ANOMALY_LOW:
      return flag.severity === SEVERITY.CRITICAL
        ? 'Block listing immediately and investigate dealer'
        : 'Review listing and contact dealer for verification'

    case FLAG_TYPES.PRICE_ANOMALY_HIGH:
      return 'Suggest price adjustment to dealer'

    case FLAG_TYPES.DUPLICATE_LISTING:
    case FLAG_TYPES.DUPLICATE_PHOTOS:
      return 'Remove duplicate and warn dealer'

    case FLAG_TYPES.STOLEN_VEHICLE:
      return 'Block listing immediately and report to authorities'

    case FLAG_TYPES.FAKE_MILEAGE:
      return 'Request odometer verification photo'

    case FLAG_TYPES.RAPID_RELISTING:
      return 'Monitor dealer activity'

    case FLAG_TYPES.SUSPICIOUS_DEALER:
      return 'Suspend dealer account pending review'

    default:
      return 'Review and take appropriate action'
  }
}

export default {
  detectFraud,
  calculateRiskScore,
  checkDealerSuspicious,
  formatFlagForDisplay,
  getRecommendedAction,
  FRAUD_RULES,
  FLAG_TYPES,
  SEVERITY
}
