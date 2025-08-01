const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABIs
const EVBatteryPassportCoreABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/EVBatteryPassportCore.sol/EVBatteryPassportCore.json'), 'utf8'));
const DIDManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/DIDManager.sol/DIDManager.json'), 'utf8'));
const SignatureManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/SignatureManager.sol/SignatureManager.json'), 'utf8'));

async function debugDIDMismatch() {
    // Initialize Web3 (you'll need to set your provider)
    const web3 = new Web3('http://localhost:8545'); // Change to your provider
    
    // Contract addresses (you'll need to update these)
    const EVBatteryPassportCoreAddress = '0x...'; // Update with your contract address
    const DIDManagerAddress = '0x...'; // Update with your DID manager address
    const SignatureManagerAddress = '0x...'; // Update with your signature manager address
    
    // Initialize contracts
    const evContract = new web3.eth.Contract(EVBatteryPassportCoreABI, EVBatteryPassportCoreAddress);
    const didManager = new web3.eth.Contract(DIDManagerABI, DIDManagerAddress);
    const signatureManager = new web3.eth.Contract(SignatureManagerABI, SignatureManagerAddress);
    
    // Test parameters (update these with your actual values)
    const testAccount = '0x...'; // The account making the transaction
    const testDIDName = 'did:example:manufacturer1'; // The DID name
    const testTokenId = 1; // The token ID
    
    console.log('=== DID Mismatch Debug Script ===');
    console.log('Test Account:', testAccount);
    console.log('Test DID Name:', testDIDName);
    console.log('Test Token ID:', testTokenId);
    
    try {
        // 1. Generate DID hash
        const didHash = web3.utils.keccak256(testDIDName);
        console.log('\n1. DID Hash:', didHash);
        
        // 2. Check if DID is registered
        const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
        console.log('2. DID Registered:', isDIDRegistered);
        
        if (!isDIDRegistered) {
            console.error('❌ DID is not registered!');
            return;
        }
        
        // 3. Get DID details
        const didDetails = await didManager.methods.getDID(didHash).call();
        console.log('\n3. DID Details:');
        console.log('   URI:', didDetails.uri);
        console.log('   Public Key:', didDetails.publicKey);
        console.log('   Trust Level:', didDetails.trustLevel);
        console.log('   Is Verified:', didDetails.isVerified);
        console.log('   Roles:', didDetails.roles);
        
        // 4. Check if public key matches the account
        console.log('\n4. Public Key vs Account:');
        console.log('   DID Public Key:', didDetails.publicKey);
        console.log('   Test Account:', testAccount);
        console.log('   Match (case-insensitive):', didDetails.publicKey.toLowerCase() === testAccount.toLowerCase());
        console.log('   Match (exact):', didDetails.publicKey === testAccount);
        
        if (didDetails.publicKey.toLowerCase() !== testAccount.toLowerCase()) {
            console.error('❌ PUBLIC KEY MISMATCH: This is the cause of the "Signer mismatch" error!');
            console.error('   The DID was registered with public key:', didDetails.publicKey);
            console.error('   But the transaction is being made by account:', testAccount);
            console.error('\n   Solutions:');
            console.error('   1. Re-register the DID with the correct public key');
            console.error('   2. Use the account that matches the DID public key');
            console.error('   3. Update the DID registration if you have admin access');
        } else {
            console.log('✅ Public key matches account');
        }
        
        // 5. Test DID role validation
        console.log('\n5. Testing DID Role Validation:');
        try {
            const hasManufacturerRole = await didManager.methods.validateDIDRole(
                didHash, 
                'MANUFACTURER', 
                4, 
                testAccount
            ).call();
            console.log('   Has MANUFACTURER role (level 4):', hasManufacturerRole);
        } catch (error) {
            console.error('   ❌ DID role validation failed:', error.message);
        }
        
        // 6. Check SignatureManager roles
        console.log('\n6. SignatureManager Roles:');
        try {
            const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
            const hasSignatureRole = await signatureManager.methods.hasRole(manufacturerRole, testAccount).call();
            console.log('   Has MANUFACTURER role in SignatureManager:', hasSignatureRole);
            
            if (!hasSignatureRole) {
                console.error('   ❌ Account does not have MANUFACTURER role in SignatureManager');
            }
        } catch (error) {
            console.error('   ❌ Error checking SignatureManager roles:', error.message);
        }
        
        // 7. Check token existence
        console.log('\n7. Token Existence:');
        try {
            const tokenExists = await evContract.methods.exists(testTokenId).call();
            console.log('   Token exists:', tokenExists);
        } catch (error) {
            console.error('   ❌ Error checking token existence:', error.message);
        }
        
        console.log('\n=== Debug Complete ===');
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
    }
}

// Function to help re-register DID (if you have admin access)
async function reRegisterDID() {
    console.log('\n=== DID Re-registration Helper ===');
    console.log('To fix the signer mismatch, you need to:');
    console.log('1. Call DIDManager.registerDID() with the correct public key');
    console.log('2. Call DIDManager.verifyGaiaXDID() to verify the DID');
    console.log('3. Ensure the public key matches the account making transactions');
    console.log('\nExample (if you have GOVERNMENT_ROLE):');
    console.log('didManager.methods.registerDID(');
    console.log('  didHash,');
    console.log('  "did:example:manufacturer1",');
    console.log('  "0x...", // The correct account address');
    console.log('  4, // trust level');
    console.log('  [], // service endpoints');
    console.log('  ["MANUFACTURER"] // roles');
    console.log(').send({ from: governmentAccount });');
}

if (require.main === module) {
    debugDIDMismatch()
        .then(() => {
            reRegisterDID();
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { debugDIDMismatch, reRegisterDID }; 