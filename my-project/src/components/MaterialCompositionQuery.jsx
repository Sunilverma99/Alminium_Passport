import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle, Database, Download } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { initializeContractInstance } from '../contractInstance';
import { apiFetch } from '../utils/api';
import MaterialCompositionDataDisplay from './MaterialCompositionDataDisplay';

const MaterialCompositionQuery = ({ userRole, requiredTrustLevel = 3 }) => {
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);

  const fetchFromPinata = async (ipfsHash) => {
    if (!ipfsHash) return null;
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const handleSearch = async () => {
    setResult(null);
    setError("");
    if (!tokenId) {
      toast.error("Please enter a Token ID");
      return;
    }
    setLoading(true);
  
    try {
      console.log('🔍 Starting material composition query...');
      console.log('Token ID:', tokenId);
      console.log('User Role:', userRole);
      console.log('Required Trust Level:', requiredTrustLevel);
      console.log('Current account from window.ethereum:', window.ethereum?.selectedAddress);
      
      // 1. Initialize contracts + Web3
      console.log('📋 Initializing contract instances...');
      const {
        bpQueries,
        evContract,
        didManager,
        credentialManager,
        account,
        web3
      } = await initializeContractInstance();
      
      console.log('✅ Contract instances initialized:');
      console.log('  - Account:', account);
      console.log('  - EVBatteryPassportCore address:', evContract.options.address);
      console.log('  - BatteryPassportQueries address:', bpQueries.options.address);
      console.log('  - DIDManager address:', didManager.options.address);
      console.log('  - CredentialManager address:', credentialManager.options.address);

      // 2. Fetch user DID info
      console.log('🔍 Fetching user DID info from backend...');
      console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
      console.log('Account to query:', account);
      
      const userResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(account)}`
      );
      console.log('Backend response status:', userResponse.status);
      
      if (!userResponse.ok) {
        console.error('❌ Backend response not OK:', userResponse.status, userResponse.statusText);
        throw new Error("Failed to fetch user credential data from backend");
      }
      const userData = await userResponse.json();
      console.log('📋 User data from backend:', userData);
      
      if (!userData.user?.didName || !userData.user?.credentialId) {
        console.error('❌ Missing user credentials:', {
          didName: userData.user?.didName,
          credentialId: userData.user?.credentialId
        });
        throw new Error("No valid user credentials found. Please ensure you are properly registered.");
      }
      const didName = userData.user.didName.toLowerCase();
      const credentialId = userData.user.credentialId;
      console.log('✅ User credentials extracted:');
      console.log('  - DID Name:', didName);
      console.log('  - Credential ID:', credentialId);

      // 3. Validate verifiable credential
      console.log('🔍 Validating verifiable credential...');
      console.log('Credential ID to validate:', credentialId.toLowerCase());
      
      const credentialValid = await credentialManager.methods
        .validateVerifiableCredential(credentialId.toLowerCase())
        .call();
      console.log('✅ Credential validation result:', credentialValid);
      
      if (!credentialValid) {
        console.error('❌ Credential validation failed');
        throw new Error("Credential is not valid or expired.");
      }
  
      // 4. Compute didHash
      console.log('🔍 Computing DID hash...');
      const didHash = web3.utils.keccak256(didName);
      console.log('DID Name:', didName);
      console.log('DID Hash:', didHash);
      
      console.log('🔍 Checking if DID is registered...');
      const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
      console.log('DID registered:', isDIDRegistered);
      
      if (!isDIDRegistered) {
        console.error('❌ DID is not registered');
        throw new Error("DID is not registered. Please wait for government approval.");
      }
      
      console.log('🔍 Fetching DID details...');
      const didDetails = await didManager.methods.getDID(didHash).call();
      console.log('📋 DID Details:', didDetails);
      
      console.log('🔍 Checking DID verification status...');
      console.log('DID is verified:', didDetails.isVerified);
      
      if (!didDetails.isVerified) {
        console.error('❌ DID is not verified');
        throw new Error("DID is not verified. Please wait for government verification.");
      }
      
      console.log('🔍 Checking public key match...');
      console.log('DID public key:', didDetails.publicKey.toLowerCase());
      console.log('Current account:', account.toLowerCase());
      console.log('Public key match:', didDetails.publicKey.toLowerCase() === account.toLowerCase());
      
      if (didDetails.publicKey.toLowerCase() !== account.toLowerCase()) {
        console.error('❌ Public key mismatch');
        throw new Error("Public key mismatch. DID was registered with a different account.");
      }
      
      // Check if user has the required role with sufficient trust level
      console.log('🔍 Checking user roles and trust level...');
      console.log('Available roles:', didDetails.roles);
      console.log('Trust level:', didDetails.trustLevel);
      console.log(`Required trust level for ${userRole}:`, requiredTrustLevel);
      
      const hasRequiredRole = didDetails.roles.some(role => 
        role.toUpperCase() === userRole.toUpperCase()
      );
      
      console.log('Role matching analysis:', {
        hasRequiredRole,
        roles: didDetails.roles,
        requiredRole: userRole.toUpperCase()
      });
      
      console.log('Trust level analysis:', {
        hasRequiredRole,
        roles: didDetails.roles,
        rolesString: didDetails.roles.join(', '),
        trustLevel: didDetails.trustLevel,
        requiredTrustLevel,
        trustLevelSufficient: didDetails.trustLevel >= requiredTrustLevel
      });
      
      if (!hasRequiredRole || didDetails.trustLevel < requiredTrustLevel) {
        console.error('❌ Insufficient permissions:', {
          hasRequiredRole,
          trustLevel: didDetails.trustLevel,
          requiredTrustLevel
        });
        throw new Error(`Insufficient permissions. User has roles: ${didDetails.roles.join(', ')}, trust level: ${didDetails.trustLevel}. Required: ${userRole.toUpperCase()} role with trust level >= ${requiredTrustLevel}.`);
      }
      
      console.log('✅ User role and trust level validation passed');
      console.log('User role details:', {
        roles: didDetails.roles,
        trustLevel: didDetails.trustLevel,
        hasRequiredRole,
        isVerified: didDetails.isVerified
      });
      
      // Test the exact role validation that the contract will do
      console.log('🔍 Testing direct role validations...');
      try {
        const roleValidation = await didManager.methods.validateDIDRole(didHash, userRole.toUpperCase(), requiredTrustLevel, account).call();
        console.log(`✅ Direct ${userRole.toUpperCase()} role validation (level ${requiredTrustLevel}):`, roleValidation);
        
        // Test GOVERNMENT role validation (this will fail for non-government users, which is expected)
        try {
          const governmentValidation = await didManager.methods.validateDIDRole(didHash, 'GOVERNMENT', 5, account).call();
          console.log('✅ Direct GOVERNMENT role validation (level 5):', governmentValidation);
        } catch (govError) {
          console.log('ℹ️ Direct GOVERNMENT role validation (level 5): Expected to fail for non-government users -', govError.message);
        }
      } catch (error) {
        console.error('❌ Role validation test error:', error.message);
      }
      
      // 5. Check organization assignment
      console.log('🔍 Checking organization assignment...');
      const userOrg = await evContract.methods.getUserOrganization(account).call();
      console.log('User organization:', userOrg);
      
      if (userOrg === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw new Error("You are not assigned to any organization. Please contact your tenant admin or government to assign you to an organization.");
      }
      
      console.log('✅ User has organization assignment:', userOrg);

      // 6. Check if the battery passport exists and get its organization
      console.log('🔍 Checking battery passport organization...');
      const passportData = await evContract.methods.getBatteryPassport(Number(tokenId)).call();
      console.log('Passport data:', passportData);
      
      if (!passportData.exists) {
        throw new Error(`Battery passport with token ID ${tokenId} does not exist.`);
      }
      
      console.log('🔍 Comparing organizations...');
      console.log('User organization:', userOrg);
      console.log('Passport organization:', passportData.organizationId);
      console.log('Organizations match:', userOrg === passportData.organizationId);
      
      if (userOrg !== passportData.organizationId) {
        console.log('⚠️ Organizations do not match, checking if user has GOVERNMENT role...');
        // Check if user has GOVERNMENT role to bypass organization check
        const hasGovRole = await didManager.methods.validateDIDRole(didHash, 'GOVERNMENT', 5, account).call();
        console.log('User has GOVERNMENT role:', hasGovRole);
        
        if (!hasGovRole) {
          throw new Error(`Not authorized for this organization's passport. Your organization (${userOrg}) does not match the passport's organization (${passportData.organizationId}). Only government users can query passports from other organizations.`);
        }
      }
      
      console.log('✅ Organization validation passed');
      
      // 7. Build the EIP-712 domain **exactly** as the Core contract does
      console.log('🔍 Building EIP-712 domain...');
      const chainId = Number(await web3.eth.getChainId());
      console.log('Chain ID:', chainId);
      
      const domain = {
        name: "EVBatteryPassport",
        version: "1",
        chainId: chainId,
        verifyingContract: evContract.options.address
      };
      console.log('Domain:', domain);
  
      // 8. Declare types to match `QueryMaterialComposition(uint256 tokenId,address requester)`
      const types = {
        EIP712Domain: [
          { name: "name",              type: "string"  },
          { name: "version",           type: "string"  },
          { name: "chainId",           type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        QueryMaterialComposition: [
          { name: "tokenId",   type: "uint256" },
          { name: "requester", type: "address" }
        ]
      };
      console.log('Types:', types);
  
      // 9. Prepare the message with the exact field names
      const message = {
        tokenId:   Number(tokenId),
        requester: account
      };
      console.log('Message:', message);
  
      // 10. Ask MetaMask (or other) to sign the typed data
      console.log('🔍 Requesting signature from MetaMask...');
      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [
          account,
          JSON.stringify({
            domain,
            types,
            primaryType: "QueryMaterialComposition",
            message
          })
        ]
      });
      
      console.log('✅ Signature received:');
      console.log('Signature:', signature);
      console.log('Signature length:', signature.length);
      console.log('Expected length:', 132); // 65 bytes = 130 hex chars + '0x' prefix
  
      // 11. Finally call the on-chain query
      console.log('🔍 Calling queryMaterialComposition on-chain...');
      console.log('Parameters:');
      console.log('  - Token ID:', Number(tokenId));
      console.log('  - DID Hash:', didHash);
      console.log('  - Signature:', signature);
      console.log('  - From account:', account);
      
      const hashOnChain = await bpQueries.methods
        .queryMaterialComposition(
          Number(tokenId),
          didHash,
          signature
        )
        .call({ from: account });
      
      console.log('✅ On-chain query result:', hashOnChain);
  
      if (!hashOnChain || /^0x0+$/.test(hashOnChain)) {
        console.error('❌ No material composition hash found on-chain');
        throw new Error("No material composition hash found on-chain.");
      }
      
      console.log('✅ Material composition hash found on-chain');
  
      // 12. Fetch backend + Pinata and compare
      console.log('🔍 Fetching data from backend...');
      const backendResp = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenId}`
      );
      
      console.log('Backend response status:', backendResp.status);
      
      if (!backendResp.ok) {
        console.error('❌ Backend response not OK:', backendResp.status, backendResp.statusText);
        throw new Error("Failed to fetch data from backend");
      }
      
      const backendData = await backendResp.json();
      console.log('Backend data:', backendData);
      
      const backendHash = backendData?.materialCompositionHashes?.[backendData?.materialCompositionHashes?.length - 1];
      console.log('Backend hash:', backendHash);
      
      if (!backendHash) {
        console.error('❌ No material composition hash found in backend');
        throw new Error("No material composition hash found in backend");
      }
      
      const finalHash = web3.utils.keccak256(backendHash);
      console.log('Final hash (keccak256 of backend hash):', finalHash);
      console.log('On-chain hash:', hashOnChain);
      console.log('Hashes match:', finalHash === hashOnChain);
      
      if (finalHash !== hashOnChain) {
        console.error('❌ Hash mismatch between blockchain and backend');
        throw new Error("Hash mismatch between blockchain and backend");
      }
      
      console.log('✅ Hash validation passed');
  
      // 13. Fetch material data from IPFS using the actual CID
      console.log('🔍 Fetching data from Pinata...');
      const pinataData = await fetchFromPinata(backendHash);
      if (!pinataData) {
        console.error('❌ Failed to fetch data from Pinata');
        throw new Error("Failed to fetch data from Pinata");
      }
      
      console.log('✅ Pinata data fetched successfully');
      console.log('Final result:', pinataData);
      
      setResult(pinataData);
      
      // Add to query history
      setQueryHistory(prev => [{
        tokenId,
        timestamp: new Date().toLocaleString(),
        status: 'Success',
        materialHash: backendHash
      }, ...prev.slice(0, 9)]);
      
      toast.success("Material composition data loaded successfully!");
    } catch (err) {
      console.error('❌ Error in handleSearch:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(err.message || "Failed to fetch data");
      toast.error(err.message || "Failed to fetch data");
      
      // Add failed query to history
      setQueryHistory(prev => [{
        tokenId,
        timestamp: new Date().toLocaleString(),
        status: 'Failed',
        error: err.message
      }, ...prev.slice(0, 9)]);
    } finally {
      console.log('🏁 handleSearch completed');
      setLoading(false);
    }
  };

  const downloadMaterialData = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `material-composition-${tokenId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      {!result && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Query Material Composition</h1>
            <p className="mt-2 text-gray-600">
              Search for battery material composition data by token ID
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 max-w-xl mx-auto space-y-6">
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
                Token ID
              </label>
              <input
                id="tokenId"
                type="text"
                value={tokenId}
                onChange={(e) => {
                  setTokenId(e.target.value)
                  setError('')
                }}
                placeholder="Enter Token ID (e.g., 123456)"
                className={`w-full mt-1 px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                  ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'}`}
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !tokenId || !!error}
              className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  <span>Search Material Composition</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Material Composition Data</h1>
            <p className="mt-2 text-gray-600">
              Token ID: {tokenId}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Material Composition Details</h2>
              <button
                onClick={downloadMaterialData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <MaterialCompositionDataDisplay data={result} tokenId={tokenId} />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setResult(null)
                  setError('')
                  setTokenId('')
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Search Another Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialCompositionQuery; 