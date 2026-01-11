import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../../config/contracts';
import PropertyTokenABI from '../../smart-contract/PropertyToken.json';
import './CustodyLabel.css';

const PROPERTY_TOKEN_ADDRESS = CONTRACTS.PROPERTY_TOKEN;

/**
 * Custody Label Component
 * Displays whether assets are in self-custody or platform custody
 */
export default function CustodyLabel({ compact = false }) {
  const { address, isConnected } = useAccount();
  
  const { data: custodyStatus } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'getCustodyStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  if (!isConnected || custodyStatus === 'none') return null;
  
  const isSelfCustody = custodyStatus === 'self';
  
  if (compact) {
    return (
      <span className={`custody-badge ${isSelfCustody ? 'custody-self' : 'custody-platform'}`}>
        {isSelfCustody ? '🔐 Self' : '🏦 Platform'}
      </span>
    );
  }
  
  return (
    <div className={`custody-label ${isSelfCustody ? 'custody-self' : 'custody-platform'}`}>
      <div className="custody-icon">
        {isSelfCustody ? '🔐' : '🏦'}
      </div>
      <div className="custody-info">
        <span className="custody-type">
          {isSelfCustody ? 'Self-Custody' : 'Platform Custody'}
        </span>
        <span className="custody-description">
          {isSelfCustody 
            ? 'Tokens held directly in your wallet' 
            : 'Tokens staked in protocol for enhanced yield'
          }
        </span>
      </div>
    </div>
  );
}

/**
 * Custody Explainer Component
 * Shows both custody models with descriptions
 */
export function CustodyExplainer() {
  return (
    <div className="custody-explainer">
      <h3>Understanding Custody</h3>
      
      <div className="custody-option">
        <div className="custody-option-header">
          <span className="custody-option-icon">🔐</span>
          <h4>Self-Custody</h4>
        </div>
        <p>
          Your tokens are held directly in your personal wallet. You have full control 
          and can transfer or sell at any time. Standard yield distribution applies.
        </p>
        <ul>
          <li>Full control of your assets</li>
          <li>Transfer anytime</li>
          <li>Standard yield rate</li>
        </ul>
      </div>
      
      <div className="custody-option">
        <div className="custody-option-header">
          <span className="custody-option-icon">🏦</span>
          <h4>Platform Custody</h4>
        </div>
        <p>
          Your tokens are staked in the protocol smart contract. This enables 
          enhanced features and potentially higher yields, but tokens are locked.
        </p>
        <ul>
          <li>Enhanced yield potential</li>
          <li>Tokens locked in contract</li>
          <li>Withdraw anytime (subject to conditions)</li>
        </ul>
      </div>
      
      <div className="custody-disclaimer">
        <span>ℹ️</span>
        <p>
          <strong>Demo Note:</strong> This is a demonstration of custody concepts. 
          In production, platform custody would involve additional security measures 
          and regulatory compliance.
        </p>
      </div>
    </div>
  );
}
