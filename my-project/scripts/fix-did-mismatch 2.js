const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABIs
const DIDManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/DIDManager.sol/DIDManager.json'), 'utf8'));

async function fixDIDMismatch() {
    // Initialize Web3 (you'll need to set your provider)
    const web3 = new Web3('http://localhost:8545'); // Change to your provider
    
    // Contract addresses (you'll need to update these)
    const DIDManagerAddress = '0x...'; // Update with your DID manager address
    
    // Initialize contract
    const didManager = new web3.eth.Contract(DIDManagerABI, DIDManagerAddress);
    
    // Configuration (update these with your actual values)
    const governmentAccount = '0x...'; // Account with GOVERNMENT_ROLE
    const manufacturerAccount = '0x...'; // The account that should match the DID public key
    const didName = 'did:example:manufacturer1'; // The DID name
    const trustLevel = 4; // Trust level for manufacturer
    const roles = ['MANUFACTURER']; // Roles for the DID
    
    console.log('=== Fix DID Mismatch Script ===');
    console.log('Government Account:', governmentAccount);
    console.log('Manufacturer Account:', manufacturerAccount);
    console.log('DID Name:', didName);
    console.log('Trust Level:', trustLevel);
    console.log('Roles:', roles);
    
    try {
        // 1. Generate DID hash
        const didHash = web3.utils.keccak256(didName);
        console.log('\n1. DID Hash:', didHash);
        
        // 2. Check if DID is already registered
        const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
        console.log('2. DID Currently Registered:', isDIDRegistered);
        
        if (isDIDRegistered) {
            // 3. Get current DID details
            const currentDID = await didManager.methods.getDID(didHash).call();
            console.log('\n3. Current DID Details:');
            console.log('   URI:', currentDID.uri);
            console.log('   Public Key:', currentDID.publicKey);
            console.log('   Trust Level:', currentDID.trustLevel);
            console.log('   Is Verified:', currentDID.isVerified);
            console.log('   Roles:', currentDID.roles);
            
            // Check if public key matches
            if (currentDID.publicKey.toLowerCase() === manufacturerAccount.toLowerCase()) {
                console.log('\n✅ DID public key already matches the manufacturer account!');
                console.log('The issue might be elsewhere. Check the console logs for other errors.');
                return;
            } else {
                console.log('\n❌ DID public key does not match manufacturer account');
                console.log('Current public key:', currentDID.publicKey);
                console.log('Expected public key:', manufacturerAccount);
            }
        }
        
        // 4. Check if government account has GOVERNMENT_ROLE
        console.log('\n4. Checking Government Role...');
        try {
            const GOVERNMENT_ROLE = await didManager.methods.GOVERNMENT_ROLE().call();
            const hasGovernmentRole = await didManager.methods.hasRole(GOVERNMENT_ROLE, governmentAccount).call();
            console.log('   Has GOVERNMENT_ROLE:', hasGovernmentRole);
            
            if (!hasGovernmentRole) {
                console.error('❌ Government account does not have GOVERNMENT_ROLE!');
                console.error('   You need an account with GOVERNMENT_ROLE to register/update DIDs');
                return;
            }
        } catch (error) {
            console.error('❌ Error checking government role:', error.message);
            return;
        }
        
        // 5. Register or update the DID
        console.log('\n5. Registering/Updating DID...');
        
        // Note: The current DIDManager contract doesn't have an update function,
        // so we need to re-register. In a real scenario, you might want to:
        // 1. Revoke the old DID first
        // 2. Register a new DID with the correct public key
        
        const serviceEndpoints = []; // Empty service endpoints
        
        console.log('   Calling registerDID with parameters:');
        console.log('   - didHash:', didHash);
        console.log('   - uri:', didName);
        console.log('   - publicKey:', manufacturerAccount);
        console.log('   - trustLevel:', trustLevel);
        console.log('   - serviceEndpoints:', serviceEndpoints);
        console.log('   - roles:', roles);
        
        // Uncomment the following lines to actually register the DID
        /*
        const registerTx = await didManager.methods.registerDID(
            didHash,
            didName,
            manufacturerAccount,
            trustLevel,
            serviceEndpoints,
            roles
        ).send({ 
            from: governmentAccount,
            gas: 500000
        });
        
        console.log('   ✅ DID registered successfully!');
        console.log('   Transaction hash:', registerTx.transactionHash);
        
        // 6. Verify the DID
        console.log('\n6. Verifying DID...');
        const verifyTx = await didManager.methods.verifyGaiaXDID(didHash, true).send({
            from: governmentAccount,
            gas: 200000
        });
        
        console.log('   ✅ DID verified successfully!');
        console.log('   Transaction hash:', verifyTx.transactionHash);
        */
        
        console.log('\n⚠️  DID registration code is commented out for safety.');
        console.log('   Uncomment the code above to actually register the DID.');
        console.log('   Make sure you have the correct contract addresses and accounts.');
        
        // 7. Verify the fix
        console.log('\n7. Verifying the fix...');
        const newDID = await didManager.methods.getDID(didHash).call();
        console.log('   New DID Details:');
        console.log('   URI:', newDID.uri);
        console.log('   Public Key:', newDID.publicKey);
        console.log('   Trust Level:', newDID.trustLevel);
        console.log('   Is Verified:', newDID.isVerified);
        console.log('   Roles:', newDID.roles);
        
        if (newDID.publicKey.toLowerCase() === manufacturerAccount.toLowerCase()) {
            console.log('   ✅ Public key now matches manufacturer account!');
        } else {
            console.log('   ❌ Public key still does not match');
        }
        
        console.log('\n=== Fix Complete ===');
        
    } catch (error) {
        console.error('❌ Error during fix:', error);
    }
}

// Alternative approach: Check if you can use a different account
async function checkAlternativeAccounts() {
    console.log('\n=== Alternative Account Check ===');
    console.log('If you cannot re-register the DID, you can:');
    console.log('1. Use the account that matches the DID public key');
    console.log('2. Check what account the DID was originally registered with');
    console.log('3. Import that account into your wallet');
    console.log('\nTo find the correct account:');
    console.log('1. Get the DID details from the contract');
    console.log('2. Use the publicKey field as the account address');
    console.log('3. Make sure that account has the required roles');
}

if (require.main === module) {
    fixDIDMismatch()
        .then(() => {
            checkAlternativeAccounts();
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { fixDIDMismatch, checkAlternativeAccounts }; 