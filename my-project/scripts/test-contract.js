const { ethers } = require("hardhat");

async function testContract() {
  console.log("Testing Battery Passport contract...");

  try {
    // Get the contract factory
    const EVBatteryPassportCore = await ethers.getContractFactory("EVBatteryPassportCore");
    
    // Try to get the deployed contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contract = EVBatteryPassportCore.attach(contractAddress);
    
    console.log("Contract address:", contractAddress);
    
    // Test basic contract calls
    try {
      const governmentRole = await contract.GOVERNMENT_ROLE();
      console.log("GOVERNMENT_ROLE:", governmentRole);
      
      const manufacturerRole = await contract.MANUFACTURER_ROLE();
      console.log("MANUFACTURER_ROLE:", manufacturerRole);
      
      const supplierRole = await contract.SUPPLIER_ROLE();
      console.log("SUPPLIER_ROLE:", supplierRole);
      
      const tenantAdminRole = await contract.TENANT_ADMIN_ROLE();
      console.log("TENANT_ADMIN_ROLE:", tenantAdminRole);
      
      const recyclerRole = await contract.RECYCLER_ROLE();
      console.log("RECYCLER_ROLE:", recyclerRole);
      
      const minerRole = await contract.MINER_ROLE();
      console.log("MINER_ROLE:", minerRole);
      
      const globalAuditorRole = await contract.GLOBAL_AUDITOR_ROLE();
      console.log("GLOBAL_AUDITOR_ROLE:", globalAuditorRole);
      
      const thirdPartyRole = await contract.THIRD_PARTY_ROLE();
      console.log("THIRD_PARTY_ROLE:", thirdPartyRole);
      
    } catch (error) {
      console.error("Error getting role constants:", error.message);
    }
    
    // Test role checking for a specific address
    const [deployer] = await ethers.getSigners();
    console.log("Testing roles for address:", deployer.address);
    
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
      console.error("Error checking roles:", error.message);
    }
    
  } catch (error) {
    console.error("Contract test failed:", error.message);
  }
}

testContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 