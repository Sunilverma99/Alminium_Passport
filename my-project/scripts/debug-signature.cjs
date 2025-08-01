const Web3 = require('web3');
const EVBatteryPassportCoreABI = require('../src/abis/EVBatteryPassportCore.json');
const BatteryPassportUpdaterABI = require('../src/abis/BatteryPassportUpdater.sol/BatteryPassportUpdater.json');
const SignatureManagerABI = require('../src/abis/SignatureManager.sol/SignatureManager.json');

async function debugSignature() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    
    console.log('Account:', account);
    
    // Contract addresses
    const coreAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';
    const updaterAddress = '0x0165878a594ca255338adfa4d48449f69242eb8f';
    const signatureManagerAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
    
    console.log('Core address:', coreAddress);
    console.log('Updater address:', updaterAddress);
    console.log('SignatureManager address:', signatureManagerAddress);
    
    // Create contract instances
    const coreContract = new web3.eth.Contract(EVBatteryPassportCoreABI.abi, coreAddress);
    const updaterContract = new web3.eth.Contract(BatteryPassportUpdaterABI.abi, updaterAddress);
    const signatureManagerContract = new web3.eth.Contract(SignatureManagerABI.abi, signatureManagerAddress);
    
    // Test parameters
    const tokenId = 1;
    const updater = account;
    
    console.log('\n=== Testing Signature Generation ===');
    
    // Get the UPDATE_PASSPORT_TYPEHASH from the core contract
    const typehash = await coreContract.methods.UPDATE_PASSPORT_TYPEHASH().call();
    console.log('UPDATE_PASSPORT_TYPEHASH:', typehash);
    
    // Create the struct hash
    const structHash = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'uint256', 'address'],
        [typehash, tokenId, updater]
      )
    );
    console.log('Struct hash:', structHash);
    
    // Get the digest using the core contract's hashTypedDataV4 function
    const digest = await coreContract.methods.hashTypedDataV4(structHash).call();
    console.log('Digest:', digest);
    
    // Create EIP-712 typed data for signing
    const chainId = await web3.eth.getChainId();
    const domain = {
      name: "EVBatteryPassport",
      version: "1",
      chainId: chainId,
      verifyingContract: coreAddress,
    };
    
    const types = {
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
    };
    
    const message = { tokenId: tokenId, updater: updater };
    const typedData = { domain, types, primaryType: "UpdatePassport", message };
    
    console.log('Typed data for signing:', JSON.stringify(typedData, null, 2));
    
    // Sign the data
    const signature = await web3.eth.personal.sign(
      web3.eth.abi.encodeParameter('bytes32', digest),
      account,
      ''
    );
    console.log('Signature:', signature);
    
    // Test signature validation in the updater contract
    console.log('\n=== Testing Signature Validation ===');
    
    // Check if token exists
    const tokenExists = await coreContract.methods.exists(tokenId).call();
    console.log('Token exists:', tokenExists);
    
    // Test the signature validation directly
    try {
      const isValid = await signatureManagerContract.methods
        .createAndValidateSignature(digest, signature, account)
        .call();
      console.log('Signature validation result:', isValid);
    } catch (error) {
      console.error('Error validating signature:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugSignature(); 