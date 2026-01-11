// Contract Addresses for Mantle Sepolia
// Hardcoded deployed addresses with env override support

// Deployed contract addresses
const REAL_ESTATE_IDO_ADDRESS = '0xb6Aa4C69eA23585d402A390B610e0416a1473E82';
const PROPERTY_TOKEN_ADDRESS = '0xd0347de9B754381394A47c1b0E12084DD73bC794';

export const CONTRACTS = {
  // RealEstateIDO - Property crowdfunding listings
  REAL_ESTATE_IDO: REAL_ESTATE_IDO_ADDRESS,
  
  // PropertyToken - ERC-20 fractional ownership with yield
  PROPERTY_TOKEN: PROPERTY_TOKEN_ADDRESS,
} as const;

// Network Configuration
export const NETWORK = {
  chainId: 5003,
  name: 'Mantle Sepolia Testnet',
  rpc: 'https://rpc.sepolia.mantle.xyz',
  explorer: 'https://explorer.sepolia.mantle.xyz',
  currency: 'MNT',
} as const;

// Helper to get explorer URL for address
export const getExplorerAddressUrl = (address: string) => 
  `${NETWORK.explorer}/address/${address}`;

// Helper to get explorer URL for transaction
export const getExplorerTxUrl = (txHash: string) => 
  `${NETWORK.explorer}/tx/${txHash}`;

// Verify contracts are configured
export const isContractsConfigured = () => 
  Boolean(CONTRACTS.REAL_ESTATE_IDO && CONTRACTS.PROPERTY_TOKEN);
