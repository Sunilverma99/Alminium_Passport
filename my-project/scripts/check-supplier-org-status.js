import Web3 from 'web3';

async function checkSupplierOrgStatus() {
  try {
    console.log('🔍 Checking Supplier Organization Status...');
    
    // Initialize Web3 with local provider
    const web3 = new Web3('http://localhost:8545');
    
    // Get the current account (first account in the local network)
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // This should be the supplier account
    
    console.log('Supplier account:', account);
    
    // Contract addresses from the logs
    const evContractAddress = '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9';
    const bpQueriesAddress = '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8';
    
    console.log('Contract addresses:');
    console.log('EVBatteryPassportCore:', evContractAddress);
    console.log('BatteryPassportQueries:', bpQueriesAddress);
    
    // Basic ABI for the functions we need
    const evContractABI = [
      {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getUserOrganization",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"name": "role", "type": "bytes32"}, {"name": "account", "type": "address"}],
        "name": "hasRole",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "TENANT_ADMIN_ROLE",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const evContract = new web3.eth.Contract(evContractABI, evContractAddress);
    
    // 1. Check blockchain organization assignment
    console.log('\n=== Blockchain Organization Assignment ===');
    const blockchainOrg = await evContract.methods.getUserOrganization(account).call();
    console.log('Blockchain organization:', blockchainOrg);
    const hasBlockchainOrg = blockchainOrg !== '0x0000000000000000000000000000000000000000000000000000000000000000';
    console.log('Has blockchain organization:', hasBlockchainOrg);
    
    // 2. Check backend organization assignment
    console.log('\n=== Backend Organization Assignment ===');
    try {
      const response = await fetch(`http://localhost:3000/api/organization/member/${account}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('Backend organization data:', userData);
        console.log('Organization ID:', userData.organizationId);
        console.log('Organization Name:', userData.organizationName);
        console.log('Member Role:', userData.memberRole);
        console.log('Has backend organization:', true);
        
        // 3. Compare organization IDs
        console.log('\n=== Organization Comparison ===');
        const backendOrgHash = web3.utils.keccak256(userData.organizationId);
        console.log('Backend organization hash:', backendOrgHash);
        console.log('Blockchain organization hash:', blockchainOrg);
        console.log('Organization match:', backendOrgHash === blockchainOrg);
        
        if (!hasBlockchainOrg) {
          console.log('\n❌ ISSUE: Supplier has backend organization but no blockchain organization!');
          console.log('This means the tenant admin added them to the backend but the assignOrganization transaction failed.');
          console.log('\nSolution: Run the organization assignment script:');
          console.log(`node scripts/assign-supplier-to-org.js ${account} ${userData.organizationId}`);
        } else if (backendOrgHash !== blockchainOrg) {
          console.log('\n❌ ISSUE: Organization mismatch between backend and blockchain!');
          console.log('This could cause authorization issues.');
        } else {
          console.log('\n✅ Organization assignment is correct!');
        }
        
      } else {
        console.log('❌ No backend organization found for supplier');
        console.log('Response status:', response.status);
        const errorData = await response.json();
        console.log('Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching backend organization:', error);
    }
    
    // 4. Check DID status
    console.log('\n=== DID Status ===');
    try {
      const userResponse = await fetch(`http://localhost:3000/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(account)}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User DID data:', userData);
        if (userData.user?.didName) {
          const didHash = web3.utils.keccak256(userData.user.didName.toLowerCase());
          console.log('DID Hash:', didHash);
        }
      } else {
        console.log('❌ No user DID data found');
      }
    } catch (error) {
      console.error('❌ Error fetching DID data:', error);
    }
    
  } catch (error) {
    console.error('❌ Error checking supplier organization status:', error);
  }
}

// Run the check
checkSupplierOrgStatus(); 