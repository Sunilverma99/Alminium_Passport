import { useState } from "react";
import { initializeContractInstance } from '../../contractInstance';
import Web3 from "web3";
import { toast, Toaster } from "react-hot-toast"
import { Shield, CheckCircle, XCircle, ChevronRight } from "lucide-react"

export default function VerifyCredential() {
  const [address, setAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(null);
  const web3 = new Web3();

  const validateEthereumAddress = (inputAddress) => {
    if (!web3.utils.isAddress(inputAddress)) {
      setError("Invalid Ethereum address.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    const { evContract, didManager, credentialManager, signatureManager, account, web3 } = await initializeContractInstance();
    if (!validateEthereumAddress(address)) return;
    setShowConfirmation(false);
    try {
      const credentialStatus = await credentialManager.methods.validateVerifiableCredential(`cred-${address}`).call( );
      if (credentialStatus) {
        toast.success("Credential is valid.");
        setIsValid(true);
      } else {
        toast.error("Credential is invalid or revoked.");
        setIsValid(false);
      }
    } catch (error) {
      console.error("Error verifying credential:", error);
      toast.error("Failed to verify credential. Please try again.");
    }
    
    setAddress("");
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-24">
    <div className="max-w-4xl mx-auto">
      {/* Header */}

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h2 className="text-xl font-semibold text-white">Verify The Credentials</h2>
          <p className="text-indigo-100 mt-2">
            Enter the Ethereum address to verify the credentials on the blockchain
          </p>
        </div>

        {/* Card Content */}
        <div className="p-8">
          <div className="space-y-6">
            <div className="relative">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Ethereum Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  validateEthereumAddress(e.target.value)
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors
                  ${
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                  }
                `}
              />
              {error && (
                <div className="flex items-center mt-2 text-red-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {address && !error && (
                <div className="flex items-center mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <p className="text-sm">Valid Ethereum address</p>
                </div>
              )}
            </div>

            <button
              onClick={() => validateEthereumAddress(address) && setShowConfirmation(true)}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-white font-medium transition-all duration-300
                ${
                  !address || error
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5"
                }
              `}
              disabled={!address || !!error}
            >
              <span>Verify Credentials</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">Why verify?</h3>
            <p className="text-sm text-indigo-700">
              Verification ensures the authenticity of your credentials on the blockchain, making them tamper-proof
              and easily verifiable by third parties.
            </p>
          </div>
        </div>
      </div>

   

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Verification</h2>
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-indigo-900 mb-2">Verifying credentials for:</p>
              <p className="font-mono text-sm bg-white p-2 rounded border border-indigo-100 break-all">{address}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition duration-300"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}