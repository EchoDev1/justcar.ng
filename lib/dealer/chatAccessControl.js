/**
 * Chat Access Control for Dealers
 * Defines what each dealer subscription tier can access
 */

export const SUBSCRIPTION_TIERS = {
  VERIFIED: 'verified',        // Free tier - just verified
  PREMIUM: 'premium',          // Premium subscription
  LUXURY: 'luxury'             // Luxury subscription (highest tier)
}

export const CHAT_ACCESS_RULES = {
  [SUBSCRIPTION_TIERS.VERIFIED]: {
    canChatWithBuyers: true,
    canChatPremiumBuyers: false,
    canChatLuxuryBuyers: false,
    canPostInPremiumCollection: false,
    canPostInLuxuryCollection: false,
    description: 'Can only chat with buyers viewing their verified listings'
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    canChatWithBuyers: true,
    canChatPremiumBuyers: true,
    canChatLuxuryBuyers: false,
    canPostInPremiumCollection: true,
    canPostInLuxuryCollection: false,
    description: 'Can post in Premium Verified Collection and chat with premium buyers'
  },
  [SUBSCRIPTION_TIERS.LUXURY]: {
    canChatWithBuyers: true,
    canChatPremiumBuyers: true,
    canChatLuxuryBuyers: true,
    canPostInPremiumCollection: true,
    canPostInLuxuryCollection: true,
    description: 'Full access: Luxury + Premium Collection posting + chat all buyer tiers'
  }
}

/**
 * Check if dealer can chat with a specific buyer based on subscription tier
 * @param {string} dealerTier - Dealer's subscription tier
 * @param {string} buyerType - Buyer type (regular, premium, luxury)
 * @returns {boolean}
 */
export function canDealerChatWithBuyer(dealerTier, buyerType = 'regular') {
  const rules = CHAT_ACCESS_RULES[dealerTier] || CHAT_ACCESS_RULES[SUBSCRIPTION_TIERS.VERIFIED]

  // All dealers can chat with regular buyers
  if (!buyerType || buyerType === 'regular') {
    return rules.canChatWithBuyers
  }

  // Check premium buyer access
  if (buyerType === 'premium') {
    return rules.canChatPremiumBuyers
  }

  // Check luxury buyer access
  if (buyerType === 'luxury') {
    return rules.canChatLuxuryBuyers
  }

  return false
}

/**
 * Check if dealer can post in Premium Verified Collection
 * @param {string} dealerTier - Dealer's subscription tier
 * @returns {boolean}
 */
export function canPostInPremiumCollection(dealerTier) {
  const rules = CHAT_ACCESS_RULES[dealerTier] || CHAT_ACCESS_RULES[SUBSCRIPTION_TIERS.VERIFIED]
  return rules.canPostInPremiumCollection
}

/**
 * Check if dealer can post in Luxury Collection
 * @param {string} dealerTier - Dealer's subscription tier
 * @returns {boolean}
 */
export function canPostInLuxuryCollection(dealerTier) {
  const rules = CHAT_ACCESS_RULES[dealerTier] || CHAT_ACCESS_RULES[SUBSCRIPTION_TIERS.VERIFIED]
  return rules.canPostInLuxuryCollection
}

/**
 * Get dealer's full access permissions
 * @param {Object} dealer - Dealer object with subscription_tier
 * @returns {Object} Full permissions object
 */
export function getDealerPermissions(dealer) {
  const tier = dealer?.subscription_tier || dealer?.badge_type || SUBSCRIPTION_TIERS.VERIFIED
  const rules = CHAT_ACCESS_RULES[tier] || CHAT_ACCESS_RULES[SUBSCRIPTION_TIERS.VERIFIED]

  return {
    tier,
    ...rules,
    displayName: getSubscriptionDisplayName(tier)
  }
}

/**
 * Get display name for subscription tier
 * @param {string} tier - Subscription tier
 * @returns {string}
 */
export function getSubscriptionDisplayName(tier) {
  const names = {
    [SUBSCRIPTION_TIERS.VERIFIED]: 'Verified Dealer',
    [SUBSCRIPTION_TIERS.PREMIUM]: 'Premium Dealer',
    [SUBSCRIPTION_TIERS.LUXURY]: 'Luxury Dealer'
  }
  return names[tier] || 'Verified Dealer'
}

/**
 * Get subscription tier benefits for display
 * @param {string} tier - Subscription tier
 * @returns {Array<string>}
 */
export function getSubscriptionBenefits(tier) {
  const benefits = {
    [SUBSCRIPTION_TIERS.VERIFIED]: [
      '✓ Chat with all your car buyers',
      '✓ List unlimited verified cars',
      '✓ Basic dealer dashboard',
      '✓ Standard support'
    ],
    [SUBSCRIPTION_TIERS.PREMIUM]: [
      '✓ Everything in Verified tier',
      '✓ Post in Premium Verified Collection',
      '✓ Chat with premium buyers',
      '✓ Enhanced listing visibility',
      '✓ Priority support',
      '✓ Advanced analytics'
    ],
    [SUBSCRIPTION_TIERS.LUXURY]: [
      '✓ Everything in Premium tier',
      '✓ Post in Luxury Collection',
      '✓ Chat with luxury buyers',
      '✓ Maximum listing visibility',
      '✓ VIP support (24/7)',
      '✓ Premium analytics dashboard',
      '✓ Featured dealer badge'
    ]
  }
  return benefits[tier] || benefits[SUBSCRIPTION_TIERS.VERIFIED]
}
