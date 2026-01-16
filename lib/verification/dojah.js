/**
 * Dojah API Integration for Identity Verification
 * Supports NIN, BVN, CAC verification and vehicle checks
 * https://docs.dojah.io
 */

const DOJAH_APP_ID = process.env.DOJAH_APP_ID
const DOJAH_SECRET_KEY = process.env.DOJAH_SECRET_KEY
const DOJAH_API_URL = process.env.DOJAH_API_URL || 'https://api.dojah.io'

/**
 * Make authenticated request to Dojah API
 */
async function dojahRequest(endpoint, method = 'GET', body = null) {
  if (!DOJAH_APP_ID || !DOJAH_SECRET_KEY) {
    console.warn('Dojah API credentials not configured')
    return {
      success: false,
      error: 'Dojah API credentials not configured',
      errorCode: 'CONFIG_ERROR'
    }
  }

  const url = `${DOJAH_API_URL}${endpoint}`
  const headers = {
    'Authorization': DOJAH_SECRET_KEY,
    'AppId': DOJAH_APP_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  const options = {
    method,
    headers
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data.error || data.message || 'API request failed',
        errorCode: data.error_code || 'API_ERROR',
        data
      }
    }

    return {
      success: true,
      status: response.status,
      data: data.entity || data.data || data
    }
  } catch (error) {
    console.error('Dojah API error:', error)
    return {
      success: false,
      error: error.message,
      errorCode: 'NETWORK_ERROR'
    }
  }
}

// ============================================================================
// NIN VERIFICATION
// ============================================================================

/**
 * Lookup NIN details
 * @param {string} nin - 11-digit National Identification Number
 */
export async function lookupNIN(nin) {
  if (!nin || nin.length !== 11) {
    return {
      success: false,
      error: 'Invalid NIN format. Must be 11 digits.',
      errorCode: 'INVALID_NIN'
    }
  }

  return dojahRequest(`/api/v1/kyc/nin?nin=${nin}`)
}

/**
 * Verify NIN with name matching
 * @param {string} nin - National Identification Number
 * @param {string} firstName - First name to verify
 * @param {string} lastName - Last name to verify
 */
export async function verifyNIN(nin, firstName, lastName) {
  if (!nin || nin.length !== 11) {
    return {
      success: false,
      error: 'Invalid NIN format. Must be 11 digits.',
      errorCode: 'INVALID_NIN'
    }
  }

  const result = await lookupNIN(nin)

  if (!result.success) {
    return result
  }

  // Check name match
  const ninData = result.data
  const ninFirstName = (ninData.first_name || ninData.firstName || '').toLowerCase()
  const ninLastName = (ninData.last_name || ninData.lastName || ninData.surname || '').toLowerCase()

  const inputFirstName = firstName.toLowerCase().trim()
  const inputLastName = lastName.toLowerCase().trim()

  const firstNameMatch = ninFirstName.includes(inputFirstName) || inputFirstName.includes(ninFirstName)
  const lastNameMatch = ninLastName.includes(inputLastName) || inputLastName.includes(ninLastName)

  const nameMatchScore = calculateNameMatchScore(
    `${inputFirstName} ${inputLastName}`,
    `${ninFirstName} ${ninLastName}`
  )

  return {
    success: true,
    data: {
      ...ninData,
      verification: {
        firstNameMatch,
        lastNameMatch,
        nameMatchScore,
        verified: firstNameMatch && lastNameMatch && nameMatchScore >= 70
      }
    }
  }
}

/**
 * Verify NIN with phone number
 * @param {string} nin - National Identification Number
 * @param {string} phoneNumber - Phone number to verify
 */
export async function verifyNINWithPhone(nin, phoneNumber) {
  if (!nin || nin.length !== 11) {
    return {
      success: false,
      error: 'Invalid NIN format. Must be 11 digits.',
      errorCode: 'INVALID_NIN'
    }
  }

  // Format phone number
  let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1)
  } else if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.substring(1)
  }

  return dojahRequest(`/api/v1/kyc/nin/verify?nin=${nin}&phone_number=${formattedPhone}`)
}

// ============================================================================
// BVN VERIFICATION
// ============================================================================

/**
 * Lookup BVN details
 * @param {string} bvn - 11-digit Bank Verification Number
 */
export async function lookupBVN(bvn) {
  if (!bvn || bvn.length !== 11) {
    return {
      success: false,
      error: 'Invalid BVN format. Must be 11 digits.',
      errorCode: 'INVALID_BVN'
    }
  }

  return dojahRequest(`/api/v1/kyc/bvn?bvn=${bvn}`)
}

