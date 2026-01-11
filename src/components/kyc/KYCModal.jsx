import { useState } from 'react';
import { useKYC } from '../../hooks/useKYC';
import { useAccount } from 'wagmi';
import './KYCModal.css';

/**
 * KYC Verification Modal
 * Collects simulated identity information for demo purposes
 */
export default function KYCModal({ isOpen, onClose, onSuccess }) {
  const { address } = useAccount();
  const { requestVerification, isLoading } = useKYC();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    idType: 'passport',
    agreedToTerms: false,
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store KYC data locally (demo only - not on-chain)
      const kycRecord = {
        ...formData,
        address,
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      };
      
      localStorage.setItem(`kyc_data_${address}`, JSON.stringify(kycRecord));
      
      // Request verification
      await requestVerification();
      
      // Move to success step
      setStep(3);
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('KYC submission error:', error);
      alert('Failed to submit verification request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="kyc-modal-overlay" onClick={onClose}>
      <div className="kyc-modal" onClick={e => e.stopPropagation()}>
        <button className="kyc-modal-close" onClick={onClose}>×</button>
        
        <div className="kyc-modal-header">
          <h2>Identity Verification</h2>
          <p className="kyc-subtitle">Complete KYC to invest in tokenized properties</p>
        </div>
        
        {/* Progress indicator */}
        <div className="kyc-progress">
          <div className={`kyc-step ${step >= 1 ? 'active' : ''}`}>1. Info</div>
          <div className={`kyc-step ${step >= 2 ? 'active' : ''}`}>2. Review</div>
          <div className={`kyc-step ${step >= 3 ? 'active' : ''}`}>3. Done</div>
        </div>
        
        {step === 1 && (
          <form className="kyc-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="kyc-disclaimer">
              <span>⚠️</span>
              <p>This is a <strong>demo/testnet</strong> environment. No real identity data is stored on-chain.</p>
            </div>
            
            <div className="kyc-field">
              <label>Full Legal Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="kyc-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="kyc-field">
              <label>Country of Residence</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              >
                <option value="">Select country</option>
                <option value="NG">Nigeria</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SG">Singapore</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div className="kyc-field">
              <label>ID Document Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            
            <button type="submit" className="kyc-btn-primary">
              Continue
            </button>
          </form>
        )}
        
        {step === 2 && (
          <div className="kyc-review">
            <h3>Review Your Information</h3>
            
            <div className="kyc-review-item">
              <span>Name:</span>
              <strong>{formData.fullName}</strong>
            </div>
            <div className="kyc-review-item">
              <span>Email:</span>
              <strong>{formData.email}</strong>
            </div>
            <div className="kyc-review-item">
              <span>Country:</span>
              <strong>{formData.country}</strong>
            </div>
            <div className="kyc-review-item">
              <span>ID Type:</span>
              <strong>{formData.idType}</strong>
            </div>
            <div className="kyc-review-item">
              <span>Wallet:</span>
              <strong>{address?.slice(0, 6)}...{address?.slice(-4)}</strong>
            </div>
            
            <div className="kyc-terms">
              <label>
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                />
                <span>I confirm this information is accurate and agree to the <a href="#">Terms of Service</a></span>
              </label>
            </div>
            
            <div className="kyc-buttons">
              <button onClick={() => setStep(1)} className="kyc-btn-secondary">
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                className="kyc-btn-primary"
                disabled={isSubmitting || !formData.agreedToTerms}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="kyc-success">
            <div className="kyc-success-icon">✓</div>
            <h3>Verification Submitted!</h3>
            <p>Your verification is pending review. For this demo, you are now verified.</p>
            <p className="kyc-success-note">In production, an admin would review and approve your KYC.</p>
          </div>
        )}
      </div>
    </div>
  );
}
