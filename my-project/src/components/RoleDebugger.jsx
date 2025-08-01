import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkUserRoles } from '../redux/contractSlice';
import { initializeContractInstance } from '../contractInstance';

const RoleDebugger = () => {
  const dispatch = useDispatch();
  const { userAddress, isConnected, roles, isLoading } = useSelector((state) => state.contract);
  const [debugInfo, setDebugInfo] = useState({});
  const [isDebugging, setIsDebugging] = useState(false);

  const runDebugCheck = async () => {
    if (!userAddress) {
      setDebugInfo({ error: 'No user address available' });
      return;
    }

    setIsDebugging(true);
    const debugData = {
      userAddress,
      isConnected,
      currentRoles: roles,
      timestamp: new Date().toISOString(),
      contractChecks: {}
    };

    try {
      // Use existing contract instance from contractInstance.js
      const { evContract, account, web3 } = await initializeContractInstance();
      
      debugData.contractAddress = evContract.options.address;
      debugData.networkId = await web3.eth.net.getId();
      debugData.account = account;

      // Check each role individually
      const roleChecks = {};
      
      const roleNames = [
        'GOVERNMENT_ROLE',
        'TENANT_ADMIN_ROLE', 
        'MANUFACTURER_ROLE',
        'SUPPLIER_ROLE',
        'RECYCLER_ROLE',
        'MINER_ROLE',
        'THIRD_PARTY_ROLE',
        'GLOBAL_AUDITOR_ROLE'
      ];

      for (const roleName of roleNames) {
        try {
          const roleHash = await evContract.methods[roleName]().call();
          const hasRole = await evContract.methods.hasRole(roleHash, userAddress).call();
          
          roleChecks[roleName] = {
            roleHash,
            hasRole: hasRole,
            success: true
          };
        } catch (error) {
          roleChecks[roleName] = {
            error: error.message,
            success: false
          };
        }
      }

      debugData.contractChecks = roleChecks;

      // Check organization assignment for tenant admin
      try {
        const userOrg = await evContract.methods.getUserOrganization(userAddress).call();
        debugData.userOrganization = userOrg;
        debugData.hasOrganization = userOrg !== '0x0000000000000000000000000000000000000000000000000000000000000000';
      } catch (error) {
        debugData.organizationError = error.message;
      }

      // Check if user has DEFAULT_ADMIN_ROLE
      try {
        const defaultAdminRole = await evContract.methods.DEFAULT_ADMIN_ROLE().call();
        const hasDefaultAdmin = await evContract.methods.hasRole(defaultAdminRole, userAddress).call();
        debugData.hasDefaultAdminRole = hasDefaultAdmin;
        debugData.defaultAdminRole = defaultAdminRole;
      } catch (error) {
        debugData.defaultAdminError = error.message;
      }

      setDebugInfo(debugData);

    } catch (error) {
      setDebugInfo({
        error: error.message,
        userAddress,
        isConnected,
        currentRoles: roles
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const refreshRoles = async () => {
    if (userAddress) {
      try {
        await dispatch(checkUserRoles(userAddress)).unwrap();
        console.log('Roles refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh roles:', error);
      }
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">Role Debugger</h3>
      
      <div className="mb-4">
        <button
          onClick={runDebugCheck}
          disabled={isDebugging || !userAddress}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          {isDebugging ? 'Debugging...' : 'Run Debug Check'}
        </button>
        
        <button
          onClick={refreshRoles}
          disabled={!userAddress}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Refresh Roles
        </button>
      </div>

      <div className="text-sm">
        <div className="mb-2">
          <strong>User Address:</strong> {userAddress || 'Not connected'}
        </div>
        <div className="mb-2">
          <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
        </div>
        <div className="mb-2">
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
      </div>

      {debugInfo.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {debugInfo.error}
        </div>
      )}

      {debugInfo.contractAddress && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div><strong>Contract Address:</strong> {debugInfo.contractAddress}</div>
          <div><strong>Network ID:</strong> {debugInfo.networkId}</div>
          <div><strong>Account:</strong> {debugInfo.account}</div>
        </div>
      )}

      {debugInfo.contractChecks && Object.keys(debugInfo.contractChecks).length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <h4 className="font-bold mb-2">Contract Role Checks:</h4>
          {Object.entries(debugInfo.contractChecks).map(([roleName, check]) => (
            <div key={roleName} className="mb-1">
              <strong>{roleName}:</strong> {check.success ? 
                `Hash: ${check.roleHash}, Has Role: ${check.hasRole}` : 
                `Error: ${check.error}`
              }
            </div>
          ))}
        </div>
      )}

      {debugInfo.userOrganization !== undefined && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div><strong>User Organization:</strong> {debugInfo.userOrganization}</div>
          <div><strong>Has Organization:</strong> {debugInfo.hasOrganization ? 'Yes' : 'No'}</div>
        </div>
      )}

      {debugInfo.hasDefaultAdminRole !== undefined && (
        <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded mb-4">
          <div><strong>Has DEFAULT_ADMIN_ROLE:</strong> {debugInfo.hasDefaultAdminRole ? 'Yes' : 'No'}</div>
          <div><strong>DEFAULT_ADMIN_ROLE Hash:</strong> {debugInfo.defaultAdminRole}</div>
        </div>
      )}

      <div className="bg-gray-200 border border-gray-400 text-gray-700 px-4 py-3 rounded">
        <h4 className="font-bold mb-2">Current Redux Roles:</h4>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(roles, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default RoleDebugger; 