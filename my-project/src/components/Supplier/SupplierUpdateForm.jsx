import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { initializeContractInstance } from '../../contractInstance';
import { apiFetch } from '../../utils/api';
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
  CloudCog
} from 'lucide-react';
import BatteryMaterialComposition from '../BatteryMaterialComposition';
import SupplyChainDueDiligenceForm from '../SupplyChainDueDiligenceForm';
import { pinata } from '../../utils/config';

const SupplierUpdateForm = ({ battery, onUpdate, onClose, prefillData = {}, MaterialComponent = BatteryMaterialComposition, DueDiligenceComponent = SupplyChainDueDiligenceForm }) => {
  console.log('SupplierUpdateForm received prefillData:', prefillData);
  const [materialData, setMaterialData] = useState(prefillData.material || {});
  const [dueDiligenceData, setDueDiligenceData] = useState(prefillData.dueDiligence || {});
  
  console.log('Initialized with materialData:', materialData);
  console.log('Initialized with dueDiligenceData:', dueDiligenceData);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    { name: 'Material Composition', component: MaterialComponent },
    { name: 'Due Diligence', component: DueDiligenceComponent }
  ];

  const handleStepComplete = (stepIndex, data) => {
    if (!data || Object.keys(data).length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (stepIndex === 0) {
      setMaterialData(data);
    } else if (stepIndex === 1) {
      setDueDiligenceData(data);
    }

    setCompletedSteps((prevCompleted) => new Set(prevCompleted).add(stepIndex));
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const effectiveShortName = materialData.battery_chemistry__short_name || battery.shortName || battery.batteryType || '';
    if (!effectiveShortName || !effectiveShortName.trim()) {
      toast.error('Short Name is required');
      return;
    }
    setLoading(true);
    try {
      // 1. Upload to Pinata
      console.log('Uploading to Pinata:', { materialData, dueDiligenceData });
      const materialRes = await pinata.upload.json(materialData);
      console.log('Material upload result:', materialRes);
      const dueDiligenceRes = await pinata.upload.json(dueDiligenceData);
      console.log('Due Diligence upload result:', dueDiligenceRes);
      const materialHash = materialRes.IpfsHash;
      console.log('Material hash:', materialHash);
      const dueDiligenceHash = dueDiligenceRes.IpfsHash;
      console.log('Due Diligence hash:', dueDiligenceHash);
      console.log('Pinata upload results:', { materialHash, dueDiligenceHash });

      // 3. Update blockchain
      const { bpUpdater, evContract, didManager, credentialManager, account, web3 } = await initializeContractInstance();
      console.log('Contract instance:', { bpUpdater, evContract, didManager, credentialManager, account });

      // Try to get userCredentials from localStorage
      let didName, credentialId;
      let foundInLocal = false;
      try {
        const userCredentialsRaw = localStorage.getItem('userCredentials');
        if (userCredentialsRaw) {
          const userCredentials = JSON.parse(userCredentialsRaw);
          // userCredentials may be an array or object keyed by address
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
        // Use the same endpoint as manufacturer pages for consistency
        const userResponse = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`);
        if (!userResponse.ok) {
          toast.error('Failed to fetch user credential data');
          setLoading(false);
          return;
        }
        
        const userData = await userResponse.json();
        if (userData.memberDetails) {
          didName = userData.memberDetails.didName.toLowerCase();
          credentialId = userData.memberDetails.credentialId;
          console.log('Fetched userCredentials from organization endpoint:', { didName, credentialId });
        } else {
          toast.error('No member details found. Please ensure you are properly registered.');
          setLoading(false);
          return;
        }
      }
      const didHash = web3.utils.sha3(didName.toLowerCase());
      console.log('DID info:', { didName, didHash, credentialId });

      // Debug: Check if token exists
      const tokenExists = await evContract.methods.exists(Number(battery.batteryId)).call();
      console.log('Token exists:', tokenExists);
      if (!tokenExists) {
        toast.error('Token ID does not exist on-chain.');
        setLoading(false);
        return;
      }

      // Debug: Check credential validity
      console.log('Validating credential with ID:', credentialId);
      
      const credentialValid = await credentialManager.methods.validateVerifiableCredential(credentialId.toLowerCase()).call();
      console.log('Credential valid:', credentialValid);
      if (!credentialValid) {
        toast.error('Credential is not valid or expired.');
        setLoading(false);
        return;
      }

      // Debug: Check on-chain credential validity only (details fetch removed)
      const credentialValidOnChain = await credentialManager.methods.validateVerifiableCredential(credentialId).call();
      console.log('On-chain Credential Valid:', credentialValidOnChain);

      // Debug: Check DID role
      const didRoleValid = await didManager.methods.validateDIDRole(didHash, 'SUPPLIER', 3, account).call();
      console.log('DID has SUPPLIER role:', didRoleValid);
      if (!didRoleValid) {
        toast.error('DID does not have SUPPLIER role with trust level 3.');
        setLoading(false);
        return;
      }

      // Debug: Check on-chain DID details
      const didDetails = await didManager.methods.getDID(didHash).call();
      console.log('On-chain DID Details:', {
        uri: didDetails.uri,
        publicKey: didDetails.publicKey,
        trustLevel: didDetails.trustLevel,
        isVerified: didDetails.isVerified,
        roles: didDetails.roles
      });
      console.log('DID publicKey matches account:', didDetails.publicKey.toLowerCase() === account.toLowerCase());

      // Debug: Check on-chain credential details
      // const credentialDetails = await credentialManager.methods.getCredential(credentialId).call();
      // console.log('On-chain Credential Details:', {
      //   id: credentialDetails.id,
      //   subject: credentialDetails.subject,
      //   issuer: credentialDetails.issuer,
      //   issuedAt: credentialDetails.issuedAt,
      //   expiresAt: credentialDetails.expiresAt,
      //   isSigned: credentialDetails.isSigned
      // });

   
      // Create signature for updateMaterialAndDueDiligence
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
        tokenId: Number(battery.batteryId),
        materialCompositionHash: web3.utils.keccak256(materialHash),
        dueDiligenceHash: web3.utils.keccak256(dueDiligenceHash),
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
        tokenId: Number(battery.batteryId),
        didHash,
        materialCompositionHash: web3.utils.keccak256(materialHash),
        dueDiligenceHash: web3.utils.keccak256(dueDiligenceHash),
        credentialId,
        signature
      });
      await bpUpdater.methods.updateMaterialAndDueDiligence(
        Number(battery.batteryId),
        didHash,
        web3.utils.keccak256(materialHash),
        web3.utils.keccak256(dueDiligenceHash),
        credentialId.toLowerCase(),
        signature
      ).send({ from: account, gas: 2000000 });

      // Now update the backend
      const backendPayload = {
        tokenId: Number(battery.batteryId),
        materialCompositionHashes: [materialHash],
        dueDiligenceHashes: [dueDiligenceHash],
      };
      console.log('Updating backend with:', backendPayload);
      const backendResp = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offchain/updateDataOffChain/${battery.batteryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materialCompositionHashes: [materialHash],
            dueDiligenceHashes: [dueDiligenceHash],
          }),
        }
      );
      console.log('Backend response:', backendResp);

      // Store supplier battery update in new API
      const supplierUpdatePayload = {
        tokenId: Number(battery.batteryId),
        shortName: effectiveShortName.trim(),
        batteryMaterial: JSON.stringify(materialData),
        supplyChainDueDiligenceReport: JSON.stringify(dueDiligenceData),
        supplyChainIndicesScore: dueDiligenceData?.indicesScore || null,
        updatedBy: account,
      };
      const supplierUpdateResp = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/supplier-battery-update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierUpdatePayload),
        }
      );
      if (supplierUpdateResp.ok) {
        console.log('Supplier battery update stored successfully');
      } else {
        console.error('Failed to store supplier battery update');
      }

      // Log activity for the supplier
      try {
        const activityPayload = {
          role: 'supplier',
          account: account,
          organizationId: battery.organizationId || 'default',
          type: 'MATERIAL_UPDATE',
          details: `Updated material composition and due diligence for battery ${battery.batteryId}`,
          batteryId: battery.batteryId,
        };
        const activityResp = await apiFetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/role-activity`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityPayload),
          }
        );
        if (activityResp.ok) {
          console.log('Activity logged successfully');
        } else {
          console.error('Failed to log activity');
        }
      } catch (activityError) {
        console.error('Error logging activity:', activityError);
      }

      toast.success('Battery updated successfully!');
      onUpdate();
    } catch (err) {
      console.error('Error updating battery:', err);
      toast.error('Failed to update battery');
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">Supplier Material Update</h1>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    completedSteps.has(index) 
                      ? 'bg-green-600 text-white' 
                      : index === currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {completedSteps.has(index) ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    completedSteps.has(index) 
                      ? 'text-green-600' 
                      : index === currentStep 
                        ? 'text-blue-600' 
                        : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      completedSteps.has(index) ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">{steps[currentStep].name}</h2>
            <CurrentStepComponent 
              updateData={(data) => handleStepComplete(currentStep, data)} 
              data={currentStep === 0 ? materialData : dueDiligenceData} 
            />
          </div>

          <div className="flex justify-between">
            <button 
              onClick={handlePrevious} 
              disabled={currentStep === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={currentStep < steps.length - 1 ? handleNext : handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Processing...
                </>
              ) : currentStep < steps.length - 1 ? "Next" : "Update Battery"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierUpdateForm; 