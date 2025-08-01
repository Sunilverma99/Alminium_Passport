import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Package, 
  Upload, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText,
  Database,
  Battery,
  Info,
  CloudCog,
  Search,
  Edit3
} from 'lucide-react';
import BatteryMaterialComposition from '../../components/BatteryMaterialComposition';
import { initializeContractInstance } from '../../contractInstance.js';
import { apiFetch } from '../../utils/api';

export default function MinerUpdateMaterialComposition() {
  const [materialData, setMaterialData] = useState({});
  const [loading, setLoading] = useState(false);
  const [tokenIdInput, setTokenIdInput] = useState('');
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState('');

  const handleStepComplete = (stepIndex, data) => {
    if (!data || Object.keys(data).length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (stepIndex === 0) {
      setMaterialData(data);
      // Since there's only one step, automatically call handleSubmit
      handleSubmit(data);
    }
  };

  const fetchFromPinata = async (ipfsHash) => {
    if (!ipfsHash) return {};
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const res = await fetch(url);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  };

  const fetchBatteryByTokenId = async () => {
    if (!tokenIdInput) {
      toast.error('Please enter a Token ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { evContract, account } = await initializeContractInstance();

      const tokenExists = await evContract.methods.exists(Number(tokenIdInput)).call();
      if (!tokenExists) {
        setError('Token ID does not exist on-chain');
        setLoading(false);
        return;
      }

      const userResponse = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`);
      if (!userResponse.ok) {
        setError('Failed to fetch user credential data');
        setLoading(false);
        return;
      }

      const userData = await userResponse.json();
      console.log('User credential data:', userData);

      const batteryResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenIdInput}`,
      );
      let batteryData = null;
      if (batteryResponse.ok) {
        batteryData = await batteryResponse.json();
        console.log('Battery data from backend:', batteryData);
      }

      let materialData = {};

      if (batteryData?.materialCompositionHashes?.[batteryData.materialCompositionHashes?.length - 1]) {
        try {
          materialData = await fetchFromPinata(
            batteryData.materialCompositionHashes[batteryData.materialCompositionHashes?.length - 1],
          );
          console.log('Material data from Pinata:', materialData);
        } catch (error) {
          console.error('Error fetching material data from Pinata:', error);
        }
      }

      setMaterialData(materialData);
      setSelectedBattery({
        batteryId: tokenIdInput,
        ...batteryData
      });
      setDataFetched(true);
      toast.success('Battery data loaded successfully');

    } catch (error) {
      console.error('Error fetching battery:', error);
      setError('Failed to fetch battery data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (submittedMaterialData = null) => {
    if (!selectedBattery) {
      toast.error('Please select a battery first');
      return;
    }

    // Use submitted data if provided, otherwise use state data
    const dataToUse = submittedMaterialData || materialData;
    
    if (!dataToUse || Object.keys(dataToUse).length === 0) {
      toast.error('Please fill in material composition data');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload to Pinata
      console.log('Uploading to Pinata:', { dataToUse });
      const { pinata } = await import('../../utils/config');
      const materialRes = await pinata.upload.json(dataToUse);
      console.log('Material upload result:', materialRes);
      const materialHash = materialRes.IpfsHash;
      console.log('Material hash:', materialHash);

      // 2. Update blockchain
      const { bpUpdater, evContract, didManager, credentialManager, account, web3 } = await initializeContractInstance();
      console.log('Contract instance:', { bpUpdater, evContract, didManager, credentialManager, account });

      // 3. Get user credentials
      let didName, credentialId;
      let foundInLocal = false;
      try {
        const userCredentialsRaw = localStorage.getItem('userCredentials');
        if (userCredentialsRaw) {
          const userCredentials = JSON.parse(userCredentialsRaw);
          if (Array.isArray(userCredentials)) {
            const found = userCredentials.find(u => u.ethereumAddress?.toLowerCase() === account.toLowerCase());
            if (found) {
              didName = found.didName;
              credentialId = found.credentialId;
              foundInLocal = true;
            }
          } else if (typeof userCredentials === 'object') {
            const found = userCredentials[account.toLowerCase()];
            if (found) {
              didName = found.didName;
              credentialId = found.credentialId;
              foundInLocal = true;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse userCredentials from localStorage:', e);
      }
      
      if (foundInLocal) {
        console.log('Using userCredentials from localStorage:', { didName, credentialId });
      } else {
        const userResponse = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`);
        if (!userResponse.ok) {
          toast.error('Failed to fetch user credential data');
          setLoading(false);
          return;
        }
        
        const userData = await userResponse.json();
        console.log('User DID data:', userData);
        
        if (!userData.success || !userData.memberDetails || !userData.memberDetails.didName) {
          toast.error('No DID found for this account. Please contact your administrator.');
          setLoading(false);
          return;
        }
        
        didName = userData.memberDetails.didName;
        credentialId = userData.memberDetails.credentialId;
        console.log('Fetched userCredentials from organization endpoint:', { didName, credentialId });
      }
      
      const didHash = web3.utils.sha3(didName.toLowerCase());
      console.log('DID info:', { didName, didHash, credentialId });

      // 4. Check if token exists
      const tokenExists = await evContract.methods.exists(Number(selectedBattery.batteryId)).call();
      console.log('Token exists:', tokenExists);
      if (!tokenExists) {
        toast.error('Token ID does not exist on-chain.');
        setLoading(false);
        return;
      }

      // 5. Validate credential
      console.log('Validating credential with ID:', credentialId);
      const credentialValid = await credentialManager.methods.validateVerifiableCredential(credentialId.toLowerCase()).call();
      console.log('Credential valid:', credentialValid);
      if (!credentialValid) {
        toast.error('Credential is not valid or expired.');
        setLoading(false);
        return;
      }

      // 6. Check DID role for MINER
      const didRoleValid = await didManager.methods.validateDIDRole(didHash, 'MINER', 2, account).call();
      console.log('DID has MINER role:', didRoleValid);
      if (!didRoleValid) {
        toast.error('DID does not have MINER role with trust level 2.');
        setLoading(false);
        return;
      }

      // 7. Check on-chain DID details
      const didDetails = await didManager.methods.getDID(didHash).call();
      console.log('On-chain DID Details:', {
        uri: didDetails.uri,
        publicKey: didDetails.publicKey,
        trustLevel: didDetails.trustLevel,
        isVerified: didDetails.isVerified,
        roles: didDetails.roles
      });
      console.log('DID publicKey matches account:', didDetails.publicKey.toLowerCase() === account.toLowerCase());

      // 8. Check if DID is registered and verified
      const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
      if (!isDIDRegistered) {
        toast.error('DID not registered. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // 9. Create signature for updateMaterialAndDueDiligence
      const domain = {
        name: 'EVBatteryPassport',
        version: '1',
        chainId: Number(await web3.eth.getChainId()),
        verifyingContract: evContract.options.address,
      };
      console.log('Domain:', evContract.options.address);
      const types = {
        EIP712Domain: [
          {"name": "name", "type": "string"},
          {"name": "version", "type": "string"},
          {"name": "chainId", "type": "uint256"},
          {"name": "verifyingContract", "type": "address"}
      ],
        UpdateMaterialAndDueDiligence: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'materialCompositionHash', type: 'bytes32' },
          { name: 'dueDiligenceHash', type: 'bytes32' },
          { name: 'updater', type: 'address' },
        ],
      };
     
      const message = {
        tokenId: Number(selectedBattery.batteryId),
        materialCompositionHash: web3.utils.keccak256(materialHash),
        dueDiligenceHash: '0x0000000000000000000000000000000000000000000000000000000000000000', // Miners don't update due diligence
        updater: account,
      };
      console.log('EIP-712 signing:', { domain, types, message });
      // Replacer to handle BigInt serialization
      function replacer(key, value) {
        return typeof value === 'bigint' ? value.toString() : value;
      }
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [account, JSON.stringify({ domain, types, primaryType: 'UpdateMaterialAndDueDiligence', message }, replacer)],
      });
      console.log('Signature:', signature);
      console.log('Calling updateMaterialAndDueDiligence with:', {
        tokenId: Number(selectedBattery.batteryId),
        didHash,
        materialCompositionHash: web3.utils.keccak256(materialHash),
        dueDiligenceHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        credentialId,
        signature
      });
      const transactionReceipt = await bpUpdater.methods.updateMaterialAndDueDiligence(
        Number(selectedBattery.batteryId),
        didHash,
        web3.utils.keccak256(materialHash),
        '0x0000000000000000000000000000000000000000000000000000000000000000', // No due diligence for miners
        credentialId.toLowerCase(),
        signature
      ).send({ from: account, gas: 2000000 });

      // 10. Update the backend
      // Get existing material composition hashes from backend
      const existingDataResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${selectedBattery.batteryId}`
      );
      
      let existingMaterialHashes = [];
      if (existingDataResponse.ok) {
        const existingData = await existingDataResponse.json();
        existingMaterialHashes = existingData.materialCompositionHashes || [];
      }
      
      // Add new material hash to the end of the array
      const updatedMaterialHashes = [...existingMaterialHashes, materialHash];
      
      const backendPayload = {
        tokenId: Number(selectedBattery.batteryId),
        materialCompositionHashes: updatedMaterialHashes,
      };
      console.log('Updating backend with:', backendPayload);
      const backendResp = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offchain/updateDataOffChain/${selectedBattery.batteryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materialCompositionHashes: updatedMaterialHashes,
          }),
        }
      );
      console.log('Backend response:', backendResp);

      // Store miner material update in new API
      const minerUpdatePayload = {
        tokenId: selectedBattery.batteryId,
        batteryShortName: dataToUse.battery_chemistry__short_name || selectedBattery.shortName || selectedBattery.batteryType || 'Unknown',
        batteryMaterials: JSON.stringify(dataToUse),
        txHash: transactionReceipt.transactionHash, // Use actual transaction hash from blockchain
        updatedBy: account,
        organizationId: selectedBattery.organizationId || 'default',
        materialCompositionHash: materialHash
      };
      
      const minerUpdateResp = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/miner-material-update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(minerUpdatePayload),
        }
      );
      
      if (minerUpdateResp.ok) {
        console.log('Miner material update stored successfully');
      } else {
        console.error('Failed to store miner material update');
      }

      toast.success('Material composition updated successfully!');
      
      // Reset form
      setMaterialData({});
      setSelectedBattery(null);
      setTokenIdInput('');
      setDataFetched(false);

    } catch (error) {
      console.error('Error updating material composition:', error);
      toast.error('Failed to update material composition: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      {!dataFetched && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg mb-4">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Update Material Composition</h1>
            <p className="mt-2 text-gray-600">
              Update battery material composition data by token ID
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
                value={tokenIdInput}
                onChange={(e) => {
                  setTokenIdInput(e.target.value)
                  setError('')
                }}
                placeholder="Enter Token ID (e.g., 123456)"
                className={`w-full mt-1 px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                  ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
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
              onClick={fetchBatteryByTokenId}
              disabled={loading || !tokenIdInput || !!error}
              className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  <span>Load Battery Data</span>
                </>
              )}
            </button>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Miner Role Limitations</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Miners can only update material composition data. Due diligence and other passport components cannot be modified by this role.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {dataFetched && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Update Material Composition</h1>
            <p className="mt-2 text-gray-600">
              Token ID: {tokenIdInput}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Material Composition Form</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Battery className="w-4 h-4" />
                <span>Battery ID: {selectedBattery?.batteryId}</span>
              </div>
            </div>
            
            <BatteryMaterialComposition 
              updateData={(data) => handleStepComplete(0, data)} 
              data={materialData} 
              loading={loading}
            />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setMaterialData({});
                  setSelectedBattery(null);
                  setTokenIdInput('');
                  setDataFetched(false);
                  setError('');
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Load Another Battery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 