/**
 * Verify BVN with name matching
 * @param {string} bvn - Bank Verification Number
 * @param {string} firstName - First name to verify
 * @param {string} lastName - Last name to verify
 */
export async function verifyBVN(bvn, firstName, lastName) {
  if (!bvn || bvn.length !== 11) {
    return {
      success: false,
      error: 'Invalid BVN format. Must be 11 digits.',
      errorCode: 'INVALID_BVN'
    }
  }

  const result = await lookupBVN(bvn)

  if (!result.success) {
    return result
  }

  // Check name match
  const bvnData = result.data
  const bvnFirstName = (bvnData.first_name || bvnData.firstName || '').toLowerCase()
  const bvnLastName = (bvnData.last_name || bvnData.lastName || bvnData.surname || '').toLowerCase()

  const inputFirstName = firstName.toLowerCase().trim()
  const inputLastName = lastName.toLowerCase().trim()

  const firstNameMatch = bvnFirstName.includes(inputFirstName) || inputFirstName.includes(bvnFirstName)
  const lastNameMatch = bvnLastName.includes(inputLastName) || inputLastName.includes(bvnLastName)

  const nameMatchScore = calculateNameMatchScore(
    `${inputFirstName} ${inputLastName}`,
    `${bvnFirstName} ${bvnLastName}`
  )

  return {
    success: true,
    data: {
      ...bvnData,
      verification: {
        firstNameMatch,
        lastNameMatch,
        nameMatchScore,
        verified: firstNameMatch && lastNameMatch && nameMatchScore >= 70
      }
    }
  }
}

/**
 * Advanced BVN verification with IGREE consent
 * @param {string} bvn - Bank Verification Number
 */
export async function verifyBVNAdvanced(bvn) {
  if (!bvn || bvn.length !== 11) {
    return {
      success: false,
      error: 'Invalid BVN format. Must be 11 digits.',
      errorCode: 'INVALID_BVN'
    }
  }

  return dojahRequest('/api/v1/kyc/bvn/advance', 'POST', { bvn })
}

// ============================================================================
// CAC VERIFICATION
// ============================================================================

/**
 * Lookup CAC business registration
 * @param {string} rcNumber - RC (Registration) Number
 */
export async function lookupCAC(rcNumber) {
  if (!rcNumber) {
    return {
      success: false,
      error: 'RC Number is required',
      errorCode: 'INVALID_RC'
    }
  }

  // Clean RC number (remove RC prefix if present)
  const cleanRC = rcNumber.replace(/^RC/i, '').trim()

  return dojahRequest(`/api/v1/kyc/cac?rc_number=${cleanRC}`)
}

/**
 * Verify CAC with business name matching
 * @param {string} rcNumber - RC Number
 * @param {string} businessName - Expected business name
 */
export async function verifyCAC(rcNumber, businessName) {
  const result = await lookupCAC(rcNumber)

  if (!result.success) {
    return result
  }

  const cacData = result.data
  const cacBusinessName = (cacData.company_name || cacData.companyName || cacData.business_name || '').toLowerCase()
  const inputBusinessName = businessName.toLowerCase().trim()

  const nameMatchScore = calculateNameMatchScore(inputBusinessName, cacBusinessName)

  return {
    success: true,
    data: {
      ...cacData,
      verification: {
        nameMatchScore,
        verified: nameMatchScore >= 60
      }
    }
  }
}

/**
 * Advanced CAC lookup with director information
 * @param {string} rcNumber - RC Number
 */
export async function lookupCACAdvanced(rcNumber) {
  if (!rcNumber) {
    return {
      success: false,
      error: 'RC Number is required',
      errorCode: 'INVALID_RC'
    }
  }

  const cleanRC = rcNumber.replace(/^RC/i, '').trim()

  return dojahRequest(`/api/v1/kyc/cac/advance?rc_number=${cleanRC}`)
}

// ============================================================================
// VEHICLE VERIFICATION
// ============================================================================

/**
 * Lookup vehicle by plate number
 * @param {string} plateNumber - Nigerian vehicle plate number
 */
export async function lookupVehiclePlate(plateNumber) {
  if (!plateNumber) {
    return {
      success: false,
      error: 'Plate number is required',
      errorCode: 'INVALID_PLATE'
    }
  }

  // Clean and format plate number
  const cleanPlate = plateNumber.replace(/[\s\-]/g, '').toUpperCase()

  return dojahRequest(`/api/v1/kyc/vehicle?vehicle_number=${cleanPlate}`)
}

/**
 * Check if vehicle is stolen
 * @param {string} plateNumber - Vehicle plate number
 * @param {string} vin - Vehicle Identification Number (optional)
 */
