import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { mantleSepolia } from '../config/mantleConfig';

/**
 * Custom hook for wallet operations
 * Provides a consistent interface for wallet connection, disconnection, and network switching
 */
export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  // Check if connected to the correct chain
  const isCorrectChain = chainId === mantleSepolia.id;

  // Switch to Mantle Sepolia if on wrong chain
  const switchToMantleSepolia = async () => {
    if (switchChain) {
      try {
        await switchChain({ chainId: mantleSepolia.id });
      } catch (error) {
        console.error('Failed to switch network:', error);
        throw error;
      }
    }
  };

  // Connect wallet
  const connect = async () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return {
    // State
    address,
    isConnected,
    chainId,
    isCorrectChain,
    
    // Actions
    connect,
    disconnect,
    switchToMantleSepolia,
    
    // Utils
    connectors,
    connectAsync,
  };
}

/**
 * Hook to get the current account address
 * Drop-in replacement for useCurrentAccount from @mysten/dapp-kit
 */
export function useCurrentAccount() {
  const { address, isConnected } = useAccount();
  
  if (!isConnected || !address) {
    return null;
  }
  
  return {
    address,
  };
}
