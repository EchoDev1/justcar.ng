/**
 * Dealer Subscription Management
 * Premium subscription tiers with amazing UI
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Crown, Star, Shield, Check, Zap, TrendingUp, MessageSquare,
  BarChart3, Users, Clock, CreditCard, Sparkles, Rocket
} from 'lucide-react'

export default function DealerSubscriptionPage() {
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    loadDealerData()
  }, [])

  const loadDealerData = async () => {
    try {
      // OPTIMIZED: Use custom dealer auth API
      const response = await fetch('/api/dealer/me', {
        credentials: 'include'
      })

      if (!response.ok) {
        setLoading(false)
        return
      }

      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading dealer:', error)
      setLoading(false)
    }
  }

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Verified Dealer',
      icon: Shield,
      price: 0,
      period: 'Free Forever',
      color: 'gray',
      gradient: 'from-gray-600 to-gray-700',
      features: [
        'List unlimited cars',
        'Basic car management',
        'Verified dealer badge',
        'Email notifications',
        'Standard support'
      ],
      limitations: [
        'No analytics dashboard',
        'No direct messaging',
        'No premium badges',
        'No priority listings'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Dealer',
      icon: Star,
      price: 25000,
      period: 'per month',
      popular: true,
      color: 'purple',
      gradient: 'from-purple-600 to-blue-600',
      features: [
        'Everything in Verified',
        'Advanced analytics dashboard',
        'Direct buyer messaging',
        'Premium dealer badge',
        'Priority search listings',
        'Featured car slots (3)',
        'Monthly performance reports',
        'Priority support',
        'Marketing tools'
      ],
      limitations: []
    },
    {
      id: 'luxury',
      name: 'Luxury Dealer',
      icon: Crown,
      price: 50000,
      period: 'per month',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
      features: [
        'Everything in Premium',
        'Luxury dealer badge with crown',
        'Unlimited featured listings',
        'Advanced buyer insights',
        'Dedicated account manager',
        'Custom dealership page',
        'Video showcase support',
        'VIP support (24/7)',
        'Social media promotion',
        'Exclusive luxury network',
        'API access',
        'White-label options'
      ],
      limitations: []
    }
  ]

  const handleSubscribe = async (planId) => {
    if (planId === dealer?.subscription_tier) {
      alert('You are already subscribed to this plan!')
      return
    }

    if (planId === 'basic') {
      // Downgrade confirmation
      if (!confirm('Are you sure you want to downgrade to the free plan? You will lose access to premium features.')) {
        return
      }
    }

    setSelectedPlan(planId)
    setSubscribing(true)

    try {
      const supabase = createClient()

      if (planId === 'basic') {
        // Downgrade to basic (free)
        const { error } = await supabase
          .from('dealers')
          .update({
            subscription_tier: 'basic',
            subscription_status: 'active',
            subscription_updated_at: new Date().toISOString()
          })
          .eq('id', dealer.id)

        if (error) throw error

        alert('Successfully downgraded to Verified Dealer plan.')
        await loadDealerData()
      } else {
        // Upgrade to premium or luxury
        // In a real implementation, this would integrate with the payment system
        // For now, we'll simulate the upgrade

        const plan = subscriptionPlans.find(p => p.id === planId)

        if (confirm(`Subscribe to ${plan.name} for ₦${plan.price.toLocaleString()} per month?\n\nClick OK to proceed to payment.`)) {
          // TODO: Integrate with actual payment gateway (Paystack/Flutterwave)
          // For now, we'll mark as pending

          const { error } = await supabase
            .from('dealers')
            .update({
              subscription_tier: planId,
              subscription_status: 'pending',
              subscription_amount: plan.price,
              subscription_updated_at: new Date().toISOString()
            })
            .eq('id', dealer.id)

          if (error) throw error

          alert(`Subscription request submitted!\n\nPlan: ${plan.name}\nAmount: ₦${plan.price.toLocaleString()}/month\n\nOur team will contact you shortly with payment details.`)
          await loadDealerData()
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to update subscription. Please try again.')
    } finally {
      setSubscribing(false)
      setSelectedPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  const currentPlan = subscriptionPlans.find(p => p.id === (dealer?.subscription_tier || 'basic'))

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full mb-4">
          <Sparkles className="inline w-5 h-5 mr-2" />
          <span className="font-bold">Subscription Plans</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Choose Your <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Power Level</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock premium features and grow your dealership with our flexible subscription plans
        </p>
      </div>

      {/* Current Plan Status */}
      {dealer?.subscription_tier && (
        <div className={`bg-gradient-to-r ${currentPlan.gradient} rounded-2xl shadow-2xl p-8 mb-12 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {React.createElement(currentPlan.icon, { size: 48, className: 'mr-4' })}
              <div>
                <p className="text-sm opacity-90 mb-1">Current Plan</p>
                <h2 className="text-3xl font-bold">{currentPlan.name}</h2>
                <p className="text-sm opacity-90 mt-1">
                  Status: <span className="font-semibold">{dealer.subscription_status || 'Active'}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">
                {currentPlan.price > 0 ? `₦${currentPlan.price.toLocaleString()}` : 'FREE'}
              </p>
              <p className="text-sm opacity-90">{currentPlan.period}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {subscriptionPlans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = dealer?.subscription_tier === plan.id
          const canUpgrade = !dealer?.subscription_tier ||
                            (dealer?.subscription_tier === 'basic' && plan.id !== 'basic') ||
                            (dealer?.subscription_tier === 'premium' && plan.id === 'luxury')

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                plan.popular ? 'ring-4 ring-purple-500 scale-105' : ''
              } ${isCurrentPlan ? 'ring-4 ring-green-500' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center">
                  <Rocket size={16} className="mr-2" />
                  MOST POPULAR
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-6 py-2 rounded-br-2xl font-bold text-sm flex items-center">
                  <Check size={16} className="mr-2" />
                  CURRENT PLAN
                </div>
              )}

              <div className="p-8">
                {/* Icon & Name */}
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon size={32} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price > 0 ? '₦' + plan.price.toLocaleString() : 'FREE'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{plan.period}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={20} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || subscribing}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : subscribing && selectedPlan === plan.id
                      ? 'bg-gray-400 text-white cursor-wait'
                      : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : subscribing && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : canUpgrade ? (
                    plan.price > 0 ? 'Upgrade Now' : 'Downgrade'
                  ) : (
                    'Not Available'
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Feature Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-bold text-gray-900">Feature</th>
                <th className="text-center py-4 px-6 font-bold text-gray-700">Verified</th>
                <th className="text-center py-4 px-6 font-bold text-purple-600">Premium</th>
                <th className="text-center py-4 px-6 font-bold text-yellow-600">Luxury</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 px-6">Unlimited Car Listings</td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-4 px-6">Analytics Dashboard</td>
                <td className="text-center py-4 px-6 text-gray-400">-</td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-4 px-6">Direct Buyer Messaging</td>
                <td className="text-center py-4 px-6 text-gray-400">-</td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-4 px-6">Featured Car Slots</td>
                <td className="text-center py-4 px-6 text-gray-400">0</td>
                <td className="text-center py-4 px-6 font-semibold">3</td>
                <td className="text-center py-4 px-6 font-semibold text-yellow-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-6">Dedicated Account Manager</td>
                <td className="text-center py-4 px-6 text-gray-400">-</td>
                <td className="text-center py-4 px-6 text-gray-400">-</td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-4 px-6">Custom Dealership Page</td>
                <td className="text-center py-4 px-6 text-gray-400">-</td>
                <td className="text-center py-4 px-6 text-gray-400">-</td>
                <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={20} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ or Help */}
      <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help Choosing?</h3>
        <p className="text-gray-600 mb-6">
          Our team is here to help you find the perfect plan for your dealership
        </p>
        <a
          href="/dealer/messages"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
