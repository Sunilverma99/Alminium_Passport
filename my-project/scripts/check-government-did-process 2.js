const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABIs
const EVBatteryPassportCoreABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/EVBatteryPassportCore.sol/EVBatteryPassportCore.json'), 'utf8'));
const DIDManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/DIDManager.sol/DIDManager.json'), 'utf8'));
const SignatureManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/SignatureManager.sol/SignatureManager.json'), 'utf8'));
const CredentialManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/CredentialManager.sol/CredentialManager.json'), 'utf8'));

async function checkGovernmentDIDProcess() {
    // Initialize Web3 (you'll need to set your provider)
    const web3 = new Web3('http://localhost:8545'); // Change to your provider
    
    // Contract addresses (you'll need to update these)
    const EVBatteryPassportCoreAddress = '0x...'; // Update with your contract address
    const DIDManagerAddress = '0x...'; // Update with your DID manager address
    const SignatureManagerAddress = '0x...'; // Update with your signature manager address
    const CredentialManagerAddress = '0x...'; // Update with your credential manager address
    
    // Initialize contracts
    const evContract = new web3.eth.Contract(EVBatteryPassportCoreABI, EVBatteryPassportCoreAddress);
    const didManager = new web3.eth.Contract(DIDManagerABI, DIDManagerAddress);
    const signatureManager = new web3.eth.Contract(SignatureManagerABI, SignatureManagerAddress);
    const credentialManager = new web3.eth.Contract(CredentialManagerABI, CredentialManagerAddress);
    
    // Test parameters (update these with your actual values)
    const governmentAccount = '0x...'; // Government account with GOVERNMENT_ROLE
    const testUserAddress = '0x...'; // User address to test
    const testOrganizationId = 'mahindra-01'; // Organization ID
    const testRole = 'MANUFACTURER'; // Role to test
    
    console.log('=== Government DID Registration & Verification Process Check ===');
    console.log('Government Account:', governmentAccount);
    console.log('Test User Address:', testUserAddress);
    console.log('Test Organization ID:', testOrganizationId);
    console.log('Test Role:', testRole);
    
    try {
        // 1. Check Government Account Permissions
        console.log('\n1. Checking Government Account Permissions...');
        
        // Check DEFAULT_ADMIN_ROLE
        try {
            const defaultAdminRole = await evContract.methods.DEFAULT_ADMIN_ROLE().call();
            const hasDefaultAdminRole = await evContract.methods.hasRole(defaultAdminRole, governmentAccount).call();
            console.log('   Has DEFAULT_ADMIN_ROLE in EVBatteryPassportCore:', hasDefaultAdminRole);
        } catch (error) {
            console.error('   ❌ Error checking DEFAULT_ADMIN_ROLE:', error.message);
        }
        
        // Check GOVERNMENT_ROLE in DIDManager
        try {
            const didManagerGovernmentRole = await didManager.methods.GOVERNMENT_ROLE().call();
            const hasDidManagerGovernmentRole = await didManager.methods.hasRole(didManagerGovernmentRole, governmentAccount).call();
            console.log('   Has GOVERNMENT_ROLE in DIDManager:', hasDidManagerGovernmentRole);
        } catch (error) {
            console.error('   ❌ Error checking GOVERNMENT_ROLE in DIDManager:', error.message);
        }
        
        // Check GOVERNMENT_ROLE in CredentialManager
        try {
            const credentialManagerGovernmentRole = await credentialManager.methods.GOVERNMENT_ROLE().call();
            const hasCredentialManagerGovernmentRole = await credentialManager.methods.hasRole(credentialManagerGovernmentRole, governmentAccount).call();
            console.log('   Has GOVERNMENT_ROLE in CredentialManager:', hasCredentialManagerGovernmentRole);
        } catch (error) {
            console.error('   ❌ Error checking GOVERNMENT_ROLE in CredentialManager:', error.message);
        }
        
        // Check DEFAULT_ADMIN_ROLE in SignatureManager
        try {
            const signatureManagerDefaultAdminRole = await signatureManager.methods.DEFAULT_ADMIN_ROLE().call();
            const hasSignatureManagerDefaultAdminRole = await signatureManager.methods.hasRole(signatureManagerDefaultAdminRole, governmentAccount).call();
            console.log('   Has DEFAULT_ADMIN_ROLE in SignatureManager:', hasSignatureManagerDefaultAdminRole);
        } catch (error) {
            console.error('   ❌ Error checking DEFAULT_ADMIN_ROLE in SignatureManager:', error.message);
        }
        
        // 2. Generate DID Information
        console.log('\n2. Generating DID Information...');
        const normalizedOrgId = testOrganizationId.toLowerCase();
        const normalizedUserAddress = testUserAddress.toLowerCase();
        const didName = `did:web:${normalizedOrgId}.com#create-${normalizedUserAddress}`;
        const didHash = web3.utils.keccak256(didName);
        const credentialId = `cred-${normalizedOrgId}-${normalizedUserAddress}`;
        
        console.log('   DID Name:', didName);
        console.log('   DID Hash:', didHash);
        console.log('   Credential ID:', credentialId);
        
        // 3. Check Current DID Status
        console.log('\n3. Checking Current DID Status...');
        
        // Check if DID is registered
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
                console.log('     Public Key matches test user:', didDetails.publicKey.toLowerCase() === testUserAddress.toLowerCase());
            }
        } catch (error) {
            console.error('   ❌ Error checking DID status:', error.message);
        }
        
        // 4. Check Credential Status
        console.log('\n4. Checking Credential Status...');
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
            }
        } catch (error) {
            console.error('   ❌ Error checking credential status:', error.message);
        }
        
        // 5. Check SignatureManager Roles
        console.log('\n5. Checking SignatureManager Roles...');
        try {
            const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
            const hasManufacturerRole = await signatureManager.methods.hasRole(manufacturerRole, testUserAddress).call();
            console.log('   Has MANUFACTURER_ROLE in SignatureManager:', hasManufacturerRole);
        } catch (error) {
            console.error('   ❌ Error checking SignatureManager roles:', error.message);
        }
        
        // 6. Simulate Government Approval Process
        console.log('\n6. Simulating Government Approval Process...');
        
        // Step 1: Register DID
        console.log('   Step 1: Registering DID...');
        try {
            const trustLevel = 4;
            await didManager.methods.registerDID(
                didHash,
                didName,
                testUserAddress,
                trustLevel,
                [],
                [testRole]
            ).send({ from: governmentAccount, gas: 500000 });
            console.log('   ✅ DID registered successfully');
        } catch (error) {
            console.error('   ❌ Error registering DID:', error.message);
        }
        
        // Step 2: Verify DID
        console.log('   Step 2: Verifying DID...');
        try {
            await didManager.methods.verifyGaiaXDID(didHash, true).send({ from: governmentAccount, gas: 200000 });
            console.log('   ✅ DID verified successfully');
        } catch (error) {
            console.error('   ❌ Error verifying DID:', error.message);
        }
        
        // Step 3: Grant role in SignatureManager
        console.log('   Step 3: Granting role in SignatureManager...');
        try {
            const signatureManagerRole = await signatureManager.methods[`${testRole.toUpperCase()}_ROLE`]().call();
            await signatureManager.methods
                .grantRole(signatureManagerRole, testUserAddress)
                .send({ from: governmentAccount, gas: 1000000 });
            console.log('   ✅ Role granted in SignatureManager');
        } catch (error) {
            console.error('   ❌ Error granting role in SignatureManager:', error.message);
        }
        
        // Step 4: Issue credential
        console.log('   Step 4: Issuing credential...');
        try {
            const latestBlock = await web3.eth.getBlock('latest');
            const issuedAt = Number(latestBlock.timestamp);
            const expiresAt = Number(issuedAt + 12 * 30 * 24 * 60 * 60); // 12 months
            
            const credentialData = JSON.stringify({
                userAddress: testUserAddress,
                organizationId: testOrganizationId,
                role: testRole,
                assignedBy: governmentAccount
            });
            
            await credentialManager.methods.issueVerifiableCredential(
                credentialId,
                didName,
                credentialData,
                expiresAt,
                ['https://www.w3.org/2018/credentials/v1'],
                ['VerifiableCredential'],
                'EcdsaSecp256k1Signature2019',
                `did:ethr:${governmentAccount}`
            ).send({ from: governmentAccount, gas: 1000000 });
            console.log('   ✅ Credential issued successfully');
        } catch (error) {
            console.error('   ❌ Error issuing credential:', error.message);
        }
        
        // Step 5: Sign credential (this would require wallet interaction in real scenario)
        console.log('   Step 5: Signing credential...');
        console.log('   ⚠️  Note: Credential signing requires wallet interaction');
        console.log('   In the real scenario, this would use eth_signTypedData_v4');
        
        // 7. Verify Final Status
        console.log('\n7. Verifying Final Status...');
        
        // Check DID status
        try {
            const finalDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
            console.log('   Final DID Registered:', finalDIDRegistered);
            
            if (finalDIDRegistered) {
                const finalDIDDetails = await didManager.methods.getDID(didHash).call();
                console.log('   Final DID Verified:', finalDIDDetails.isVerified);
                console.log('   Final DID Public Key:', finalDIDDetails.publicKey);
                console.log('   Final DID Roles:', finalDIDDetails.roles);
            }
        } catch (error) {
            console.error('   ❌ Error checking final DID status:', error.message);
        }
        
        // Check credential status
        try {
            const finalCredentialValid = await credentialManager.methods.validateVerifiableCredential(credentialId).call();
            console.log('   Final Credential Valid:', finalCredentialValid);
        } catch (error) {
            console.error('   ❌ Error checking final credential status:', error.message);
        }
        
        // Check SignatureManager role
        try {
            const finalManufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
            const finalHasManufacturerRole = await signatureManager.methods.hasRole(finalManufacturerRole, testUserAddress).call();
            console.log('   Final Has MANUFACTURER_ROLE in SignatureManager:', finalHasManufacturerRole);
        } catch (error) {
            console.error('   ❌ Error checking final SignatureManager role:', error.message);
        }
        
        console.log('\n=== Government DID Process Check Complete ===');
        
    } catch (error) {
        console.error('❌ Error during government DID process check:', error);
    }
}

