const Web3 = require('web3');
const { initializeContractInstance } = require('../src/contractInstance');

async function debugSignatureSimple() {
  try {
    const { evContract, signatureManager, account, web3 } = await initializeContractInstance();
    
    console.log('=== Simple Signature Debug ===');
    console.log('Account:', account);
    console.log('SignatureManager address:', signatureManager.options.address);
    
    // Create a simple test message
    const testMessage = "Hello World";
    const messageHash = web3.utils.keccak256(testMessage);
    console.log('Test message hash:', messageHash);
    
    // Sign the message using personal_sign
    const signature = await web3.eth.personal.sign(messageHash, account, '');
    console.log('Signature:', signature);
    
    // Test 1: Try to validate with createAndValidateSignature
    console.log('\n=== Test 1: createAndValidateSignature ===');
    try {
      const isValid = await signatureManager.methods
        .createAndValidateSignature(messageHash, signature, account)
        .call();
      console.log('createAndValidateSignature result:', isValid);
    } catch (error) {
      console.error('createAndValidateSignature error:', error.message);
    }
    
    // Test 2: Try to recover signer directly
    console.log('\n=== Test 2: recoverSigner ===');
    try {
      const recoveredSigner = await signatureManager.methods
        .recoverSigner(messageHash, signature)
        .call();
      console.log('Recovered signer:', recoveredSigner);
      console.log('Matches account:', recoveredSigner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('recoverSigner error:', error.message);
    }
    
    // Test 3: Check if account has MANUFACTURER_ROLE
    console.log('\n=== Test 3: Role Check ===');
    try {
      const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
      console.log('MANUFACTURER_ROLE:', manufacturerRole);
      
      const hasRole = await signatureManager.methods.hasRole(manufacturerRole, account).call();
      console.log('Has MANUFACTURER role:', hasRole);
    } catch (error) {
      console.error('Role check error:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugSignatureSimple(); 