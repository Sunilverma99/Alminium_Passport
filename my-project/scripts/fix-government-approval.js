import Web3 from 'web3';

async function fixGovernmentApproval() {
  try {
    console.log('=== Fixing Government Approval Process ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('Government account:', account);
    
    // Contract addresses
    const signatureManagerAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    const didManagerAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const credentialManagerAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
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
        "inputs": [],
        "name": "SUPPLIER_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MINER_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "RECYCLER_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "GOVERNMENT_ROLE",
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
    
    const signatureManager = new web3.eth.Contract(signatureManagerAbi, signatureManagerAddress);
    
    // Check if current user is admin in SignatureManager
    const adminRole = await signatureManager.methods.DEFAULT_ADMIN_ROLE().call();
    const isAdmin = await signatureManager.methods.hasRole(adminRole, account).call();
    
    console.log('Is current user admin in SignatureManager:', isAdmin);
    
    if (!isAdmin) {
      console.log('❌ Current user is not admin in SignatureManager');
      console.log('Cannot grant roles. Need admin privileges.');
      return;
    }
    
    // Get user address to grant role to
    const userAddress = prompt('Enter the user address to grant role to:');
    if (!userAddress || !web3.utils.isAddress(userAddress)) {
      console.log('❌ Invalid user address');
      return;
    }
    
    // Get role to grant
    const role = prompt('Enter the role to grant (MANUFACTURER/SUPPLIER/MINER/RECYCLER/GOVERNMENT):').toUpperCase();
    const validRoles = ['MANUFACTURER', 'SUPPLIER', 'MINER', 'RECYCLER', 'GOVERNMENT'];
    
    if (!validRoles.includes(role)) {
      console.log('❌ Invalid role. Must be one of:', validRoles.join(', '));
      return;
    }
    
    console.log(`Granting ${role}_ROLE to ${userAddress}...`);
    
    // Get the role hash
    const roleHash = await signatureManager.methods[`${role}_ROLE`]().call();
    
    // Check if user already has the role
    const hasRole = await signatureManager.methods.hasRole(roleHash, userAddress).call();
    
    if (hasRole) {
      console.log(`✅ User already has ${role}_ROLE in SignatureManager`);
      return;
    }
    
    // Grant the role
    const tx = await signatureManager.methods.grantRole(roleHash, userAddress).send({
      from: account,
      gas: 100000
    });
    
    console.log('Transaction hash:', tx.transactionHash);
    console.log(`✅ ${role}_ROLE granted to ${userAddress} in SignatureManager!`);
    
    // Verify the role was granted
    const hasRoleAfter = await signatureManager.methods.hasRole(roleHash, userAddress).call();
    console.log(`User has ${role}_ROLE in SignatureManager after granting:`, hasRoleAfter);
    
    if (hasRoleAfter) {
      console.log('✅ Role granted successfully!');
      console.log('The user should now be able to call functions that require this role.');
    }
    
  } catch (error) {
    console.error('❌ Error granting role:', error.message);
  }
}

// Export for use in browser console
window.fixGovernmentApproval = fixGovernmentApproval;

// Run if called directly
if (typeof window !== 'undefined') {
  fixGovernmentApproval();
} 