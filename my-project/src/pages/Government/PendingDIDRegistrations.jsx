import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { initializeContractInstance } from "../../contractInstance"
import { apiFetch } from "../../utils/api"
import { Check, Shield, ChevronDown, ChevronUp } from "lucide-react"

// Pagination constants
const PAGE_SIZE = 20

export default function PendingDIDRegistrations() {
  const [pendingDIDs, setPendingDIDs] = useState([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedOrgs, setExpandedOrgs] = useState({})

  // Fetch paginated pending DID registrations
  useEffect(() => {
    async function fetchPending() {
      setPendingLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pending-did?page=${page}&limit=${PAGE_SIZE}`)
        const data = await res.json()
        setPendingDIDs(data.entries || [])
        setTotal(data.total || 0)
        // Expand all orgs by default
        const orgs = (data.entries || []).reduce((acc, entry) => {
          acc[entry.organizationId] = true
          return acc
        }, {})
        setExpandedOrgs(orgs)
      } catch (err) {
        setPendingDIDs([])
        setTotal(0)
      }
      setPendingLoading(false)
    }
    fetchPending()
  }, [page])

  // Group DIDs by organization
  const groupedByOrg = pendingDIDs.reduce((acc, entry) => {
    if (!acc[entry.organizationId]) acc[entry.organizationId] = []
    acc[entry.organizationId].push(entry)
    return acc
  }, {})

  // Approve a pending DID registration (same as in GovernmentHome)
  async function approveDID(entry) {
    const { userAddress, role, organizationId, _id } = entry
    try {
      setLoading(true)
      setCurrentStep(1)
      const { didManager, credentialManager, signatureManager, account, web3 } = await initializeContractInstance()
      const [signer] = await window.ethereum.request({ method: "eth_requestAccounts" })
      const normalizedOrgId = organizationId.toLowerCase()
      const normalizedUserAddress = userAddress.toLowerCase()
      const did_name = `did:web:${normalizedOrgId}.com#create-${normalizedUserAddress}`
      const didHash = web3.utils.keccak256(did_name)
      const trustLevels = {
        MANUFACTURER: 4,
        SUPPLIER: 3,
        MINER: 2,
        RECYCLER: 3,
        TENANT_ADMIN: 5,
        GOVERNMENT: 5,
      }
      const trustLevel = trustLevels[role.toUpperCase()] || 3
      let isRegistered = false
      try {
        isRegistered = await didManager.methods.isDIDRegistered(didHash).call()
      } catch (e) {}
      if (!isRegistered) {
        await didManager.methods
          .registerDID(didHash, did_name, userAddress.toLowerCase(), trustLevel, [], [role])
          .send({ from: signer })
        setCurrentStep(2)
      }
      await didManager.methods.verifyGaiaXDID(didHash, true).send({ from: signer })
      setCurrentStep(3)
      try {
        const signatureManagerRole = await signatureManager.methods[`${role.toUpperCase()}_ROLE`]().call()
        await signatureManager.methods.grantRole(signatureManagerRole, userAddress).send({ from: signer, gas: 1000000 })
      } catch (error) {
        toast.error("Failed to grant role in SignatureManager.")
        setLoading(false)
        return
      }
      const credential_id = `cred-${normalizedOrgId}-${normalizedUserAddress}`.toLowerCase()
      const latestBlock = await web3.eth.getBlock("latest")
      const issued_at = Number(latestBlock.timestamp)
      const expires_at = Number(issued_at + 12 * 30 * 24 * 60 * 60)
      const credential_data = JSON.stringify({
        userAddress,
        organizationId: organizationId.toLowerCase(),
        role,
        assignedBy: signer,
      })
      const isVerified = await didManager.methods.isVerified(did_name).call()
      if (!isVerified) {
        toast.error("DID is not verified. Cannot issue credential.")
        setLoading(false)
        return
      }
      try {
        await credentialManager.methods
          .issueVerifiableCredential(
            credential_id,
            did_name,
            credential_data,
            expires_at,
            ["https://www.w3.org/2018/credentials/v2"],
            ["VerifiableCredential"],
            "EcdsaSecp256k1Signature2020",
            `did:ethr:${signer}`,
          )
          .send({ from: signer, gas: 1000000 })
        setCurrentStep(4)
      } catch (error) {
        toast.error("Failed to issue credential: " + error.message)
        setLoading(false)
        return
      }
      const issued_atRetrieved = Number(await credentialManager.methods.getIssuedTimestamp(credential_id).call())
      let signature
      try {
        const domain = {
          name: "CredentialManager",
          version: "1",
          chainId: Number(await web3.eth.getChainId()),
          verifyingContract: credentialManager.options.address,
        }
        const types = {
          Credential: [
            { name: "id", type: "string" },
            { name: "issuer", type: "address" },
            { name: "subject", type: "string" },
            { name: "data", type: "string" },
            { name: "issuedAt", type: "uint256" },
            { name: "expiresAt", type: "uint256" },
          ],
        }
        const value = {
          id: credential_id,
          issuer: signer,
          subject: did_name,
          data: credential_data,
          issuedAt: issued_atRetrieved,
          expiresAt: expires_at,
        }
        const rawSignature = await window.ethereum.request({
          method: "eth_signTypedData_v4",
          params: [
            signer,
            JSON.stringify({
              types: {
                EIP712Domain: [
                  { name: "name", type: "string" },
                  { name: "version", type: "string" },
                  { name: "chainId", type: "uint256" },
                  { name: "verifyingContract", type: "address" },
                ],
                ...types,
              },
              primaryType: "Credential",
              domain,
              message: value,
            }),
          ],
        })
        signature = rawSignature
        if (signature.length !== 132) {
          throw new Error(`Invalid signature length: ${signature.length}. Expected 132 characters (65 bytes)`)
        }
        setCurrentStep(5)
      } catch (signError) {
        toast.error("Failed to sign credential: " + signError.message)
        setLoading(false)
        return
      }
      try {
        await credentialManager.methods.signCredential(credential_id, signature).send({ from: signer })
        setCurrentStep(6)
      } catch (signTxError) {
        toast.error("Failed to sign credential on-chain: " + signTxError.message)
        setLoading(false)
        return
      }
      try {
        const isCredentialValid = await credentialManager.methods.validateVerifiableCredential(credential_id).call()
        if (!isCredentialValid) {
          toast.error("Credential is not valid after signing!")
          setLoading(false)
          return
        }
        setCurrentStep(7)
      } catch (verifyError) {
        toast.error("Error verifying credential after signing: " + verifyError.message)
        setLoading(false)
        return
      }
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pending-did/${_id}/approve`, { method: "PATCH" })
      try {
        const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ethereumAddress: userAddress,
            didName: did_name,
            credentialId: credential_id,
            role: role,
            organizationId: organizationId,
          }),
        })
        if (response.ok) {
          toast.success("DID registration approved, role granted, credential issued, and user created in database!")
        } else {
          toast.error("DID approved but failed to create user in database")
        }
      } catch (userError) {
        toast.error("DID approved but failed to create user in database")
      }
      setPendingDIDs(pendingDIDs.filter((e) => e._id !== _id))
    } catch (err) {
      toast.error("Failed to approve DID registration: " + err.message)
    } finally {
      setLoading(false)
      setTimeout(() => {
        setCurrentStep(0)
      }, 3000)
    }
  }

  // Pagination controls
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Accordion toggle
  const toggleOrg = (orgId) => {
    setExpandedOrgs((prev) => ({ ...prev, [orgId]: !prev[orgId] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 mt-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Pending DID Registrations</h2>
                <p className="text-indigo-100">Review and approve pending decentralized identity registrations, grouped by organization</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                {total} Pending
              </div>
            </div>
          </div>
          <div className="p-8">
            {pendingLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <span className="text-lg text-gray-600 font-medium">Loading registrations...</span>
                </div>
              </div>
            ) : Object.keys(groupedByOrg).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No pending registrations</h3>
                <p className="text-gray-500 text-lg">All DID registrations have been processed.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByOrg).map(([orgId, entries]) => (
                  <div key={orgId} className="border border-gray-200 rounded-xl shadow-md">
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl focus:outline-none"
                      onClick={() => toggleOrg(orgId)}
                    >
                      <span className="text-lg font-bold text-blue-900">{orgId}</span>
                      {expandedOrgs[orgId] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {expandedOrgs[orgId] && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User Address</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {entries.map((entry, index) => (
                              <tr key={entry._id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                      <span className="text-white text-sm font-bold">{entry.userAddress.slice(2, 4).toUpperCase()}</span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded-lg font-medium">{entry.userAddress.slice(0, 6)}...{entry.userAddress.slice(-4)}</div>
                                      <div className="text-xs text-gray-500 mt-1 font-medium">Ethereum Address</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">{entry.role}</span>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end space-x-3">
                                    <button
                                      onClick={() => approveDID(entry)}
                                      disabled={loading}
                                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      Approve
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 