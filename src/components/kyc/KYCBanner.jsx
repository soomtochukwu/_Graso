import { useKYC } from '../../hooks/useKYC';
import { useAccount } from 'wagmi';
import './KYCBanner.css';

/**
 * KYC Status Banner
 * Displays verification status prominently in the UI
 */
export default function KYCBanner({ onVerifyClick }) {
  const { isConnected } = useAccount();
  const { isVerified, isLoading, isCheckingStatus } = useKYC();
  
  if (!isConnected) return null;
  
  if (isCheckingStatus) {
    return (
      <div className="kyc-banner kyc-banner-loading">
        <span className="kyc-banner-icon">⏳</span>
        <span>Checking verification status...</span>
      </div>
    );
  }
  
  if (isVerified) {
    return (
      <div className="kyc-banner kyc-banner-verified">
        <span className="kyc-banner-icon">✓</span>
        <span><strong>Verified Investor</strong> — You can invest in tokenized properties</span>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="kyc-banner kyc-banner-pending">
        <span className="kyc-banner-icon">⏳</span>
        <span><strong>Verification Pending</strong> — Your KYC is under review</span>
      </div>
    );
  }
  
  return (
    <div className="kyc-banner kyc-banner-unverified">
      <div className="kyc-banner-content">
        <span className="kyc-banner-icon">⚠️</span>
        <span><strong>Verification Required</strong> — Complete KYC to invest</span>
      </div>
      <button className="kyc-banner-button" onClick={onVerifyClick}>
        Verify Now
      </button>
    </div>
  );
}
