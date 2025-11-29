/**
 * Buyer Verification Page
 * Allows buyers to verify their identity and unlock chat/premium features
 * Fee: ₦2,000
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  User,
  DollarSign,
  Info,
  Star,
  MessageCircle,
  Lock,
  Unlock
} from 'lucide-react'
import { openPaymentModal, generateReference, formatNaira, BUYER_VERIFICATION_FEE } from '@/lib/payments'

export default function BuyerVerification() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [buyer, setBuyer] = useState(null)
  const [step, setStep] = useState(1) // 1: Info, 2: Upload, 3: Budget, 4: Payment, 5: Success

  const [formData, setFormData] = useState({
    budgetRange: '',
    idType: 'national_id',
    idNumber: '',
    idFile: null
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingId, setUploadingId] = useState(false)

  useEffect(() => {
    fetchBuyerData()
  }, [])

  const fetchBuyerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      const { data: buyerData, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setBuyer(buyerData)

      // If already verified, show success
      if (buyerData.verification_status === 'verified') {
        setStep(5)
      } else if (buyerData.verification_status === 'pending') {
        setStep(4)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching buyer:', error)
      setError('Failed to load verification status')
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      setUploadingId(true)
      setError('')

      // Upload to Supabase Storage
      // File path must be: {buyer_id}/{filename} to match storage policy
      const fileExt = file.name.split('.').pop()
      const fileName = `id_document_${Date.now()}.${fileExt}`
      const filePath = `${buyer.id}/${fileName}`

      const { data, error } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, idFile: publicUrl }))
      setUploadingId(false)
      setSuccess('ID uploaded successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(`File upload failed: ${error.message || 'Please try again'}`)
      setUploadingId(false)
    }
  }

  const handleSubmitDocuments = async () => {
    try {
      setLoading(true)
      setError('')

      // Validate
      if (!formData.idFile) {
        setError('Please upload your ID document')
        setLoading(false)
        return
      }

      // Save document to verification_documents table
      const { error: docError } = await supabase
        .from('verification_documents')
        .insert({
          buyer_id: buyer.id,
          document_type: formData.idType,
          document_url: formData.idFile,
          document_number: formData.idNumber,
          verification_status: 'pending'
        })

      if (docError) throw docError

      // Update buyer budget range
      if (formData.budgetRange) {
        await supabase
          .from('buyers')
          .update({ budget_range: formData.budgetRange })
          .eq('id', buyer.id)
      }

      setStep(4) // Move to payment
      setLoading(false)
    } catch (error) {
      console.error('Document submission error:', error)
      setError('Failed to submit documents. Please try again.')
      setLoading(false)
    }
  }

  const handlePayment = () => {
    const reference = generateReference('VERIFY')

    openPaymentModal({
      email: buyer.email,
      amount: BUYER_VERIFICATION_FEE,
      reference,
      metadata: {
        buyer_id: buyer.id,
        transaction_type: 'buyer_verification',
        buyer_name: buyer.full_name
      },
      onSuccess: async (response) => {
        try {
          // Record payment transaction
          await supabase
            .from('payment_transactions')
            .insert({
              transaction_type: 'buyer_verification',
              payer_id: buyer.id,
              payer_type: 'buyer',
              amount: BUYER_VERIFICATION_FEE,
              currency: 'NGN',
              payment_gateway: 'paystack',
              payment_reference: reference,
              gateway_reference: response.reference,
              status: 'successful',
              related_entity_type: 'buyer',
              related_entity_id: buyer.id
            })

          // Update buyer verification status
          await supabase
            .from('buyers')
            .update({
              verification_status: 'pending',
              verification_paid: true,
              verification_payment_date: new Date().toISOString(),
              verification_payment_reference: reference
            })
            .eq('id', buyer.id)

          // Record terms acceptance
          await supabase
            .from('terms_acceptances')
            .insert({
              user_id: buyer.id,
              user_type: 'buyer',
              terms_version: 'v1.0',
              acceptance_type: 'verification'
            })

          setStep(5)
        } catch (error) {
          console.error('Payment recording error:', error)
          setError('Payment successful but failed to update status. Please contact support.')
        }
      },
      onClose: () => {
        console.log('Payment modal closed')
      }
    })
  }

  if (loading) {
    return (
      <div className="verify-loading">
        <div className="loading-spinner"></div>
        <p>Loading verification status...</p>
      </div>
    )
  }

  return (
    <div className="verify-container">
      {/* Header */}
      <div className="verify-header">
        <Shield size={48} className="verify-header-icon" />
        <h1>Buyer Verification</h1>
        <p>Get verified to unlock premium features and gain dealer trust</p>
      </div>

      {/* Progress Steps */}
      <div className="verify-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="progress-circle">1</div>
          <span>Info</span>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="progress-circle">2</div>
          <span>Upload ID</span>
        </div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="progress-circle">3</div>
          <span>Budget</span>
        </div>
        <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
          <div className="progress-circle">4</div>
          <span>Payment</span>
        </div>
        <div className={`progress-line ${step >= 5 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
          <div className="progress-circle">
            <CheckCircle2 size={20} />
          </div>
          <span>Verified</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="verify-alert error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="verify-alert success">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Step 1: Info */}
      {step === 1 && (
        <div className="verify-step">
          <h2>Why Get Verified?</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <MessageCircle size={32} />
              <h3>Chat with Dealers</h3>
              <p>Only verified buyers can message dealers directly</p>
            </div>

            <div className="benefit-card">
              <Star size={32} />
              <h3>Higher Priority</h3>
              <p>Dealers prioritize verified buyers as serious customers</p>
            </div>

            <div className="benefit-card">
              <Unlock size={32} />
              <h3>Unlock Features</h3>
              <p>Access escrow services and premium buyer tools</p>
            </div>

            <div className="benefit-card">
              <Shield size={32} />
              <h3>Build Trust</h3>
              <p>Show dealers you're a legitimate buyer</p>
            </div>
          </div>

          <div className="verify-info-box">
            <Info size={24} />
            <div>
              <h4>What You'll Need:</h4>
              <ul>
                <li>Valid government-issued ID (National ID, Driver's License, or International Passport)</li>
                <li>Your budget range (optional but recommended)</li>
                <li>Verification fee: {formatNaira(BUYER_VERIFICATION_FEE)}</li>
              </ul>
            </div>
          </div>

          <button className="verify-btn primary" onClick={() => setStep(2)}>
            Start Verification
          </button>
        </div>
      )}

      {/* Step 2: Upload ID */}
      {step === 2 && (
        <div className="verify-step">
          <h2>Upload Your ID</h2>

          <div className="form-group">
            <label>ID Type</label>
            <select
              value={formData.idType}
              onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
            >
              <option value="national_id">National ID Card</option>
              <option value="drivers_license">Driver's License</option>
              <option value="international_passport">International Passport</option>
              <option value="voters_card">Voter's Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>ID Number (optional)</label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder="Enter your ID number"
            />
          </div>

          <div className="upload-box">
            <Upload size={48} />
            <h3>Upload ID Document</h3>
            <p>Clear photo or scan of your ID (front and back if applicable)</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              disabled={uploadingId}
            />
            {uploadingId && (
              <div className="upload-progress">
                <div className="loading-spinner"></div>
                <span>Uploading...</span>
              </div>
            )}
            {formData.idFile && !uploadingId && (
              <div className="upload-success">
                <CheckCircle2 size={20} />
                <span>ID uploaded successfully</span>
              </div>
            )}
          </div>

          <div className="verify-actions">
            <button className="verify-btn secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="verify-btn primary"
              onClick={() => setStep(3)}
              disabled={!formData.idFile}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Budget Range */}
      {step === 3 && (
        <div className="verify-step">
          <h2>What's Your Budget Range?</h2>
          <p className="step-description">
            This helps dealers understand your purchasing power and provide better matches
          </p>

          <div className="budget-options">
            {[
              '₦1M - ₦3M',
              '₦3M - ₦5M',
              '₦5M - ₦10M',
              '₦10M - ₦20M',
              '₦20M - ₦50M',
              '₦50M - ₦100M',
              '₦100M+'
            ].map((range) => (
              <button
                key={range}
                className={`budget-option ${formData.budgetRange === range ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, budgetRange: range })}
              >
                <DollarSign size={20} />
                <span>{range}</span>
                {formData.budgetRange === range && <CheckCircle2 size={20} />}
              </button>
            ))}
          </div>

          <p className="budget-note">
            <Info size={16} />
            Your budget range is optional but helps you get matched with the right cars
          </p>

          <div className="verify-actions">
            <button className="verify-btn secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              className="verify-btn primary"
              onClick={handleSubmitDocuments}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue to Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div className="verify-step">
          <h2>Complete Payment</h2>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Verification Fee</span>
              <strong>{formatNaira(BUYER_VERIFICATION_FEE)}</strong>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{formatNaira(BUYER_VERIFICATION_FEE)}</strong>
            </div>
          </div>

          <div className="payment-info">
            <Shield size={24} />
            <div>
              <h4>What Happens Next?</h4>
              <ol>
                <li>Complete payment of {formatNaira(BUYER_VERIFICATION_FEE)}</li>
                <li>Admin reviews your documents (24-48 hours)</li>
                <li>Receive verification approval notification</li>
                <li>Start chatting with dealers immediately</li>
              </ol>
            </div>
          </div>

          <button
            className="verify-btn payment"
            onClick={handlePayment}
          >
            <CreditCard size={20} />
            Pay {formatNaira(BUYER_VERIFICATION_FEE)} Now
          </button>

          <p className="payment-secure">
            <Lock size={16} />
            Secure payment powered by Paystack/Flutterwave
          </p>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="verify-step success-step">
          <div className="success-icon">
            <CheckCircle2 size={80} />
          </div>

          <h2>
            {buyer?.verification_status === 'verified'
              ? 'You\'re Verified!'
              : 'Verification Pending'}
          </h2>

          <p>
            {buyer?.verification_status === 'verified'
              ? 'Your buyer account is fully verified. You can now chat with dealers and use all premium features.'
              : 'Your documents and payment have been received. Our admin team will review your verification within 24-48 hours.'}
          </p>

          {buyer?.verification_status === 'pending' && (
            <div className="pending-info">
              <Info size={24} />
              <div>
                <h4>Under Review</h4>
                <p>We'll send you an email once your verification is approved.</p>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button className="verify-btn primary" onClick={() => router.push('/buyer/saved')}>
              Browse Cars
            </button>
            <button className="verify-btn secondary" onClick={() => router.push('/buyer/settings')}>
              Go to Settings
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .verify-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 40px 20px;
        }

        .verify-header {
          text-align: center;
          color: white;
          margin-bottom: 48px;
        }

        .verify-header-icon {
          color: #22c55e;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 12px rgba(34, 197, 94, 0.4));
        }

        .verify-header h1 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .verify-header p {
          font-size: 18px;
          opacity: 0.9;
        }

        .verify-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 48px;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .progress-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .progress-step.active .progress-circle {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }

        .progress-step span {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .progress-step.active span {
          color: white;
        }

        .progress-line {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .progress-line.active {
          background: #22c55e;
        }

        .verify-step {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 48px;
          color: white;
        }

        .verify-step h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #60a5fa;
        }

        .step-description {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 32px;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .benefit-card {
          background: rgba(59, 130, 246, 0.1);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          text-align: center;
        }

        .benefit-card svg {
          color: #60a5fa;
          margin-bottom: 12px;
        }

        .benefit-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: white;
        }

        .benefit-card p {
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }

        .verify-info-box {
          background: rgba(34, 197, 94, 0.1);
          padding: 24px;
          border-radius: 12px;
          border-left: 4px solid #22c55e;
          margin-bottom: 32px;
          display: flex;
          gap: 16px;
        }

        .verify-info-box svg {
          flex-shrink: 0;
          color: #22c55e;
        }

        .verify-info-box h4 {
          margin-bottom: 12px;
          color: white;
        }

        .verify-info-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .verify-info-box li {
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #93c5fd;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 16px;
        }

        .upload-box {
          background: rgba(59, 130, 246, 0.1);
          border: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          margin-bottom: 24px;
        }

        .upload-box.optional {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.3);
        }

        .upload-box svg {
          color: #60a5fa;
          margin-bottom: 16px;
        }

        .upload-box h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: white;
        }

        .upload-box p {
          opacity: 0.8;
          margin-bottom: 16px;
        }

        .upload-box input[type="file"] {
          margin-top: 12px;
        }

        .upload-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          color: #60a5fa;
          font-weight: 600;
        }

        .upload-progress .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(96, 165, 250, 0.3);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .upload-success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          color: #22c55e;
          font-weight: 600;
        }

        .budget-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .budget-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .budget-option:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .budget-option.selected {
          background: rgba(34, 197, 94, 0.2);
          border-color: #22c55e;
        }

        .budget-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 32px;
        }

        .payment-summary {
          background: rgba(59, 130, 246, 0.1);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .summary-row.total {
          font-size: 20px;
          color: #60a5fa;
        }

        .summary-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          margin: 16px 0;
        }

        .payment-info {
          display: flex;
          gap: 16px;
          background: rgba(34, 197, 94, 0.1);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }

        .payment-info svg {
          flex-shrink: 0;
          color: #22c55e;
        }

        .payment-info h4 {
          margin-bottom: 12px;
        }

        .payment-info ol {
          margin: 0;
          padding-left: 20px;
        }

        .payment-info li {
          margin-bottom: 8px;
        }

        .verify-btn {
          padding: 16px 32px;
          border-radius: 12px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .verify-btn.primary {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .verify-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
        }

        .verify-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .verify-btn.payment {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .verify-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .verify-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
        }

        .payment-secure {
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          font-size: 14px;
          opacity: 0.8;
        }

        .success-step {
          text-align: center;
        }

        .success-icon {
          margin-bottom: 24px;
        }

        .success-icon svg {
          color: #22c55e;
          filter: drop-shadow(0 4px 12px rgba(34, 197, 94, 0.4));
        }

        .pending-info {
          display: flex;
          gap: 16px;
          background: rgba(234, 179, 8, 0.1);
          padding: 24px;
          border-radius: 12px;
          text-align: left;
          margin: 24px 0;
        }

        .pending-info svg {
          flex-shrink: 0;
          color: #eab308;
        }

        .success-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 32px;
        }

        .verify-alert {
          max-width: 800px;
          margin: 0 auto 24px;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .verify-alert.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #fca5a5;
        }

        .verify-alert.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid #22c55e;
          color: #86efac;
        }

        @media (max-width: 768px) {
          .verify-step {
            padding: 24px;
          }

          .verify-progress {
            overflow-x: auto;
          }

          .progress-line {
            width: 30px;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .budget-options {
            grid-template-columns: 1fr;
          }

          .verify-actions {
            flex-direction: column;
          }

          .success-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