// Function to check pending DIDs from backend
async function checkPendingDIDs() {
    console.log('\n=== Checking Pending DIDs from Backend ===');
    
    try {
        // This would require your backend URL
        const backendUrl = 'http://localhost:3001'; // Update with your backend URL
        
        const response = await fetch(`${backendUrl}/api/pending-did`);
        if (response.ok) {
            const data = await response.json();
            console.log('Pending DIDs:', data.entries || []);
            
            if (data.entries && data.entries.length > 0) {
                console.log('\nPending DID Details:');
                data.entries.forEach((entry, index) => {
                    console.log(`  ${index + 1}. User: ${entry.userAddress}`);
                    console.log(`     Role: ${entry.role}`);
                    console.log(`     Organization: ${entry.organizationId}`);
                    console.log(`     Status: ${entry.status}`);
                    console.log(`     Created: ${new Date(entry.createdAt).toLocaleString()}`);
                    console.log('');
                });
            } else {
                console.log('No pending DIDs found');
            }
        } else {
            console.error('Failed to fetch pending DIDs:', response.status);
        }
    } catch (error) {
        console.error('❌ Error checking pending DIDs:', error.message);
    }
}

if (require.main === module) {
    checkGovernmentDIDProcess()
        .then(() => {
            return checkPendingDIDs();
        })
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { checkGovernmentDIDProcess, checkPendingDIDs }; 