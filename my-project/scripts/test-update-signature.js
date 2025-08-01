import Web3 from 'web3';

async function testUpdateSignature() {
  try {
    console.log('=== Testing UpdateBatteryPassport Signature ===\n');
    
    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    
    console.log('User account:', account);
    
    // Get contract addresses from environment variables
    const coreAddress = import.meta.env.VITE_EV_BATTERY_PASSPORT_CORE;
    const updaterAddress = import.meta.env.VITE_BATTERY_PASSPORT_UPDATER;
    const signatureManagerAddress = import.meta.env.VITE_SIGNATURE_MANAGER;
    
    console.log('EVBatteryPassportCore address:', coreAddress);
    console.log('BatteryPassportUpdater address:', updaterAddress);
    console.log('SignatureManager address:', signatureManagerAddress);
    
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
    
    const evContract = new web3.eth.Contract(evContractAbi, coreAddress);
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
      verifyingContract: coreAddress,
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
    
    // Test signature validation in SignatureManager
    const signatureManagerAbi = [
      {
        "inputs": [
          {"type": "bytes32", "name": "hash"},
          {"type": "bytes", "name": "signature"},
          {"type": "address", "name": "signer"}
        ],
        "name": "createAndValidateSignature",
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"type": "bytes32", "name": "messageHash"},
          {"type": "bytes", "name": "signature"}
        ],
        "name": "recoverSigner",
        "outputs": [{"type": "address"}],
        "stateMutability": "pure",
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
      },
      {
        "inputs": [],
        "name": "MANUFACTURER_ROLE",
        "outputs": [{"type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const signatureManager = new web3.eth.Contract(signatureManagerAbi, signatureManagerAddress);
    
    // Create the domain separator manually
    const domainSeparator = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          web3.utils.keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
          web3.utils.keccak256('EVBatteryPassport'),
          web3.utils.keccak256('1'),
          chainId,
          coreAddress
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
    
    // Test signature recovery
    try {
      const recoveredSigner = await signatureManager.methods.recoverSigner(contractDigest, signature).call();
      console.log('Recovered signer:', recoveredSigner);
      console.log('Expected signer:', account);
      console.log('Signers match:', recoveredSigner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Error recovering signer:', error.message);
    }
    
    // Test signature validation
    try {
      const isValid = await signatureManager.methods.createAndValidateSignature(contractDigest, signature, account).call();
      console.log('Signature validation result:', isValid);
    } catch (error) {
      console.error('Error validating signature:', error.message);
      
      // Check if it's a role issue
      try {
        const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
        const hasRole = await signatureManager.methods.hasRole(manufacturerRole, account).call();
        console.log('Has MANUFACTURER_ROLE in SignatureManager:', hasRole);
      } catch (roleError) {
        console.error('Error checking role:', roleError.message);
      }
    }
    
    // Test the actual updateBatteryPassport call
    console.log('\n=== Testing Actual Contract Call ===');
    
    // Get user's organization data
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.memberDetails) {
        const userDidName = data.memberDetails.didName.toLowerCase();
        const userCredentialId = data.memberDetails.credentialId.toLowerCase();
        const didHash = web3.utils.keccak256(userDidName);
        
        console.log('DID Hash:', didHash);
        console.log('Credential ID:', userCredentialId);
        
        // Create dummy hashes for testing
        const dummyHash = web3.utils.keccak256('dummy');
        
        // Test the actual contract call
        try {
          const updateAbi = [
            {
              "inputs": [
                {"type": "uint256", "name": "tokenId"},
                {"type": "bytes32", "name": "didHash"},
                {"type": "bytes32", "name": "materialCompositionHash"},
                {"type": "bytes32", "name": "carbonFootprintHash"},
                {"type": "bytes32", "name": "performanceDataHash"},
                {"type": "bytes32", "name": "circularityDataHash"},
                {"type": "bytes32", "name": "labelsDataHash"},
                {"type": "bytes32", "name": "dueDiligenceHash"},
                {"type": "bytes32", "name": "generalProductInfoHash"},
                {"type": "string", "name": "credentialId"},
                {"type": "bytes", "name": "signature"}
              ],
              "name": "updateBatteryPassport",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ];
          
          const updaterContract = new web3.eth.Contract(updateAbi, updaterAddress);
          
          console.log('Calling updateBatteryPassport...');
          console.log('Parameters:', {
            tokenId: Number(tokenId),
            didHash,
            materialCompositionHash: dummyHash,
            carbonFootprintHash: dummyHash,
            performanceDataHash: dummyHash,
            circularityDataHash: dummyHash,
            labelsDataHash: dummyHash,
            dueDiligenceHash: dummyHash,
            generalProductInfoHash: dummyHash,
            credentialId: userCredentialId,
            signature
          });
          
          // This will fail, but we want to see the exact error
          await updaterContract.methods.updateBatteryPassport(
            Number(tokenId),
            didHash,
            dummyHash,
            dummyHash,
            dummyHash,
            dummyHash,
            dummyHash,
            dummyHash,
            dummyHash,
            userCredentialId,
            signature
          ).call({ from: account });
          
          console.log('✅ Contract call succeeded!');
          
        } catch (callError) {
          console.error('❌ Contract call failed:', callError.message);
          
          // Parse the error to understand what went wrong
          if (callError.message.includes('Invalid signature')) {
            console.log('Issue: Signature validation failed');
          } else if (callError.message.includes('Unauthorized signer')) {
            console.log('Issue: Role validation failed');
          } else if (callError.message.includes('Not authorized')) {
            console.log('Issue: DID role validation failed');
          } else if (callError.message.includes('Invalid credential')) {
            console.log('Issue: Credential validation failed');
          } else {
            console.log('Issue: Unknown error');
          }
        }
      } else {
        console.log('No member details found');
      }
    } else {
      console.log('Failed to fetch organization data');
    }
    
  } catch (error) {
    console.error('❌ Error testing signature:', error.message);
  }
}

// Export for use in browser console
window.testUpdateSignature = testUpdateSignature;

// Run if called directly
if (typeof window !== 'undefined') {
  testUpdateSignature();
} 