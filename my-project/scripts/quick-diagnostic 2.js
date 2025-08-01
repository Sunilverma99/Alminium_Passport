const Web3 = require('web3');

async function quickDiagnostic() {
    // Initialize Web3 (update with your provider)
    const web3 = new Web3('http://localhost:8545'); // Change to your provider
    
    // Contract addresses (update these)
    const DIDManagerAddress = '0x...'; // Update with your DID manager address
    
    // Test parameters from your error
    const transactionSender = '0xc9c57133372c017ef83c4b3f6d7671b2db943790';
    const didHash = '0x5238242b7a9b5536c5446d6e25c210501aac01d713fe340499ae143985c617ef';
    
    console.log('=== Quick Diagnostic for "Signer mismatch" Error ===');
    console.log('Transaction Sender:', transactionSender);
    console.log('DID Hash:', didHash);
    
    try {
        // Simple DIDManager ABI for basic calls
        const didManagerABI = [
            {
                "inputs": [{"internalType": "bytes32", "name": "didHash", "type": "bytes32"}],
                "name": "isDIDRegistered",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "bytes32", "name": "didHash", "type": "bytes32"}],
                "name": "getDID",
                "outputs": [
                    {"internalType": "string", "name": "uri", "type": "string"},
                    {"internalType": "address", "name": "publicKey", "type": "address"},
                    {"internalType": "uint8", "name": "trustLevel", "type": "uint8"},
                    {"internalType": "bool", "name": "isVerified", "type": "bool"},
                    {"internalType": "string[]", "name": "serviceEndpoints", "type": "string[]"},
                    {"internalType": "string[]", "name": "roles", "type": "string[]"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        const didManager = new web3.eth.Contract(didManagerABI, DIDManagerAddress);
        
        // Check if DID is registered
        console.log('\n1. Checking DID Registration...');
        const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
        console.log('   DID Registered:', isDIDRegistered);
        
        if (isDIDRegistered) {
            // Get DID details
            console.log('\n2. Getting DID Details...');
            const didDetails = await didManager.methods.getDID(didHash).call();
            
            console.log('   URI:', didDetails.uri);
            console.log('   Public Key:', didDetails.publicKey);
            console.log('   Trust Level:', didDetails.trustLevel);
            console.log('   Is Verified:', didDetails.isVerified);
            console.log('   Roles:', didDetails.roles);
            
            // Check the critical mismatch
            const publicKeyMatch = didDetails.publicKey.toLowerCase() === transactionSender.toLowerCase();
            console.log('\n   Public Key matches transaction sender:', publicKeyMatch);
            
            if (!publicKeyMatch) {
                console.error('\n❌ ISSUE CONFIRMED: DID public key does not match transaction sender!');
                console.error('   DID Public Key:', didDetails.publicKey);
                console.error('   Transaction Sender:', transactionSender);
                console.error('\n   This is the cause of the "Signer mismatch" error.');
                
                // Try to find the correct DID name
                console.log('\n   Trying to find the correct DID name...');
                const possibleOrgIds = ['mahindra', 'mahindra-01', 'mahindra01', 'marklytics'];
                
                for (const orgId of possibleOrgIds) {
                    const testDidName = `did:web:${orgId}.com#create-${transactionSender}`;
                    const testDidHash = web3.utils.keccak256(testDidName);
                    
                    if (testDidHash.toLowerCase() === didHash.toLowerCase()) {
                        console.log(`   ✅ FOUND MATCH: Organization ID should be "${orgId}"`);
                        console.log(`   Correct DID name: ${testDidName}`);
                        console.log(`   The DID should be registered with publicKey: ${transactionSender}`);
                        break;
                    }
                }
                
                console.log('\n   SOLUTION:');
                console.log('   1. Use a government account with GOVERNMENT_ROLE');
                console.log('   2. Re-register the DID with the correct public key');
                console.log('   3. Verify the DID');
                console.log('   4. Grant roles in SignatureManager');
                console.log('   5. Issue and sign credentials');
            } else {
                console.log('\n✅ Public key matches transaction sender');
                console.log('   The issue might be elsewhere (roles, verification, etc.)');
            }
        } else {
            console.error('\n❌ DID is not registered!');
            console.error('   The government approval process was not completed.');
            console.error('   Solution: Complete the government approval process.');
        }
        
    } catch (error) {
        console.error('❌ Error during diagnostic:', error.message);
        console.log('\nMake sure to:');
        console.log('1. Update the Web3 provider URL');
        console.log('2. Update the DIDManager contract address');
        console.log('3. Check that the contracts are deployed and accessible');
    }
}

if (require.main === module) {
    quickDiagnostic()
        .then(() => {
            console.log('\n=== Diagnostic Complete ===');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { quickDiagnostic }; 