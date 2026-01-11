import { useState } from 'react';
import { useAccount } from 'wagmi';
import KYCModal from '../kyc/KYCModal';
import KYCBanner from '../kyc/KYCBanner';
import YieldDashboard from '../yield/YieldDashboard';
import CustodyLabel, { CustodyExplainer } from '../custody/CustodyLabel';
import { useKYC } from '../../hooks/useKYC';
import { useYield } from '../../hooks/useYield';
import './InvestorDashboard.css';

/**
 * Investor Dashboard
 * Central hub showing KYC status, holdings, yield, and custody
 */
export default function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const { isVerified } = useKYC();
  const { yieldData } = useYield();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isConnected) {
    return (
      <div className="investor-dashboard">
        <div className="dashboard-empty">
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to view your investment dashboard</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="investor-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Investor Dashboard</h1>
          <p>Manage your tokenized real estate investments</p>
        </div>
        <CustodyLabel compact />
      </div>
      
      {/* KYC Status Banner */}
      <KYCBanner onVerifyClick={() => setShowKYCModal(true)} />
      
      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'yield' ? 'active' : ''}`}
          onClick={() => setActiveTab('yield')}
        >
          Yield
        </button>
        <button 
          className={`tab ${activeTab === 'custody' ? 'active' : ''}`}
          onClick={() => setActiveTab('custody')}
        >
          Custody
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <span className="stat-icon">🏠</span>
                <div className="stat-info">
                  <span className="stat-value">{yieldData?.tokenBalance?.toFixed(2) || 0}</span>
                  <span className="stat-label">Property Tokens</span>
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <span className="stat-value">{yieldData?.ownershipPercentage?.toFixed(2) || 0}%</span>
                  <span className="stat-label">Ownership</span>
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-info">
                  <span className="stat-value">{yieldData?.yieldOwed?.toFixed(4) || 0} MNT</span>
                  <span className="stat-label">Claimable Yield</span>
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-icon">{isVerified ? '✅' : '⏳'}</span>
                <div className="stat-info">
                  <span className="stat-value">{isVerified ? 'Verified' : 'Unverified'}</span>
                  <span className="stat-label">KYC Status</span>
                </div>
              </div>
            </div>
            
            {/* Wallet Address */}
            <div className="wallet-info">
              <span>Connected Wallet:</span>
              <code>{address}</code>
            </div>
            
            {/* Demo Notice */}
            <div className="demo-notice">
              <span>ℹ️</span>
              <div>
                <strong>Testnet Demo</strong>
                <p>
                  This is running on Mantle Sepolia testnet. All tokens and transactions 
                  are for demonstration purposes only.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'yield' && (
          <YieldDashboard />
        )}
        
        {activeTab === 'custody' && (
          <>
            <CustodyLabel />
            <CustodyExplainer />
          </>
        )}
      </div>
      
      {/* KYC Modal */}
      <KYCModal 
        isOpen={showKYCModal} 
        onClose={() => setShowKYCModal(false)}
        onSuccess={() => {
          setShowKYCModal(false);
        }}
      />
    </div>
  );
}
