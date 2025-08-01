const { ethers } = require("hardhat");

async function grantMissingRoles() {
  console.log("🔧 Granting missing roles to existing contracts...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Contract addresses - update these with your deployed addresses
    const DISCREPANCY_MANAGER_ADDRESS = process.env.VITE_DISCREPANCY_MANAGER || '0x...';
    const SIGNATURE_MANAGER_ADDRESS = process.env.VITE_SIGNATURE_MANAGER || '0x...';
    const EV_BATTERY_PASSPORT_CORE_ADDRESS = process.env.VITE_EV_BATTERY_PASSPORT_CORE || '0x...';

    if (DISCREPANCY_MANAGER_ADDRESS === '0x...' || SIGNATURE_MANAGER_ADDRESS === '0x...' || EV_BATTERY_PASSPORT_CORE_ADDRESS === '0x...') {
      console.log("❌ Please set the environment variables with your contract addresses:");
      console.log("VITE_DISCREPANCY_MANAGER");
      console.log("VITE_SIGNATURE_MANAGER");
      console.log("VITE_EV_BATTERY_PASSPORT_CORE");
      return;
    }

    console.log("\n📋 Contract addresses:");
    console.log("DiscrepancyManager:", DISCREPANCY_MANAGER_ADDRESS);
    console.log("SignatureManager:", SIGNATURE_MANAGER_ADDRESS);
    console.log("EVBatteryPassportCore:", EV_BATTERY_PASSPORT_CORE_ADDRESS);

    // Get contract factories
    const DiscrepancyManager = await ethers.getContractFactory("DiscrepancyManager");
    const SignatureManager = await ethers.getContractFactory("SignatureManager");
    const EVBatteryPassportCore = await ethers.getContractFactory("EVBatteryPassportCore");

    // Attach to deployed contracts
    const discrepancyManager = DiscrepancyManager.attach(DISCREPANCY_MANAGER_ADDRESS);
    const signatureManager = SignatureManager.attach(SIGNATURE_MANAGER_ADDRESS);
    const evBatteryPassportCore = EVBatteryPassportCore.attach(EV_BATTERY_PASSPORT_CORE_ADDRESS);

    console.log("\n👑 Granting roles to deployer...");

    // Grant roles in main contract
    try {
      await evBatteryPassportCore.grantRole(await evBatteryPassportCore.RECYCLER_ROLE(), deployer.address);
      console.log("✅ Recycler role granted in main contract");
    } catch (error) {
      console.log("⚠️  Recycler role already granted in main contract or error:", error.message);
    }

    try {
      await evBatteryPassportCore.grantRole(await evBatteryPassportCore.MINER_ROLE(), deployer.address);
      console.log("✅ Miner role granted in main contract");
    } catch (error) {
      console.log("⚠️  Miner role already granted in main contract or error:", error.message);
    }

    // Grant roles in SignatureManager
    try {
      await signatureManager.grantRole(await signatureManager.MANUFACTURER_ROLE(), deployer.address);
      console.log("✅ Manufacturer role granted in SignatureManager");
    } catch (error) {
      console.log("⚠️  Manufacturer role already granted in SignatureManager or error:", error.message);
    }

    try {
      await signatureManager.grantRole(await signatureManager.SUPPLIER_ROLE(), deployer.address);
      console.log("✅ Supplier role granted in SignatureManager");
    } catch (error) {
      console.log("⚠️  Supplier role already granted in SignatureManager or error:", error.message);
    }

    try {
      await signatureManager.grantRole(await signatureManager.RECYCLER_ROLE(), deployer.address);
      console.log("✅ Recycler role granted in SignatureManager");
    } catch (error) {
      console.log("⚠️  Recycler role already granted in SignatureManager or error:", error.message);
    }

    try {
      await signatureManager.grantRole(await signatureManager.MINER_ROLE(), deployer.address);
      console.log("✅ Miner role granted in SignatureManager");
    } catch (error) {
      console.log("⚠️  Miner role already granted in SignatureManager or error:", error.message);
    }

    try {
      await signatureManager.grantRole(await signatureManager.GOVERNMENT_ROLE(), deployer.address);
      console.log("✅ Government role granted in SignatureManager");
    } catch (error) {
      console.log("⚠️  Government role already granted in SignatureManager or error:", error.message);
    }

    // Grant roles in DiscrepancyManager
    try {
      await discrepancyManager.grantRole(await discrepancyManager.RECYCLER_ROLE(), deployer.address);
      console.log("✅ Recycler role granted in DiscrepancyManager");
    } catch (error) {
      console.log("⚠️  Recycler role already granted in DiscrepancyManager or error:", error.message);
    }

    try {
      await discrepancyManager.grantRole(await discrepancyManager.GOVERNMENT_ROLE(), deployer.address);
      console.log("✅ Government role granted in DiscrepancyManager");
    } catch (error) {
      console.log("⚠️  Government role already granted in DiscrepancyManager or error:", error.message);
    }

    console.log("\n🎉 Role granting completed!");
    console.log("\n📝 Next steps:");
    console.log("1. Test the RecyclerReportDiscrepancies component");
    console.log("2. If you need to grant roles to other users, use the same pattern");

  } catch (error) {
    console.error("❌ Role granting failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

grantMissingRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 