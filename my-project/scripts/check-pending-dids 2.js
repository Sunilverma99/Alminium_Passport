const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABIs
const DIDManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/DIDManager.sol/DIDManager.json'), 'utf8'));
const SignatureManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/SignatureManager.sol/SignatureManager.json'), 'utf8'));
const CredentialManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/CredentialManager.sol/CredentialManager.json'), 'utf8'));

async function checkPendingDIDProcess() {
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
    
    // Test parameters (update these with your actual values)
    const governmentAccount = '0x...'; // Government account with GOVERNMENT_ROLE
    const testUserAddress = '0x...'; // User address to test
    const testOrganizationId = 'mahindra-01'; // Organization ID
    const testRole = 'MANUFACTURER'; // Role to test
    
    console.log('=== Pending DID Registration & Verification Check ===');
    console.log('Government Account:', governmentAccount);
    console.log('Test User Address:', testUserAddress);
    console.log('Test Organization ID:', testOrganizationId);
    console.log('Test Role:', testRole);
    
    try {
        // 1. Generate DID Information (same as government approval process)
        console.log('\n1. Generating DID Information...');
        const normalizedOrgId = testOrganizationId.toLowerCase();
        const normalizedUserAddress = testUserAddress.toLowerCase();
        const didName = `did:web:${normalizedOrgId}.com#create-${normalizedUserAddress}`;
        const didHash = web3.utils.keccak256(didName);
        const credentialId = `cred-${normalizedOrgId}-${normalizedUserAddress}`;
        
        console.log('   DID Name:', didName);
        console.log('   DID Hash:', didHash);
        console.log('   Credential ID:', credentialId);
        
        // 2. Check if DID is already registered
        console.log('\n2. Checking Current DID Status...');
        try {
            const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
            console.log('   DID Registered:', isDIDRegistered);
            
            if (isDIDRegistered) {
                const didDetails = await didManager.methods.getDID(didHash).call();
                console.log('   DID Details:');
                console.log('     URI:', didDetails.uri);
                console.log('     Public Key:', didDetails.publicKey);
                console.log('     Trust Level:', didDetails.trustLevel);
                console.log('     Is Verified:', didDetails.isVerified);
                console.log('     Roles:', didDetails.roles);
                
                // Check if public key matches test user
                const publicKeyMatch = didDetails.publicKey.toLowerCase() === testUserAddress.toLowerCase();
                console.log('     Public Key matches test user:', publicKeyMatch);
                
                if (!publicKeyMatch) {
                    console.log('   ❌ ISSUE FOUND: DID public key does not match user address!');
                    console.log('   This is likely the cause of the "Signer mismatch" error.');
                    console.log('   Solution: Re-register the DID with the correct public key.');
                }
            } else {
                console.log('   DID is not registered yet - needs government approval');
            }
        } catch (error) {
            console.error('   ❌ Error checking DID status:', error.message);
        }
        
        // 3. Check Credential Status
        console.log('\n3. Checking Credential Status...');
        try {
            const credentialValid = await credentialManager.methods.validateVerifiableCredential(credentialId).call();
            console.log('   Credential Valid:', credentialValid);
            
            if (credentialValid) {
                const credentialDetails = await credentialManager.methods.getCredential(credentialId).call();
                console.log('   Credential Details:');
                console.log('     ID:', credentialDetails.id);
                console.log('     Subject:', credentialDetails.subject);
                console.log('     Issuer:', credentialDetails.issuer);
                console.log('     Issued At:', credentialDetails.issuedAt);
                console.log('     Expires At:', credentialDetails.expiresAt);
                console.log('     Is Signed:', credentialDetails.isSigned);
            } else {
                console.log('   Credential is not valid or does not exist');
            }
        } catch (error) {
            console.error('   ❌ Error checking credential status:', error.message);
        }
        
        // 4. Check SignatureManager Roles
        console.log('\n4. Checking SignatureManager Roles...');
        try {
            const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
            const hasManufacturerRole = await signatureManager.methods.hasRole(manufacturerRole, testUserAddress).call();
            console.log('   Has MANUFACTURER_ROLE in SignatureManager:', hasManufacturerRole);
            
            if (!hasManufacturerRole) {
                console.log('   ❌ ISSUE FOUND: User does not have MANUFACTURER_ROLE in SignatureManager!');
                console.log('   This will cause signature validation to fail.');
            }
        } catch (error) {
            console.error('   ❌ Error checking SignatureManager roles:', error.message);
        }
        
        // 5. Check Government Account Permissions
        console.log('\n5. Checking Government Account Permissions...');
        try {
            const didManagerGovernmentRole = await didManager.methods.GOVERNMENT_ROLE().call();
            const hasDidManagerGovernmentRole = await didManager.methods.hasRole(didManagerGovernmentRole, governmentAccount).call();
            console.log('   Has GOVERNMENT_ROLE in DIDManager:', hasDidManagerGovernmentRole);
            
            if (!hasDidManagerGovernmentRole) {
                console.log('   ❌ ISSUE FOUND: Government account does not have GOVERNMENT_ROLE in DIDManager!');
                console.log('   This will prevent DID registration and verification.');
            }
        } catch (error) {
            console.error('   ❌ Error checking government role:', error.message);
        }
        
        // 6. Summary and Recommendations
        console.log('\n6. Summary and Recommendations...');
        console.log('   To fix the "Signer mismatch" error:');
        console.log('   1. Ensure the DID is registered with the correct public key (user address)');
        console.log('   2. Ensure the DID is verified by government');
        console.log('   3. Ensure the user has the required role in SignatureManager');
        console.log('   4. Ensure the credential is valid and signed');
        
        console.log('\n   Government approval process should:');
        console.log('   1. Register DID with userAddress as publicKey');
        console.log('   2. Verify the DID');
        console.log('   3. Grant role in SignatureManager');
        console.log('   4. Issue and sign credential');
        console.log('   5. Update backend status');
        
        console.log('\n=== Check Complete ===');
        
    } catch (error) {
        console.error('❌ Error during pending DID check:', error);
    }
}

