/**
 * Utility Functions for the Nigerian Car Marketplace
 */

/**
 * Format price in Nigerian Naira
 * @param {number} price - The price to format
 * @returns {string} Formatted price string (e.g., "₦15,500,000")
 */
export function formatNaira(price) {
  if (!price && price !== 0) return '₦0'
  return `₦${parseInt(price).toLocaleString('en-NG')}`
}

/**
 * Format number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '0'
  return parseInt(num).toLocaleString('en-NG')
}

/**
 * Nigerian States - Complete list of all 36 states + FCT
 */
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

/**
 * Popular car makes in Nigeria (includes all luxury brands)
 */
export const CAR_MAKES = [
  // Luxury & Ultra-Luxury Brands
  'Rolls-Royce', 'Bentley', 'Lamborghini', 'Ferrari', 'Porsche',
  'Maserati', 'Aston Martin', 'McLaren', 'Bugatti', 'Maybach',
  'Mercedes-AMG', 'BMW M', 'Audi RS',
  // Premium Brands
  'Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Jaguar', 'Land Rover',
  'Range Rover', 'Cadillac', 'Lincoln', 'Genesis', 'Alfa Romeo',
  'Volvo', 'Infiniti', 'Acura',
  // Popular Brands
  'Toyota', 'Honda', 'Nissan', 'Ford', 'Hyundai', 'Kia',
  'Volkswagen', 'Peugeot', 'Chevrolet', 'Mazda', 'Mitsubishi',
  'Jeep', 'Subaru', 'Suzuki', 'Chrysler', 'Dodge',
  // Other
  'Other'
]

/**
 * Brand abbreviations for display
 * Maps brand names to their short display letters/codes
 */
export const BRAND_ABBREVIATIONS = {
  // Ultra-Luxury Brands
  'Rolls-Royce': 'RR',
  'Bentley': 'B',
  'Lamborghini': 'L',
  'Ferrari': 'F',
  'Porsche': 'P',
  'Maserati': 'M',
  'Aston Martin': 'AM',
  'McLaren': 'MC',
  'Bugatti': 'BG',
  'Maybach': 'MB',
  'Mercedes-AMG': 'AMG',
  // Premium Brands
  'Mercedes-Benz': 'MB',
  'BMW': 'BMW',
  'BMW M': 'M',
  'Audi': 'A',
  'Audi RS': 'RS',
  'Lexus': 'LX',
  'Jaguar': 'J',
  'Land Rover': 'LR',
  'Range Rover': 'RR',
  'Cadillac': 'C',
  'Lincoln': 'L',
  'Genesis': 'G',
  'Alfa Romeo': 'AR',
  'Volvo': 'V',
  'Infiniti': 'I',
  'Acura': 'AC',
  // Popular Brands
  'Toyota': 'T',
  'Honda': 'H',
  'Nissan': 'N',
  'Ford': 'F',
  'Hyundai': 'HY',
  'Kia': 'K',
  'Volkswagen': 'VW',
  'Peugeot': 'PG',
  'Chevrolet': 'CH',
  'Mazda': 'MZ',
  'Mitsubishi': 'MT',
  'Jeep': 'JP',
  'Subaru': 'SB',
  'Suzuki': 'SZ',
  'Chrysler': 'CR',
  'Dodge': 'DG'
}

/**
 * Brand colors for display
 * Maps brand names to their official/signature colors
 */
export const BRAND_COLORS = {
  // Ultra-Luxury Brands
  'Rolls-Royce': '#8B4513',
  'Bentley': '#006341',
  'Lamborghini': '#FFC300',
  'Ferrari': '#DC0000',
  'Porsche': '#D5001C',
  'Maserati': '#0C2340',
  'Aston Martin': '#004225',
  'McLaren': '#FF8000',
  'Bugatti': '#C40234',
  'Maybach': '#000000',
  'Mercedes-AMG': '#00ADEF',
  // Premium Brands
  'Mercedes-Benz': '#333333',
  'BMW': '#0066B1',
  'BMW M': '#E31837',
  'Audi': '#BB0A30',
  'Audi RS': '#00A651',
  'Lexus': '#1A1A1A',
  'Jaguar': '#366B1F',
  'Land Rover': '#005A2B',
  'Range Rover': '#005A2B',
  'Cadillac': '#C4A000',
  'Lincoln': '#2B2B2B',
  'Genesis': '#8B7355',
  'Alfa Romeo': '#8B0000',
  'Volvo': '#003057',
  'Infiniti': '#5C5C5C',
  'Acura': '#E31837',
  // Popular Brands
  'Toyota': '#EB0A1E',
  'Honda': '#E40521',
  'Nissan': '#C3002F',
  'Ford': '#003478',
  'Hyundai': '#002C5F',
  'Kia': '#05141F',
  'Volkswagen': '#001E50',
  'Peugeot': '#1B3C71',
  'Chevrolet': '#D1A000',
  'Mazda': '#910000',
  'Mitsubishi': '#E60012',
  'Jeep': '#374740',
  'Subaru': '#013C8E',
  'Suzuki': '#E5001A',
  'Chrysler': '#0047AB',
  'Dodge': '#BA0C2F'
}

