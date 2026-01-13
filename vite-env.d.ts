/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Pinata JWT token for authenticating uploads
   * Get from: https://app.pinata.cloud/developers/api-keys
   */
  readonly VITE_PINATA_JWT: string;

  /**
   * Pinata gateway domain for serving IPFS files
   * Example: "your-gateway.mypinata.cloud"
   */
  readonly VITE_PINATA_GATEWAY: string;

  /**
   * RealEstateIDO contract address (deployed to Mantle Sepolia)
   */
  readonly VITE_CONTRACT_ADDRESS: string;

  /**
   * PropertyToken contract address (deployed to Mantle Sepolia)
   */
  readonly VITE_PROPERTY_TOKEN_ADDRESS: string;

  /**
   * WalletConnect project ID for wallet connections
   * Get from: https://cloud.walletconnect.com/
   */
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}