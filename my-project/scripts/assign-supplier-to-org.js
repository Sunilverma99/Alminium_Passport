import Web3 from 'web3';
import { initializeContractInstance } from '../src/contractInstance.js';

async function assignSupplierToOrg() {
  try {
    console.log('🔧 Assigning Supplier to Organization...');
    
    // Get command line arguments
    const supplierAddress = process.argv[2];
    const organizationId = process.argv[3];
    
    if (!supplierAddress || !organizationId) {
      console.error('❌ Usage: node scripts/assign-supplier-to-org.js <supplierAddress> <organizationId>');
      console.error('Example: node scripts/assign-supplier-to-org.js 0x1234... mahindra-0x1234...');
      return;
    }
    
    // Initialize contract instance
    const { evContract, account, web3 } = await initializeContractInstance();
    
    console.log('Government account:', account);
    console.log('Supplier address:', supplierAddress);
    console.log('Organization ID:', organizationId);
    
    // Check if government user has DEFAULT_ADMIN_ROLE
    const defaultAdminRole = await evContract.methods.DEFAULT_ADMIN_ROLE().call();
    const hasDefaultAdminRole = await evContract.methods.hasRole(defaultAdminRole, account).call();
    
    if (!hasDefaultAdminRole) {
      console.error('❌ Government user does not have DEFAULT_ADMIN_ROLE');
      return;
    }
    
    // Convert organization ID to bytes32
    const organizationIdHash = web3.utils.keccak256(organizationId);
    console.log('Organization ID Hash:', organizationIdHash);
    
    // Check current organization assignment
    const currentOrg = await evContract.methods.getUserOrganization(supplierAddress).call();
    console.log('Current organization assignment:', currentOrg);
    
    if (currentOrg !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log('⚠️ Supplier is already assigned to an organization');
      console.log('Current org:', currentOrg);
      console.log('New org:', organizationIdHash);
      
      if (currentOrg === organizationIdHash) {
        console.log('✅ Supplier is already assigned to the correct organization');
        return;
      } else {
        console.log('❌ Supplier is assigned to a different organization');
        console.log('Cannot reassign without first removing from current organization');
        return;
      }
    }
    
    // Assign organization
    console.log('Assigning supplier to organization...');
    const tx = await evContract.methods.assignOrganization(supplierAddress, organizationIdHash).send({
      from: account,
      gas: 300000
    });
    
    console.log('✅ Organization assigned successfully!');
    console.log('Transaction hash:', tx.transactionHash);
    
    // Verify assignment
    const newOrg = await evContract.methods.getUserOrganization(supplierAddress).call();
    console.log('New organization assignment:', newOrg);
    console.log('Assignment successful:', newOrg === organizationIdHash);
    
  } catch (error) {
    console.error('❌ Error assigning supplier to organization:', error);
  }
}

// Run the assignment
assignSupplierToOrg(); 