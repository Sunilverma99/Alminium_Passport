import React, { useState } from 'react';
import { initializeContractInstance } from '../../contractInstance';
import { ArrowRight, Shield, RefreshCw } from "lucide-react"
function UpdateStatus() {
  const [tokenId, setTokenId] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Mapping from status string to uint8 value
  const statusMapping = {
    Manufactured: 0,
    InUse: 1,
    Recycled: 2,
    Retired: 3,
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { evContract, didManager, credentialManager, signatureManager, account, web3 } = await initializeContractInstance();
  
    // Generate Government DID
    const governmentDidName = `did:web:example.com#government-${account}`;
    const governmentDidHash = web3.utils.sha3(governmentDidName);
  
    // Check if the DID is registered
    const isDidRegistered = await didManager.methods.isDIDRegistered(governmentDidHash).call();
    if (!isDidRegistered) {
      await didManager.methods.registerDID(
        governmentDidHash,
        governmentDidName,
        account,
        5,
        [],
        ["GOVERNMENT"]
      ).send({ from: account });
  
      await didManager.methods.verifyGaiaXDID(governmentDidHash, true).send({ from: account });
    }
  
    // Convert human-readable status to uint8
    const blockchainStatus = statusMapping[newStatus];
  
    const domainPassport = {
      name: "EVBatteryPassport",
      version: "1",
      chainId: Number(await web3.eth.getChainId()), // 🔥 Convert BigInt to Number
      verifyingContract: evContract.options.address,
    };
  
    const updateTypedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        UpdateBatteryStatus: [
          { name: "tokenId", type: "uint256" },
          { name: "newStatus", type: "uint8" },
          { name: "updater", type: "address" },
        ],
      },
      primaryType: "UpdateBatteryStatus",
      domain: domainPassport,
      message: {
        tokenId: Number(tokenId),
        newStatus: blockchainStatus, 
        updater: account,
      },
    };
  
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [account, JSON.stringify(updateTypedData)],
    });
  
    const { bpUpdater } = await initializeContractInstance();
    await bpUpdater.methods.updateBatteryStatus(tokenId, governmentDidHash, blockchainStatus, signature).send({ from: account });
  };
  
  return (
    <div className=" p-24  flex flex-col">
      {/* Header */}
      {/* <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">TokenGuard</span>
          </div>
          <nav>
            <a href="#" className="text-gray-600 hover:text-green-600 transition duration-150 ease-in-out">
              Dashboard
            </a>
          </nav>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left Column - Form */}
            <div className="md:w-1/2 px-6 py-8 md:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Update Token Status</h2>
              <p className="text-gray-600 mb-8">
                Use this form to update the status of your token. Ensure all information is accurate before submitting.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-1">
                    Token ID
                  </label>
                  <input
                    id="tokenId"
                    type="text"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter token ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 outline-none"
                    required
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="Manufactured">Manufactured</option>
                    <option value="InUse">In Use</option>
                    <option value="Recycled">Recycled</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>


                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center"
                >
                  Update Token
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Right Column - Illustration and Info */}
            <div className="md:w-1/2 bg-green-50 px-6 py-8 md:px-8 lg:px-12 flex flex-col justify-center">
              <div className="mb-8 flex justify-center">
                <RefreshCw className="h-32 w-32 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Update Token Status?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ensure accurate tracking throughout the token lifecycle</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Maintain compliance with regulatory requirements</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Facilitate efficient management of token inventory</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">&copy; 2023 TokenGuard. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-500 hover:text-green-600 transition duration-150 ease-in-out">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-green-600 transition duration-150 ease-in-out">
              Terms of Service
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default UpdateStatus;
