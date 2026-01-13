// Mantle Sepolia Testnet Configuration
// Single source of truth for all network-related constants

// Import deployed contract data
import { RealEstateIDO, PropertyToken, NETWORK, CHAIN_ID } from '../../public/contract/contracts.js';

export const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
} as const;

// Faucet URL for getting test MNT tokens
export const MANTLE_FAUCET_URL = 'https://faucet.sepolia.mantle.xyz';

// Contract addresses and ABIs - auto-imported from deploy script
export const CONTRACT_ADDRESSES = {
  REAL_ESTATE_IDO: RealEstateIDO.address,
  PROPERTY_TOKEN: PropertyToken.address,
};

// Export ABIs for use in contract integration
export const CONTRACT_ABIS = {
  REAL_ESTATE_IDO: RealEstateIDO.abi,
  PROPERTY_TOKEN: PropertyToken.abi,
};

// Re-export for convenience
export { RealEstateIDO, PropertyToken, NETWORK, CHAIN_ID };
