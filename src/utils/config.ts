/**
 * Pinata SDK Configuration
 *
 * This module initializes the Pinata SDK for IPFS file uploads and gateway access.
 *
 * Required environment variables:
 * - VITE_PINATA_JWT: Your Pinata JWT token from https://app.pinata.cloud/developers/api-keys
 * - VITE_PINATA_GATEWAY: Your Pinata gateway domain (e.g., "your-gateway.mypinata.cloud")
 */
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});
