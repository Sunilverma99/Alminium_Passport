import React from 'react'
import { useState } from 'react'
import { Battery, Info, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/api'
function MaterialCompostion() {
    const[tokenId, setTokenId] = useState("");
    const[inputTokenId, setInputTokenId] = useState("");
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState("");
    const[materialComposition, setMaterialComposition] = useState("");
    const[isDataFetched, setIsDataFetched] = useState(false);

    const handleTokenSubmit = () => {
        if (!inputTokenId) {
          toast.error("Please enter a valid Token ID.");
          return;
        }
        setTokenId(inputTokenId);
        fetchBatteryData(inputTokenId);
      };


      const fetchBatteryData = async (tokenId) => {
        try {
          const { evContract, web3 } = await initializeContractInstance();

          if (!evContract || !web3) {
            toast.error("Failed to initialize contract.");
            return;
          }
    
          console.log("Fetching data for Token ID:", tokenId);
      
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
                  const cid = value[0]; // Get first CID
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
      
          // Map fetched data into batteryData structure
          const fetchedData = fetchedOrbitDbData.reduce((acc, { key, data }) => {
            acc[key] = data;
            return acc;
          }, {});
          setBatteryData(fetchedData);
          setIsDataFetched(true);
          toast.success("Battery data fetched successfully!");
        } catch (error) {
          console.error("Error fetching battery data:", error);
          toast.error("Failed to fetch battery data.");
        }
      };
     if(!tokenId) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
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
    
  }
  return (
    <div>
      done
    </div>
  )
}

export default MaterialCompostion
