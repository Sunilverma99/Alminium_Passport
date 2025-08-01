import { useState } from "react";
import { initializeContractInstance } from '../../contractInstance';
import Web3 from "web3";
import { toast, Toaster } from "react-hot-toast";
import { AlertCircle, CheckCircle2, ShieldCheck, Info, ArrowRight } from "lucide-react"
export default function CheckDIDVerification() {
  const [address, setAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(null);
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
      const verificationStatus = await didManager.methods.isVerified(`did:web:marklytics.com#create-${address}`).call();
      if (verificationStatus) {
        toast.success("DID is verified.");
        setIsVerified(true);
      } else {
        toast.error("DID is not verified.");
        setIsVerified(false);
      }
    } catch (error) {
      console.error("Error checking DID verification:", error);
      toast.error("Failed to check DID verification. Please try again.");
    }
    
    setAddress("");
  };

  return (
    <div className="  p-4 md:p-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-[1fr,380px]">
        {/* Info Section */}
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">DID Verification System</h1>
            <p className="text-gray-500">Verify Decentralized Identifiers (DIDs) associated with Ethereum addresses.</p>
          </div>

          <div className="grid gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Info className="h-5 w-5 text-green-600" />
                What is a DID?
              </div>
              <p className="text-sm text-gray-500">
                A Decentralized Identifier (DID) is a new type of identifier that enables verifiable, decentralized
                digital identity. DIDs are fully under the control of the DID subject.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-3">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Why Verify?
              </div>
              <p className="text-sm text-gray-500">
                Verification ensures the authenticity of DIDs and their association with Ethereum addresses, providing a
                trusted foundation for decentralized identity management.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Check DID Verification</h2>
            <p className="text-sm text-gray-500">Enter an Ethereum address to verify its DID status</p>
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
                className={`w-full px-4 py-2 border rounded-lg  ${
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

            {isVerified !== null && (
              <div
                className={`p-4 rounded-lg flex items-start gap-2 ${
                  isVerified ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
              >
                {isVerified ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                <div>
                  <p className="font-semibold">{isVerified ? "Verified" : "Not Verified"}</p>
                  <p className="text-sm mt-1">
                    {isVerified
                      ? `The DID for address ${address} is verified.`
                      : `The DID for address ${address} is not verified.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => validateEthereumAddress(address) && setShowConfirmation(true)}
            disabled={!address || !!error}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium
              flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            Verify DID
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirm Verification Check</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to check the verification status for this DID?
              <code className="block mt-2 p-2 bg-gray-100 rounded text-sm font-mono">{address}</code>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
