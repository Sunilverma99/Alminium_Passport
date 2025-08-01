import Web3 from 'web3';

async function grantSupplierRole() {
  try {
    console.log('=== Granting SUPPLIER_ROLE to User ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    
    // SignatureManager address
    const signatureManagerAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    
    // Basic ABI for role management
    const abi = [
      {
        "inputs": [],
        "name": "SUPPLIER_ROLE",
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
    
    const signatureManager = new web3.eth.Contract(abi, signatureManagerAddress);
    
    // Check if user already has the role
    const supplierRole = await signatureManager.methods.SUPPLIER_ROLE().call();
    const hasRole = await signatureManager.methods.hasRole(supplierRole, account).call();
    
    console.log('SUPPLIER_ROLE hash:', supplierRole);
    console.log('User already has SUPPLIER_ROLE:', hasRole);
    
    if (hasRole) {
      console.log('✅ User already has SUPPLIER_ROLE in SignatureManager');
      return;
    }
    
    // Check if current user is admin
    const adminRole = await signatureManager.methods.DEFAULT_ADMIN_ROLE().call();
    const isAdmin = await signatureManager.methods.hasRole(adminRole, account).call();
    
    console.log('Is current user admin:', isAdmin);
    
    if (!isAdmin) {
      console.log('❌ Current user is not admin. Cannot grant role.');
      console.log('You need to use an admin account to grant the SUPPLIER_ROLE.');
      console.log('Or contact the government user to grant this role.');
      return;
    }
    
    // Grant the role
    console.log('Granting SUPPLIER_ROLE to user...');
    const tx = await signatureManager.methods.grantRole(supplierRole, account).send({
      from: account,
      gas: 100000
    });
    
    console.log('Transaction hash:', tx.transactionHash);
    console.log('✅ SUPPLIER_ROLE granted successfully!');
    
    // Verify the role was granted
    const hasRoleAfter = await signatureManager.methods.hasRole(supplierRole, account).call();
    console.log('User has SUPPLIER_ROLE after granting:', hasRoleAfter);
    
  } catch (error) {
    console.error('❌ Error granting SUPPLIER_ROLE:', error.message);
  }
}

// Run the script
grantSupplierRole(); 