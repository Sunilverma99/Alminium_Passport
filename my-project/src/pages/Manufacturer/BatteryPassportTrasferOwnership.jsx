"use client"

import { useState } from "react"
import { AlertCircle, Battery, Info, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { initializeContractInstance } from "../../contractInstance"

export default function BatteryPassportTransferOwnership() {
  const [inputTokenId, setInputTokenId] = useState("")
  const [newOwnerAddress, setNewOwnerAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateAddress = (address) => {
    // Basic Ethereum address validation (starts with 0x and has 42 characters total)
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleTransferSubmit = async () => {
    try {
      // Reset error state
      setError("")

      // Validate inputs
      if (!inputTokenId) {
        setError("Token ID is required")
        return
      }

      if (!newOwnerAddress) {
        setError("New owner address is required")
        return
      }

      if (!validateAddress(newOwnerAddress)) {
        setError("New owner address is invalid")
        return
      }

      // Check if Metamask is installed
      if (!window.ethereum) {
        toast.error("Metamask is not installed. Please install Metamask and try again.")
        return
      }

      setLoading(true)

      // Initialize contract instance
      const { evContract, account, web3 } = await initializeContractInstance()

      if (!evContract || !account || !web3) {
        setError("Failed to initialize contract. Please ensure Metamask is connected.")
        setLoading(false)
        return
      }

      // Validate that new owner is not the same as current owner
      if (account.toLowerCase() === newOwnerAddress.toLowerCase()) {
        setError("New owner address cannot be the same as your address")
        setLoading(false)
        return
      }

      // Get chain ID
      const chainId = await web3.eth.getChainId()
      if (!chainId) {
        setError("Failed to retrieve chain ID.")
        setLoading(false)
        return
      }

      // Fetch current nonce for signing and contract call
      const nonce = await evContract.methods.nonces(account).call()

      const domainUpdate = {
        name: "EVBatteryPassport",
        version: "1",
        chainId: Number(chainId),
        verifyingContract: evContract.options.address,
      }

      const transferTypedData = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          TransferPassportOwnership: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        },
        domain: domainUpdate,
        primaryType: "TransferPassportOwnership",
        message: {
          from: account, // Using the connected MetaMask account as the current owner
          to: newOwnerAddress,
          tokenId: Number(inputTokenId),
          nonce: Number(nonce),
        },
      }

      // Request user signature
      let signature
      try {
        signature = await window.ethereum.request({
          method: "eth_signTypedData_v4",
          params: [account, JSON.stringify(transferTypedData)],
        })
      } catch (signError) {
        console.error("Error signing data:", signError)
        setError("Failed to sign transaction. User denied the request or Metamask error occurred.")
        setLoading(false)
        return
      }

      // Ensure signature is valid
      if (!signature) {
        setError("Signature is required to proceed with ownership transfer.")
        setLoading(false)
        return
      }

      // Execute ownership transfer on blockchain
      try {
        const receipt = await evContract.methods
          .transferPassportOwnership(account, newOwnerAddress, inputTokenId, signature, nonce)
          .send({ from: account })

        console.log("Transaction Receipt:", receipt)

        toast.success("Ownership transferred successfully!")
        setInputTokenId("")
        setNewOwnerAddress("")
      } catch (contractError) {
        console.error("Error executing contract transaction:", contractError)
        setError("Transaction failed. Ensure you have enough gas and the correct permissions.")
      }
    } catch (error) {
      console.error("Unexpected error in handleTransferSubmit:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
          <Battery className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Battery Passport</h1>
        <p className="mt-2 text-gray-600">Transfer ownership of your battery passport to another address.</p>
      </div>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-6 sm:p-8">
          <div className="max-w-xl mx-auto space-y-6">
            {/* Token ID Input */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
                  Token ID
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-xs text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    Enter the unique identifier of your battery passport
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
                      error && error.includes("Token ID")
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    }
                  `}
                />
              </div>
            </div>

            {/* New Owner Address Input */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                <label htmlFor="newOwnerAddress" className="block text-sm font-medium text-gray-700">
                  New Owner Address
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-xs text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    Enter the address to transfer ownership to
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  id="newOwnerAddress"
                  value={newOwnerAddress}
                  onChange={(e) => {
                    setNewOwnerAddress(e.target.value)
                  }}
                  placeholder="Enter new owner address (0x...)"
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                    ${
                      error && error.includes("New owner")
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    }
                  `}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleTransferSubmit}
              disabled={loading || !inputTokenId || !newOwnerAddress || !!error}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 
                ${
                  loading || !inputTokenId || !newOwnerAddress || error
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-0.5 hover:shadow-lg"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <Battery className="w-5 h-5" />
                  <span>Transfer Ownership</span>
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <p className="flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-400" />
                Transferring ownership will move all rights and access permissions for this battery passport to the new
                owner's address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