export async function checkStolenVehicle(plateNumber, vin = null) {
  if (!plateNumber && !vin) {
    return {
      success: false,
      error: 'Plate number or VIN is required',
      errorCode: 'INVALID_INPUT'
    }
  }

  let endpoint = '/api/v1/kyc/vehicle/stolen?'
  if (plateNumber) {
    endpoint += `vehicle_number=${plateNumber.replace(/[\s\-]/g, '').toUpperCase()}`
  }
  if (vin) {
    endpoint += `${plateNumber ? '&' : ''}vin=${vin}`
  }

  return dojahRequest(endpoint)
}

/**
 * Verify vehicle details match listing
 * @param {string} plateNumber - Plate number
 * @param {object} expectedDetails - Expected vehicle details
 */
export async function verifyVehicle(plateNumber, expectedDetails = {}) {
  const plateResult = await lookupVehiclePlate(plateNumber)

  if (!plateResult.success) {
    return plateResult
  }

  const stolenResult = await checkStolenVehicle(plateNumber)

  const vehicleData = plateResult.data
  const verification = {
    plateVerified: true,
    stolenCheckPassed: stolenResult.success && !stolenResult.data?.is_stolen,
    stolenReportFound: stolenResult.data?.is_stolen || false
  }

  // Check if details match
  if (expectedDetails.make) {
    const vehicleMake = (vehicleData.make || vehicleData.vehicle_make || '').toLowerCase()
    verification.makeMatch = vehicleMake.includes(expectedDetails.make.toLowerCase())
  }

  if (expectedDetails.model) {
    const vehicleModel = (vehicleData.model || vehicleData.vehicle_model || '').toLowerCase()
    verification.modelMatch = vehicleModel.includes(expectedDetails.model.toLowerCase())
  }

  if (expectedDetails.year) {
    const vehicleYear = parseInt(vehicleData.year || vehicleData.year_of_manufacture || 0)
    verification.yearMatch = vehicleYear === parseInt(expectedDetails.year)
  }

  if (expectedDetails.color) {
    const vehicleColor = (vehicleData.color || vehicleData.vehicle_color || '').toLowerCase()
    verification.colorMatch = vehicleColor.includes(expectedDetails.color.toLowerCase())
  }

  return {
    success: true,
    data: {
      ...vehicleData,
      stolenCheck: stolenResult.data,
      verification
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate name match score using Levenshtein distance
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} - Match score (0-100)
 */
function calculateNameMatchScore(name1, name2) {
  if (!name1 || !name2) return 0

  const s1 = name1.toLowerCase().trim()
  const s2 = name2.toLowerCase().trim()

  if (s1 === s2) return 100

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const shorter = s1.length < s2.length ? s1 : s2
    const longer = s1.length >= s2.length ? s1 : s2
    return Math.round((shorter.length / longer.length) * 100)
  }

  // Levenshtein distance
  const matrix = []
  const len1 = s1.length
  const len2 = s2.length

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return Math.round(((maxLen - distance) / maxLen) * 100)
}

/**
 * Validate NIN format
 * @param {string} nin - NIN to validate
 */
export function validateNIN(nin) {
  if (!nin) return false
  const cleanNIN = nin.replace(/\D/g, '')
  return cleanNIN.length === 11
}

/**
 * Validate BVN format
 * @param {string} bvn - BVN to validate
 */
export function validateBVN(bvn) {
  if (!bvn) return false
  const cleanBVN = bvn.replace(/\D/g, '')
  return cleanBVN.length === 11
}

/**
 * Validate Nigerian plate number format
 * @param {string} plateNumber - Plate number to validate
 */
export function validatePlateNumber(plateNumber) {
  if (!plateNumber) return false
  // Nigerian plate formats: ABC-123-DE, ABC123DE, etc.
  const cleanPlate = plateNumber.replace(/[\s\-]/g, '').toUpperCase()
  return /^[A-Z]{2,3}[0-9]{2,3}[A-Z]{2,3}$/.test(cleanPlate)
}

/**
 * Check if Dojah API is configured
 */
export function isDojahConfigured() {
  return !!(DOJAH_APP_ID && DOJAH_SECRET_KEY)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // NIN
  lookupNIN,
  verifyNIN,
  verifyNINWithPhone,
  // BVN
  lookupBVN,
  verifyBVN,
  verifyBVNAdvanced,
  // CAC
  lookupCAC,
  verifyCAC,
  lookupCACAdvanced,
  // Vehicle
  lookupVehiclePlate,
  checkStolenVehicle,
  verifyVehicle,
  // Helpers
  validateNIN,
  validateBVN,
  validatePlateNumber,
  isDojahConfigured,
  calculateNameMatchScore
}
