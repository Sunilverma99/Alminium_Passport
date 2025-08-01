import Web3 from 'web3';

async function debugContractIssues() {
  try {
    console.log('=== Debugging Contract Issues ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    console.log('Network ID:', await web3.eth.net.getId());
    console.log('Chain ID:', await web3.eth.getChainId());
    
    // Contract addresses (update these with your actual addresses)
    const contractAddresses = {
      didManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      signatureManager: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
      evBatteryPassportCore: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      batteryPassportQueries: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' // Update this
    };
    
    console.log('Contract addresses:', contractAddresses);
    
    // Test basic contract connectivity
    console.log('\n1. Testing basic contract connectivity...');
    
    for (const [name, address] of Object.entries(contractAddresses)) {
      try {
        console.log(`Testing ${name} at ${address}...`);
        
        // Check if address is valid
        if (!web3.utils.isAddress(address)) {
          console.log(`❌ ${name}: Invalid address format`);
          continue;
        }
        
        // Check if contract has code
        const code = await web3.eth.getCode(address);
        if (code === '0x' || code === '0x0') {
          console.log(`❌ ${name}: No contract code found at address`);
          continue;
        }
        
        console.log(`✅ ${name}: Contract code found (${code.length} bytes)`);
        
        // Try a simple call to test connectivity
        try {
          const simpleABI = [
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [{"type": "bytes32"}],
              "stateMutability": "view",
              "type": "function"
            }
          ];
          
          const contract = new web3.eth.Contract(simpleABI, address);
          const adminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
          console.log(`✅ ${name}: Basic function call successful`);
        } catch (callError) {
          console.log(`⚠️  ${name}: Basic function call failed:`, callError.message);
        }
        
      } catch (error) {
        console.log(`❌ ${name}: Error testing contract:`, error.message);
      }
    }
    
    // Test DIDManager specific functions
    console.log('\n2. Testing DIDManager functions...');
    try {
      const didManagerABI = [
        {
          "inputs": [],
          "name": "DEFAULT_ADMIN_ROLE",
          "outputs": [{"type": "bytes32"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"type": "bytes32", "name": "didHash"}],
          "name": "isDIDRegistered",
          "outputs": [{"type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"type": "bytes32", "name": "didHash"}],
          "name": "getDID",
          "outputs": [
            {"type": "string", "name": "uri"},
            {"type": "address", "name": "publicKey"},
            {"type": "uint256", "name": "trustLevel"},
            {"type": "bool", "name": "isVerified"},
            {"type": "string[]", "name": "roles"}
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      const didManager = new web3.eth.Contract(didManagerABI, contractAddresses.didManager);
      
      // Test admin role
      const adminRole = await didManager.methods.DEFAULT_ADMIN_ROLE().call();
      console.log('✅ DIDManager admin role:', adminRole);
      
      // Test with a dummy DID hash
      const dummyDidHash = '0x' + '0'.repeat(64);
      const isRegistered = await didManager.methods.isDIDRegistered(dummyDidHash).call();
      console.log('✅ DIDManager isDIDRegistered call successful:', isRegistered);
      
    } catch (error) {
      console.log('❌ DIDManager test failed:', error.message);
    }
    
    // Test SignatureManager specific functions
    console.log('\n3. Testing SignatureManager functions...');
    try {
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
      
      const signatureManager = new web3.eth.Contract(signatureManagerABI, contractAddresses.signatureManager);
      
      const supplierRole = await signatureManager.methods.SUPPLIER_ROLE().call();
      console.log('✅ SignatureManager SUPPLIER_ROLE:', supplierRole);
      
      const hasRole = await signatureManager.methods.hasRole(supplierRole, account).call();
      console.log('✅ SignatureManager hasRole call successful:', hasRole);
      
    } catch (error) {
      console.log('❌ SignatureManager test failed:', error.message);
    }
    
    // Test EVBatteryPassportCore functions
    console.log('\n4. Testing EVBatteryPassportCore functions...');
    try {
      const evContractABI = [
        {
          "inputs": [],
          "name": "QUERY_DUE_DILIGENCE_TYPEHASH",
          "outputs": [{"type": "bytes32"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"type": "bytes32", "name": "structHash"}],
          "name": "hashTypedDataV4",
          "outputs": [{"type": "bytes32"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      const evContract = new web3.eth.Contract(evContractABI, contractAddresses.evBatteryPassportCore);
      
      const typeHash = await evContract.methods.QUERY_DUE_DILIGENCE_TYPEHASH().call();
      console.log('✅ EVBatteryPassportCore typehash:', typeHash);
      
      const dummyStructHash = '0x' + '0'.repeat(64);
      const digest = await evContract.methods.hashTypedDataV4(dummyStructHash).call();
      console.log('✅ EVBatteryPassportCore hashTypedDataV4 call successful:', digest);
      
    } catch (error) {
      console.log('❌ EVBatteryPassportCore test failed:', error.message);
    }
    
    // Test user's DID
    console.log('\n5. Testing user DID...');
    try {
      const userResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(account)}`
      );
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ User data from backend:', userData);
        
        if (userData.user?.didName) {
          const didName = userData.user.didName.toLowerCase();
          const didHash = web3.utils.keccak256(didName);
          
          console.log('DID Name:', didName);
          console.log('DID Hash:', didHash);
          
          // Test DID registration
          const didManager = new web3.eth.Contract([
            {
              "inputs": [{"type": "bytes32", "name": "didHash"}],
              "name": "isDIDRegistered",
              "outputs": [{"type": "bool"}],
              "stateMutability": "view",
              "type": "function"
            }
          ], contractAddresses.didManager);
          
          const isRegistered = await didManager.methods.isDIDRegistered(didHash).call();
          console.log('✅ DID registration check successful:', isRegistered);
          
        } else {
          console.log('❌ No DID found for user');
        }
      } else {
        console.log('❌ Failed to fetch user data from backend');
      }
      
    } catch (error) {
      console.log('❌ User DID test failed:', error.message);
    }
    
    console.log('\n=== DEBUGGING COMPLETE ===');
    console.log('If you see any ❌ errors above, those are the likely causes of the EVM issues.');
    console.log('Common solutions:');
    console.log('1. Check contract addresses are correct');
    console.log('2. Ensure contracts are deployed to the correct network');
    console.log('3. Verify the network/RPC connection is stable');
    console.log('4. Check if contracts have the expected ABI functions');
    
  } catch (error) {
    console.error('❌ Error in debugging:', error.message);
  }
}

// Export for use in browser console
window.debugContractIssues = debugContractIssues;

export default debugContractIssues; 