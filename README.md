# GRASO

I built Graso as a decentralized real estate investment platform powered by **Mantle Network**. My goal is to enable fractional property ownership using cryptocurrency with full blockchain transparency.

> **⚠️ This is running on Mantle Sepolia Testnet for development and testing.**

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet with Mantle Sepolia network configured
- Test MNT tokens from faucet

### 1. Clone and Install

```bash
git clone <repository-url>
cd grs
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Deploy Smart Contracts

```bash
cd contracts
cp .env.example .env
# Add your DEPLOYER_PRIVATE_KEY to .env

npm install
npm run compile
npm run deploy
# Copy the deployed contract addresses to frontend .env
```

### 4. Run the App

```bash
npm run dev
# Open http://localhost:5173
```

---

## What I Built

### 🏠 Real Estate Tokenization

I implemented tokenization of real estate assets using ERC-20 tokens, enabling fractional ownership:

- **Fractional Ownership**: Each property token represents a share of the property
- **Fixed Supply**: I set a capped number of ownership units per property
- **Transparent Pricing**: Token prices are set at property creation
- **On-chain Metadata**: I store property details directly on the blockchain

**PropertyToken Contract Functions:**
```solidity
buyTokens(amount)          // Purchase ownership tokens
getPropertyInfo()          // View property details
balanceOf(address)         // Check token balance
getOwnershipPercentage()   // View ownership %
```

### 🔐 KYC Verification (Simulated)

I built a compliance-aware access control demonstration:

- **Verification Flow**: Multi-step identity verification modal
- **On-chain Status**: I store KYC status in the contract
- **Gated Access**: Only verified users can invest/claim yield

> **Note**: This is a simulated KYC flow for demo purposes. I don't store real identity data on-chain.

**How it works:**
1. User attempts to invest
2. If unverified, my KYC modal appears
3. User completes verification form
4. Admin approves on-chain (demo auto-approves)
5. User can now invest

### 🏦 Custody Models

I display custody status in the dashboard to demonstrate asset holding patterns:

| Model | Description |
|-------|-------------|
| **Self-Custody** | Tokens held in user's wallet (direct control) |
| **Platform Custody** | Tokens staked in protocol (enhanced yield) |

Users can see their custody status and understand where their assets are held.

### 💰 Yield Distribution

I implemented a system where property managers can deposit rent, distributed proportionally to token holders:

- **Proportional Distribution**: Yield based on ownership percentage
- **KYC Gated**: Only verified users can claim
- **Transparent**: All transactions visible on Mantle Sepolia explorer
- **Real-time**: My dashboard shows claimable yield

**Yield Contract Functions:**
```solidity
depositRent()              // Admin deposits rent (payable)
claimYield()               // User claims accumulated yield
getYieldOwed(address)      // Check pending yield
getTotalYieldClaimed()     // View historical claims
```

---

## Mantle Sepolia Network Setup

Add to MetaMask manually or my app will prompt you automatically:

| Setting | Value |
|---------|-------|
| Network Name | Mantle Sepolia Testnet |
| RPC URL | `https://rpc.sepolia.mantle.xyz` |
| Chain ID | `5003` |
| Currency Symbol | `MNT` |
| Block Explorer | `https://explorer.sepolia.mantle.xyz` |

### Get Test MNT Tokens
Visit the [Mantle Sepolia Faucet](https://faucet.sepolia.mantle.xyz) to get test tokens.

---

## Project Structure

```
grs/
├── contracts/                    # My Solidity smart contracts
│   ├── contracts/
│   │   ├── RealEstateIDO.sol     # Property listings
│   │   └── PropertyToken.sol     # Tokenization + yield
│   └── scripts/deploy.js         # Deployment script
├── src/
│   ├── components/
│   │   ├── kyc/                  # KYC modal & banner
│   │   ├── yield/                # Yield dashboard
│   │   ├── custody/              # Custody labels
│   │   └── dashboard/            # Investor dashboard
│   ├── hooks/
│   │   ├── useKYC.ts             # KYC state management
│   │   └── useYield.ts           # Yield calculations
│   ├── config/                   # Network configuration
│   └── smart-contract/           # Contract ABIs
└── public/
```

---

## My Smart Contracts

### RealEstateIDO.sol
I use this to manage property crowdfunding campaigns:
- `createProperty()` - Create a new listing
- `contribute()` - Invest in a campaign
- `withdraw()` - Withdraw funds (creator only)

### PropertyToken.sol
This is my ERC-20 tokenization contract with compliance features:
- `buyTokens()` - Purchase property shares
- `claimYield()` - Claim rental income
- `setVerified()` - Admin KYC approval
- `depositRent()` - Admin deposits rent

---

## Disclaimers

> ⚠️ **TESTNET DEMO**
> 
> This application is a demonstration I built on Mantle Sepolia testnet:
> - All tokens and transactions use test MNT with no real value
> - KYC verification is simulated - no real identity verification
> - No legal claims to real estate ownership are implied
> - This is not investment advice

> 🔒 **SECURITY**
> 
> - I never commit private keys
> - `.env` files are in `.gitignore`
> - My smart contracts are unaudited demo code

---

## Tech Stack

- **Frontend**: React + Vite
- **Wallet**: RainbowKit + wagmi + viem
- **Blockchain**: Mantle Sepolia Testnet (EVM)
- **Smart Contracts**: Solidity + Hardhat + OpenZeppelin
- **Storage**: Pinata (IPFS)

---

## Contributing

I welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a pull request

---

## Contact Me

- **Email:** afrotechboss@yahoo.com
- **GitHub:** [AfroTechBoss](https://github.com/AfroTechBoss)
- **Twitter:** [@0xAfroTechBoss](https://x.com/0xAfroTechBoss)

---

## License

MIT License - see [LICENSE](LICENSE)
