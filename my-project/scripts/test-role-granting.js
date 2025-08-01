const Web3 = require('web3');
const EVBatteryPassportCoreABI = require('../src/abis/EVBatteryPassportCore.json');

async function testRoleGranting() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    const tenantAdminAccount = accounts[1];
    const testAccount = accounts[2];
    
    console.log('Admin account:', adminAccount);
    console.log('Tenant admin account:', tenantAdminAccount);
    console.log('Test account:', testAccount);
    
    // Contract address
    const contractAddress = process.env.VITE_EV_BATTERY_PASSPORT_CORE || '0x...';
    
    if (contractAddress === '0x...') {
      console.log('Please set the VITE_EV_BATTERY_PASSPORT_CORE environment variable');
      return;
    }
    
    const contract = new web3.eth.Contract(EVBatteryPassportCoreABI.abi, contractAddress);
    
    console.log('\n=== STEP 1: Check Initial Roles ===');
    
    // Check DEFAULT_ADMIN_ROLE
    const defaultAdminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
    console.log('DEFAULT_ADMIN_ROLE:', defaultAdminRole);
    
    const hasDefaultAdminRole = await contract.methods.hasRole(defaultAdminRole, adminAccount).call();
    console.log('Admin has DEFAULT_ADMIN_ROLE:', hasDefaultAdminRole);
    
    // Check TENANT_ADMIN_ROLE
    const tenantAdminRole = await contract.methods.TENANT_ADMIN_ROLE().call();
    console.log('TENANT_ADMIN_ROLE:', tenantAdminRole);
    
    const hasTenantAdminRole = await contract.methods.hasRole(tenantAdminRole, tenantAdminAccount).call();
    console.log('Tenant admin account has TENANT_ADMIN_ROLE:', hasTenantAdminRole);
    
    console.log('\n=== STEP 2: Test configureTenantAdmin ===');
    
    if (!hasDefaultAdminRole) {
      console.error('Admin account does not have DEFAULT_ADMIN_ROLE. Cannot proceed.');
      return;
    }
    
    // Generate organization ID
    const organizationName = 'test-organization';
    const organizationId = `${organizationName}-${tenantAdminAccount}`;
    const organizationIdHash = web3.utils.sha3(organizationId);
    
    console.log('Organization ID:', organizationId);
    console.log('Organization ID Hash:', organizationIdHash);
    
    try {
      const result = await contract.methods.configureTenantAdmin(tenantAdminAccount, organizationIdHash).send({
        from: adminAccount,
        gas: 1000000
      });
      
      console.log('✅ configureTenantAdmin successful!');
      console.log('Transaction hash:', result.transactionHash);
      
      // Verify the role was granted
      const newHasTenantAdminRole = await contract.methods.hasRole(tenantAdminRole, tenantAdminAccount).call();
      console.log('Tenant admin account now has TENANT_ADMIN_ROLE:', newHasTenantAdminRole);
      
      if (newHasTenantAdminRole) {
        console.log('✅ Role granting successful!');
      } else {
        console.log('❌ Role granting failed!');
      }
      
    } catch (error) {
      console.error('❌ configureTenantAdmin failed:', error.message);
    }
    
    console.log('\n=== STEP 3: Test assignOrganization ===');
    
    try {
      // Test assigning a user to the organization
      const result = await contract.methods.assignOrganization(testAccount, organizationIdHash).send({
        from: adminAccount,
        gas: 1000000
      });
      
      console.log('✅ assignOrganization successful!');
      console.log('Transaction hash:', result.transactionHash);
      
    } catch (error) {
      console.error('❌ assignOrganization failed:', error.message);
    }
    
    console.log('\n=== STEP 4: Test Tenant Admin Permissions ===');
    
    // Check if tenant admin can assign users to their organization
    try {
      const testAccount2 = accounts[3];
      const result = await contract.methods.assignOrganization(testAccount2, organizationIdHash).send({
        from: tenantAdminAccount,
        gas: 1000000
      });
      
      console.log('✅ Tenant admin can assign users to their organization!');
      console.log('Transaction hash:', result.transactionHash);
      
    } catch (error) {
      console.error('❌ Tenant admin cannot assign users:', error.message);
    }
    
    console.log('\n=== STEP 5: Test Role Revocation ===');
    
    try {
      const result = await contract.methods.revokeRole(tenantAdminRole, tenantAdminAccount).send({
        from: adminAccount,
        gas: 1000000
      });
      
      console.log('✅ Role revocation successful!');
      console.log('Transaction hash:', result.transactionHash);
      
      // Verify the role was revoked
      const finalHasTenantAdminRole = await contract.methods.hasRole(tenantAdminRole, tenantAdminAccount).call();
      console.log('Tenant admin account still has TENANT_ADMIN_ROLE:', finalHasTenantAdminRole);
      
    } catch (error) {
      console.error('❌ Role revocation failed:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRoleGranting(); 