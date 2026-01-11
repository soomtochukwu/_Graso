// Mantle Sepolia Testnet Configuration
// Single source of truth for all network-related constants

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

// Contract addresses - update after deployment
export const CONTRACT_ADDRESSES = {
  REAL_ESTATE_IDO: import.meta.env.VITE_CONTRACT_ADDRESS || '',
};
