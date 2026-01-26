'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Car,
  Info,
  Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const REQUIRED_COLUMNS = ['make', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission']
const OPTIONAL_COLUMNS = ['title', 'description', 'color', 'body_type', 'engine_size', 'location', 'vin', 'condition']

export default function BulkUploadPage() {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [validationErrors, setValidationErrors] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState(null)
  const [step, setStep] = useState(1) // 1: upload, 2: preview, 3: results
  const fileInputRef = useRef(null)

  const downloadTemplate = () => {
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]
    const sampleData = [
      ['Toyota', 'Camry', '2022', '15000000', '25000', 'petrol', 'automatic', '2022 Toyota Camry XSE', 'Well maintained vehicle', 'Black', 'sedan', '2.5L', 'Lagos', 'ABC123456789', 'foreign_used'],
      ['Honda', 'Accord', '2021', '12000000', '35000', 'petrol', 'automatic', '2021 Honda Accord Sport', 'Clean title, no accidents', 'Silver', 'sedan', '1.5L', 'Abuja', 'XYZ987654321', 'nigerian_used']
    ]

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'car_upload_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return { data: [], errors: ['File must contain headers and at least one data row'] }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const errors = []
    const data = []

    // Check required columns
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
      return { data: [], errors }
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`)
        continue
      }

      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      // Validate row
      const rowErrors = validateRow(row, i + 1)
      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
        row._hasErrors = true
      }

      // Generate title if not provided
      if (!row.title) {
        row.title = `${row.year} ${row.make} ${row.model}`
      }

      data.push(row)
    }

    return { data, errors }
  }

  const validateRow = (row, rowNum) => {
    const errors = []

    if (!row.make) errors.push(`Row ${rowNum}: Make is required`)
    if (!row.model) errors.push(`Row ${rowNum}: Model is required`)

    const year = parseInt(row.year)
    if (!year || year < 1990 || year > new Date().getFullYear() + 1) {
      errors.push(`Row ${rowNum}: Invalid year (must be between 1990 and ${new Date().getFullYear() + 1})`)
    }

    const price = parseFloat(row.price)
    if (!price || price < 100000) {
      errors.push(`Row ${rowNum}: Invalid price (must be at least 100,000)`)
    }

    const mileage = parseInt(row.mileage)
    if (isNaN(mileage) || mileage < 0) {
      errors.push(`Row ${rowNum}: Invalid mileage`)
    }

    const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid']
    if (!validFuelTypes.includes(row.fuel_type?.toLowerCase())) {
      errors.push(`Row ${rowNum}: Invalid fuel type (use: ${validFuelTypes.join(', ')})`)
    }

    const validTransmissions = ['automatic', 'manual']
    if (!validTransmissions.includes(row.transmission?.toLowerCase())) {
      errors.push(`Row ${rowNum}: Invalid transmission (use: automatic or manual)`)
    }

    return errors
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const { data, errors } = parseCSV(text)
      setParsedData(data)
      setValidationErrors(errors)
      setStep(2)
    }
    reader.readAsText(selectedFile)
  }

  const handleUpload = async () => {
    if (parsedData.length === 0 || validationErrors.some(e => e.includes('required'))) {
      alert('Please fix validation errors before uploading')
      return
    }

    setUploading(true)
    const results = { success: 0, failed: 0, errors: [] }

    try {
      // Get dealer info
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer } = await response.json()

      const supabase = createClient()

      for (const row of parsedData) {
        if (row._hasErrors) {
          results.failed++
          continue
        }

        try {
          const carData = {
            dealer_id: dealer.id,
            make: row.make,
            model: row.model,
            year: parseInt(row.year),
            price: parseFloat(row.price),
            mileage: parseInt(row.mileage),
            fuel_type: row.fuel_type.toLowerCase(),
            transmission: row.transmission.toLowerCase(),
            title: row.title || `${row.year} ${row.make} ${row.model}`,
            description: row.description || '',
            color: row.color || null,
            body_type: row.body_type || null,
            engine_size: row.engine_size || null,
            location: row.location || dealer.location,
            vin: row.vin || null,
            condition: row.condition || 'nigerian_used',
            status: 'pending', // Requires admin approval
            images: [],
            features: []
          }

          const { error } = await supabase.from('cars').insert([carData])

          if (error) {
            results.failed++
            results.errors.push(`${row.title}: ${error.message}`)
          } else {
            results.success++
          }
        } catch (err) {
          results.failed++
          results.errors.push(`${row.title}: ${err.message}`)
        }
      }

      setUploadResults(results)
      setStep(3)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setParsedData([])
    setValidationErrors([])
    setUploadResults(null)
    setStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Upload className="w-8 h-8 text-blue-600" />
          Bulk Car Upload
        </h1>
        <p className="text-gray-600 mt-2">
          Upload multiple vehicles at once using a CSV file
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Preview Data' },
          { num: 3, label: 'Results' }
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
            </div>
            <span className={`ml-2 font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {idx < 2 && <div className={`w-16 h-1 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900">CSV File Requirements</h3>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• <strong>Required columns:</strong> {REQUIRED_COLUMNS.join(', ')}</li>
                  <li>• <strong>Optional columns:</strong> {OPTIONAL_COLUMNS.join(', ')}</li>
                  <li>• First row must contain column headers</li>
                  <li>• Prices should be in Naira (no currency symbols)</li>
                  <li>• Fuel types: petrol, diesel, electric, hybrid</li>
                  <li>• Transmissions: automatic, manual</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Start with our template</h3>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your CSV file here or click to browse
              </h3>
              <p className="text-gray-500">Supports .csv files up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{file?.name}</p>
                <p className="text-sm text-gray-500">{parsedData.length} vehicles found</p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="text-gray-500 hover:text-gray-700"
            >
              Change file
            </button>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">Validation Errors ({validationErrors.length})</h3>
                  <ul className="mt-2 text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Data Preview</h3>
              <span className="text-sm text-gray-500">Showing first 10 rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Make</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Model</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Year</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Mileage</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className={row._hasErrors ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{row.make}</td>
                      <td className="px-4 py-3">{row.model}</td>
                      <td className="px-4 py-3">{row.year}</td>
                      <td className="px-4 py-3">₦{parseFloat(row.price).toLocaleString()}</td>
                      <td className="px-4 py-3">{parseInt(row.mileage).toLocaleString()} km</td>
                      <td className="px-4 py-3">
                        {row._hasErrors ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" /> Errors
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" /> Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={resetUpload}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || parsedData.filter(r => !r._hasErrors).length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {parsedData.filter(r => !r._hasErrors).length} Vehicles
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && uploadResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            {uploadResults.success > 0 ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete</h2>
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">{uploadResults.success}</p>
                <p className="text-gray-500">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-red-600">{uploadResults.failed}</p>
                <p className="text-gray-500">Failed</p>
              </div>
            </div>
          </div>

          {uploadResults.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-3">Failed Uploads</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {uploadResults.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900">What's Next?</h3>
                <p className="text-yellow-800 mt-1">
                  Your vehicles have been uploaded with "Pending" status. You'll need to add images
                  to each listing from your inventory page. Listings require admin approval before
                  they go live.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetUpload}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Upload More
            </button>
            <a
              href="/dealer/cars"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Car className="w-5 h-5" />
              View Inventory
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
