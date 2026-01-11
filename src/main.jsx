import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// RainbowKit + Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from './config/wagmiConfig';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#24C2A5',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          modalSize="compact"
        >
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </StrictMode>,
)
