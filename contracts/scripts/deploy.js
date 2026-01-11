const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Mantle Sepolia...\n");
  
  // Deploy RealEstateIDO (property listings)
  console.log("1. Deploying RealEstateIDO...");
  const RealEstateIDO = await hre.ethers.getContractFactory("RealEstateIDO");
  const realEstateIDO = await RealEstateIDO.deploy();
  await realEstateIDO.waitForDeployment();
  const idoAddress = await realEstateIDO.getAddress();
  console.log("   RealEstateIDO deployed to:", idoAddress);
  
  // Deploy PropertyToken (demo tokenized property)
  console.log("\n2. Deploying PropertyToken (Demo Property)...");
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  
  // Demo property parameters
  const propertyToken = await PropertyToken.deploy(
    "Graso Lagos Property",           // name
    "GLP",                              // symbol
    "Lagos Beachfront Villa",           // title
    "Luxury beachfront property with ocean views, 5 bedrooms, modern amenities", // description
    "Victoria Island, Lagos, Nigeria",  // location
    "QmDemo123",                        // imageHash (IPFS)
    hre.ethers.parseEther("500000"),    // valuation (500,000 MNT)
    hre.ethers.parseEther("10000"),     // totalSupply (10,000 tokens)
    hre.ethers.parseEther("50"),        // pricePerToken (50 MNT each)
    800                                 // yieldRate (8% annual)
  );
  await propertyToken.waitForDeployment();
  const tokenAddress = await propertyToken.getAddress();
  console.log("   PropertyToken deployed to:", tokenAddress);
  
  // Summary
  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("RealEstateIDO:", idoAddress);
  console.log("PropertyToken:", tokenAddress);
  console.log("Network:", hre.network.name);
  console.log("========================================\n");
  
  console.log("Next steps:");
  console.log("1. Add to frontend .env:");
  console.log(`   VITE_CONTRACT_ADDRESS=${idoAddress}`);
  console.log(`   VITE_PROPERTY_TOKEN_ADDRESS=${tokenAddress}`);
  console.log("2. View contracts on explorer:");
  console.log(`   https://explorer.sepolia.mantle.xyz/address/${idoAddress}`);
  console.log(`   https://explorer.sepolia.mantle.xyz/address/${tokenAddress}`);
  
  return { idoAddress, tokenAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
