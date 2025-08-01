import Web3 from 'web3';

async function debugUpdateSignature() {
  try {
    console.log('=== Debugging UpdateBatteryPassport Signature ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    
    // Contract addresses
    const evContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const bpUpdaterAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
    console.log('EVBatteryPassportCore address:', evContractAddress);
    console.log('BatteryPassportUpdater address:', bpUpdaterAddress);
    
    // Get chain ID
    const chainId = await web3.eth.getChainId();
    console.log('Chain ID:', chainId);
    
    // Test parameters
    const tokenId = 1; // Use a valid token ID
    const updater = account;
    
    // Get the UPDATE_PASSPORT_TYPEHASH from the contract
    const evContractAbi = [
      {
        "inputs": [],
        "name": "UPDATE_PASSPORT_TYPEHASH",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const evContract = new web3.eth.Contract(evContractAbi, evContractAddress);
    const updatePassportTypehash = await evContract.methods.UPDATE_PASSPORT_TYPEHASH().call();
    console.log('UPDATE_PASSPORT_TYPEHASH:', updatePassportTypehash);
    
    // Create the struct hash as the contract does
    const structHash = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256', 'address'],
        [updatePassportTypehash, tokenId, updater]
      )
    );
    console.log('Struct hash:', structHash);
    
    // Create the domain as the frontend does
    const domain = {
      name: "EVBatteryPassport",
      version: "1",
      chainId: Number(chainId),
      verifyingContract: evContractAddress,
    };
    
    console.log('Domain:', domain);
    
    // Create the typed data as the frontend does
    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        UpdatePassport: [
          { name: "tokenId", type: "uint256" },
          { name: "updater", type: "address" },
        ],
      },
      primaryType: "UpdatePassport",
      domain: domain,
      message: { tokenId: Number(tokenId), updater: account },
    };
    
    console.log('Typed data:', JSON.stringify(typedData, null, 2));
    
    // Generate signature
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [account, JSON.stringify(typedData)],
    });
    
    console.log('Signature:', signature);
    
    // Now let's verify the signature manually
    const recoveredAddress = web3.eth.accounts.recover(structHash, signature);
    console.log('Recovered address:', recoveredAddress);
    console.log('Expected address:', account);
    console.log('Addresses match:', recoveredAddress.toLowerCase() === account.toLowerCase());
    
    // Let's also check what the contract's hashTypedDataV4 function would produce
    // We need to create the domain separator manually
    const domainSeparator = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          web3.utils.keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
          web3.utils.keccak256('EVBatteryPassport'),
          web3.utils.keccak256('1'),
          chainId,
          evContractAddress
        ]
      )
    );
    
    console.log('Domain separator:', domainSeparator);
    
    // Create the final digest as the contract does
    const contractDigest = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['string', 'bytes32', 'bytes32'],
        ['\x19\x01', domainSeparator, structHash]
      )
    );
    
    console.log('Contract digest:', contractDigest);
    
    // Verify signature against contract digest
    const recoveredFromContractDigest = web3.eth.accounts.recover(contractDigest, signature);
    console.log('Recovered from contract digest:', recoveredFromContractDigest);
    console.log('Addresses match (contract digest):', recoveredFromContractDigest.toLowerCase() === account.toLowerCase());
    
    // Test with different domain (using updater contract address)
    const domainWithUpdater = {
      name: "EVBatteryPassport",
      version: "1",
      chainId: Number(chainId),
      verifyingContract: bpUpdaterAddress,
    };
    
    const typedDataWithUpdater = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        UpdatePassport: [
          { name: "tokenId", type: "uint256" },
          { name: "updater", type: "address" },
        ],
      },
      primaryType: "UpdatePassport",
      domain: domainWithUpdater,
      message: { tokenId: Number(tokenId), updater: account },
    };
    
    console.log('\n=== Testing with Updater Contract Domain ===');
    console.log('Domain with updater:', domainWithUpdater);
    
    const signatureWithUpdater = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [account, JSON.stringify(typedDataWithUpdater)],
    });
    
    console.log('Signature with updater domain:', signatureWithUpdater);
    
    // Create domain separator for updater contract
    const domainSeparatorUpdater = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          web3.utils.keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
          web3.utils.keccak256('EVBatteryPassport'),
          web3.utils.keccak256('1'),
          chainId,
          bpUpdaterAddress
        ]
      )
    );
    
    const contractDigestUpdater = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['string', 'bytes32', 'bytes32'],
        ['\x19\x01', domainSeparatorUpdater, structHash]
      )
    );
    
    const recoveredFromUpdaterDigest = web3.eth.accounts.recover(contractDigestUpdater, signatureWithUpdater);
    console.log('Recovered from updater digest:', recoveredFromUpdaterDigest);
    console.log('Addresses match (updater digest):', recoveredFromUpdaterDigest.toLowerCase() === account.toLowerCase());
    
    console.log('\n=== Summary ===');
    console.log('1. Frontend uses EVBatteryPassportCore address as verifyingContract');
    console.log('2. Contract validation happens in BatteryPassportUpdater');
    console.log('3. BatteryPassportUpdater calls passportCore.hashTypedDataV4()');
    console.log('4. This should use EVBatteryPassportCore domain, not updater domain');
    console.log('5. The frontend signature should work with EVBatteryPassportCore domain');
    
  } catch (error) {
    console.error('❌ Error debugging signature:', error.message);
  }
}

// Export for use in browser console
window.debugUpdateSignature = debugUpdateSignature;

// Run if called directly
if (typeof window !== 'undefined') {
  debugUpdateSignature();
} 