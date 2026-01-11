import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mantleSepolia } from './mantleConfig';

// Define the chain for wagmi/viem
const mantleSepoliaChain = {
  id: mantleSepolia.id,
  name: mantleSepolia.name,
  nativeCurrency: mantleSepolia.nativeCurrency,
  rpcUrls: mantleSepolia.rpcUrls,
  blockExplorers: mantleSepolia.blockExplorers,
  testnet: mantleSepolia.testnet,
};

// RainbowKit + Wagmi config
export const config = getDefaultConfig({
  appName: 'Graso',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'graso-demo-app',
  chains: [mantleSepoliaChain],
  transports: {
    [mantleSepolia.id]: http(mantleSepolia.rpcUrls.default.http[0]),
  },
  ssr: false,
});

export { mantleSepoliaChain };
