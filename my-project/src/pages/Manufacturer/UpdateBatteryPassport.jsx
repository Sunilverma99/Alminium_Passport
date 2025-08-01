import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { initializeContractInstance } from '../../contractInstance';
import { ProgressIndicator } from '../../components/progress-indicator';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

import BatteryPassport from '../../components/BatteryMaterialComposition';
import BatteryCarbonFootprintForm from '../../components/BatteryCarbonFootprintForm';
import BatteryPerformanceForm from '../../components/BatteryPerformanceForm';
import BatteryCircularityForm from '../../components/BatteryCircularityForm';
import BatteryLabelForm from '../../components/BatteryLabelForm';
import SupplyChainDueDiligenceForm from '../../components/SupplyChainDueDiligenceForm';
import BatteryGeneralProductForm from '../../components/BatteryGeneralProductForm';
import BatteryAutomaticallyData from '../../components/BatteryAutomaticallyData';
import { pinata } from "../../utils/config";
import { Battery, Info, Loader2, AlertCircle, CloudCog } from "lucide-react"
import { apiFetch } from "../../utils/api";
const steps = [
  { name: 'Battery Composition', component: BatteryPassport },
  { name: 'Carbon Footprint', component: BatteryCarbonFootprintForm },
  { name: 'Performance', component: BatteryPerformanceForm },
  { name: 'Circularity', component: BatteryCircularityForm },
  { name: 'Label', component: BatteryLabelForm },
  { name: 'Supply Chain', component: SupplyChainDueDiligenceForm },
  { name: 'General Product', component: BatteryGeneralProductForm },
];

