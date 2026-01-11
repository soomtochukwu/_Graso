import { useState } from 'react';
import { useYield, usePropertyInfo } from '../../hooks/useYield';
import { useKYC } from '../../hooks/useKYC';
import { useAccount } from 'wagmi';
import './YieldDashboard.css';

/**
 * Yield Dashboard Component
 * Displays accumulated yield, ownership, and claim functionality
 */
export default function YieldDashboard() {
  const { address, isConnected } = useAccount();
  const { yieldData, isLoading, claimYield, isClaiming, claimTxHash, error, refetch } = useYield();
  const { propertyInfo } = usePropertyInfo();
  const { isVerified } = useKYC();
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  
  if (!isConnected) {
    return (
      <div className="yield-dashboard yield-dashboard-empty">
        <p>Connect your wallet to view yield information</p>
      </div>
    );
  }
  
  const handleClaim = async () => {
    await claimYield();
    if (!error) {
      setShowClaimSuccess(true);
      setTimeout(() => setShowClaimSuccess(false), 5000);
    }
  };

  // Helper to safely convert BigInt to Number for display
  const toNumber = (value) => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'bigint') return Number(value);
    return Number(value);
  };

  // Get yield rate as percentage (convert from basis points)
  const yieldRatePercent = propertyInfo ? toNumber(propertyInfo.yieldRate) / 100 : 0;
  
  return (
    <div className="yield-dashboard">
      <div className="yield-header">
        <h2>Yield Management</h2>
        <p className="yield-subtitle">Earn rental income from your property holdings</p>
      </div>
      
      {propertyInfo && (
        <div className="yield-property-info">
          <h3>{propertyInfo.title}</h3>
          <div className="yield-property-meta">
            <span>Annual Yield Rate: <strong>{yieldRatePercent}%</strong></span>
            <span>Location: <strong>{propertyInfo.location}</strong></span>
          </div>
        </div>
      )}
      
      <div className="yield-stats">
        <div className="yield-stat-card">
          <span className="yield-stat-label">Your Holdings</span>
          <span className="yield-stat-value">
            {isLoading ? '...' : `${yieldData?.tokenBalance?.toFixed(2) || 0} Tokens`}
          </span>
          <span className="yield-stat-sub">
            {yieldData?.ownershipPercentage?.toFixed(2) || 0}% ownership
          </span>
        </div>
        
        <div className="yield-stat-card yield-stat-highlight">
          <span className="yield-stat-label">Available Yield</span>
          <span className="yield-stat-value">
            {isLoading ? '...' : `${yieldData?.yieldOwed?.toFixed(4) || 0} MNT`}
          </span>
          <span className="yield-stat-sub">Claimable now</span>
        </div>
        
        <div className="yield-stat-card">
          <span className="yield-stat-label">Total Claimed</span>
          <span className="yield-stat-value">
            {isLoading ? '...' : `${yieldData?.totalClaimed?.toFixed(4) || 0} MNT`}
          </span>
          <span className="yield-stat-sub">All time earnings</span>
        </div>
      </div>
      
      <div className="yield-actions">
        {!isVerified ? (
          <div className="yield-kyc-warning">
            <span>⚠️</span>
            <p>KYC verification required to claim yield</p>
          </div>
        ) : yieldData?.yieldOwed && yieldData.yieldOwed > 0 ? (
          <button 
            className="yield-claim-btn"
            onClick={handleClaim}
            disabled={isClaiming}
          >
            {isClaiming ? 'Claiming...' : `Claim ${yieldData.yieldOwed.toFixed(4)} MNT`}
          </button>
        ) : (
          <button className="yield-claim-btn" disabled>
            No Yield Available
          </button>
        )}
        
        <button className="yield-refresh-btn" onClick={refetch}>
          Refresh
        </button>
      </div>
      
      {showClaimSuccess && claimTxHash && (
        <div className="yield-success-message">
          <span>✓</span>
          <div>
            <p><strong>Yield Claimed Successfully!</strong></p>
            <a 
              href={`https://explorer.sepolia.mantle.xyz/tx/${claimTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Transaction →
            </a>
          </div>
        </div>
      )}
      
      {error && (
        <div className="yield-error-message">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
      
      <div className="yield-info-box">
        <h4>How Yield Works</h4>
        <ul>
          <li>Property managers deposit rental income into the contract</li>
          <li>Yield is distributed proportionally based on token holdings</li>
          <li>Only KYC-verified investors can claim yield</li>
          <li>All transactions are traceable on Mantle Sepolia</li>
        </ul>
      </div>
    </div>
  );
}

