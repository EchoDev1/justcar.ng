/**
 * Unified Payment Gateway Interface
 * Provides a single interface to work with multiple payment gateways
 */

import * as Paystack from './paystack'
import * as Flutterwave from './flutterwave'

// Default gateway (can be changed via environment variable)
const DEFAULT_GATEWAY = process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_GATEWAY || 'paystack'

/**
 * Initialize payment with the default or specified gateway
 * @param {Object} options - Payment options
 * @param {string} options.gateway - Payment gateway ('paystack' or 'flutterwave')
 * @returns {Promise<Object>} Payment initialization response
 */
export async function initializePayment(options) {
  const gateway = options.gateway || DEFAULT_GATEWAY

  if (gateway === 'paystack') {
    return await Paystack.initializePayment(options)
  } else if (gateway === 'flutterwave') {
    return await Flutterwave.initializePayment(options)
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Verify payment with the specified gateway
 * @param {string} reference - Payment reference
 * @param {string} gateway - Payment gateway
 * @returns {Promise<Object>} Verification response
 */
export async function verifyPayment(reference, gateway = DEFAULT_GATEWAY) {
  if (gateway === 'paystack') {
    return await Paystack.verifyPayment(reference)
  } else if (gateway === 'flutterwave') {
    return await Flutterwave.verifyTransaction(reference)
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Open payment modal/popup
 * @param {Object} options - Payment options
 */
export function openPaymentModal(options) {
  const gateway = options.gateway || DEFAULT_GATEWAY

  if (gateway === 'paystack') {
    Paystack.openPaystackPopup(options)
  } else if (gateway === 'flutterwave') {
    Flutterwave.openFlutterwaveModal(options)
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Generate payment reference
 * @param {string} prefix - Reference prefix
 * @param {string} gateway - Payment gateway
 * @returns {string} Unique reference
 */
export function generateReference(prefix = 'PAY', gateway = DEFAULT_GATEWAY) {
  if (gateway === 'paystack') {
    return Paystack.generateReference(prefix)
  } else if (gateway === 'flutterwave') {
    return Flutterwave.generateReference(prefix)
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Get list of banks
 * @param {string} gateway - Payment gateway
 * @returns {Promise<Array>} List of banks
 */
export async function getBanks(gateway = DEFAULT_GATEWAY) {
  if (gateway === 'paystack') {
    return await Paystack.getBanks()
  } else if (gateway === 'flutterwave') {
    return await Flutterwave.getBanks()
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Verify bank account number
 * @param {string} accountNumber - Account number
 * @param {string} bankCode - Bank code
 * @param {string} gateway - Payment gateway
 * @returns {Promise<Object>} Account details
 */
export async function verifyAccountNumber(accountNumber, bankCode, gateway = DEFAULT_GATEWAY) {
  if (gateway === 'paystack') {
    return await Paystack.verifyAccountNumber(accountNumber, bankCode)
  } else if (gateway === 'flutterwave') {
    return await Flutterwave.verifyAccountNumber(accountNumber, bankCode)
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Initiate transfer to a recipient
 * @param {Object} options - Transfer options
 * @param {string} gateway - Payment gateway
 * @returns {Promise<Object>} Transfer response
 */
export async function initiateTransfer(options, gateway = DEFAULT_GATEWAY) {
  if (gateway === 'paystack') {
    return await Paystack.initiateTransfer(options)
  } else if (gateway === 'flutterwave') {
    return await Flutterwave.initiateTransfer(options)
  } else {
    throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

/**
 * Calculate escrow fee (1.5% of car price)
 * @param {number} carPrice - Car price in Naira
 * @returns {number} Escrow fee
 */
export function calculateEscrowFee(carPrice) {
  return Math.round(carPrice * 0.015 * 100) / 100 // 1.5%, rounded to 2 decimal places
}

/**
 * Calculate total amount with escrow fee
 * @param {number} carPrice - Car price in Naira
 * @returns {Object} Breakdown of amounts
 */
export function calculateEscrowTotal(carPrice) {
  const escrowFee = calculateEscrowFee(carPrice)
  const totalAmount = carPrice + escrowFee

  return {
    carPrice,
    escrowFee,
    totalAmount,
    breakdown: {
      car_price: carPrice.toFixed(2),
      escrow_fee: escrowFee.toFixed(2),
      total: totalAmount.toFixed(2)
    }
  }
}

/**
 * Format amount to Naira currency
 * @param {number} amount - Amount
 * @returns {string} Formatted amount
 */
export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Alias for formatNaira (for consistency)
 * @param {number} amount - Amount
 * @returns {string} Formatted amount
 */
export const formatCurrency = formatNaira

/**
 * Payment transaction types
 */
export const TRANSACTION_TYPES = {
  BADGE_SUBSCRIPTION: 'badge_subscription',
  FEATURED_LISTING: 'featured_listing',
  BUYER_VERIFICATION: 'buyer_verification',
  ESCROW_FUNDING: 'escrow_funding',
  ESCROW_RELEASE: 'escrow_release',
  ESCROW_REFUND: 'escrow_refund'
}

/**
 * Badge pricing
 */
export const BADGE_PRICING = {
  verified: {
    price: 0,
    name: 'Verified Badge',
    description: 'Free verification badge for dealers'
  },
  premium: {
    price: 30000, // ₦30,000 (middle of ₦25k-₦40k range)
    name: 'Premium Dealer Badge',
    description: 'Enhanced visibility and premium features'
  },
  luxury: {
    price: 100000, // ₦100,000
    name: 'Luxury Dealer Badge',
    description: 'Ultimate dealer status for luxury vehicles'
  }
}

/**
 * Featured listing pricing
 */
export const FEATURED_PRICING = {
  single: {
    min: 3000,
    max: 10000,
    default: 5000,
    name: 'Single Featured Listing',
    description: 'Feature one car at the top of search results'
  },
  monthly: {
    min: 15000,
    max: 50000,
    default: 25000,
    name: 'Monthly Featured Package',
    description: 'Multiple featured slots for a full month'
  }
}

/**
 * Buyer verification fee
 */
export const BUYER_VERIFICATION_FEE = 2000 // ₦2,000

// Export individual gateway modules
export { Paystack, Flutterwave }

export default {
  initializePayment,
  verifyPayment,
  openPaymentModal,
  generateReference,
  getBanks,
  verifyAccountNumber,
  initiateTransfer,
  calculateEscrowFee,
  calculateEscrowTotal,
  formatNaira,
  formatCurrency,
  TRANSACTION_TYPES,
  BADGE_PRICING,
  FEATURED_PRICING,
  BUYER_VERIFICATION_FEE,
  Paystack,
  Flutterwave
}
