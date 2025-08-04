const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABIs
const DIDManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/DIDManager.sol/DIDManager.json'), 'utf8'));
const SignatureManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/SignatureManager.sol/SignatureManager.json'), 'utf8'));
const CredentialManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/CredentialManager.sol/CredentialManager.json'), 'utf8'));

async function debugSignerMismatch() {
    // Initialize Web3 (you'll need to set your provider)
    const web3 = new Web3('http://localhost:8545'); // Change to your provider
    
    // Contract addresses (you'll need to update these)
    const DIDManagerAddress = '0x...'; // Update with your DID manager address
    const SignatureManagerAddress = '0x...'; // Update with your signature manager address
    const CredentialManagerAddress = '0x...'; // Update with your credential manager address
    
    // Initialize contracts
    const didManager = new web3.eth.Contract(DIDManagerABI, DIDManagerAddress);
    const signatureManager = new web3.eth.Contract(SignatureManagerABI, SignatureManagerAddress);
    const credentialManager = new web3.eth.Contract(CredentialManagerABI, CredentialManagerAddress);
    
    // Test parameters from your error (update these with your actual values)
    const transactionSender = '0xc9c57133372c017ef83c4b3f6d7671b2db943790'; // From the error log
    const didHash = '0x5238242b7a9b5536c5446d6e25c210501aac01d713fe340499ae143985c617ef'; // From the error log
    const tokenId = 1; // From the error log
    const governmentAccount = '0x...'; // Government account with GOVERNMENT_ROLE
    
    console.log('=== Debugging "Signer mismatch" Error ===');
    console.log('Transaction Sender:', transactionSender);
    console.log('DID Hash:', didHash);
    console.log('Token ID:', tokenId);
    
    try {
        // 1. Check if DID is registered
        console.log('\n1. Checking DID Registration...');
        try {
            const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
            console.log('   DID Registered:', isDIDRegistered);
            
            if (!isDIDRegistered) {
                console.error('   ❌ DID is not registered!');
                console.error('   This means the government approval process was not completed.');
                return;
            }
        } catch (error) {
            console.error('   ❌ Error checking DID registration:', error.message);
            return;
        }
        
        // 2. Get DID details
        console.log('\n2. Getting DID Details...');
        try {
            const didDetails = await didManager.methods.getDID(didHash).call();
            console.log('   DID Details:');
            console.log('     URI:', didDetails.uri);
            console.log('     Public Key:', didDetails.publicKey);
            console.log('     Trust Level:', didDetails.trustLevel);
            console.log('     Is Verified:', didDetails.isVerified);
            console.log('     Roles:', didDetails.roles);
            
            // Check the critical mismatch
            const publicKeyMatch = didDetails.publicKey.toLowerCase() === transactionSender.toLowerCase();
            console.log('     Public Key matches transaction sender:', publicKeyMatch);
            
            if (!publicKeyMatch) {
                console.error('   ❌ ISSUE FOUND: DID public key does not match transaction sender!');
                console.error('   DID Public Key:', didDetails.publicKey);
                console.error('   Transaction Sender:', transactionSender);
                console.error('   This is the cause of the "Signer mismatch" error.');
                
                // Try to find what the DID name should be
                console.log('\n   Trying to reverse-engineer the DID name...');
                const possibleOrgIds = ['mahindra', 'mahindra-01', 'mahindra01', 'aeiforo'];
                
                for (const orgId of possibleOrgIds) {
                    const testDidName = `did:web:${orgId}.com#create-${transactionSender}`;
                    const testDidHash = web3.utils.keccak256(testDidName);
                    console.log(`   Testing "${orgId}": ${testDidHash}`);
                    
                    if (testDidHash.toLowerCase() === didHash.toLowerCase()) {
                        console.log(`   ✅ FOUND MATCH: Organization ID should be "${orgId}"`);
                        console.log(`   Correct DID name: ${testDidName}`);
                        break;
                    }
                }
            } else {
                console.log('   ✅ Public key matches transaction sender');
            }
        } catch (error) {
            console.error('   ❌ Error getting DID details:', error.message);
            return;
        }
        
        // 3. Check if DID is verified
        console.log('\n3. Checking DID Verification...');
        try {
            const didDetails = await didManager.methods.getDID(didHash).call();
            console.log('   DID Verified:', didDetails.isVerified);
            
            if (!didDetails.isVerified) {
                console.error('   ❌ DID is not verified!');
                console.error('   The government needs to call verifyGaiaXDID(didHash, true)');
            }
        } catch (error) {
            console.error('   ❌ Error checking DID verification:', error.message);
        }
        
        // 4. Check SignatureManager roles
        console.log('\n4. Checking SignatureManager Roles...');
        try {
            const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
            const hasManufacturerRole = await signatureManager.methods.hasRole(manufacturerRole, transactionSender).call();
            console.log('   Has MANUFACTURER_ROLE in SignatureManager:', hasManufacturerRole);
            
            if (!hasManufacturerRole) {
                console.error('   ❌ User does not have MANUFACTURER_ROLE in SignatureManager!');
                console.error('   The government needs to grant this role.');
            }
        } catch (error) {
            console.error('   ❌ Error checking SignatureManager roles:', error.message);
        }
        
        // 5. Check credential status
        console.log('\n5. Checking Credential Status...');
        try {
            // Try to find the credential ID
            const possibleCredentialIds = [
                `cred-mahindra-${transactionSender}`,
                `cred-mahindra-01-${transactionSender}`,
                `cred-mahindra01-${transactionSender}`,
                `cred-aeiforo-${transactionSender}`
            ];
            
            for (const credentialId of possibleCredentialIds) {
                try {
                    const credentialValid = await credentialManager.methods.validateVerifiableCredential(credentialId).call();
                    if (credentialValid) {
                        console.log(`   ✅ Credential valid: ${credentialId}`);
                        break;
                    }
                } catch (e) {
                    // Credential doesn't exist or is invalid
                }
            }
        } catch (error) {
            console.error('   ❌ Error checking credential status:', error.message);
        }
        
        // 6. Provide solutions
        console.log('\n6. Solutions to Fix "Signer mismatch" Error:');
        console.log('   Option 1: Re-register DID with correct public key');
        console.log('   Option 2: Use the account that matches the DID public key');
        console.log('   Option 3: Check government approval process');
        
        console.log('\n   Government should:');
        console.log('   1. Call DIDManager.registerDID() with userAddress as publicKey');
        console.log('   2. Call DIDManager.verifyGaiaXDID(didHash, true)');
        console.log('   3. Call SignatureManager.grantRole(MANUFACTURER_ROLE, userAddress)');
        console.log('   4. Issue and sign credential');
        
        console.log('\n=== Debug Complete ===');
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
    }
}

