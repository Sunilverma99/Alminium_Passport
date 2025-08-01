import Web3 from 'web3';

async function debugSupplierQuery() {
  try {
    console.log('=== Supplier Query Debug Script ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('✅ Web3 initialized successfully');
    console.log('User account:', account);
    console.log('Chain ID:', await web3.eth.getChainId());
    
    // Contract addresses from your logs
    const didManagerAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788';
    const credentialManagerAddress = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
    const signatureManagerAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    const bpQueriesAddress = '0x0B306BF915C4d645ff596e518fAf3F9669b97016';
    
    // Basic ABIs for debugging
    const didManagerABI = [
      {
        "inputs": [{"type": "bytes32"}],
        "name": "isDIDRegistered",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
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
    
    const credentialManagerABI = [
      {
        "inputs": [{"type": "string", "name": "credentialId"}],
        "name": "validateVerifiableCredential",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const signatureManagerABI = [
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
      }
    ];
    
    const bpQueriesABI = [
      {
        "inputs": [{"type": "uint256", "name": "tokenId"}],
        "name": "exists",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    // Initialize contracts
    const didManager = new web3.eth.Contract(didManagerABI, didManagerAddress);
    const credentialManager = new web3.eth.Contract(credentialManagerABI, credentialManagerAddress);
    const signatureManager = new web3.eth.Contract(signatureManagerABI, signatureManagerAddress);
    const bpQueries = new web3.eth.Contract(bpQueriesABI, bpQueriesAddress);
    
    // 1. Fetch user DID info from backend
    console.log('\n1. Fetching user DID info from backend...');
    const userResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(account)}`
    );
    
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user credential data from backend");
    }
    
    const userData = await userResponse.json();
    console.log('User data from backend:', userData);
    
    if (!userData.user?.didName || !userData.user?.credentialId) {
      throw new Error("No valid user credentials found. Please ensure you are properly registered.");
    }
    
    const didName = userData.user.didName.toLowerCase();
    const credentialId = userData.user.credentialId;
    console.log('DID Name:', didName);
    console.log('Credential ID:', credentialId);
    
    // 2. Compute DID hash
    const didHash = web3.utils.keccak256(didName);
    console.log('DID Hash:', didHash);
    
    // 3. Check DID registration
    console.log('\n2. Checking DID registration...');
    const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
    console.log('DID registered:', isDIDRegistered);
    
    if (!isDIDRegistered) {
      console.error('❌ DID is not registered! This is the root cause.');
      console.error('   The user needs to be approved by a government user first.');
      return;
    }
    
    // 4. Get DID details
    console.log('\n3. Getting DID details...');
    const didDetails = await didManager.methods.getDID(didHash).call();
    console.log('DID Details:', {
      uri: didDetails.uri,
      publicKey: didDetails.publicKey,
      trustLevel: didDetails.trustLevel,
      isVerified: didDetails.isVerified,
      roles: didDetails.roles
    });
    
    // 5. Check verification status
    if (!didDetails.isVerified) {
      console.error('❌ DID is not verified! This will cause validation to fail.');
      console.error('   The user needs to be verified by a government user.');
      return;
    }
    
    // 6. Check public key match
    if (didDetails.publicKey.toLowerCase() !== account.toLowerCase()) {
      console.error('❌ PUBLIC KEY MISMATCH!');
      console.error('   DID was registered with public key:', didDetails.publicKey);
      console.error('   Current account:', account);
      console.error('   This will cause "Signer mismatch" errors.');
      return;
    }
    
    // 7. Check trust level
    console.log('\n4. Checking trust level requirements...');
    console.log('Current trust level:', didDetails.trustLevel);
    console.log('Required trust level for SUPPLIER role:', 3);
    
    if (didDetails.trustLevel < 3) {
      console.error('❌ INSUFFICIENT TRUST LEVEL!');
      console.error('   Current trust level:', didDetails.trustLevel);
      console.error('   Required trust level for SUPPLIER role:', 3);
      console.error('   This is causing the "Insufficient trust level" error.');
      return;
    }
    
    // 8. Check roles
    console.log('\n5. Checking roles...');
    console.log('User roles:', didDetails.roles);
    
    const hasSupplierRole = didDetails.roles.some(role => 
      role.toUpperCase() === 'SUPPLIER'
    );
    
    if (!hasSupplierRole) {
      console.error('❌ MISSING SUPPLIER ROLE!');
      console.error('   User roles:', didDetails.roles);
      console.error('   Required role: SUPPLIER');
      console.error('   This is causing the "Insufficient access level" error.');
      return;
    }
    
    // 9. Test DID role validation
    console.log('\n6. Testing DID role validation...');
    try {
      const hasSupplierRoleValid = await didManager.methods.validateDIDRole(
        didHash, 
        'SUPPLIER', 
        3, 
        account
      ).call();
      console.log('DID has SUPPLIER role (level 3):', hasSupplierRoleValid);
      
      if (!hasSupplierRoleValid) {
        console.error('❌ DID role validation failed!');
        console.error('   This means the user cannot access supplier functions.');
        return;
      }
    } catch (error) {
      console.error('❌ Error during DID role validation:', error.message);
      return;
    }
    
    // 10. Check credential validation
    console.log('\n7. Checking credential validation...');
    try {
      const credentialValid = await credentialManager.methods
        .validateVerifiableCredential(credentialId.toLowerCase())
        .call();
      console.log('Credential valid:', credentialValid);
      
      if (!credentialValid) {
        console.error('❌ Credential is not valid or expired!');
        return;
      }
    } catch (error) {
      console.error('❌ Error checking credential:', error.message);
      return;
    }
    
    // 11. Check SignatureManager roles
    console.log('\n8. Checking SignatureManager roles...');
    try {
      const supplierRole = await signatureManager.methods.SUPPLIER_ROLE().call();
      const hasSignatureManagerRole = await signatureManager.methods.hasRole(supplierRole, account).call();
      console.log('Has SUPPLIER_ROLE in SignatureManager:', hasSignatureManagerRole);
      
      if (!hasSignatureManagerRole) {
        console.error('❌ MISSING SIGNATURE MANAGER ROLE!');
        console.error('   User does not have SUPPLIER_ROLE in SignatureManager.');
        console.error('   This will cause signature validation to fail.');
        return;
      }
    } catch (error) {
      console.error('❌ Error checking SignatureManager roles:', error.message);
      return;
    }
    
    // 12. Test a simple query to see if it works
    console.log('\n9. Testing simple query...');
    try {
      const tokenExists = await bpQueries.methods.exists(1).call();
      console.log('Token 1 exists:', tokenExists);
    } catch (error) {
      console.error('❌ Error testing simple query:', error.message);
    }
    
    console.log('\n✅ All checks passed! The user should be able to query due diligence data.');
    console.log('\nIf you\'re still getting errors, the issue might be:');
    console.log('1. Organization mismatch (user org != passport org)');
    console.log('2. Token ID doesn\'t exist');
    console.log('3. EIP-712 signature issues');
    console.log('4. Network connectivity issues');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug script
debugSupplierQuery(); 