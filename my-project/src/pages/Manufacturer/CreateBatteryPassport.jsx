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
import { apiFetch } from "../../utils/api";

// Utility function to ensure consistent DID and credential formats
const getConsistentFormats = (account, organizationIdString) => {
  // Use the same format as government approval process
  // Normalize address to lowercase to match government approval
  const normalizedAccount = account.toLowerCase();
  const didName = `did:web:${organizationIdString}.com#create-${normalizedAccount}`;
  const credentialId = `cred-${organizationIdString}-${normalizedAccount}`.toLowerCase();
  
  return {
    didName,
    didHash: Web3.utils.keccak256(didName.toLowerCase()),
    credentialId
  };
};

const steps = [
  { name: 'Battery Composition', component: BatteryPassport },
  { name: 'Carbon Footprint', component: BatteryCarbonFootprintForm },
  { name: 'Performance', component: BatteryPerformanceForm },
  { name: 'Circularity', component: BatteryCircularityForm },
  { name: 'Label', component: BatteryLabelForm },
  { name: 'Supply Chain', component: SupplyChainDueDiligenceForm },
  { name: 'General Product', component: BatteryGeneralProductForm },
  { name: 'Auto Generated', component: BatteryAutomaticallyData },
];

export default function ManufacturerHome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
   
  const [batteryData, setBatteryData] = useState({
    composition: {},
    carbonFootprint: {},
    performance: {},
    circularity: {},
    label: {},
    supplyChain: {},
    generalProduct: {},
    BatteryIndentifcationData: {},
  });

  const navigate = useNavigate();

  // Function to check if current step data is valid
  const isCurrentStepValid = () => {
    const currentStepData = batteryData[Object.keys(batteryData)[currentStep]];
    // Check if the current step data exists and has at least one property
    return currentStepData && Object.keys(currentStepData).length > 0;
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

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      toast.error('Please complete all required fields before proceeding');
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
    if (!batteryData || Object.keys(batteryData).length === 0) {
      toast.error("Battery data is missing or invalid.");
      return;
    }

    const results = await Promise.all(
      Object.keys(batteryData).map(async (key) => {
        try {
          const upload = await pinata.upload.json(batteryData[key]);
          if (!upload || !upload.IpfsHash) {
            throw new Error(`No hash returned for ${key}`);
          }

          const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
          return { key, hash: upload.IpfsHash };
        } catch (error) {
          console.error(`Error processing ${key}:`, error);
          return { key, error: error.message };
        }
      })
    );

    const errors = results.filter(res => res.error);
    if (errors.length > 0) {
      toast.error(`Submission failed for: ${errors.map(e => e.key).join(', ')}`);
      return;
    }

    const hashMap = Object.fromEntries(results.map(({ key, hash }) => [key, { hash }]));

    const { qrCodeUrl, batchId, uniqueIdentifier } = batteryData.BatteryIndentifcationData || {};
    if (!qrCodeUrl || !batchId || !uniqueIdentifier) {
      toast.error('Missing required automatically generated data.');
      return;
    }

    const { evContract, account, web3 } = await initializeContractInstance();

    if (!evContract || !account || !web3) {
      toast.error("Failed to initialize contract instance.");
      return;
    }

    // Get the manufacturer's organization ID from the contract
    const organizationId = await evContract.methods.getUserOrganization(account).call();
    
    // Check if organization ID is valid (not zero)
    if (organizationId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      toast.error('You are not assigned to any organization. Please contact your tenant admin.');
      return;
    }
    
    // Get the organization ID string from the backend to construct the correct DID
    let organizationIdString = '';
    try {
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        organizationIdString = data.organizationId;
      } else {
      }
    } catch (error) {
    }
    
    // Use consistent format utility to ensure DID matches government approval
   
    const { didName: manufacturer_did_name, didHash: manufacturerHash, credentialId: credentialIdBytes } = 
      getConsistentFormats(account, organizationIdString);
    // Check if DID is registered and verified
    try {
      const { didManager } = await initializeContractInstance();
      const isDIDRegistered = await didManager.methods.isDIDRegistered(manufacturerHash).call();
      
      if (!isDIDRegistered) {
        toast.error('Your DID is not registered. Please wait for government approval or contact your tenant admin.');
        return;
      }
    } catch (error) {
    }
    
    // Check if credential exists (should have been created during government approval)
    try {
      const { credentialManager } = await initializeContractInstance();
      const credentialExists = await credentialManager.methods.validateVerifiableCredential(credentialIdBytes).call();
      
      if (!credentialExists) {
        toast.error('Credential validation failed. Please ensure government approval is complete.');
        return;
      }
    } catch (credentialError) {
      console.error('Error checking credential:', credentialError);
      toast.error('Failed to validate credential. Please ensure government approval is complete.');
      return;
    }
    
    const nonce = await evContract.methods.nonces(account).call();

    const domain_passport = {
      name: "EVBatteryPassport",
      version: "1",
      chainId: Number(await web3.eth.getChainId()),
      verifyingContract: evContract.options.address
    };

    const passport_typed_data = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        CreatePassport: [
          { name: "uniqueIdentifier", type: "string" },
          { name: "batchId", type: "uint256" },
          { name: "claimedMfgAddress", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      },
      primaryType: "CreatePassport",
      domain: domain_passport,
      message: {
        uniqueIdentifier,
        batchId: Number(batchId),
        claimedMfgAddress: account,
        nonce: Number(nonce),
      },
    };

    if (!window.ethereum) {
      toast.error("Metamask is not installed.");
      return;
    }

    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [account, JSON.stringify(passport_typed_data)],
    });



    console.log('Creating battery passport with parameters:', {
      manufacturerHash,
      uniqueIdentifier,
      batchId,
      qrCodeUrl,
      credentialIdBytes,
      signature: signature.substring(0, 10) + '...',
      account,
      organizationId,
      nonce
    });

    // Create the battery passport
    const tx = await evContract.methods.createBatteryPassport(
      manufacturerHash,
      uniqueIdentifier,
      `urn:uuid:${uniqueIdentifier}`,
      web3.utils.keccak256(hashMap.composition?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      web3.utils.keccak256(hashMap.carbonFootprint?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      web3.utils.keccak256(hashMap.performance?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      web3.utils.keccak256(hashMap.circularity?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      web3.utils.keccak256(hashMap.label?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      web3.utils.keccak256(hashMap.supplyChain?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      web3.utils.keccak256(hashMap.generalProduct?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000'),
      Number(batchId),
      qrCodeUrl,
      credentialIdBytes,
      signature,
      account,
      JSON.stringify(hashMap),
      organizationId,
      Number(nonce)
    ).send({ from: account, gas: 5000000 });

    console.log('Transaction sent:', tx);

        const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
    console.log('Transaction receipt:', receipt);
    
    if (!receipt.status) {
      throw new Error('Transaction failed');
    }

    // Try to find the PassportCreated event
    let event = null;
    
    // Method 1: Check if events exist in receipt.events
    if (receipt.events && receipt.events.PassportCreated) {
      event = receipt.events.PassportCreated;
      console.log('Found event in receipt.events:', event);
    }
    
    // Method 2: If not found, search in logs using the event signature
    if (!event && receipt.logs) {
      console.log('Searching for PassportCreated event in logs...');
      // The event signature for PassportCreated(uint256,string,string,string)
      const eventSignature = web3.utils.keccak256('PassportCreated(uint256,string,string,string)');
      
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`Log ${i}:`, log);
        
        if (log.topics && log.topics[0] === eventSignature) {
          console.log('Found PassportCreated event in logs');
          try {
            // Decode the event - tokenId is indexed (first topic), others are in data
            const decodedLog = web3.eth.abi.decodeLog([
              { type: 'uint256', name: 'tokenId', indexed: true },
              { type: 'string', name: 'uniqueIdentifier' },
              { type: 'string', name: 'qrCodeUrl' },
              { type: 'string', name: 'credentialId' }
            ], log.data, [log.topics[1]]); // topics[0] is event signature, topics[1] is indexed tokenId
            
            event = {
              returnValues: {
                tokenId: decodedLog.tokenId
              }
            };
            console.log('Decoded event:', event);
            break;
          } catch (decodeError) {
            console.error('Error decoding event:', decodeError);
          }
        }
      }
    }

    if (!event) {
      console.error('Transaction receipt details:', {
        status: receipt.status,
        events: receipt.events,
        logs: receipt.logs,
        gasUsed: receipt.gasUsed,
        cumulativeGasUsed: receipt.cumulativeGasUsed
      });
      throw new Error("PassportCreated event not found. Check console for transaction details.");
    }

    // Store off‐chain reference
    const tokenId = event.returnValues.tokenId.toString();
    console.log('Extracted token ID:', tokenId);

    // Store off-chain data
    const offChainData = {
      tokenId: tokenId,
      materialCompositionHashes: [hashMap.composition?.hash || ""],
      carbonFootprintHashes: [hashMap.carbonFootprint?.hash || ""],
      performanceDataHashes: [hashMap.performance?.hash || ""],
      circularityDataHashes: [hashMap.circularity?.hash || ""],
      labelsDataHashes: [hashMap.label?.hash || ""],
      dueDiligenceHashes: [hashMap.supplyChain?.hash || ""],
      generalProductInfoHashes: [hashMap.generalProduct?.hash || ""],
      organizationId: organizationIdString // <-- add this
    };

    const offChainResponse = await apiFetch("/api/offchain/storeDataOffChain", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offChainData),
    });

    if (!offChainResponse.ok) {
      throw new Error('Failed to store data off-chain.');
    }

    // Store manufacturer-battery info
    const batteryType = batteryData.composition?.battery_chemistry__short_name || '';
    const batteryModel = batteryData.composition?.battery_chemistry__clear_name || '';
    const totalCO2 = batteryData.carbonFootprint?.batteryCarbonFootprint || 0;
    const renewableContentPercent = batteryData.generalProduct?.renewable_content_percent || 0;
    const productIdentifier = batteryData.generalProduct?.product_identifier || '';
    const batteryPassportIdentifier = batteryData.generalProduct?.battery_passport_identifier || '';
    const batteryCategory = batteryData.generalProduct?.battery_category || '';
    const batteryStatus = batteryData.generalProduct?.battery_status || '';
    
    // Use the QR code URL from the form data (which should already have the correct token ID)
    const qrCodeUrlValue = batteryData.BatteryIndentifcationData?.qrCodeUrl || `${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/battery-passport/${tokenId}`
    
    const manufacturerBatteryPayload = {
      manufacturerEthereumAddress: account,
      batteryTokenId: tokenId,
      batteryType,
      batteryModel,
      organizationId: organizationIdString,
      totalCO2,
      renewableContentPercent,
      productIdentifier,
      batteryPassportIdentifier,
      batteryCategory,
      batteryStatus,
      qrCodeUrl: qrCodeUrlValue
    };
    
    console.log('Using QR Code URL:', qrCodeUrlValue);
    try {
      const mbRes = await apiFetch('/api/manufacturer-battery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manufacturerBatteryPayload)
      });
      if (!mbRes.ok) {
        const err = await mbRes.json().catch(() => ({}));
        console.error('Failed to store manufacturer-battery info:', err.error || mbRes.statusText);
      }
    } catch (err) {
      console.error('Error calling manufacturer-battery API:', err);
    }

    // Log manufacturer activity
    try {
      const activityPayload = {
        role: 'manufacturer',
        account,
        organizationId: organizationIdString,
        type: 'create_battery_passport',
        details: {
          batteryTokenId: tokenId,
          productIdentifier,
          batteryPassportIdentifier,
          batteryType,
          batteryModel,
          totalCO2,
          renewableContentPercent,
          batteryCategory,
          batteryStatus
        }
      };
      const actRes = await apiFetch('/api/role-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityPayload)
      });
      if (!actRes.ok) {
        const err = await actRes.json().catch(() => ({}));
        console.error('Failed to log manufacturer activity:', err.error || actRes.statusText);
      }
    } catch (err) {
      console.error('Error calling role-activity API:', err);
    }

    toast.success('Battery passport created and data stored successfully!');

    setBatteryData({});
    navigate('/');
    setCurrentStep(0);
    setCompletedSteps(new Set());
  } catch (error) {
    console.error('Error during submission:', error);
    toast.error('Submission failed. See console for details.');
  }
};

  


  

  const getStepStatus = (index) => {
    if (completedSteps.has(index)) return 'complete';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const progressSteps = steps.map((step, index) => ({
    name: step.name,
    status: getStepStatus(index),
  }));

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            Battery Passport
          </h1>

          <div className="mb-12">
            <ProgressIndicator steps={progressSteps} />
          </div>

          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
              {steps[currentStep].name}
            </h2>
            <CurrentStepComponent
              updateData={(data) => handleStepComplete(currentStep, data)}
              data={batteryData[Object.keys(batteryData)[currentStep]]}
            />
          </div>

          <div className="flex justify-between">
            <button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            {currentStep < steps.length - 1 ? (
              <button onClick={handleNext}>
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                variant="default"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

