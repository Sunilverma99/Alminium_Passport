import Web3 from 'web3';

async function testSignatureManager() {
  try {
    console.log('=== Testing SignatureManager Roles ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    
    // SignatureManager address
    const signatureManagerAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    
    // Basic ABI for role checking
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
        "name": "hasRole",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"type": "bytes32", "name": "hash"},
          {"type": "bytes", "name": "signature"},
          {"type": "address", "name": "signer"}
        ],
        "name": "createAndValidateSignature",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const signatureManager = new web3.eth.Contract(abi, signatureManagerAddress);
    
    // Check SUPPLIER_ROLE
    const supplierRole = await signatureManager.methods.SUPPLIER_ROLE().call();
    console.log('SUPPLIER_ROLE hash:', supplierRole);
    
    // Check if user has the role
    const hasRole = await signatureManager.methods.hasRole(supplierRole, account).call();
    console.log('User has SUPPLIER_ROLE:', hasRole);
    
    if (!hasRole) {
      console.log('\n❌ USER DOES NOT HAVE SUPPLIER_ROLE IN SIGNATUREMANAGER!');
      console.log('This is likely the cause of the signature validation failure.');
      console.log('\nTo fix this:');
      console.log('1. Go to Government dashboard');
      console.log('2. Find the user in the approved users list');
      console.log('3. Grant SUPPLIER_ROLE in SignatureManager');
    } else {
      console.log('\n✅ User has SUPPLIER_ROLE in SignatureManager');
    }
    
    // Test signature validation with a dummy signature
    console.log('\nTesting signature validation...');
    try {
      const dummyHash = '0x' + '0'.repeat(64);
      const dummySignature = '0x' + '0'.repeat(130);
      
      const isValid = await signatureManager.methods.createAndValidateSignature(
        dummyHash, 
        dummySignature, 
        account
      ).call();
      
      console.log('Dummy signature validation result:', isValid);
    } catch (error) {
      console.log('Signature validation test error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing SignatureManager:', error.message);
  }
}

// Run the test
testSignatureManager(); 