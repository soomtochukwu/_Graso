// Contract Integration for Mantle Sepolia
// Replaces Sui-specific grasoContractIntegration.ts

import { createPublicClient, createWalletClient, http, custom, parseEther, formatEther } from 'viem';
import { mantleSepolia, CONTRACT_ADDRESSES } from '../config/mantleConfig';
import contractABI from './RealEstateIDO.json';

// Define the chain for viem
const chain = {
  id: mantleSepolia.id,
  name: mantleSepolia.name,
  nativeCurrency: mantleSepolia.nativeCurrency,
  rpcUrls: mantleSepolia.rpcUrls,
  blockExplorers: mantleSepolia.blockExplorers,
};

// Public client for read operations
const publicClient = createPublicClient({
  chain,
  transport: http(mantleSepolia.rpcUrls.default.http[0]),
});

// Get wallet client for write operations
function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet found. Please install MetaMask.');
  }
  
  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
}

// Contract address
const getContractAddress = () => {
  const address = CONTRACT_ADDRESSES.REAL_ESTATE_IDO;
  if (!address) {
    throw new Error('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in .env');
  }
  return address as `0x${string}`;
};

// ============ Write Functions ============

/**
 * Create a new property listing
 */
export async function createProperty(
  title: string,
  description: string,
  image: string,
  propertyType: string,
  price: number, // in MNT
  deadline: number, // Unix timestamp
  longitude: string,
  latitude: string,
) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: getContractAddress(),
    abi: contractABI.abi,
    functionName: 'createProperty',
    args: [
      title,
      description,
      image,
      propertyType,
      parseEther(price.toString()),
      BigInt(deadline),
      longitude,
      latitude,
    ],
    account,
  });
  
  return hash;
}

/**
 * Contribute to a property campaign
 */
export async function contribute(propertyId: number, amount: number) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: getContractAddress(),
    abi: contractABI.abi,
    functionName: 'contribute',
    args: [BigInt(propertyId)],
    value: parseEther(amount.toString()),
    account,
  });
  
  return hash;
}

/**
 * Withdraw funds from a property (creator only)
 */
export async function withdraw(propertyId: number) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: getContractAddress(),
    abi: contractABI.abi,
    functionName: 'withdraw',
    args: [BigInt(propertyId)],
    account,
  });
  
  return hash;
}

/**
 * Finalize a campaign after deadline
 */
export async function finalizeCampaign(propertyId: number) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: getContractAddress(),
    abi: contractABI.abi,
    functionName: 'finalizeCampaign',
    args: [BigInt(propertyId)],
    account,
  });
  
  return hash;
}

// ============ Read Functions ============

export interface PropertyInfo {
  id: number;
  title: string;
  description: string;
  image: string;
  propertyType: string;
  longitude: string;
  latitude: string;
  creator: string;
  price: number;
  currentAmount: number;
  deadline: number;
  isActive: boolean;
  isSuccessful: boolean;
}

export interface Contributor {
  contributor: string;
  amount: number;
  timestamp: number;
}

/**
 * Get property info by ID
 */
export async function getPropertyInfo(propertyId: number): Promise<PropertyInfo | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: contractABI.abi,
      functionName: 'getPropertyInfo',
      args: [BigInt(propertyId)],
    }) as any;
    
    return {
      id: Number(result.id),
      title: result.title,
      description: result.description,
      image: result.image,
      propertyType: result.propertyType,
      longitude: result.longitude,
      latitude: result.latitude,
      creator: result.creator,
      price: Number(formatEther(result.targetPrice)),
      currentAmount: Number(formatEther(result.currentAmount)),
      deadline: Number(result.deadline),
      isActive: result.isActive,
      isSuccessful: result.isSuccessful,
    };
  } catch (error) {
    console.error('Error getting property info:', error);
    return null;
  }
}

/**
 * Get all properties
 */
export async function getAllProperties(): Promise<PropertyInfo[]> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: contractABI.abi,
      functionName: 'getAllProperties',
      args: [],
    }) as any[];
    
    return result.map((p: any) => ({
      id: Number(p.id),
      title: p.title,
      description: p.description,
      image: p.image,
      propertyType: p.propertyType,
      longitude: p.longitude,
      latitude: p.latitude,
      creator: p.creator,
      price: Number(formatEther(p.targetPrice)),
      currentAmount: Number(formatEther(p.currentAmount)),
      deadline: Number(p.deadline),
      isActive: p.isActive,
      isSuccessful: p.isSuccessful,
    }));
  } catch (error) {
    console.error('Error getting all properties:', error);
    return [];
  }
}

/**
 * Get contributors for a property
 */
export async function getContributors(propertyId: number): Promise<Contributor[]> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: contractABI.abi,
      functionName: 'getContributors',
      args: [BigInt(propertyId)],
    }) as any[];
    
    return result.map((c: any) => ({
      contributor: c.contributor,
      amount: Number(formatEther(c.amount)),
      timestamp: Number(c.timestamp),
    }));
  } catch (error) {
    console.error('Error getting contributors:', error);
    return [];
  }
}

/**
 * Check if address is a contributor
 */
export async function isContributor(propertyId: number, address: string): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: contractABI.abi,
      functionName: 'isContributor',
      args: [BigInt(propertyId), address as `0x${string}`],
    });
    
    return result as boolean;
  } catch (error) {
    console.error('Error checking contributor:', error);
    return false;
  }
}

/**
 * Get contribution amount for an address
 */
export async function getContribution(propertyId: number, address: string): Promise<number> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: contractABI.abi,
      functionName: 'getContribution',
      args: [BigInt(propertyId), address as `0x${string}`],
    });
    
    return Number(formatEther(result as bigint));
  } catch (error) {
    console.error('Error getting contribution:', error);
    return 0;
  }
}
