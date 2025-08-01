import Web3 from 'web3';
import { initializeContractInstance } from '../src/contractInstance.js';

async function tenantAdminFixOrg() {
  try {
    console.log('🔧 Tenant Admin: Fixing Organization Assignments...');
    
    // Get command line arguments
    const memberAddress = process.argv[2];
    
    if (!memberAddress) {
      console.error('❌ Usage: node scripts/tenant-admin-fix-org.js <memberAddress>');
      console.error('Example: node scripts/tenant-admin-fix-org.js 0x1234...');
      return;
    }
    
    // Initialize contract instance
    const { evContract, account, web3 } = await initializeContractInstance();
    
    console.log('Tenant admin account:', account);
    console.log('Member address:', memberAddress);
    
    // 1. Check if caller is a tenant admin
    console.log('\n=== Checking Tenant Admin Role ===');
    const tenantAdminRole = await evContract.methods.TENANT_ADMIN_ROLE().call();
    const hasTenantAdminRole = await evContract.methods.hasRole(tenantAdminRole, account).call();
    console.log('Has TENANT_ADMIN_ROLE:', hasTenantAdminRole);
    
    if (!hasTenantAdminRole) {
      console.error('❌ Caller does not have TENANT_ADMIN_ROLE');
      return;
    }
    
    // 2. Get tenant admin's organization
    const tenantAdminOrg = await evContract.methods.getUserOrganization(account).call();
    console.log('Tenant admin organization:', tenantAdminOrg);
    
    if (tenantAdminOrg === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.error('❌ Tenant admin is not assigned to any organization');
      return;
    }
    
    // 3. Check member's current organization assignment
    console.log('\n=== Checking Member Organization ===');
    const memberOrg = await evContract.methods.getUserOrganization(memberAddress).call();
    console.log('Member current organization:', memberOrg);
    
    if (memberOrg !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      if (memberOrg === tenantAdminOrg) {
        console.log('✅ Member is already assigned to the correct organization');
        return;
      } else {
        console.log('❌ Member is assigned to a different organization');
        console.log('Cannot reassign without first removing from current organization');
        return;
      }
    }
    
    // 4. Check if member exists in backend organization
    console.log('\n=== Checking Backend Organization ===');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${memberAddress}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('Backend organization data:', userData);
        
        // Check if member belongs to tenant admin's organization
        const backendOrgHash = web3.utils.keccak256(userData.organizationId);
        console.log('Backend organization hash:', backendOrgHash);
        console.log('Tenant admin organization hash:', tenantAdminOrg);
        
        if (backendOrgHash !== tenantAdminOrg) {
          console.error('❌ Member does not belong to tenant admin\'s organization');
          console.log('Backend org:', userData.organizationId);
          console.log('Tenant admin org hash:', tenantAdminOrg);
          return;
        }
        
        // 5. Assign member to organization
        console.log('\n=== Assigning Member to Organization ===');
        console.log('Assigning member to organization hash:', tenantAdminOrg);
        
        const tx = await evContract.methods.assignOrganization(memberAddress, tenantAdminOrg).send({
          from: account,
          gas: 300000
        });
        
        console.log('✅ Organization assigned successfully!');
        console.log('Transaction hash:', tx.transactionHash);
        
        // 6. Verify assignment
        const newMemberOrg = await evContract.methods.getUserOrganization(memberAddress).call();
        console.log('New member organization:', newMemberOrg);
        console.log('Assignment successful:', newMemberOrg === tenantAdminOrg);
        
      } else {
        console.error('❌ Member not found in backend organization');
        const errorData = await response.json();
        console.log('Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error checking backend organization:', error);
    }
    
  } catch (error) {
    console.error('❌ Error fixing organization assignment:', error);
  }
}

// Run the fix
tenantAdminFixOrg(); 