const Web3 = require('web3');
const CredentialManagerABI = require('../src/abis/CredentialManager.json');

async function testCredentialManager() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    const testAccount = accounts[1];
    
    console.log('Admin account:', adminAccount);
    console.log('Test account:', testAccount);
    
    // Contract address (you'll need to update this with your deployed address)
    const contractAddress = process.env.VITE_CREDENTIAL_MANAGER || '0x...';
    
    if (contractAddress === '0x...') {
      console.log('Please set the VITE_CREDENTIAL_MANAGER environment variable');
      return;
    }
    
    const contract = new web3.eth.Contract(CredentialManagerABI.abi, contractAddress);
    
    // Test 1: Check if GOVERNMENT_ROLE exists
    console.log('\n=== Test 1: Check GOVERNMENT_ROLE ===');
    try {
      const governmentRole = await contract.methods.GOVERNMENT_ROLE().call();
      console.log('GOVERNMENT_ROLE:', governmentRole);
    } catch (error) {
      console.error('Error getting GOVERNMENT_ROLE:', error.message);
    }
    
    // Test 2: Check if admin has DEFAULT_ADMIN_ROLE
    console.log('\n=== Test 2: Check admin role ===');
    try {
      const defaultAdminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
      const hasAdminRole = await contract.methods.hasRole(defaultAdminRole, adminAccount).call();
      console.log('Admin has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    } catch (error) {
      console.error('Error checking admin role:', error.message);
    }
    
    // Test 3: Check if admin has GOVERNMENT_ROLE
    console.log('\n=== Test 3: Check government role ===');
    try {
      const governmentRole = await contract.methods.GOVERNMENT_ROLE().call();
      const hasGovernmentRole = await contract.methods.hasRole(governmentRole, adminAccount).call();
      console.log('Admin has GOVERNMENT_ROLE:', hasGovernmentRole);
    } catch (error) {
      console.error('Error checking government role:', error.message);
    }
    
    // Test 4: Try to issue a test credential
    console.log('\n=== Test 4: Issue test credential ===');
    try {
      const testCredentialId = 'test-cred-123';
      const testSubject = 'did:web:test.com#test';
      const testData = '{"test": "data"}';
      const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const context = ['https://www.w3.org/2018/credentials/v1'];
      const credentialType = ['VerifiableCredential'];
      const proofType = 'EcdsaSecp256k1Signature2019';
      const proofCreator = `did:ethr:${adminAccount}`;
      
      console.log('Test credential parameters:');
      console.log('ID:', testCredentialId);
      console.log('Subject:', testSubject);
      console.log('Data:', testData);
      console.log('Expires at:', expiresAt);
      
      const result = await contract.methods.issueVerifiableCredential(
        testCredentialId,
        testSubject,
        testData,
        expiresAt,
        context,
        credentialType,
        proofType,
        proofCreator
      ).send({
        from: adminAccount,
        gas: 1000000
      });
      
      console.log('Test credential issued successfully!');
      console.log('Transaction hash:', result.transactionHash);
    } catch (error) {
      console.error('Error issuing test credential:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCredentialManager(); 