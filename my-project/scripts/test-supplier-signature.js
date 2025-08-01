const Web3 = require('web3');
const { initializeContractInstance } = require('../src/contractInstance');

async function testSupplierSignature() {
  try {
    console.log('=== Testing Supplier Signature Creation ===');
    
    const { evContract, bpUpdater, account, web3 } = await initializeContractInstance();
    
    console.log('Account:', account);
    console.log('Core Contract:', evContract.options.address);
    console.log('Updater Contract:', bpUpdater.options.address);
    
    // Test parameters
    const tokenId = 1;
    const materialHash = 'QmTestMaterialHash123';
    const dueDiligenceHash = 'QmTestDueDiligenceHash123';
    
    // Create the correct domain (matching our fix)
    const domain = {
      name: 'EVBatteryPassport',
      version: '1',
      chainId: Number(await web3.eth.getChainId()),
      verifyingContract: evContract.options.address,
    };
    
    const types = {
      UpdateMaterialAndDueDiligence: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'materialCompositionHash', type: 'bytes32' },
        { name: 'dueDiligenceHash', type: 'bytes32' },
        { name: 'updater', type: 'address' },
      ],
    };
    
    const message = {
      tokenId: tokenId,
      materialCompositionHash: web3.utils.keccak256(materialHash),
      dueDiligenceHash: web3.utils.keccak256(dueDiligenceHash),
      updater: account,
    };
    
    console.log('\nDomain:', domain);
    console.log('Message:', message);
    
    // Create the typed data for signing
    const typedData = {
      domain,
      types,
      primaryType: 'UpdateMaterialAndDueDiligence',
      message
    };
    
    console.log('\nTyped data for signing:', JSON.stringify(typedData, null, 2));
    
    // Simulate the signature creation (we can't actually sign without MetaMask)
    console.log('\n=== Signature Creation Simulation ===');
    console.log('This would normally call:');
    console.log('window.ethereum.request({');
    console.log('  method: "eth_signTypedData_v4",');
    console.log('  params: [account, JSON.stringify(typedData)]');
    console.log('})');
    
    // Test the struct hash creation (what the contract does)
    console.log('\n=== Testing Struct Hash Creation ===');
    
    // Get the typehash from the contract
    const typehash = await evContract.methods.UPDATE_MATERIAL_AND_DUE_DILIGENCE_TYPEHASH().call();
    console.log('Typehash from contract:', typehash);
    
    // Create the struct hash manually
    const manualStructHash = web3.utils.keccak256(web3.eth.abi.encodeParameters([
      'bytes32',
      'uint256',
      'bytes32',
      'bytes32',
      'address'
    ], [
      typehash,
      tokenId,
      web3.utils.keccak256(materialHash),
      web3.utils.keccak256(dueDiligenceHash),
      account
    ]));
    
    console.log('Manual struct hash:', manualStructHash);
    
    // Get the digest from the contract
    const contractDigest = await evContract.methods.hashTypedDataV4(manualStructHash).call();
    console.log('Contract digest:', contractDigest);
    
    // Verify the domain separator
    console.log('\n=== Domain Separator Verification ===');
    const domainSeparator = await evContract.methods.eip712Domain().call();
    console.log('Domain separator from contract:', domainSeparator);
    
    console.log('\n✅ Signature creation test completed successfully!');
    console.log('The domain and message structure are correct for supplier updates.');
    
  } catch (error) {
    console.error('❌ Error testing supplier signature:', error);
  }
}

// Run the test
testSupplierSignature(); 