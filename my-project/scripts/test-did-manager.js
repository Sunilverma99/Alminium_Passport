const Web3 = require('web3');
const DIDManagerABI = require('../src/abis/DIDManager.json');

async function testDIDManager() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    const testAccount = accounts[1];
    
    console.log('Admin account:', adminAccount);
    console.log('Test account:', testAccount);
    
    // Contract address
    const contractAddress = process.env.VITE_DID_MANAGER || '0x...';
    
    if (contractAddress === '0x...') {
      console.log('Please set the VITE_DID_MANAGER environment variable');
      return;
    }
    
    const contract = new web3.eth.Contract(DIDManagerABI.abi, contractAddress);
    
    console.log('\n=== Test 1: Check GOVERNMENT_ROLE ===');
    try {
      const governmentRole = await contract.methods.GOVERNMENT_ROLE().call();
      console.log('GOVERNMENT_ROLE:', governmentRole);
    } catch (error) {
      console.error('Error getting GOVERNMENT_ROLE:', error.message);
    }
    
    console.log('\n=== Test 2: Check admin role ===');
    try {
      const defaultAdminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
      const hasAdminRole = await contract.methods.hasRole(defaultAdminRole, adminAccount).call();
      console.log('Admin has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    } catch (error) {
      console.error('Error checking admin role:', error.message);
    }
    
    console.log('\n=== Test 3: Check government role ===');
    try {
      const governmentRole = await contract.methods.GOVERNMENT_ROLE().call();
      const hasGovernmentRole = await contract.methods.hasRole(governmentRole, adminAccount).call();
      console.log('Admin has GOVERNMENT_ROLE:', hasGovernmentRole);
    } catch (error) {
      console.error('Error checking government role:', error.message);
    }
    
    console.log('\n=== Test 4: Register test DID ===');
    try {
      const testDIDName = 'did:web:test.com#test';
      const testDIDHash = web3.utils.sha3(testDIDName);
      const testTrustLevel = 3;
      const testRoles = ['TENANT_ADMIN'];
      
      console.log('Test DID parameters:');
      console.log('DID Name:', testDIDName);
      console.log('DID Hash:', testDIDHash);
      console.log('Trust Level:', testTrustLevel);
      console.log('Roles:', testRoles);
      
      // Check if DID is already registered
      try {
        const isRegistered = await contract.methods.isDIDRegistered(testDIDHash).call();
        console.log('DID already registered:', isRegistered);
        
        if (isRegistered) {
          console.log('Skipping registration as DID is already registered');
        } else {
          const result = await contract.methods.registerDID(
            testDIDHash,
            testDIDName,
            testAccount,
            testTrustLevel,
            [],
            testRoles
          ).send({
            from: adminAccount,
            gas: 1000000
          });
          
          console.log('✅ Test DID registered successfully!');
          console.log('Transaction hash:', result.transactionHash);
        }
      } catch (error) {
        console.error('Error checking or registering DID:', error.message);
      }
      
    } catch (error) {
      console.error('Error in DID registration test:', error.message);
    }
    
    console.log('\n=== Test 5: Verify test DID ===');
    try {
      const testDIDName = 'did:web:test.com#test';
      const testDIDHash = web3.utils.sha3(testDIDName);
      
      const result = await contract.methods.verifyGaiaXDID(testDIDHash, true).send({
        from: adminAccount,
        gas: 1000000
      });
      
      console.log('✅ Test DID verified successfully!');
      console.log('Transaction hash:', result.transactionHash);
      
    } catch (error) {
      console.error('Error verifying DID:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDIDManager(); 