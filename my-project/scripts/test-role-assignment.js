const Web3 = require('web3');
const EVBatteryPassportCoreABI = require('../src/abis/EVBatteryPassportCore.json');

// Configuration
const RPC_URL = 'http://127.0.0.1:8545'; // Local Hardhat node
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Update with your deployed contract address

async function testRoleAssignment() {
  try {
    // Initialize Web3
    const web3 = new Web3(RPC_URL);
    
    // Initialize contract
    const contract = new web3.eth.Contract(EVBatteryPassportCoreABI.abi, CONTRACT_ADDRESS);
    
    console.log('=== Testing Role Assignment ===');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log('Available accounts:', accounts);
    
    if (accounts.length < 2) {
      console.error('Need at least 2 accounts for testing');
      return;
    }
    
    const adminAccount = accounts[0];
    const testAccount = accounts[1];
    
    console.log('\nAdmin Account:', adminAccount);
    console.log('Test Account:', testAccount);
    
    // Get role hashes
    console.log('\n=== Getting Role Hashes ===');
    const roles = {};
    
    try {
      roles.GOVERNMENT_ROLE = await contract.methods.GOVERNMENT_ROLE().call();
      console.log('GOVERNMENT_ROLE:', roles.GOVERNMENT_ROLE);
    } catch (error) {
      console.log('GOVERNMENT_ROLE not available:', error.message);
    }
    
    try {
      roles.TENANT_ADMIN_ROLE = await contract.methods.TENANT_ADMIN_ROLE().call();
      console.log('TENANT_ADMIN_ROLE:', roles.TENANT_ADMIN_ROLE);
    } catch (error) {
      console.log('TENANT_ADMIN_ROLE not available:', error.message);
    }
    
    try {
      roles.MANUFACTURER_ROLE = await contract.methods.MANUFACTURER_ROLE().call();
      console.log('MANUFACTURER_ROLE:', roles.MANUFACTURER_ROLE);
    } catch (error) {
      console.log('MANUFACTURER_ROLE not available:', error.message);
    }
    
    try {
      roles.SUPPLIER_ROLE = await contract.methods.SUPPLIER_ROLE().call();
      console.log('SUPPLIER_ROLE:', roles.SUPPLIER_ROLE);
    } catch (error) {
      console.log('SUPPLIER_ROLE not available:', error.message);
    }
    
    try {
      roles.RECYCLER_ROLE = await contract.methods.RECYCLER_ROLE().call();
      console.log('RECYCLER_ROLE:', roles.RECYCLER_ROLE);
    } catch (error) {
      console.log('RECYCLER_ROLE not available:', error.message);
    }
    
    try {
      roles.MINER_ROLE = await contract.methods.MINER_ROLE().call();
      console.log('MINER_ROLE:', roles.MINER_ROLE);
    } catch (error) {
      console.log('MINER_ROLE not available:', error.message);
    }
    
    try {
      roles.THIRD_PARTY_ROLE = await contract.methods.THIRD_PARTY_ROLE().call();
      console.log('THIRD_PARTY_ROLE:', roles.THIRD_PARTY_ROLE);
    } catch (error) {
      console.log('THIRD_PARTY_ROLE not available:', error.message);
    }
    
    // Check admin's roles
    console.log('\n=== Checking Admin Roles ===');
    for (const [roleName, roleHash] of Object.entries(roles)) {
      try {
        const hasRole = await contract.methods.hasRole(roleHash, adminAccount).call();
        console.log(`${roleName}: ${hasRole}`);
      } catch (error) {
        console.log(`${roleName}: Error - ${error.message}`);
      }
    }
    
    // Check test account's roles before assignment
    console.log('\n=== Checking Test Account Roles (Before Assignment) ===');
    for (const [roleName, roleHash] of Object.entries(roles)) {
      try {
        const hasRole = await contract.methods.hasRole(roleHash, testAccount).call();
        console.log(`${roleName}: ${hasRole}`);
      } catch (error) {
        console.log(`${roleName}: Error - ${error.message}`);
      }
    }
    
    // Test assigning TENANT_ADMIN_ROLE
    if (roles.TENANT_ADMIN_ROLE) {
      console.log('\n=== Testing TENANT_ADMIN_ROLE Assignment ===');
      
      try {
        // Check if admin has DEFAULT_ADMIN_ROLE
        const defaultAdminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
        const adminHasDefaultRole = await contract.methods.hasRole(defaultAdminRole, adminAccount).call();
        console.log('Admin has DEFAULT_ADMIN_ROLE:', adminHasDefaultRole);
        
        if (adminHasDefaultRole) {
          // Try to assign TENANT_ADMIN_ROLE
          console.log('Attempting to assign TENANT_ADMIN_ROLE...');
          
          const organizationId = `test-org-${testAccount}`;
          const organizationIdHash = web3.utils.sha3(organizationId);
          
          const tx = await contract.methods.configureTenantAdmin(testAccount, organizationIdHash).send({
            from: adminAccount,
            gas: 1000000,
          });
          
          console.log('Transaction successful:', tx.transactionHash);
          
          // Check roles after assignment
          console.log('\n=== Checking Test Account Roles (After Assignment) ===');
          for (const [roleName, roleHash] of Object.entries(roles)) {
            try {
              const hasRole = await contract.methods.hasRole(roleHash, testAccount).call();
              console.log(`${roleName}: ${hasRole}`);
            } catch (error) {
              console.log(`${roleName}: Error - ${error.message}`);
            }
          }
          
          // Check organization assignment
          try {
            const userOrg = await contract.methods.getUserOrganization(testAccount).call();
            console.log('User Organization:', userOrg);
            console.log('Expected Organization Hash:', organizationIdHash);
            console.log('Organization Match:', userOrg === organizationIdHash);
          } catch (error) {
            console.log('Error checking organization:', error.message);
          }
          
        } else {
          console.log('Admin does not have DEFAULT_ADMIN_ROLE, cannot assign roles');
        }
        
      } catch (error) {
        console.error('Error assigning TENANT_ADMIN_ROLE:', error.message);
      }
    }
    
    // Test assigning other roles
    console.log('\n=== Testing Other Role Assignments ===');
    
    const testRoles = ['MANUFACTURER_ROLE', 'SUPPLIER_ROLE', 'RECYCLER_ROLE', 'MINER_ROLE'];
    
    for (const roleName of testRoles) {
      if (roles[roleName]) {
        try {
          console.log(`\nTesting ${roleName} assignment...`);
          
          const tx = await contract.methods.grantRole(roles[roleName], testAccount).send({
            from: adminAccount,
            gas: 1000000,
          });
          
          console.log(`${roleName} assigned successfully:`, tx.transactionHash);
          
          // Verify the role was assigned
          const hasRole = await contract.methods.hasRole(roles[roleName], testAccount).call();
          console.log(`${roleName} verification: ${hasRole}`);
          
        } catch (error) {
          console.error(`Error assigning ${roleName}:`, error.message);
        }
      }
    }
    
    // Final role check
    console.log('\n=== Final Role Check for Test Account ===');
    for (const [roleName, roleHash] of Object.entries(roles)) {
      try {
        const hasRole = await contract.methods.hasRole(roleHash, testAccount).call();
        console.log(`${roleName}: ${hasRole}`);
      } catch (error) {
        console.log(`${roleName}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRoleAssignment().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 