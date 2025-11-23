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
 * Popular car makes in Nigeria
 */
export const CAR_MAKES = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'Lexus', 'BMW', 'Nissan',
  'Ford', 'Hyundai', 'Kia', 'Volkswagen', 'Audi', 'Peugeot',
  'Chevrolet', 'Mazda', 'Mitsubishi', 'Land Rover', 'Range Rover',
  'Porsche', 'Acura', 'Infiniti', 'Jeep', 'Subaru', 'Suzuki',
  'Volvo', 'Chrysler', 'Dodge', 'Cadillac', 'Jaguar', 'Other'
]

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
