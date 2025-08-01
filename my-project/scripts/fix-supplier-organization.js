import Web3 from 'web3';
import { initializeContractInstance } from '../src/contractInstance.js';

async function fixSupplierOrganization() {
  try {
    console.log('🔧 Fixing Supplier Organization Assignment...');
    
    // Initialize contract instance
    const { evContract, account, web3 } = await initializeContractInstance();
    
    console.log('User account:', account);
    console.log('Contract address:', evContract.options.address);
    
    // Check current organization assignment
    const currentOrg = await evContract.methods.getUserOrganization(account).call();
    console.log('Current organization assignment:', currentOrg);
    
    if (currentOrg !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log('✅ User is already assigned to an organization');
      return;
    }
    
    // Get user organization from backend
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`);
    if (!response.ok) {
      console.error('❌ Failed to fetch user organization from backend');
      return;
    }
    
    const userData = await response.json();
    console.log('User organization data:', userData);
    
    if (!userData.organizationId) {
      console.error('❌ No organization ID found for user');
      return;
    }
    
    // Convert organization ID to bytes32
    const organizationIdHash = web3.utils.keccak256(userData.organizationId);
    console.log('Organization ID:', userData.organizationId);
    console.log('Organization ID Hash:', organizationIdHash);
    
    // Check if user has DEFAULT_ADMIN_ROLE to assign themselves
    const defaultAdminRole = await evContract.methods.DEFAULT_ADMIN_ROLE().call();
    const hasDefaultAdminRole = await evContract.methods.hasRole(defaultAdminRole, account).call();
    
    if (hasDefaultAdminRole) {
      console.log('✅ User has DEFAULT_ADMIN_ROLE, can assign themselves');
      
      // Assign organization
      const tx = await evContract.methods.assignOrganization(account, organizationIdHash).send({
        from: account,
        gas: 300000
      });
      
      console.log('✅ Organization assigned successfully!');
      console.log('Transaction hash:', tx.transactionHash);
    } else {
      console.log('❌ User does not have DEFAULT_ADMIN_ROLE');
      console.log('Please contact a government user or tenant admin to assign you to the organization');
      console.log('Organization ID:', userData.organizationId);
      console.log('Organization ID Hash:', organizationIdHash);
    }
    
  } catch (error) {
    console.error('❌ Error fixing supplier organization:', error);
  }
}

// Run the fix
fixSupplierOrganization(); 