// Function to help fix the issue by re-registering the DID
async function fixSignerMismatch() {
    console.log('\n=== Fixing "Signer mismatch" Error ===');
    console.log('This function will help you re-register the DID with the correct public key.');
    
    // You would need to:
    // 1. Have a government account with GOVERNMENT_ROLE
    // 2. Call DIDManager.registerDID() with the correct parameters
    // 3. Call DIDManager.verifyGaiaXDID() to verify the DID
    // 4. Grant roles in SignatureManager
    // 5. Issue and sign credentials
    
    console.log('\nSteps to fix:');
    console.log('1. Use a government account with GOVERNMENT_ROLE');
    console.log('2. Call DIDManager.registerDID(didHash, didName, userAddress, trustLevel, [], [role])');
    console.log('3. Call DIDManager.verifyGaiaXDID(didHash, true)');
    console.log('4. Call SignatureManager.grantRole(MANUFACTURER_ROLE, userAddress)');
    console.log('5. Call CredentialManager.issueVerifiableCredential()');
    console.log('6. Sign the credential and call CredentialManager.signCredential()');
    
    console.log('\nExample code:');
    console.log(`
    // Re-register DID with correct public key
    await didManager.methods.registerDID(
        didHash,
        didName,
        userAddress, // This MUST match the transaction sender
        4, // trust level for manufacturer
        [],
        ['MANUFACTURER']
    ).send({ from: governmentAccount });
    
    // Verify the DID
    await didManager.methods.verifyGaiaXDID(didHash, true).send({ from: governmentAccount });
    
    // Grant role in SignatureManager
    const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
    await signatureManager.methods.grantRole(manufacturerRole, userAddress).send({ from: governmentAccount });
    `);
}

if (require.main === module) {
    debugSignerMismatch()
        .then(() => {
            fixSignerMismatch();
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { debugSignerMismatch, fixSignerMismatch }; 