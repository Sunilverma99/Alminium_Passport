"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast, Toaster } from "react-hot-toast"
import {
  Recycle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Battery,
  Info,
  Save,
  History,
} from "lucide-react"
import { initializeContractInstance } from "../../contractInstance"
import { apiFetch } from "../../utils/api"

const RecyclerUpdateLifecycleStatus = () => {
  const [tokenId, setTokenId] = useState("")
  const [lifecycleStatus, setLifecycleStatus] = useState("0")
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [updateHistory, setUpdateHistory] = useState([])
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [backendActivities, setBackendActivities] = useState([])
  const [userAddress, setUserAddress] = useState("")

  const lifecycleStatuses = [
    { value: "0", label: "Original", description: "Battery in its original manufactured state", color: "slate" },
    { value: "1", label: "Repurposed", description: "Battery modified for a different use case", color: "blue" },
    { value: "2", label: "Reused", description: "Battery reused in its original application", color: "emerald" },
    { value: "3", label: "Remanufactured", description: "Battery rebuilt to original specifications", color: "amber" },
    { value: "4", label: "Waste", description: "Battery ready for final disposal/recycling", color: "red" },
  ]

  const getStatusColor = (status) => {
    const statusObj = lifecycleStatuses.find((s) => s.value === status.toString())
    const color = statusObj?.color || "slate"

    const colorMap = {
      slate: "bg-slate-100 text-slate-700 border-slate-200",
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
      amber: "bg-amber-100 text-amber-700 border-amber-200",
      red: "bg-red-100 text-red-700 border-red-200",
    }

    return colorMap[color]
  }

  // Fetch recycler activities from backend
  const fetchRecyclerActivities = async (address) => {
    try {
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/role-activity/recycler/${address}`)
      if (response.ok) {
        const data = await response.json()
        setBackendActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching recycler activities:', error)
    }
  }

  // Get user address and fetch activities
  const initializeUserAndActivities = async () => {
    try {
      const { account } = await initializeContractInstance()
      setUserAddress(account)
      if (account) {
        await fetchRecyclerActivities(account)
      }
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }

  // Initialize on component mount
  useEffect(() => {
    initializeUserAndActivities()
  }, [])

  const checkCurrentStatus = async () => {
    if (!tokenId) {
      toast.error("Please enter a Token ID")
      return
    }

    setLoading(true)
    try {
      console.log("=== CHECKING CURRENT STATUS DEBUG ===")
      const { evContract, bpQueries, account, web3 ,bpUpdater} = await initializeContractInstance()

      const tokenIdNumber = Number(tokenId)
      const tokenExists = await bpQueries.methods.exists(tokenIdNumber).call()
      console.log("Token exists:", tokenExists)

      if (!tokenExists) {
        throw new Error("Token ID does not exist")
      }

      console.log("Token existence check passed")

      console.log("=== LIFECYCLE STATUS CHECK ===")
      const passportId = web3.eth.abi.encodeParameter("uint256", tokenIdNumber)
      console.log("Passport ID:", passportId)
      console.log("Calling getLifecycleStatus on contract:", evContract.options.address)

      let currentLifecycleStatus
      try {
        currentLifecycleStatus = await evContract.methods.getLifecycleStatus(passportId).call()
        console.log("Status from main contract:", currentLifecycleStatus)
      } catch (error) {
        console.log("Main contract method failed, trying queries contract...")
        try {
          currentLifecycleStatus = await bpQueries.methods.getLifecycleStatus(passportId).call()
          console.log("Status from queries contract:", currentLifecycleStatus)
        } catch (error2) {
          console.log("Queries contract method failed, trying updater contract...")
          currentLifecycleStatus = await bpUpdater.methods.getLifecycleStatus(passportId).call()
          console.log("Status from updater contract:", currentLifecycleStatus)
        }
      }

      const statusIndex = Number(currentLifecycleStatus)
      console.log("Status index for array lookup:", statusIndex)

      setCurrentStatus({
        tokenId,
        lifecycleStatus: statusIndex,
        statusName: lifecycleStatuses[statusIndex]?.label || "Unknown",
      })

      toast.success("Current status retrieved successfully!")
    } catch (error) {
      console.error("=== STATUS CHECK ERROR ===", error)
      toast.error(error.message || "Failed to check current status")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLifecycleStatus = async () => {
    if (!tokenId || lifecycleStatus === "") {
      toast.error("Please enter Token ID and select lifecycle status")
      return
    }

    setLoading(true)
    try {
      console.log("=== STARTING LIFECYCLE UPDATE DEBUG ===")
      const { evContract, bpUpdater, bpQueries, signatureManager, account, web3 } = await initializeContractInstance()

      console.log("Account:", account)
      console.log("Core Contract:", evContract.options.address)
      console.log("Updater Contract:", bpUpdater.options.address)

      setDebugInfo({
        account,
        coreContract: evContract.options.address,
        updaterContract: bpUpdater.options.address,
        queriesContract: bpQueries.options.address,
        signatureManager: signatureManager.options.address,
        timestamp: new Date().toLocaleString(),
      })

      const RECYCLER_ROLE = web3.utils.keccak256("RECYCLER_ROLE")
      const isRecycler = await signatureManager.methods.hasRole(RECYCLER_ROLE, account).call()

      if (!isRecycler) {
        toast.error("Your account does not have the RECYCLER_ROLE. Please contact an admin.")
        setLoading(false)
        return
      }

      const tokenIdNumber = Number(tokenId)
      const passportId = web3.eth.abi.encodeParameter("uint256", tokenIdNumber)
      const nonce = await evContract.methods.nonces(account).call()
      const nonceNumber = Number(nonce)

      const isUpdater = await evContract.methods.isAuthorizedLifecycleUpdater(passportId, account).call()
      if (!isUpdater) {
        throw new Error("Account not authorized to update this passport")
      }

      const domain = {
        name: "EVBatteryPassport",
        version: "1",
        chainId: Number(await web3.eth.getChainId()),
        verifyingContract: evContract.options.address,
      }

      const types = {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        LifecycleStatusUpdate: [
          { name: "passportId", type: "bytes32" },
          { name: "newStatus", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      }

      const lifecycleStatusNumber = Number(lifecycleStatus)
      if (lifecycleStatusNumber < 0 || lifecycleStatusNumber > 4) {
        throw new Error("Lifecycle status must be between 0 and 4")
      }

      const message = { passportId, newStatus: lifecycleStatusNumber, nonce: nonceNumber }
      const typedData = { domain, types, primaryType: "LifecycleStatusUpdate", message }

      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify(typedData)],
      })

      const result = await bpUpdater.methods
        .updateLifecycleStatus(passportId, lifecycleStatusNumber, signature, nonceNumber)
        .send({ from: account })

      // Store lifecycle update in backend
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/lifecycle-status-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: tokenId.toString(),
            updatedBy: account,
            fromStatus: currentStatus?.lifecycleStatus ?? null,
            toStatus: lifecycleStatusNumber,
            txHash: result?.transactionHash || '',
          })
        })
      } catch (err) {
        console.error('Failed to store lifecycle update in backend:', err)
      }

      // Log recycler activity
      try {
        const activityPayload = {
          role: 'recycler',
          account: account,
          organizationId: 'default', // You can update this if you have organization info
          type: 'LIFECYCLE_UPDATE',
          details: `Updated lifecycle status from ${lifecycleStatuses[currentStatus?.lifecycleStatus]?.label || 'Unknown'} to ${lifecycleStatuses[lifecycleStatusNumber]?.label} for battery ${tokenId}`,
          batteryId: tokenId.toString(),
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
          console.log('Recycler activity logged successfully');
          // Refresh activities from backend
          await fetchRecyclerActivities(account);
        } else {
          console.error('Failed to log recycler activity');
        }
      } catch (activityError) {
        console.error('Error logging recycler activity:', activityError);
      }

      toast.success("Lifecycle status updated successfully!")

       setUpdateHistory((prev) => [
         {
           tokenId,
           oldStatus: currentStatus?.lifecycleStatus ?? "Unknown",
           newStatus: lifecycleStatus,
           statusName: lifecycleStatuses[lifecycleStatus]?.label ?? "Unknown",
           timestamp: new Date().toLocaleString(),
           status: "Success",
         },
         ...prev.slice(0, 9),
       ])

       setCurrentStatus({
         tokenId,
         lifecycleStatus: Number(lifecycleStatus),
         statusName: lifecycleStatuses[lifecycleStatus]?.label ?? "Unknown",
       })

       // Auto-refresh status from blockchain after 3 seconds (silent)
       setTimeout(async () => {
         try {
           const passportId = web3.eth.abi.encodeParameter("uint256", Number(tokenId))
           let refreshedStatus
           try {
             refreshedStatus = await evContract.methods.getLifecycleStatus(passportId).call()
           } catch (error) {
             try {
               refreshedStatus = await bpQueries.methods.getLifecycleStatus(passportId).call()
             } catch (error2) {
               refreshedStatus = await bpUpdater.methods.getLifecycleStatus(passportId).call()
             }
           }
           const statusIndex = Number(refreshedStatus)
           setCurrentStatus({
             tokenId,
             lifecycleStatus: statusIndex,
             statusName: lifecycleStatuses[statusIndex]?.label || "Unknown",
           })
           // Removed the success toast here to avoid duplicate notifications
         } catch (error) {
           console.error("Failed to refresh status:", error)
           // Only show error toast if refresh fails
           toast.error("Status updated but refresh failed")
         }
       }, 3000)
    } catch (error) {
      console.error("=== ERROR DETAILS ===", error)
      toast.error(error.message || "Failed to update lifecycle status")

      setUpdateHistory((prev) => [
        {
          tokenId,
          oldStatus: currentStatus?.lifecycleStatus ?? "Unknown",
          newStatus: lifecycleStatus,
          statusName: lifecycleStatuses[lifecycleStatus]?.label ?? "Unknown",
          timestamp: new Date().toLocaleString(),
          status: "Failed",
          error: error.message,
        },
        ...prev.slice(0, 9),
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
         <div className="min-h-screen bg-green-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg border border-green-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Recycle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Lifecycle Status Management</h1>
                <p className="text-green-100 mt-1">Update and track battery lifecycle status for recycling operations</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Step 1: Check Current Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-semibold text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-green-900">Check Current Status</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Enter a battery Token ID to view its current lifecycle status.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Battery Token ID</label>
                    <input
                      type="number"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      placeholder="Enter battery token ID"
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>

                  <button
                    onClick={checkCurrentStatus}
                    disabled={loading || !tokenId}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />}
                    Check Status
                  </button>

                  {currentStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(currentStatus.lifecycleStatus)}`}
                          >
                            {currentStatus.statusName}
                          </span>
                          <span className="text-sm text-gray-600">Token ID: {currentStatus.tokenId}</span>
                        </div>
                        <button
                          onClick={checkCurrentStatus}
                          disabled={loading}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                        >
                          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Update Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-semibold text-sm">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-green-900">Update Lifecycle Status</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Select a new lifecycle status and submit the update for this battery.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Lifecycle Status</label>
                    <select
                      value={lifecycleStatus}
                      onChange={(e) => setLifecycleStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                      disabled={!tokenId || !currentStatus}
                    >
                      {lifecycleStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label} - {status.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateLifecycleStatus}
                    disabled={loading || !tokenId || !currentStatus}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Submit Status Update
                  </button>
                </div>
              </div>
            </div>

            {/* Debug Information */}
            {showDebug && debugInfo && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden lg:col-span-2">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                  <h3 className="text-lg font-semibold text-green-900">Debug Information</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <strong className="text-gray-700">Account:</strong>
                      </div>
                      <div className="font-mono text-xs bg-green-50 p-2 rounded-lg break-all border border-green-200">{debugInfo.account}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <strong className="text-gray-700">Core Contract:</strong>
                      </div>
                      <div className="font-mono text-xs bg-green-50 p-2 rounded-lg break-all border border-green-200">
                        {debugInfo.coreContract}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <strong className="text-gray-700">Updater Contract:</strong>
                      </div>
                      <div className="font-mono text-xs bg-green-50 p-2 rounded-lg break-all border border-green-200">
                        {debugInfo.updaterContract}
                      </div>
                    </div>
                    <div>
                      <strong className="text-gray-700">Last Updated:</strong> {debugInfo.timestamp}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700">
                      💡 Check the browser console for detailed debugging information
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Updates - Full Width */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-green-700" />
                  <h3 className="text-lg font-semibold text-green-900">Recent Updates</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Backend Activities */}
                  {backendActivities.map((activity, index) => (
                    <motion.div
                      key={`backend-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border bg-green-50 border-green-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{activity.type}</p>
                          <p className="text-xs text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Backend</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {activity.details}
                      </div>
                      {activity.batteryId && (
                        <div className="mt-2 text-xs text-gray-500">
                          Battery ID: {activity.batteryId}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Local Update History */}
                  {updateHistory.map((update, index) => (
                    <motion.div
                      key={`local-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (backendActivities.length + index) * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        update.status === "Success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Token ID: {update.tokenId}</p>
                          <p className="text-xs text-gray-600">{update.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {update.status === "Success" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              update.status === "Success" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {update.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Status Change:</span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(update.oldStatus)}`}
                        >
                          {lifecycleStatuses[update.oldStatus]?.label || "Unknown"}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(update.newStatus)}`}
                        >
                          {update.statusName}
                        </span>
                      </div>

                      {update.error && (
                        <div className="mt-2 p-2 bg-red-100 rounded-lg">
                          <p className="text-xs text-red-700">{update.error}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {backendActivities.length === 0 && updateHistory.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-600 text-sm">No updates yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default RecyclerUpdateLifecycleStatus
