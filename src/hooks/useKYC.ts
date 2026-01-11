import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import PropertyTokenABI from '../smart-contract/PropertyToken.json';

const PROPERTY_TOKEN_ADDRESS = CONTRACTS.PROPERTY_TOKEN as `0x${string}`;

interface UseKYCReturn {
  isVerified: boolean;
  isLoading: boolean;
  isCheckingStatus: boolean;
  requestVerification: () => Promise<void>;
  error: string | null;
}

/**
 * Hook for managing KYC verification status
 * Checks on-chain verification and provides verification request
 */
export function useKYC(): UseKYCReturn {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  
  // Read verification status from contract
  const { data: isVerifiedOnChain, isLoading: isCheckingStatus, refetch } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'isUserVerified',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  // For demo purposes, we also check localStorage for pending verification
  const [localVerificationPending, setLocalVerificationPending] = useState(false);
  
  useEffect(() => {
    if (address) {
      const pending = localStorage.getItem(`kyc_pending_${address}`);
      setLocalVerificationPending(!!pending);
    }
  }, [address]);
  
  /**
   * Request verification (in demo, this stores locally and admin must approve on-chain)
   */
  const requestVerification = useCallback(async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      // Store verification request locally (demo mode)
      const kycData = {
        address,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      };
      
      localStorage.setItem(`kyc_pending_${address}`, JSON.stringify(kycData));
      setLocalVerificationPending(true);
      
      // In a real app, this would call a backend API
      console.log('KYC verification requested for:', address);
      
      // Refetch on-chain status
      await refetch();
    } catch (err) {
      setError('Failed to request verification');
      console.error('KYC request error:', err);
    }
  }, [address, refetch]);
  
  return {
    isVerified: Boolean(isVerifiedOnChain),
    isLoading: localVerificationPending && !isVerifiedOnChain,
    isCheckingStatus,
    requestVerification,
    error,
  };
}

/**
 * Hook to check if a specific address is verified
 */
export function useIsVerified(userAddress?: string) {
  const { data: isVerified, isLoading } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'isUserVerified',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  return {
    isVerified: Boolean(isVerified),
    isLoading,
  };
}