export default function UpdateBatteryPassport() {
  const [tokenId, setTokenId] = useState("");
  const [inputTokenId, setInputTokenId] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [batteryData, setBatteryData] = useState({
    composition: {},
    carbonFootprint: {},
    performance: {},
    circularity: {},
    label: {},
    supplyChain: {},
    generalProduct: {},
  });
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleTokenSubmit = () => {
    if (!inputTokenId) {
      toast.error("Please enter a valid Token ID.");
      return;
    }
    setTokenId(inputTokenId);
    fetchBatteryData(inputTokenId);
  };

  const handleStepComplete = (stepIndex, data) => {
    if (!data || Object.keys(data).length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setBatteryData((prevData) => ({
      ...prevData,
      [Object.keys(batteryData)[stepIndex]]: data,
    }));
    setCompletedSteps((prevCompleted) => new Set(prevCompleted).add(stepIndex));
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };
  const fetchBatteryData = async (tokenId) => {
    try {
      const { evContract, web3, bpUpdater } = await initializeContractInstance();

      if (!evContract || !web3) {
        toast.error("Failed to initialize contract.");
        return;
      }

      console.log("Fetching data for Token ID:", tokenId);
  
      // Fetch battery passport data from blockchain
      const batteryPassport = await evContract.methods.getBatteryPassport(Number(tokenId)).call();
  
      if (!batteryPassport) {
        toast.error("No data found for this Token ID.");
        return;
      }
  
      console.log("Blockchain Data:", batteryPassport);
  
      // Fetch off-chain data from API
      const offChainResponse = await apiFetch(`/api/offchain/getDataOffChain/${tokenId}`);
  
      if (!offChainResponse.ok) {
        toast.error("Failed to retrieve off-chain data.");
        return;
      }
  
      const offChainData = await offChainResponse.json();
      console.log("Off-chain Data:", offChainData);
  
      // Function to construct correct Pinata URL
      const getIpfsUrl = (cid) => {
        return cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : null;
      };
  
      // Fetch all off-chain data in parallel with correct IPFS URLs
      const fetchedOrbitDbData = await Promise.all(
        Object.entries(offChainData)
          .filter(([key, value]) => Array.isArray(value) && value.length > 0) // Ensure values exist
          .map(async ([key, value]) => {
            try {
              const cid = value[value.length - 1]; // Get last CID (latest)
              if (!cid || typeof cid !== "string") {
                throw new Error(`Invalid CID for ${key}: ${cid}`);
              }
  
              const url = getIpfsUrl(cid);
              const response = await fetch(url);
  
              if (!response.ok) {
                throw new Error(`Failed to fetch IPFS data for ${key}: ${cid}`);
              }
  
              const jsonData = await response.json();
              return { key, data: jsonData };
            } catch (error) {
              console.error(`Error fetching OrbitDB data for ${key}:`, error);
              return { key, data: {} }; // Return empty object in case of error
            }
          })
      );
  
      // Map backend keys to frontend keys
      const backendToFrontendMapping = {
        'materialCompositionHashes': 'composition',
        'carbonFootprintHashes': 'carbonFootprint',
        'performanceDataHashes': 'performance',
        'circularityDataHashes': 'circularity',
        'labelsDataHashes': 'label',
        'dueDiligenceHashes': 'supplyChain',
        'generalProductInfoHashes': 'generalProduct'
      };

      // Map fetched data into batteryData structure
      const fetchedData = fetchedOrbitDbData.reduce((acc, { key, data }) => {
        const frontendKey = backendToFrontendMapping[key];
        console.log(`Mapping backend key "${key}" to frontend key "${frontendKey}"`);
        if (frontendKey) {
          acc[frontendKey] = data;
        } else {
          console.warn(`No frontend mapping found for backend key: ${key}`);
        }
        return acc;
      }, {});
      
      console.log('Fetched data before mapping:', fetchedOrbitDbData.map(({key}) => key));
      console.log('Final fetchedData structure:', fetchedData);
      
      console.log('Final fetchedData structure:', fetchedData);
  
  
      setBatteryData(fetchedData);
      setIsDataFetched(true);
      toast.success("Battery data fetched successfully!");
    } catch (error) {
      console.error("Error fetching battery data:", error);
      toast.error("Failed to fetch battery data.");
    }
  };
  

  const handleNext = () => {
    if (!batteryData[Object.keys(batteryData)[currentStep]]) {
      toast.error("Please complete all required fields before proceeding.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('batteryData structure:', batteryData);
      console.log('batteryData keys:', Object.keys(batteryData));
      
      if (!batteryData || Object.keys(batteryData).length === 0) {
        toast.error("Battery data is missing or invalid.");
        return;
      }

      // Upload data to IPFS
      const results = await Promise.all(
        Object.keys(batteryData).map(async (key) => {
          try {
            console.log(`Uploading data for key: ${key}`, batteryData[key]);
            const upload = await pinata.upload.json(batteryData[key]);
            if (!upload || !upload.IpfsHash) {
              throw new Error(`No hash returned for ${key}`);
            }
            return { key, hash: upload.IpfsHash };
          } catch (error) {
            return { key, error: error.message };
          }
        })
      );

      const errors = results.filter(res => res.error);
      if (errors.length > 0) {
        toast.error(`Upload failed for: ${errors.map(e => e.key).join(', ')}`);
        return;
      }

      // Create hash mapping - handle both frontend and backend keys
      const keyToBackendMapping = {
        // Frontend keys
        'composition': 'materialCompositionHashes',
        'carbonFootprint': 'carbonFootprintHashes',
        'performance': 'performanceDataHashes',
        'circularity': 'circularityDataHashes',
        'label': 'labelsDataHashes',
        'supplyChain': 'dueDiligenceHashes',
        'generalProduct': 'generalProductInfoHashes',
        // Backend keys (direct mapping)
        'materialCompositionHashes': 'materialCompositionHashes',
        'carbonFootprintHashes': 'carbonFootprintHashes',
        'performanceDataHashes': 'performanceDataHashes',
        'circularityDataHashes': 'circularityDataHashes',
        'labelsDataHashes': 'labelsDataHashes',
        'dueDiligenceHashes': 'dueDiligenceHashes',
        'generalProductInfoHashes': 'generalProductInfoHashes'
      };
      
      const hashMap = {};
      results.forEach(({ key, hash }) => {
        const backendKey = keyToBackendMapping[key];
        if (backendKey) {
          hashMap[backendKey] = { hash };
          console.log(`IPFS upload result for ${key} (mapped to ${backendKey}):`, hash);
        } else {
          console.warn(`No backend mapping found for key: ${key}`);
        }
      });
      
      console.log('Final hashMap:', hashMap);

      // Initialize contracts
      const { evContract, account: originalAccount, web3 } = await initializeContractInstance();
      const account = web3.utils.toChecksumAddress(originalAccount);
      if (!evContract || !account || !web3) {
        toast.error("Failed to initialize contract instance.");
        return;
      }

      // Map keys to contract parameter names and convert to keccak256 hashes
      const keyMapping = {
        'materialCompositionHashes': 'materialComposition',
        'carbonFootprintHashes': 'carbonFootprint',
        'performanceDataHashes': 'performanceData',
        'circularityDataHashes': 'circularityData',
        'labelsDataHashes': 'labelsData',
        'dueDiligenceHashes': 'dueDiligence',
        'generalProductInfoHashes': 'generalProductInfo'
      };
      const mappedHashes = {};
      
      console.log('Available keys in hashMap:', Object.keys(hashMap));
      console.log('Key mapping:', keyMapping);
      
      Object.keys(hashMap).forEach(actualKey => {
        const contractParamName = keyMapping[actualKey];
        console.log(`Processing key: ${actualKey}, mapped to: ${contractParamName}`);
        
        if (contractParamName) {
          const ipfsHash = hashMap[actualKey].hash;
          const keccakHash = web3.utils.keccak256(ipfsHash || '');
          mappedHashes[contractParamName] = keccakHash;
          console.log(`Hash mapping for ${actualKey}:`, {
            ipfsHash,
            keccakHash,
            contractParamName
          });
        } else {
          console.warn(`No mapping found for key: ${actualKey}`);
        }
      });
      
      console.log('Final mappedHashes:', mappedHashes);

      // Get user's organization data
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        toast.error("Failed to fetch user organization data. Please ensure you are properly registered.");
        return;
      }
      const data = await response.json();
      if (!data.memberDetails) {
        toast.error("User DID or credential information is missing. Please contact your administrator.");
        return;
      }
      // Fix: get organizationId from the correct place
      const organizationId = data.organizationId || data.memberDetails?.organizationId || '';
      const userDidName = data.memberDetails.didName.toLowerCase();
      const userCredentialId = data.memberDetails.credentialId.toLowerCase();
      const didHash = web3.utils.keccak256(userDidName);

      // Generate signature
      const domain = {
        name: "EVBatteryPassport",
        version: "1",
        chainId: Number(await web3.eth.getChainId()),
        verifyingContract: evContract.options.address,
      };
      const typedData = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          UpdatePassport: [
            { name: "tokenId", type: "uint256" },
            { name: "updater", type: "address" },
          ],
        },
        primaryType: "UpdatePassport",
        domain: domain,
        message: { tokenId: Number(tokenId), updater: account },
      };
      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify(typedData)],
      });

      // Call the updateBatteryPassport function through the updater contract
      const { bpUpdater } = await initializeContractInstance();
      console.log('Updating blockchain with hashes:', mappedHashes);
      
      const blockchainResult = await bpUpdater.methods
        .updateBatteryPassport(
          Number(tokenId),
          didHash,
          mappedHashes.materialComposition,
          mappedHashes.carbonFootprint,
          mappedHashes.performanceData,
          mappedHashes.circularityData,
          mappedHashes.labelsData,
          mappedHashes.dueDiligence,
          mappedHashes.generalProductInfo,
          userCredentialId,
          signature
        )
        .send({ from: account, gas: 2000000 });

      console.log('Blockchain update successful:', blockchainResult);

      // Transaction is mined, blockchainResult is the receipt
      console.log('Transaction mined successfully:', blockchainResult);
      
      // Verify what was stored on-chain
      console.log('Verifying on-chain data...');
      const onChainData = await evContract.methods.getBatteryPassport(Number(tokenId)).call();
      console.log('On-chain material composition hash:', onChainData[2]);
      console.log('Expected material composition hash:', mappedHashes.materialComposition);
      
      // Check if they match
      console.log('Hash match:', onChainData[2] === mappedHashes.materialComposition);
      
      // Also check the original IPFS hash that was used
      console.log('Original IPFS hash used for blockchain:', hashMap.materialCompositionHashes?.hash);

      // Store off-chain data
      const offChainData = {
        materialCompositionHashes: [hashMap.materialCompositionHashes?.hash || ""],
        carbonFootprintHashes: [hashMap.carbonFootprintHashes?.hash || ""],
        performanceDataHashes: [hashMap.performanceDataHashes?.hash || ""],
        circularityDataHashes: [hashMap.circularityDataHashes?.hash || ""],
        labelsDataHashes: [hashMap.labelsDataHashes?.hash || ""],
        dueDiligenceHashes: [hashMap.dueDiligenceHashes?.hash || ""],
        generalProductInfoHashes: [hashMap.generalProductInfoHashes?.hash || ""]
      };
      
      console.log('Off-chain data being sent:', offChainData);
      
      // Log the actual IPFS hashes being stored
      console.log('IPFS hashes being stored in backend:');
      Object.entries(offChainData).forEach(([key, value]) => {
        console.log(`${key}:`, value[0]);
      });
      
      // Verify that the IPFS hash matches what was sent to blockchain
      const blockchainIpfsHash = hashMap.materialCompositionHashes?.hash;
      const backendIpfsHash = offChainData.materialCompositionHashes[0];
      console.log('IPFS hash verification:');
      console.log('  Blockchain IPFS hash:', blockchainIpfsHash);
      console.log('  Backend IPFS hash:', backendIpfsHash);
      console.log('  Match:', blockchainIpfsHash === backendIpfsHash);
      
      console.log('Storing off-chain data:', offChainData);
      
      const offChainResponse = await apiFetch(`/api/offchain/updateDataOffChain/${tokenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offChainData),
      });
      
      if (!offChainResponse.ok) {
        const errorText = await offChainResponse.text();
        console.error('Off-chain update failed:', errorText);
        throw new Error(`Off-chain update failed: ${errorText}`);
      }
      
      console.log('Off-chain update successful');

      toast.success('Battery passport updated successfully!');

      // Log the update to BatteryUpdateLog
      const updateLogPayload = {
        batteryTokenId: tokenId,
        batteryType: batteryData.composition?.battery_chemistry__short_name || '',
        batteryModel: batteryData.composition?.battery_chemistry__clear_name || '',
        organizationId,
        totalCO2: batteryData.carbonFootprint?.batteryCarbonFootprint || 0,
        batteryCategory: batteryData.generalProduct?.battery_category || '',
        qrCodeUrl: batteryData.BatteryIndentifcationData?.qrCodeUrl || '',
        batteryPassportUrl: `/battery-passport/${tokenId}`,
        updatedBy: account,
        previousValues: {}, // Optionally fetch and include previous values if you have them
        updateReason: 'User updated battery passport via dashboard'
      };
      try {
        await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/battery-update-log/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateLogPayload)
        });
      } catch (err) {
        console.error('Failed to log battery update:', err);
      }

      // Log the activity in RoleActivity
      const activityPayload = {
        role: 'manufacturer',
        account,
        organizationId,
        type: 'update_battery',
        details: updateLogPayload,
        batteryId: tokenId
      };
      try {
        await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/role-activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityPayload)
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
      }

      setBatteryData({});
      setTokenId('');
      setInputTokenId('');
    } catch (error) {
      console.error('Error updating battery passport:', error);
      toast.error(`Failed to update battery passport: ${error.message}`);
    }
  };

  const checkUserAuthorization = async (tokenId) => {
    try {
      const { evContract, didManager, credentialManager, signatureManager, account, web3, bpUpdater } = await initializeContractInstance();
      
      if (!evContract || !account || !web3) {
        toast.error("Failed to initialize contract instance.");
        return;
      }

      console.log("Checking user authorization for token:", tokenId);

      // Check token existence
      const tokenExists = await evContract.methods.exists(Number(tokenId)).call();
      if (!tokenExists) {
        setError("Token ID does not exist. Please check the token ID.");
        return;
      }

      // Get user's organization data from backend
      let userDidName = '';
      let userCredentialId = '';
      
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Organization data for authorization check:', data);
          
          if (data.memberDetails) {
            userDidName = data.memberDetails.didName.toLowerCase();
            userCredentialId = data.memberDetails.credentialId;
            console.log('Using DID from organization (lowercase):', userDidName);
            console.log('Using credential ID from organization:', userCredentialId);
          } else {
            throw new Error('No member details found');
          }
        } else {
          throw new Error(`Failed to fetch organization data: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        setError("Failed to fetch user organization data. Please ensure you are properly registered.");
        return;
      }

      if (!userDidName || !userCredentialId) {
        setError("User DID or credential information is missing. Please contact your administrator.");
        return;
      }

      // Generate DID hash
      const didHash = web3.utils.keccak256(userDidName);
      console.log('DID Hash for validation:', didHash);

      // Check DID registration and validation
      try {
        const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
        console.log("DID registered:", isDIDRegistered);
        
        if (!isDIDRegistered) {
          setError("Your DID is not registered. Please wait for government approval.");
          return;
        }

        // Get DID details to check verification and roles
        const didDetails = await didManager.methods.getDID(didHash).call();
        console.log("DID details:", didDetails);
        
        if (!didDetails.isVerified) {
          setError("Your DID is not verified. Please wait for government verification.");
          return;
        }

        // Check if DID has MANUFACTURER role
        const hasManufacturerRole = await didManager.methods.validateDIDRole(
          didHash, 
          'MANUFACTURER', 
          4, 
          account
        ).call();
        
        console.log("Has MANUFACTURER role:", hasManufacturerRole);
        if (!hasManufacturerRole) {
          setError("Your DID does not have MANUFACTURER role with sufficient trust level.");
          return;
        }
      } catch (error) {
        console.error("Error checking DID:", error);
        setError("Failed to validate DID. Please ensure government approval is complete.");
        return;
      }

      // Check credential validation
      try {
        const credentialValid = await credentialManager.methods.validateVerifiableCredential(userCredentialId).call();
        console.log("Credential valid:", credentialValid);
        
        if (!credentialValid) {
          setError("Credential validation failed. Please ensure government approval is complete.");
          return;
        }
      } catch (error) {
        console.error("Error checking credential:", error);
        setError("Failed to validate credential. Please ensure government approval is complete.");
        return;
      }

      // Check signature manager roles
      try {
        const manufacturerRole = await signatureManager.methods.MANUFACTURER_ROLE().call();
        const hasSignatureRole = await signatureManager.methods.hasRole(manufacturerRole, account).call();
        console.log("Has signature role:", hasSignatureRole);
        
        if (!hasSignatureRole) {
          setError("You don't have the required role in SignatureManager. Please contact government.");
          return;
        }
      } catch (error) {
        console.error("Error checking signature role:", error);
        setError("Failed to verify signature permissions.");
        return;
      }

      // All checks passed
      console.log("All authorization checks passed!");
      setError(null);
      toast.success("Authorization check passed! You can now update the battery passport.");
      
    } catch (error) {
      console.error("Error during authorization check:", error);
      setError(`Authorization check failed: ${error.message}`);
    }
  };


  const CurrentStepComponent = steps[currentStep].component;

  if (!tokenId) {
    return (<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
                 <Battery className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-3xl font-bold text-gray-900">Battery Passport </h1>
               <p className="mt-2 text-gray-600">
                 View detailed information about your battery&apos;s specifications and Update the battery passport.
               </p>
             </div>
             <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8">
          <div className="max-w-xl mx-auto space-y-6">
              <div className="relative">
                <div className="flex justify-between mb-2">
                  <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
                    Token ID
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-xs text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      Enter the unique identifier of your battery passport to fetch the data
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="tokenId"
                    value={inputTokenId}
                    onChange={(e) => {
                      setInputTokenId(e.target.value)
                    }}
                    placeholder="Enter Token ID (e.g., 123456)"
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                      ${
                        error
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      }
                    `}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleTokenSubmit}
                disabled={loading || !inputTokenId || !!error}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 
                  ${
                    loading || !inputTokenId || error
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-0.5 hover:shadow-lg"
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Fetching Passport...</span>
                  </>
                ) : (
                  <>
                    <Battery className="w-5 h-5" />
                    <span>Get Battery Passport</span>
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <p className="flex items-center">
                  <Info className="w-4 h-4 mr-2 text-gray-400" />
                  The battery passport contains detailed information about your battery&apos;s specifications, history,
                  and sustainability metrics.
                </p>
              </div>
            </div>
          </div>
          </div>
          </div>
    );
  }

  if(!isDataFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0.6))]"></div>

        <div className="relative">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-75 blur-sm animate-pulse"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-full p-3">
                <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
              Fetching Battery Data
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
              Please wait while we retrieve the latest information
            </p>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full animate-progress"></div>
            </div>

            <div className="text-sm text-slate-400 dark:text-slate-500">This may take a few moments...</div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">Battery Passport</h1>

          <ProgressIndicator steps={steps.map((step, index) => ({ name: step.name, status: completedSteps.has(index) ? "complete" : index === currentStep ? "current" : "upcoming" }))} />

          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">{steps[currentStep].name}</h2>
            <CurrentStepComponent updateData={(data) => handleStepComplete(currentStep, data)} data={batteryData[Object.keys(batteryData)[currentStep]]} />
          </div>

          <div className="flex justify-between">
            <button onClick={handlePrevious} disabled={currentStep === 0}>Previous</button>
            <button onClick={currentStep < steps.length - 1 ? handleNext : handleSubmit}>{currentStep < steps.length - 1 ? "Next" : "Update"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