// Function to simulate the government approval process
async function simulateGovernmentApproval() {
    console.log('\n=== Simulating Government Approval Process ===');
    console.log('This function shows the exact steps the government should follow:');
    
    console.log('\n1. Government receives pending DID registration from backend');
    console.log('2. Government calls DIDManager.registerDID() with:');
    console.log('   - didHash: keccak256(did:web:org.com#create-userAddress)');
    console.log('   - uri: did:web:org.com#create-userAddress');
    console.log('   - publicKey: userAddress (IMPORTANT: must match transaction sender)');
    console.log('   - trustLevel: 4 (for manufacturer)');
    console.log('   - serviceEndpoints: []');
    console.log('   - roles: ["MANUFACTURER"]');
    
    console.log('\n3. Government calls DIDManager.verifyGaiaXDID(didHash, true)');
    console.log('4. Government calls SignatureManager.grantRole(MANUFACTURER_ROLE, userAddress)');
    console.log('5. Government calls CredentialManager.issueVerifiableCredential()');
    console.log('6. Government signs the credential using eth_signTypedData_v4');
    console.log('7. Government calls CredentialManager.signCredential()');
    console.log('8. Government updates backend status to "approved"');
    
    console.log('\n=== Key Points ===');
    console.log('• The publicKey in DID registration MUST match the userAddress');
    console.log('• The userAddress MUST match the account making transactions');
    console.log('• All roles must be granted in SignatureManager for signature validation');
    console.log('• Credentials must be properly signed for validation');
}

if (require.main === module) {
    checkPendingDIDProcess()
        .then(() => {
            simulateGovernmentApproval();
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { checkPendingDIDProcess, simulateGovernmentApproval }; 