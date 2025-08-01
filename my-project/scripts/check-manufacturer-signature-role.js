import Web3 from 'web3';

async function checkManufacturerSignatureRole() {
  try {
    console.log('=== Checking Manufacturer SignatureManager Role ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    
    // Contract addresses
    const signatureManagerAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    const passportCoreAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // Basic ABI for role management
    const signatureManagerAbi = [
      {
        "inputs": [],
        "name": "MANUFACTURER_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"type": "bytes32", "name": "role"},
          {"type": "address", "name": "account"}
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"type": "bytes32", "name": "role"},
          {"type": "address", "name": "account"}
        ],
        "name": "hasRole",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const passportCoreAbi = [
      {
        "inputs": [],
        "name": "MANUFACTURER_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"type": "bytes32", "name": "role"},
          {"type": "address", "name": "account"}
        ],
        "name": "hasRole",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const signatureManager = new web3.eth.Contract(signatureManagerAbi, signatureManagerAddress);
    const passportCore = new web3.eth.Contract(passportCoreAbi, passportCoreAddress);
    
    // Check roles in both contracts
    const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
    const hasSignatureRole = await signatureManager.methods.hasRole(manufacturerRole, account).call();
    const hasCoreRole = await passportCore.methods.hasRole(manufacturerRole, account).call();
    
    console.log('MANUFACTURER_ROLE hash:', manufacturerRole);
    console.log('Has MANUFACTURER_ROLE in SignatureManager:', hasSignatureRole);
    console.log('Has MANUFACTURER_ROLE in PassportCore:', hasCoreRole);
    
    if (hasSignatureRole && hasCoreRole) {
      console.log('✅ User has MANUFACTURER_ROLE in both contracts');
      return;
    }
    
    if (!hasSignatureRole) {
      console.log('❌ User missing MANUFACTURER_ROLE in SignatureManager');
      console.log('This is required for the updateBatteryPassport function');
      
      // Check if current user is admin
      const adminRole = await signatureManager.methods.DEFAULT_ADMIN_ROLE().call();
      const isAdmin = await signatureManager.methods.hasRole(adminRole, account).call();
      
      console.log('Is current user admin in SignatureManager:', isAdmin);
      
      if (!isAdmin) {
        console.log('❌ Current user is not admin. Cannot grant role.');
        console.log('You need to use an admin account to grant the MANUFACTURER_ROLE.');
        console.log('Or contact the government user to grant this role.');
        return;
      }
      
      // Grant the role
      console.log('Granting MANUFACTURER_ROLE to user in SignatureManager...');
      const tx = await signatureManager.methods.grantRole(manufacturerRole, account).send({
        from: account,
        gas: 100000
      });
      
      console.log('Transaction hash:', tx.transactionHash);
      console.log('✅ MANUFACTURER_ROLE granted in SignatureManager!');
    }
    
    if (!hasCoreRole) {
      console.log('❌ User missing MANUFACTURER_ROLE in PassportCore');
      console.log('This should be granted by the government during DID approval');
    }
    
    // Verify the role was granted
    const hasRoleAfter = await signatureManager.methods.hasRole(manufacturerRole, account).call();
    console.log('User has MANUFACTURER_ROLE in SignatureManager after granting:', hasRoleAfter);
    
    if (hasRoleAfter) {
      console.log('✅ Now you should be able to call updateBatteryPassport without "Unauthorized signer" error');
    }
    
  } catch (error) {
    console.error('❌ Error checking/granting MANUFACTURER_ROLE:', error.message);
  }
}

// Export for use in browser console
window.checkManufacturerSignatureRole = checkManufacturerSignatureRole;

// Run if called directly
if (typeof window !== 'undefined') {
  checkManufacturerSignatureRole();
} 