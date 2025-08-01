import { useState } from "react";
import { initializeContractInstance } from '../../contractInstance';
import Web3 from "web3";
import { toast, Toaster } from "react-hot-toast"
import { AlertCircle, ShieldOff, AlertTriangle, XCircle, Info } from "lucide-react"

export default function RevokeCredential() {
  const [address, setAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [isRevoked, setIsRevoked] = useState(false);
  const web3= new Web3();
  const validateEthereumAddress = (inputAddress) => {
    if (!web3.utils.isAddress(inputAddress)) {
      setError("Invalid Ethereum address.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async() => {
 const { evContract, didManager, credentialManager, signatureManager, account, web3 } = await initializeContractInstance();
    if (!validateEthereumAddress(address)) return; 
    setShowConfirmation(false);
    try {
        await credentialManager.methods.revokeCredential(`cred-${address}`).send({ from: account });
    toast.success("Credential revoked successfully.");
    setIsRevoked(true);
    } catch (error) {
        console.error("Error revoking credential:", error);
        toast.error("Failed to revoke credential. Please try again.");
        setIsRevoked(false);
    }
    
    setAddress("");
  };

  return (
    <div className="  p-4 md:p-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-[1fr,380px]">
        {/* Info Section */}
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Credential Revocation</h1>
            <p className="text-gray-500">Safely revoke credentials associated with Ethereum addresses.</p>
          </div>

          <div className="grid gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Important Notice
              </div>
              <p className="text-sm text-gray-500">
                Revoking credentials is a permanent action. Once revoked, the credentials cannot be restored without
                going through the entire issuance process again.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Info className="h-5 w-5 text-red-600" />
                What happens after revocation?
              </div>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600 mt-2"></div>
                  <span>The credential will immediately become invalid</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600 mt-2"></div>
                  <span>All associated permissions will be removed</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600 mt-2"></div>
                  <span>The action will be recorded on the blockchain</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Revocation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldOff className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">Revoke Credentials</h2>
            </div>
            <p className="text-sm text-gray-500">Enter the Ethereum address to revoke its credentials</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  validateEthereumAddress(e.target.value)
                }}
                className={`w-full px-4 py-2  rounded-lg  border ${
                  error ? "border-red-500" : "border-gray-200"
                }`}
              />
              {error && (
                <div className="bg-red-50 text-red-600 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            {isRevoked && (
              <div className="bg-red-50 text-red-600 rounded-lg p-4 flex items-start gap-2">
                <XCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Credentials Revoked</p>
                  <p className="text-sm mt-1">The credentials for address {address} have been successfully revoked.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => validateEthereumAddress(address) && setShowConfirmation(true)}
              disabled={!address || !!error}
              className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium
                flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              Revoke Credentials
              <ShieldOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Credential Revocation</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                You are about to revoke credentials for:
                <code className="block mt-2 p-2 bg-gray-100 rounded text-sm font-mono">{address}</code>
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">
                  This action cannot be undone. The credentials will be permanently revoked.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