/**
 * Luxury brands list (for filtering luxury section)
 * Only cars from these brands AND price >= 150M show in luxury section
 */
export const LUXURY_BRANDS = [
  'Rolls-Royce', 'Bentley', 'Lamborghini', 'Ferrari', 'Porsche',
  'Maserati', 'Aston Martin', 'McLaren', 'Bugatti', 'Maybach',
  'Mercedes-AMG', 'Range Rover'
]

/**
 * Luxury price threshold in Naira
 */
export const LUXURY_PRICE_THRESHOLD = 150000000

/**
 * Get brand abbreviation - auto-generates if not defined
 * @param {string} brandName - The brand name
 * @returns {string} Brand abbreviation
 */
export function getBrandAbbreviation(brandName) {
  if (!brandName) return '?'

  // Return predefined abbreviation if exists
  if (BRAND_ABBREVIATIONS[brandName]) {
    return BRAND_ABBREVIATIONS[brandName]
  }

  // Auto-generate abbreviation for new brands
  const words = brandName.trim().split(/[\s-]+/)

  if (words.length === 1) {
    // Single word: use first 1-2 letters
    return brandName.substring(0, 2).toUpperCase()
  } else if (words.length === 2) {
    // Two words: use first letter of each word
    return (words[0][0] + words[1][0]).toUpperCase()
  } else {
    // Multiple words: use first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase()
  }
}

/**
 * Get brand color - returns default if not defined
 * @param {string} brandName - The brand name
 * @returns {string} Brand color hex code
 */
export function getBrandColor(brandName) {
  if (!brandName) return '#333333'
  return BRAND_COLORS[brandName] || '#333333'
}

/**
 * Check if a brand is a luxury brand
 * @param {string} brandName - The brand name
 * @returns {boolean} True if luxury brand
 */
export function isLuxuryBrand(brandName) {
  if (!brandName) return false
  return LUXURY_BRANDS.includes(brandName)
}

/**
 * Check if a car qualifies for luxury section
 * @param {object} car - Car object with make and price
 * @returns {boolean} True if car qualifies for luxury section
 */
export function isLuxuryCar(car) {
  if (!car) return false
  return car.price >= LUXURY_PRICE_THRESHOLD
}

/**
 * Car body types
 */
export const BODY_TYPES = [
  'Sedan', 'SUV', 'Hatchback', 'Wagon', 'Coupe', 'Convertible',
  'Pickup Truck', 'Minivan', 'Van', 'Bus', 'Truck'
]

/**
 * Fuel types
 */
export const FUEL_TYPES = [
  'Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'
]

/**
 * Transmission types
 */
export const TRANSMISSIONS = [
  'Automatic', 'Manual', 'CVT', 'Semi-Automatic'
]

/**
 * Car conditions
 */
export const CONDITIONS = [
  'New', 'Nigerian Used', 'Foreign Used'
]

/**
 * Common car colors
 */
export const COLORS = [
  'Black', 'White', 'Silver', 'Grey', 'Red', 'Blue', 'Green',
  'Brown', 'Gold', 'Beige', 'Orange', 'Yellow', 'Purple', 'Other'
]

/**
 * Common car features
 */
export const CAR_FEATURES = [
  'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking',
  'Alloy Wheels', 'Leather Seats', 'Fabric Seats', 'Sunroof', 'Moonroof',
  'Navigation System', 'GPS', 'Reverse Camera', 'Parking Sensors',
  'Bluetooth', 'USB Port', 'Aux Input', 'CD Player', 'DVD Player',
  'Touch Screen Display', 'Climate Control', 'Heated Seats', 'Cooled Seats',
  'Electric Mirrors', 'Fog Lights', 'Xenon Lights', 'LED Lights',
  'Cruise Control', 'Keyless Entry', 'Push Start Button', 'Alarm System',
  'Immobilizer', 'ABS', 'Airbags', 'Traction Control', 'Stability Control',
  'Hill Assist', 'Lane Departure Warning', 'Blind Spot Monitor',
  'Premium Sound System', 'Subwoofer', 'Apple CarPlay', 'Android Auto'
]

/**
 * Generate WhatsApp message for car inquiry
 * @param {object} car - Car object with details
 * @param {string} dealerPhone - Dealer's WhatsApp number
 * @returns {string} WhatsApp URL
 */
export function generateWhatsAppLink(car, dealerPhone) {
  const message = `Hello, I'm interested in the ${car.year} ${car.make} ${car.model} listed for ${formatNaira(car.price)}. Is it still available?`
  const encodedMessage = encodeURIComponent(message)
  const phoneNumber = dealerPhone.replace(/[^0-9]/g, '')
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get time ago string
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string (e.g., "2 days ago")
 */
export function getTimeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return interval === 1 ? '1 year ago' : `${interval} years ago`

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return interval === 1 ? '1 month ago' : `${interval} months ago`

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return interval === 1 ? '1 day ago' : `${interval} days ago`

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return interval === 1 ? '1 hour ago' : `${interval} hours ago`

  interval = Math.floor(seconds / 60)
  if (interval >= 1) return interval === 1 ? '1 minute ago' : `${interval} minutes ago`

  return 'Just now'
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 100) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Class names helper (simple version)
 * @param  {...any} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
