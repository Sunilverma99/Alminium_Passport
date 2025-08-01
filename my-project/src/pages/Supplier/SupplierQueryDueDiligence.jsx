"use client"

import { useState } from "react"
import { Search, Loader2, FileText, AlertCircle, CheckCircle, CloudCog } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { initializeContractInstance } from "../../contractInstance"
import { apiFetch } from "../../utils/api"
import DueDiligenceDataDisplay from "../../components/DueDiligenceDataDisplay"

const SupplierQueryDueDiligence = () => {
  const [tokenId, setTokenId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const fetchFromPinata = async (ipfsHash) => {
    if (!ipfsHash) return null
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      const res = await fetch(url)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setResult(null)
    setError("")

    if (!tokenId) {
      toast.error("Please enter a Token ID")
      return
    }

    setLoading(true)
    try {
      // 1. Initialize contracts + Web3
      const { bpQueries, evContract, didManager, credentialManager, account, web3 } = await initializeContractInstance()

      // 2. Fetch user DID info (unchanged)
      const userResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(account)}`,
      )

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user credential data from backend")
      }

      const userData = await userResponse.json()
      if (!userData.user?.didName || !userData.user?.credentialId) {
        throw new Error("No valid user credentials found. Please ensure you are properly registered.")
      }

      const didName = userData.user.didName.toLowerCase()
      const credentialId = userData.user.credentialId

      // 3. Validate verifiable credential (unchanged)
      const credentialValid = await credentialManager.methods
        .validateVerifiableCredential(credentialId.toLowerCase())
        .call()

      if (!credentialValid) {
        throw new Error("Credential is not valid or expired.")
      }

      // 4. Compute didHash
      const didHash = web3.utils.keccak256(didName)
      const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call()

      if (!isDIDRegistered) {
        throw new Error("DID is not registered. Please wait for government approval.")
      }

      const didDetails = await didManager.methods.getDID(didHash).call()
      if (!didDetails.isVerified) {
        throw new Error("DID is not verified. Please wait for government verification.")
      }

      if (didDetails.publicKey.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Public key mismatch. DID was registered with a different account.")
      }

      // Check if user has SUPPLIER role with sufficient trust level
      const hasSupplierRole = didDetails.roles.some((role) => role.toUpperCase() === "SUPPLIER")

      if (!hasSupplierRole || didDetails.trustLevel < 3) {
        throw new Error(
          `Insufficient permissions. User has roles: ${didDetails.roles.join(", ")}, trust level: ${didDetails.trustLevel}. Required: SUPPLIER role with trust level >= 3.`,
        )
      }

      // 5. Build the EIP-712 domain **exactly** as your Core contract did
      const domain = {
        name: "EVBatteryPassport",
        version: "1",
        chainId: Number(await web3.eth.getChainId()),
        verifyingContract: evContract.options.address,
      }

      // 6. Declare types to match `QueryDueDiligence(uint256 tokenId,address requester)`
      const types = {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        QueryDueDiligence: [
          { name: "tokenId", type: "uint256" },
          { name: "requester", type: "address" },
        ],
      }

      // 7. Prepare the message with the exact field names
      const message = {
        tokenId: Number(tokenId),
        requester: account,
      }

      // 8. Ask MetaMask (or other) to sign the typed data
      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [
          account,
          JSON.stringify({
            domain,
            types,
            primaryType: "QueryDueDiligence",
            message,
          }),
        ],
      })

      const userOrg = await evContract.methods.getUserOrganization(account).call()
      const passportData = await evContract.methods.getBatteryPassport(Number(tokenId)).call()

      if (!passportData.exists) {
        throw new Error(`Battery passport with token ID ${tokenId} does not exist.`)
      }

      if (userOrg !== passportData.organizationId) {
        // This might be okay if the user has GOVERNMENT role, but let's check
        const hasGovRole = await didManager.methods.validateDIDRole(didHash, "GOVERNMENT", 5, account).call()

        if (!hasGovRole) {
          throw new Error(
            "Not authorized for this organization's passport. User and passport must belong to the same organization.",
          )
        }
      }

      // 10. Finally call your on-chain query
      const hashOnChain = await bpQueries.methods
        .queryDueDiligence(Number(tokenId), didHash, signature)
        .call({ from: account })

      if (!hashOnChain || /^0x0+$/.test(hashOnChain)) {
        throw new Error("No due diligence hash found on-chain.")
      }

      // 10. Fetch backend + Pinata and compare (unchanged)
      const backendResp = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenId}`)

      if (!backendResp.ok) throw new Error("Failed to fetch data from backend")

      const backendData = await backendResp.json()
      const backendHash = backendData?.dueDiligenceHashes?.[backendData?.dueDiligenceHashes?.length - 1]
      const finalHash = web3.utils.keccak256(backendHash)

      if (!backendHash) throw new Error("No due diligence hash found in backend")
      if (finalHash !== hashOnChain) {
        throw new Error("Hash mismatch between blockchain and backend")
      }

      const pinataData = await fetchFromPinata(backendHash)
      if (!pinataData) throw new Error("Failed to fetch data from Pinata")

      setResult(pinataData)
      toast.success("Due diligence data loaded successfully!")
    } catch (err) {
      setError(err.message || "Failed to fetch data")
      toast.error(err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      {!result && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Query Due Diligence</h1>
            <p className="mt-2 text-gray-600">
              Search for battery due diligence data by token ID
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 max-w-xl mx-auto space-y-6">
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
                Token ID
              </label>
              <input
                id="tokenId"
                type="text"
                value={tokenId}
                onChange={(e) => {
                  setTokenId(e.target.value)
                  setError('')
                }}
                placeholder="Enter Token ID (e.g., 123456)"
                className={`w-full mt-1 px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                  ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'}`}
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !tokenId || !!error}
              className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  <span>Search Due Diligence</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Due Diligence Data</h1>
            <p className="mt-2 text-gray-600">
              Token ID: {tokenId}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Due Diligence Details</h2>
            </div>
            <DueDiligenceDataDisplay data={result} tokenId={tokenId} />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setResult(null)
                  setError('')
                  setTokenId('')
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Search Another Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierQueryDueDiligence
