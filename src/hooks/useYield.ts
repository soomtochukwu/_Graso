import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { CONTRACTS } from '../config/contracts';
import PropertyTokenABI from '../smart-contract/PropertyToken.json';

const PROPERTY_TOKEN_ADDRESS = CONTRACTS.PROPERTY_TOKEN as `0x${string}`;

interface YieldData {
  yieldOwed: number;
  totalClaimed: number;
  ownershipPercentage: number;
  tokenBalance: number;
}

interface UseYieldReturn {
  yieldData: YieldData | null;
  isLoading: boolean;
  claimYield: () => Promise<void>;
  isClaiming: boolean;
  claimTxHash: string | null;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for managing yield/rent distribution
 */
export function useYield(): UseYieldReturn {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  
  // Read yield owed
  const { data: yieldOwed, isLoading: loadingYield, refetch: refetchYield } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'getYieldOwed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  // Read total claimed
  const { data: totalClaimed, refetch: refetchClaimed } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'getTotalYieldClaimed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  // Read ownership percentage
  const { data: ownershipBps } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'getOwnershipPercentage',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  // Read token balance
  const { data: tokenBalance } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  // Write contract for claiming
  const { writeContract, isPending: isClaiming, data: hash } = useWriteContract();
  
  // Wait for transaction
  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  useEffect(() => {
    if (hash) {
      setClaimTxHash(hash);
    }
  }, [hash]);
  
  useEffect(() => {
    if (isSuccess) {
      refetchYield();
      refetchClaimed();
    }
  }, [isSuccess, refetchYield, refetchClaimed]);
  
  const claimYield = useCallback(async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    
    try {
      setError(null);
      writeContract({
        address: PROPERTY_TOKEN_ADDRESS,
        abi: PropertyTokenABI.abi,
        functionName: 'claimYield',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to claim yield');
      console.error('Claim yield error:', err);
    }
  }, [address, writeContract]);
  
  const refetch = useCallback(() => {
    refetchYield();
    refetchClaimed();
  }, [refetchYield, refetchClaimed]);
  
  const yieldData: YieldData | null = address ? {
    yieldOwed: yieldOwed ? Number(formatEther(yieldOwed as bigint)) : 0,
    totalClaimed: totalClaimed ? Number(formatEther(totalClaimed as bigint)) : 0,
    ownershipPercentage: ownershipBps ? Number(ownershipBps) / 100 : 0,
    tokenBalance: tokenBalance ? Number(formatEther(tokenBalance as bigint)) : 0,
  } : null;
  
  return {
    yieldData,
    isLoading: loadingYield,
    claimYield,
    isClaiming,
    claimTxHash,
    error,
    refetch,
  };
}

/**
 * Hook to get property token info
 */
export function usePropertyInfo() {
  const { data: propertyInfo, isLoading } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PropertyTokenABI.abi,
    functionName: 'getPropertyInfo',
    query: {
      enabled: !!PROPERTY_TOKEN_ADDRESS,
    },
  });
  
  return {
    propertyInfo: propertyInfo as any,
    isLoading,
  };
}
