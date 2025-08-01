import Web3 from 'web3';

async function checkDIDStatus() {
  try {
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const userAccount = accounts[0];
    
    console.log('User account:', userAccount);
    
    // Contract addresses
    const didManagerAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // Basic DIDManager ABI for checking DID status
    const didManagerABI = [
      {
        "inputs": [{"type": "bytes32"}],
        "name": "getDID",
        "outputs": [{
          "components": [
            {"type": "string", "name": "uri"},
            {"type": "address", "name": "publicKey"},
            {"type": "uint8", "name": "trustLevel"},
            {"type": "bool", "name": "isVerified"},
            {"type": "string[]", "name": "serviceEndpoints"},
            {"type": "string[]", "name": "roles"}
          ],
          "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"type": "bytes32", "name": "didHash"},
          {"type": "string", "name": "requiredRole"},
          {"type": "uint8", "name": "requiredTrustLevel"},
          {"type": "address", "name": "signer"}
        ],
        "name": "validateDIDRole",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const didManager = new web3.eth.Contract(didManagerABI, didManagerAddress);
    
    // You need to provide the actual DID hash that your frontend is using
    // For now, let's check if there are any DIDs registered
    console.log('\n=== DID Status Check ===');
    console.log('Note: You need to provide the actual DID hash from your frontend');
    
    // Example: Check with a test DID hash (you need to replace this with your actual DID hash)
    const testDidHash = web3.utils.keccak256('test_did');
    
    try {
      const didDetails = await didManager.methods.getDID(testDidHash).call();
      console.log('Test DID Details:', didDetails);
    } catch (error) {
      console.log('Test DID not found (expected)');
    }
    
    console.log('\n=== Manual Check Required ===');
    console.log('1. Check your browser console for the actual DID hash being used');
    console.log('2. Verify that DID is registered in DIDManager');
    console.log('3. Verify that DID has MANUFACTURER role and trust level >= 4');
    console.log('4. Verify that DID is verified');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDIDStatus(); 