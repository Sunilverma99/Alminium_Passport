const Web3 = require('web3');
const EVBatteryPassportCoreABI = require('../src/abis/EVBatteryPassportCore.json');

async function testTenantAdmin() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    const tenantAdminAccount = accounts[1];
    
    console.log('Admin account:', adminAccount);
    console.log('Tenant admin account:', tenantAdminAccount);
    
    // Contract address (you'll need to update this with your deployed address)
    const contractAddress = process.env.VITE_EV_BATTERY_PASSPORT_CORE || '0x...';
    
    if (contractAddress === '0x...') {
      console.log('Please set the VITE_EV_BATTERY_PASSPORT_CORE environment variable');
      return;
    }
    
    const contract = new web3.eth.Contract(EVBatteryPassportCoreABI.abi, contractAddress);
    
    // Test 1: Check if TENANT_ADMIN_ROLE exists
    console.log('\n=== Test 1: Check TENANT_ADMIN_ROLE ===');
    try {
      const tenantAdminRole = await contract.methods.TENANT_ADMIN_ROLE().call();
      console.log('TENANT_ADMIN_ROLE:', tenantAdminRole);
    } catch (error) {
      console.error('Error getting TENANT_ADMIN_ROLE:', error.message);
    }
    
    // Test 2: Check if admin has DEFAULT_ADMIN_ROLE
    console.log('\n=== Test 2: Check admin role ===');
    try {
      const defaultAdminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
      const hasAdminRole = await contract.methods.hasRole(defaultAdminRole, adminAccount).call();
      console.log('Admin has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    } catch (error) {
      console.error('Error checking admin role:', error.message);
    }
    
    // Test 3: Try to configure tenant admin
    console.log('\n=== Test 3: Configure tenant admin ===');
    try {
      const organizationId = `test-org-${tenantAdminAccount}`;
      const organizationIdHash = web3.utils.sha3(organizationId);
      
      console.log('Organization ID:', organizationId);
      console.log('Organization ID Hash:', organizationIdHash);
      
      const result = await contract.methods.configureTenantAdmin(tenantAdminAccount, organizationIdHash).send({
        from: adminAccount,
        gas: 1000000
      });
      
      console.log('Tenant admin configured successfully!');
      console.log('Transaction hash:', result.transactionHash);
    } catch (error) {
      console.error('Error configuring tenant admin:', error.message);
    }
    
    // Test 4: Check if tenant admin has the role
    console.log('\n=== Test 4: Verify tenant admin role ===');
    try {
      const tenantAdminRole = await contract.methods.TENANT_ADMIN_ROLE().call();
      const hasTenantAdminRole = await contract.methods.hasRole(tenantAdminRole, tenantAdminAccount).call();
      console.log('Tenant admin has TENANT_ADMIN_ROLE:', hasTenantAdminRole);
    } catch (error) {
      console.error('Error checking tenant admin role:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTenantAdmin(); 