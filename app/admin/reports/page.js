'use client'

import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Car,
  Users,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const REPORT_TYPES = [
  { id: 'cars', name: 'Cars Report', icon: Car, description: 'Export all car listings with details' },
  { id: 'dealers', name: 'Dealers Report', icon: Users, description: 'Export all dealers with status and stats' },
  { id: 'buyers', name: 'Buyers Report', icon: Users, description: 'Export all registered buyers' },
  { id: 'transactions', name: 'Transactions Report', icon: DollarSign, description: 'Export escrow transactions' },
  { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Export payment transactions' }
]

export default function ReportsPage() {
  const [generating, setGenerating] = useState(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [success, setSuccess] = useState(null)

  const generateReport = async (reportType) => {
    setGenerating(reportType)
    setSuccess(null)

    try {
      const supabase = createClient()
      let data = []
      let filename = ''
      let headers = []

      switch (reportType) {
        case 'cars':
          const { data: cars } = await supabase
            .from('cars')
            .select('*, dealers(name)')
            .order('created_at', { ascending: false })

          headers = ['ID', 'Make', 'Model', 'Year', 'Price', 'Mileage', 'Condition', 'Location', 'Dealer', 'Status', 'Views', 'Created']
          data = (cars || []).map(car => [
            car.id,
            car.make,
            car.model,
            car.year,
            car.price,
            car.mileage,
            car.condition,
            car.location,
            car.dealers?.name || '',
            car.status || 'active',
            car.views_count || 0,
            new Date(car.created_at).toLocaleDateString()
          ])
          filename = 'cars-report'
          break

        case 'dealers':
          const { data: dealers } = await supabase
            .from('dealers')
            .select('*')
            .order('created_at', { ascending: false })

          headers = ['ID', 'Name', 'Business Name', 'Email', 'Phone', 'Location', 'Status', 'Verified', 'Badge', 'Created']
          data = (dealers || []).map(d => [
            d.id,
            d.name,
            d.business_name || '',
            d.email,
            d.phone,
            d.location,
            d.status,
            d.is_verified ? 'Yes' : 'No',
            d.badge_type || 'none',
            new Date(d.created_at).toLocaleDateString()
          ])
          filename = 'dealers-report'
          break

        case 'buyers':
          const { data: buyers } = await supabase
            .from('buyers')
            .select('*')
            .order('created_at', { ascending: false })

          headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Status', 'Verification', 'Lead Score', 'Created']
          data = (buyers || []).map(b => [
            b.id,
            b.full_name,
            b.email,
            b.phone || '',
            b.location || '',
            b.account_status || 'active',
            b.verification_status || 'unverified',
            b.lead_score || 'low',
            new Date(b.created_at).toLocaleDateString()
          ])
          filename = 'buyers-report'
          break

        case 'transactions':
          const { data: escrows } = await supabase
            .from('escrow_transactions')
            .select('*, buyers(full_name), dealers(name), cars(make, model)')
            .order('created_at', { ascending: false })

          headers = ['ID', 'Buyer', 'Dealer', 'Car', 'Price', 'Escrow Fee', 'Total', 'Status', 'Created']
          data = (escrows || []).map(e => [
            e.id,
            e.buyers?.full_name || '',
            e.dealers?.name || '',
            e.cars ? `${e.cars.make} ${e.cars.model}` : '',
            e.car_price,
            e.escrow_fee,
            e.total_amount,
            e.status,
            new Date(e.created_at).toLocaleDateString()
          ])
          filename = 'transactions-report'
          break

        case 'revenue':
          const { data: payments } = await supabase
            .from('payment_transactions')
            .select('*')
            .order('created_at', { ascending: false })

          headers = ['ID', 'Type', 'Payer Type', 'Amount', 'Status', 'Gateway', 'Reference', 'Created']
          data = (payments || []).map(p => [
            p.id,
            p.transaction_type,
            p.payer_type,
            p.amount,
            p.status,
            p.payment_gateway || '',
            p.payment_reference || '',
            new Date(p.created_at).toLocaleDateString()
          ])
          filename = 'revenue-report'
          break
      }

      // Generate CSV
      const csv = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()

      setSuccess(reportType)
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report: ' + error.message)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Download className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Export</h1>
              <p className="text-sm sm:text-base text-gray-500">Generate and download data reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Date Range (optional):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORT_TYPES.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <report.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => generateReport(report.id)}
                  disabled={generating === report.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating === report.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success === report.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  {generating === report.id ? 'Generating...' : success === report.id ? 'Downloaded!' : 'Export CSV'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Export Tips</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
            <li>• Reports include all data matching your selected date range</li>
            <li>• For large datasets, the download may take a few seconds</li>
            <li>• All monetary values are in Nigerian Naira (NGN)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
