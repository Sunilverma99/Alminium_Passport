const { ethers } = require("hardhat");

async function deploySimple() {
  console.log("🚀 Deploying Battery Passport contracts...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy manager contracts first
    console.log("\n📋 Deploying DIDManager...");
    const DIDManager = await ethers.getContractFactory("DIDManager");
    const didManager = await DIDManager.deploy();
    await didManager.deployed();
    console.log("✅ DIDManager deployed to:", didManager.address);

    console.log("\n📋 Deploying CredentialManager...");
    const CredentialManager = await ethers.getContractFactory("CredentialManager");
    const credentialManager = await CredentialManager.deploy(didManager.address);
    await credentialManager.deployed();
    console.log("✅ CredentialManager deployed to:", credentialManager.address);

    console.log("\n📋 Deploying SignatureManager...");
    const SignatureManager = await ethers.getContractFactory("SignatureManager");
    const signatureManager = await SignatureManager.deploy();
    await signatureManager.deployed();
    console.log("✅ SignatureManager deployed to:", signatureManager.address);

    console.log("\n📋 Deploying DiscrepancyManager...");
    const DiscrepancyManager = await ethers.getContractFactory("DiscrepancyManager");
    const discrepancyManager = await DiscrepancyManager.deploy(didManager.address, signatureManager.address);
    await discrepancyManager.deployed();
    console.log("✅ DiscrepancyManager deployed to:", discrepancyManager.address);

    // Deploy the main contract
    console.log("\n🏭 Deploying EVBatteryPassportCore...");
    const EVBatteryPassportCore = await ethers.getContractFactory("EVBatteryPassportCore");
    const evBatteryPassportCore = await EVBatteryPassportCore.deploy(
      didManager.address,
      credentialManager.address,
      signatureManager.address,
      discrepancyManager.address,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("GOVERNMENT_DID"))
    );
    await evBatteryPassportCore.deployed();
    console.log("✅ EVBatteryPassportCore deployed to:", evBatteryPassportCore.address);

    // Deploy updater contract
    console.log("\n📋 Deploying BatteryPassportUpdater...");
    const BatteryPassportUpdater = await ethers.getContractFactory("BatteryPassportUpdater");
    const batteryPassportUpdater = await BatteryPassportUpdater.deploy(
      evBatteryPassportCore.address,
      didManager.address
    );
    await batteryPassportUpdater.deployed();
    console.log("✅ BatteryPassportUpdater deployed to:", batteryPassportUpdater.address);

    // Set the updater contract in the main contract
    console.log("\n🔗 Setting updater contract...");
    await evBatteryPassportCore.setBatteryPassportUpdater(batteryPassportUpdater.address);
    console.log("✅ Updater contract set in main contract");

    // Grant roles for testing
    console.log("\n👑 Granting roles to deployer...");
    
    // Grant roles in main contract
    await evBatteryPassportCore.grantRole(await evBatteryPassportCore.GOVERNMENT_ROLE(), deployer.address);
    console.log("✅ Government role granted in main contract");

    await evBatteryPassportCore.grantRole(await evBatteryPassportCore.MANUFACTURER_ROLE(), deployer.address);
    console.log("✅ Manufacturer role granted in main contract");

    await evBatteryPassportCore.grantRole(await evBatteryPassportCore.SUPPLIER_ROLE(), deployer.address);
    console.log("✅ Supplier role granted in main contract");

    await evBatteryPassportCore.grantRole(await evBatteryPassportCore.RECYCLER_ROLE(), deployer.address);
    console.log("✅ Recycler role granted in main contract");

    await evBatteryPassportCore.grantRole(await evBatteryPassportCore.MINER_ROLE(), deployer.address);
    console.log("✅ Miner role granted in main contract");

    await evBatteryPassportCore.grantRole(await evBatteryPassportCore.TENANT_ADMIN_ROLE(), deployer.address);
    console.log("✅ Tenant Admin role granted in main contract");

    // Grant roles in SignatureManager
    await signatureManager.grantRole(await signatureManager.MANUFACTURER_ROLE(), deployer.address);
    console.log("✅ Manufacturer role granted in SignatureManager");

    await signatureManager.grantRole(await signatureManager.SUPPLIER_ROLE(), deployer.address);
    console.log("✅ Supplier role granted in SignatureManager");

    await signatureManager.grantRole(await signatureManager.RECYCLER_ROLE(), deployer.address);
    console.log("✅ Recycler role granted in SignatureManager");

    await signatureManager.grantRole(await signatureManager.MINER_ROLE(), deployer.address);
    console.log("✅ Miner role granted in SignatureManager");

    await signatureManager.grantRole(await signatureManager.GOVERNMENT_ROLE(), deployer.address);
    console.log("✅ Government role granted in SignatureManager");

    // Grant roles in DiscrepancyManager (already has RECYCLER_ROLE from constructor, but let's be explicit)
    await discrepancyManager.grantRole(await discrepancyManager.RECYCLER_ROLE(), deployer.address);
    console.log("✅ Recycler role granted in DiscrepancyManager");

    await discrepancyManager.grantRole(await discrepancyManager.GOVERNMENT_ROLE(), deployer.address);
    console.log("✅ Government role granted in DiscrepancyManager");

    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("\n=== CONTRACT ADDRESSES ===");
    console.log("DIDManager:", didManager.address);
    console.log("CredentialManager:", credentialManager.address);
    console.log("SignatureManager:", signatureManager.address);
    console.log("DiscrepancyManager:", discrepancyManager.address);
    console.log("EVBatteryPassportCore:", evBatteryPassportCore.address);
    console.log("BatteryPassportUpdater:", batteryPassportUpdater.address);
    console.log("Deployer address:", deployer.address);
    
    console.log("\n📝 Next steps:");
    console.log("1. Update my-project/src/config/contracts.js with the EVBatteryPassportCore address");
    console.log("2. Restart your frontend application");
    console.log("3. Connect your wallet to test the roles");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

deploySimple()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 