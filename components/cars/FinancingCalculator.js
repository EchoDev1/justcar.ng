'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Clock, Percent, Building, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

// Default financing settings
const DEFAULT_SETTINGS = {
  interestRates: { min: 15, max: 28, default: 22 },
  loanTerms: { months: [12, 24, 36, 48, 60, 72], default: 48 },
  downPayment: { minPercent: 20, maxPercent: 70, defaultPercent: 30 },
  partnerBanks: [
    { name: 'Access Bank', rate: 22, maxTerm: 60 },
    { name: 'GTBank', rate: 21, maxTerm: 48 },
    { name: 'First Bank', rate: 23, maxTerm: 72 },
    { name: 'UBA', rate: 22, maxTerm: 60 },
    { name: 'Zenith Bank', rate: 21, maxTerm: 48 }
  ]
}

/**
 * Financing Calculator Component
 * Calculates monthly car loan payments
 */
export default function FinancingCalculator({ carPrice, carTitle, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_SETTINGS.downPayment.defaultPercent)
  const [loanTerm, setLoanTerm] = useState(DEFAULT_SETTINGS.loanTerms.default)
  const [interestRate, setInterestRate] = useState(DEFAULT_SETTINGS.interestRates.default)
  const [selectedBank, setSelectedBank] = useState(null)

  // Calculate loan values
  const downPaymentAmount = carPrice * (downPaymentPercent / 100)
  const loanAmount = carPrice - downPaymentAmount
  const monthlyInterestRate = interestRate / 100 / 12

  // Monthly payment calculation using PMT formula
  const calculateMonthlyPayment = () => {
    if (loanAmount <= 0 || loanTerm <= 0 || monthlyInterestRate <= 0) return 0

    const payment = loanAmount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) /
      (Math.pow(1 + monthlyInterestRate, loanTerm) - 1)

    return Math.round(payment)
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalPayment = monthlyPayment * loanTerm
  const totalInterest = totalPayment - loanAmount

  const handleBankSelect = (bank) => {
    setSelectedBank(bank)
    setInterestRate(bank.rate)
    if (loanTerm > bank.maxTerm) {
      setLoanTerm(bank.maxTerm)
    }
  }

  if (compact && !isExpanded) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Calculator className="text-purple-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Financing Calculator</p>
              <p className="text-sm text-gray-600">
                Est. {formatNaira(monthlyPayment)}/month
              </p>
            </div>
          </div>
          <ChevronDown className="text-purple-600" size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="text-purple-600" size={24} />
          Financing Calculator
        </h2>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </div>

      {carTitle && (
        <p className="text-sm text-gray-600 mb-4">
          Calculate financing for: <span className="font-medium">{carTitle}</span>
        </p>
      )}

      {/* Car Price Display */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-600 mb-1">Vehicle Price</p>
        <p className="text-3xl font-bold text-blue-700">{formatNaira(carPrice)}</p>
      </div>

      {/* Calculator Inputs */}
      <div className="space-y-6">
        {/* Down Payment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <DollarSign size={16} />
              Down Payment
            </label>
            <span className="text-sm font-semibold text-gray-900">
              {formatNaira(downPaymentAmount)} ({downPaymentPercent}%)
            </span>
          </div>
          <input
            type="range"
            min={DEFAULT_SETTINGS.downPayment.minPercent}
            max={DEFAULT_SETTINGS.downPayment.maxPercent}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{DEFAULT_SETTINGS.downPayment.minPercent}%</span>
            <span>{DEFAULT_SETTINGS.downPayment.maxPercent}%</span>
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
            <Clock size={16} />
            Loan Term
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DEFAULT_SETTINGS.loanTerms.months.map((months) => (
              <button
                key={months}
                onClick={() => setLoanTerm(months)}
                disabled={selectedBank && months > selectedBank.maxTerm}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loanTerm === months
                    ? 'bg-purple-600 text-white'
                    : selectedBank && months > selectedBank.maxTerm
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {months} months
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Percent size={16} />
              Interest Rate (Annual)
            </label>
            <span className="text-sm font-semibold text-gray-900">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={DEFAULT_SETTINGS.interestRates.min}
            max={DEFAULT_SETTINGS.interestRates.max}
            value={interestRate}
            onChange={(e) => {
              setInterestRate(parseInt(e.target.value))
              setSelectedBank(null)
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{DEFAULT_SETTINGS.interestRates.min}%</span>
            <span>{DEFAULT_SETTINGS.interestRates.max}%</span>
          </div>
        </div>

        {/* Partner Banks */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
            <Building size={16} />
            Partner Banks (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_SETTINGS.partnerBanks.map((bank) => (
              <button
                key={bank.name}
                onClick={() => handleBankSelect(bank)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedBank?.name === bank.name
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">{bank.name}</p>
                <p className="text-xs text-gray-500">
                  {bank.rate}% APR | Up to {bank.maxTerm} months
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 pt-6 border-t">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Estimated Monthly Payment</p>
          <p className="text-4xl font-bold mb-4">{formatNaira(monthlyPayment)}</p>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="opacity-70">Loan Amount</p>
              <p className="font-semibold">{formatNaira(loanAmount)}</p>
            </div>
            <div>
              <p className="opacity-70">Total Interest</p>
              <p className="font-semibold">{formatNaira(totalInterest)}</p>
            </div>
            <div>
              <p className="opacity-70">Total Payment</p>
              <p className="font-semibold">{formatNaira(totalPayment)}</p>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Payment Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Down Payment</span>
              <span className="font-medium text-gray-900">{formatNaira(downPaymentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Payment x {loanTerm}</span>
              <span className="font-medium text-gray-900">{formatNaira(totalPayment)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span className="text-gray-800">Total Cost</span>
              <span className="text-purple-700">{formatNaira(downPaymentAmount + totalPayment)}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>
            This calculator provides estimates only. Actual loan terms, rates, and monthly payments
            may vary based on credit history, bank policies, and market conditions.
            Contact our partner banks for accurate quotes.
          </p>
        </div>
      </div>
    </div>
  )
}
