const { ethers } = require("hardhat");

async function verifyDeployment() {
  console.log("Verifying contract deployment...");

  try {
    // Get the contract factory
    const EVBatteryPassportCore = await ethers.getContractFactory("EVBatteryPassportCore");
    
    // Try to get the deployed contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    console.log("Checking contract at address:", contractAddress);
    
    // Check if the contract exists at this address
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("❌ No contract deployed at this address!");
      console.log("Please deploy the contracts first using:");
      console.log("npx hardhat run scripts/deploy-local.js --network localhost");
      return;
    }
    
    console.log("✅ Contract exists at address");
    
    // Try to attach to the contract
    const contract = EVBatteryPassportCore.attach(contractAddress);
    
    // Test basic contract calls
    try {
      const governmentRole = await contract.GOVERNMENT_ROLE();
      console.log("✅ GOVERNMENT_ROLE:", governmentRole);
      
      const manufacturerRole = await contract.MANUFACTURER_ROLE();
      console.log("✅ MANUFACTURER_ROLE:", manufacturerRole);
      
      const supplierRole = await contract.SUPPLIER_ROLE();
      console.log("✅ SUPPLIER_ROLE:", supplierRole);
      
      const tenantAdminRole = await contract.TENANT_ADMIN_ROLE();
      console.log("✅ TENANT_ADMIN_ROLE:", tenantAdminRole);
      
    } catch (error) {
      console.error("❌ Error getting role constants:", error.message);
      console.log("The contract might not be properly deployed or might be a different contract");
      return;
    }
    
    // Test role checking for deployer
    const [deployer] = await ethers.getSigners();
    console.log("\nTesting roles for deployer address:", deployer.address);
    
    try {
      const hasGovernmentRole = await contract.hasRole(await contract.GOVERNMENT_ROLE(), deployer.address);
      console.log("Has GOVERNMENT_ROLE:", hasGovernmentRole);
      
      const hasManufacturerRole = await contract.hasRole(await contract.MANUFACTURER_ROLE(), deployer.address);
      console.log("Has MANUFACTURER_ROLE:", hasManufacturerRole);
      
      const hasSupplierRole = await contract.hasRole(await contract.SUPPLIER_ROLE(), deployer.address);
      console.log("Has SUPPLIER_ROLE:", hasSupplierRole);
      
      const hasTenantAdminRole = await contract.hasRole(await contract.TENANT_ADMIN_ROLE(), deployer.address);
      console.log("Has TENANT_ADMIN_ROLE:", hasTenantAdminRole);
      
    } catch (error) {
      console.error("❌ Error checking roles:", error.message);
    }
    
    console.log("\n✅ Contract verification completed successfully!");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

verifyDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 