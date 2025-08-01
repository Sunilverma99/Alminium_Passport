import Web3 from 'web3';

async function checkTokenCounter() {
  try {
    console.log('=== Checking Token Counter ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    console.log('Chain ID:', await web3.eth.getChainId());
    
    // Contract addresses
    const evContractAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508';
    const bpQueriesAddress = '0x0B306BF915C4d645ff596e518fAf3F9669b97016';
    
    // Basic ABI for token counter
    const abi = [
      {
        "inputs": [],
        "name": "getTokenCounter",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"type": "uint256", "name": "tokenId"}],
        "name": "exists",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"type": "uint256", "name": "tokenId"}],
        "name": "getBatteryPassport",
        "outputs": [{
          "components": [
            {"type": "string", "name": "uniqueIdentifier"},
            {"type": "string", "name": "externalURN"},
            {"type": "bytes32", "name": "materialCompositionHash"},
            {"type": "bytes32", "name": "carbonFootprintHash"},
            {"type": "bytes32", "name": "performanceDataHash"},
            {"type": "bytes32", "name": "circularityDataHash"},
            {"type": "bytes32", "name": "labelsDataHash"},
            {"type": "bytes32", "name": "dueDiligenceHash"},
            {"type": "bytes32", "name": "generalProductInfoHash"},
            {"type": "uint256", "name": "batchId"},
            {"type": "string", "name": "qrCodeUrl"},
            {"type": "uint256", "name": "version"},
            {"type": "bool", "name": "exists"},
            {"type": "uint8", "name": "status"},
            {"type": "string", "name": "offChainMultihash"},
            {"type": "bytes32", "name": "offChainKeccak256"},
            {"type": "bytes32", "name": "offChainSha256"},
            {"type": "bytes32", "name": "organizationId"}
          ],
          "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const evContract = new web3.eth.Contract(abi, evContractAddress);
    const bpQueries = new web3.eth.Contract(abi, bpQueriesAddress);
    
    // Check token counter
    const tokenCounter = await evContract.methods.getTokenCounter().call();
    console.log('Current token counter:', tokenCounter);
    
    // Check if specific tokens exist
    for (let i = 1; i <= Math.min(Number(tokenCounter), 5); i++) {
      try {
        const exists = await bpQueries.methods.exists(i).call();
        console.log(`Token ${i} exists:`, exists);
        
        if (exists) {
          const passport = await evContract.methods.getBatteryPassport(i).call();
          console.log(`Token ${i} details:`, {
            uniqueIdentifier: passport.uniqueIdentifier,
            organizationId: passport.organizationId,
            status: passport.status,
            dueDiligenceHash: passport.dueDiligenceHash
          });
        }
      } catch (error) {
        console.log(`Error checking token ${i}:`, error.message);
      }
    }
    
    if (Number(tokenCounter) === 0) {
      console.log('\n❌ No battery passports exist!');
      console.log('You need to create a battery passport first before querying due diligence data.');
      console.log('Use the Manufacturer dashboard to create a battery passport.');
    } else {
      console.log('\n✅ Battery passports exist. You can query due diligence data for tokens 1-' + tokenCounter);
    }
    
  } catch (error) {
    console.error('❌ Error checking token counter:', error.message);
  }
}

// Run the script
checkTokenCounter(); 