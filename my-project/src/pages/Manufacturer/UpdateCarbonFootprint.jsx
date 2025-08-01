import React from 'react'
import BatteryCarbonFootprintForm from '../../components/BatteryCarbonFootprintForm'
import { useState } from 'react'
import { Battery ,Info,Loader2} from 'lucide-react'
import toast from "react-hot-toast";
import { initializeContractInstance } from '../../contractInstance';
import { pinata } from "../../utils/config";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

function UpdateCarbonFootprint() {
      const[tokenId, setTokenId] = useState('');
      const [inputTokenId, setInputTokenId] = useState("");
      const [isDataFetched, setIsDataFetched] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");
      const [carbonFootprintData,setCarbonFootprintData]=useState("");
      const [fetchedData,setFetchedData]=useState("");
      const navigate = useNavigate();
        const handleTokenSubmit = async () => {
            if (!inputTokenId) {
                toast.error("Please enter a valid Token ID.");
                return;
              }
              setTokenId(inputTokenId);
              fetchBatteryData(inputTokenId);
        };
        const fetchBatteryData = async (tokenId) => {
            try {
              const { evContract, web3 ,account} = await initializeContractInstance();

              if (!evContract || !web3) {
                toast.error("Failed to initialize contract.");
                return;
              }
          
              console.log("Fetching data for Token ID:", tokenId);
          
              // Fetch battery passport data from blockchain
              const batteryPassport = await evContract.methods.getPassport(tokenId).call();
          
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
          
              // Ensure carbonFootprintHashes exists and has values
              if (!offChainData.carbonFootprintHashes || offChainData.carbonFootprintHashes.length === 0) {
                toast.error("No carbon footprint data available.");
                return;
              }
          
              // Get the last carbon footprint CID
              const carbonFootprintCid = offChainData.carbonFootprintHashes[offChainData.carbonFootprintHashes.length - 1];
          
              // Construct correct Pinata URL
              const fetchedDatafromPinata = carbonFootprintCid ? `https://gateway.pinata.cloud/ipfs/${carbonFootprintCid}` : null;
          
              if (!fetchedDatafromPinata) {
                toast.error("Invalid CID for carbon footprint data.");
                return;
              }
          
              // Fetch the actual data from Pinata
              const ipfsResponse = await fetch(fetchedDatafromPinata);
          
              if (!ipfsResponse.ok) {
                toast.error("Failed to fetch data from IPFS.");
                return;
              }
          
              const ipfsData = await ipfsResponse.json();
              console.log("IPFS Data:", ipfsData);
          
              setFetchedData(ipfsData); // Store fetched JSON data
              setCarbonFootprintData(ipfsData);
              setIsDataFetched(true);
              toast.success("Battery data fetched successfully!");
            } catch (error) {
              console.error("Error fetching battery data:", error);
              toast.error("Failed to fetch battery data.");
            }
          };
          
          const handleSubmit = async (data) => {
              setLoading(true);
              try {
                  // Initialize contract
                  const { evContract, web3,account } = await initializeContractInstance();
                  if (!evContract || !web3) {
                      toast.error("Failed to initialize contract.");
                      return;
                  }

                  // Fetch DID and credentialId and organizationId from backend (move to top)
                  let didName, credentialId, orgData, organizationId;
                  try {
                    const orgRes = await apiFetch(`/api/organization/member/${account}`);
                    if (!orgRes.ok) {
                      toast.error("Failed to fetch DID and credentialId from backend.");
                      return;
                    }
                    orgData = await orgRes.json();
                    didName = orgData.memberDetails?.didName;
                    credentialId = orgData.memberDetails?.credentialId;
                    organizationId = orgData.organizationId || orgData.memberDetails?.organizationId || '';
                    if (!didName || !credentialId) {
                      toast.error("DID or credentialId missing in backend response.");
                      return;
                    }
                  } catch (err) {
                    toast.error("Error fetching DID/credentialId from backend.");
                    return;
                  }

                  if (!data) {
                      toast.error("Invalid data provided.");
                      return;
                  }
          
                  console.log("Uploading data to IPFS...");
                  const upload = await pinata.upload.json(data);
          
                  if (!upload || !upload.IpfsHash) {
                      toast.error("Failed to upload carbon footprint data to IPFS.");
                      return;
                  }
          
                  const ipfsCID = upload.IpfsHash; // This is a string
                  console.log("Uploaded to IPFS, CID:", ipfsCID);
          
                  if (!account) {
                      toast.error("User account not found. Ensure you're connected to Metamask.");
                      return;
                  }
          
                  // Convert the IPFS CID to a bytes32 hash (SHA3)
                  const carbonFootprintHash = web3.utils.keccak256(ipfsCID);
                  console.log("Converted Carbon Footprint Hash (bytes32):", carbonFootprintHash);
          
                  if (!tokenId) {
                      toast.error("Token ID is missing.");
                      return;
                  }
          
                  const chainId = await web3.eth.getChainId();
                  if (!chainId) {
                      toast.error("Failed to retrieve chain ID.");
                      return;
                  }

                  const manufacturerHash = web3.utils.keccak256(didName.toLowerCase());

                  const updateCarbonFootprintTypedData = {
                      types: {
                          EIP712Domain: [
                              { name: "name", type: "string" },
                              { name: "version", type: "string" },
                              { name: "chainId", type: "uint256" },
                              { name: "verifyingContract", type: "address" }
                          ],
                          UpdateCarbonFootprint: [
                              { name: "tokenId", type: "uint256" },
                              { name: "carbonFootprintHash", type: "bytes32" },
                              { name: "updater", type: "address" }
                          ]
                      },
                      primaryType: "UpdateCarbonFootprint",
                      domain: {
                          name: "EVBatteryPassport",
                          version: "1",
                          chainId: Number(chainId),
                          verifyingContract: evContract.options.address,
                      },
                      message: {
                          tokenId: tokenId,
                          carbonFootprintHash: carbonFootprintHash, // Now a bytes32 hash
                          updater: account,
                      }
                  };
          
                  console.log("Signing transaction with Metamask...");
                  const signature = await window.ethereum.request({
                      method: "eth_signTypedData_v4",
                      params: [account, JSON.stringify(updateCarbonFootprintTypedData)],
                  });
          
                  if (!signature) {
                      toast.error("Signature failed.");
                      return;
                  }
          
                  console.log("Signature:", signature);
          
                  // Call smart contract function through the updater contract
                  console.log("Updating blockchain...");
                  const { bpUpdater } = await initializeContractInstance();
                  let updateOnBlockchain;
                  try {
                    updateOnBlockchain = await bpUpdater.methods
                      .updateCarbonFootprint(tokenId, manufacturerHash, carbonFootprintHash, credentialId, signature, 1)
                      .send({ from: account, gas: 1500000 });
                  } catch (err) {
                    console.error("Blockchain update failed:", err);
                    toast.error("Blockchain update failed: " + (err?.message || err));
                    setLoading(false);
                    return;
                  }
                  if (!updateOnBlockchain.status) {
                    toast.error("Blockchain update failed (status false).");
                    setLoading(false);
                    return;
                  }
                  console.log("Blockchain update successful:", updateOnBlockchain);

                  // Update off-chain database
                  console.log("Updating off-chain data...");
                  let offChainResponse;
                  try {
                    offChainResponse = await apiFetch(`/api/offchain/updateDataOffChain/${tokenId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ carbonFootprintHashes: [ipfsCID] }),
                    });
                  } catch (err) {
                    console.error("Off-chain update failed:", err);
                    toast.error("Off-chain update failed: " + (err?.message || err));
                    setLoading(false);
                    return;
                  }
                  if (!offChainResponse.ok) {
                    const errorText = await offChainResponse.text();
                    console.error("Off-chain update failed:", errorText);
                    toast.error("Off-chain update failed: " + errorText);
                    setLoading(false);
                    return;
                  }
                  console.log("Off-chain data updated successfully.");
                  toast.success("Carbon footprint data updated successfully!");

                  // Log the update to CarbonFootprintUpdateLog
                  const logPayload = {
                    batteryTokenId: tokenId,
                    newCarbonFootprint: data.batteryCarbonFootprint, // or the correct field from your form
                    previousCarbonFootprint: fetchedData?.batteryCarbonFootprint || null,
                    updatedBy: account,
                    organizationId,
                    updateReason: 'User updated carbon footprint via dashboard'
                  };
                  try {
                    await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/carbon-footprint-update-log/`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(logPayload)
                    });
                  } catch (err) {
                    console.error('Failed to log carbon footprint update:', err);
                  }
                  // Log the activity in RoleActivity
                  const activityPayload = {
                    role: 'manufacturer',
                    account,
                    organizationId,
                    type: 'update_carbon_footprint',
                    details: logPayload,
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
                  navigate('/');
              } catch (error) {
                  console.error("Error updating carbon footprint data:", error);
                  toast.error("Failed to update carbon footprint data.");
              } finally {
                  setLoading(false);
                  setCarbonFootprintData("");
              }
          };
          
        

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
    <div className='min-h-screen bg-gray-100 p-0 sm:p-12'>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <span className="text-lg text-gray-700">Updating carbon footprint...</span>
        </div>
      ) : (
        <BatteryCarbonFootprintForm updateData={handleSubmit} data={carbonFootprintData} />
      )}
    </div>
  )
}

export default UpdateCarbonFootprint
