require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris", // Use Paris EVM for Mantle compatibility (no PUSH0)
    },
  },
  networks: {
    mantleSepolia: {
      url: "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY] 
        : [],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      mantleSepolia: "placeholder", // Mantle explorer doesn't require API key
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

