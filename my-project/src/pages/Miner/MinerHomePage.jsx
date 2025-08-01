"use client"

import { useState, useEffect } from "react"
import { initializeContractInstance } from "../../contractInstance.js"
import { toast, Toaster } from "react-hot-toast"
import { apiFetch } from "../../utils/api"
import {
  FaCubes,
  FaUpload,
  FaHistory,
  FaChartBar,
  FaShieldAlt,
  FaExclamationTriangle,
  FaPlus,
  FaTimes,
  FaSync,
  FaMountain,
  FaIndustry,
  FaGlobe,
} from "react-icons/fa"

export default function MinerHomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState("")
  const [stats, setStats] = useState({
    totalUpdates: 0,
    pendingUpdates: 0,
    recentActivity: [],
  })

  // Material composition update form state
  const [materialForm, setMaterialForm] = useState({
    tokenId: "",
    materialComposition: {
      battery_chemistry__short_name: "",
      battery_chemistry__clear_name: "",
      battery_materials: [],
      hazardous_substances: [],
    },
  })

  // New state for miner material updates and activities
  const [minerMaterialUpdates, setMinerMaterialUpdates] = useState([])
  const [minerActivities, setMinerActivities] = useState([])
  const [loadingUpdates, setLoadingUpdates] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)

  useEffect(() => {
    initializeAccount()
    loadStats()
  }, [])

  useEffect(() => {
    if (account) {
      loadMinerData()
    }
  }, [account])

  const initializeAccount = async () => {
    try {
      const { account } = await initializeContractInstance()
      setAccount(account)
    } catch (error) {
      console.error("Failed to initialize account:", error)
    }
  }

  const loadStats = async () => {
    // Mock stats for now - in real implementation, fetch from contract/backend
    setStats({
      totalUpdates: 24,
      pendingUpdates: 3,
      recentActivity: [
        { id: 1, action: "Material Composition Updated", tokenId: "123", timestamp: "2024-01-15 10:30" },
        { id: 2, action: "Material Composition Updated", tokenId: "124", timestamp: "2024-01-14 15:45" },
        { id: 3, action: "Material Composition Updated", tokenId: "125", timestamp: "2024-01-13 09:20" },
      ],
    })
  }

  const loadMinerData = async () => {
    setLoadingUpdates(true)
    setLoadingActivities(true)

    try {
      // Load miner material updates
      const updatesResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/miner-material-update/miner/${account}`,
      )

      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json()
        setMinerMaterialUpdates(updatesData.logs || [])
        setStats((prev) => ({
          ...prev,
          totalUpdates: updatesData.logs?.length || 0,
        }))
      } else {
        console.error("Failed to fetch miner material updates")
      }

      // Load miner activities
      const activitiesResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/role-activity/miner/${account}`,
      )

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setMinerActivities(activitiesData.activities || [])
      } else {
        console.error("Failed to fetch miner activities")
      }
    } catch (error) {
      console.error("Error loading miner data:", error)
      toast.error("Failed to load miner data")
    } finally {
      setLoadingUpdates(false)
      setLoadingActivities(false)
    }
  }

  const handleMaterialUpdate = async (e) => {
    e.preventDefault()

    if (!materialForm.tokenId) {
      toast.error("Please enter a Token ID")
      return
    }

    setLoading(true)

    try {
      const { evContract, batteryPassportUpdater, didManager, credentialManager, signatureManager, account, web3 } =
        await initializeContractInstance()

      // Create material composition hash
      const materialData = JSON.stringify(materialForm.materialComposition)
      const materialHash = web3.utils.keccak256(materialData)

      // Get DID hash for miner
      const minerDidUri = `did:web:miner.com#create-${account}`
      const didHash = web3.utils.keccak256(minerDidUri)

      // Check if DID is registered and verified
      const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call()
      if (!isDIDRegistered) {
        toast.error("DID not registered. Please contact your administrator.")
        setLoading(false)
        return
      }

      // Create credential ID
      const credentialId = `cred-miner-${account}-${Date.now()}`

      // Create EIP-712 signature
      const domain = {
        name: "BatteryPassportUpdater",
        version: "1",
        chainId: Number(await web3.eth.getChainId()),
        verifyingContract: batteryPassportUpdater.options.address,
      }

      const types = {
        UpdateMaterialAndDueDiligence: [
          { name: "tokenId", type: "uint256" },
          { name: "materialCompositionHash", type: "bytes32" },
          { name: "dueDiligenceHash", type: "bytes32" },
          { name: "updater", type: "address" },
        ],
      }

      const message = {
        tokenId: materialForm.tokenId,
        materialCompositionHash: materialHash,
        dueDiligenceHash: "0x0000000000000000000000000000000000000000000000000000000000000000", // Miners don't update due diligence
        updater: account,
      }

      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify({ domain, types, primaryType: "UpdateMaterialAndDueDiligence", message })],
      })

      // Update material composition through the updater contract
      await batteryPassportUpdater.methods
        .updateMaterialAndDueDiligence(
          materialForm.tokenId,
          didHash,
          materialHash,
          "0x0000000000000000000000000000000000000000000000000000000000000000", // No due diligence for miners
          credentialId,
          signature,
        )
        .send({ from: account, gas: 1000000 })

      toast.success("Material composition updated successfully!")

      // Reset form
      setMaterialForm({
        tokenId: "",
        materialComposition: {
          battery_chemistry__short_name: "",
          battery_chemistry__clear_name: "",
          battery_materials: [],
          hazardous_substances: [],
        },
      })

      // Reload stats
      loadStats()
    } catch (error) {
      console.error("Error updating material composition:", error)
      toast.error("Failed to update material composition: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addBatteryMaterial = () => {
    setMaterialForm((prev) => ({
      ...prev,
      materialComposition: {
        ...prev.materialComposition,
        battery_materials: [
          ...prev.materialComposition.battery_materials,
          {
            battery_material_location: {
              component_name: "",
              component_id: "",
            },
            battery_material_identifier: "",
            battery_material_name: "",
            battery_material_mass: 0,
            is_critical_raw_material: false,
          },
        ],
      },
    }))
  }

  const updateBatteryMaterial = (index, field, value) => {
    setMaterialForm((prev) => {
      const updated = { ...prev }
      if (field.startsWith("battery_material_location.")) {
        const locationField = field.split(".")[1]
        updated.materialComposition.battery_materials[index].battery_material_location[locationField] = value
      } else {
        updated.materialComposition.battery_materials[index][field] = value
      }
      return updated
    })
  }

  const removeBatteryMaterial = (index) => {
    setMaterialForm((prev) => ({
      ...prev,
      materialComposition: {
        ...prev.materialComposition,
        battery_materials: prev.materialComposition.battery_materials.filter((_, i) => i !== index),
      },
    }))
  }

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: FaChartBar },
    { id: "update-material", name: "Update Material", icon: FaCubes },
    { id: "activity", name: "Activity Log", icon: FaHistory },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Mining Operations</h1>
              <p className="text-slate-600 text-lg">Material composition and resource tracking</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200">
                <FaMountain className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl border border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Updates</p>
                  <p className="text-3xl font-bold">{stats.totalUpdates}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaCubes className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-xl border border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium mb-1">Pending Updates</p>
                  <p className="text-3xl font-bold">{stats.pendingUpdates}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaExclamationTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-copper-600 to-orange-600 rounded-2xl p-6 text-white shadow-xl border border-copper-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-copper-100 text-sm font-medium mb-1">Trust Level</p>
                  <p className="text-3xl font-bold">Level 2</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaShieldAlt className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Enhanced Tabs */}
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 border-b border-slate-200">
            <div className="flex space-x-2 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 text-sm ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-lg border border-slate-300 transform scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 hover:shadow-md"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* Enhanced Material Updates Table */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <FaCubes className="text-white w-6 h-6" />
                      </div>
                      Recent Material Updates
                    </h3>
                    <button
                      onClick={loadMinerData}
                      disabled={loadingUpdates || loadingActivities}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 disabled:opacity-50 backdrop-blur-sm"
                    >
                      <FaSync className={`h-5 w-5 ${loadingUpdates || loadingActivities ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>

                  {loadingUpdates ? (
                    <div className="p-16 text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                      <p className="text-slate-700 text-lg font-medium">Loading material updates...</p>
                    </div>
                  ) : minerMaterialUpdates.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-slate-100 to-blue-100">
                          <tr>
                            {["Token ID", "Battery Name", "Transaction Hash", "Update Date", "Organization"].map(
                              (header) => (
                                <th
                                  key={header}
                                  className="px-8 py-6 text-left text-sm font-bold text-slate-800 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {minerMaterialUpdates.slice(0, 5).map((update, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-all duration-300">
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                                  {update.tokenId}
                                </span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-slate-900 font-semibold">
                                {update.batteryShortName}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className="font-mono text-sm bg-slate-100 text-slate-800 px-4 py-2 rounded-xl border border-slate-200">
                                  {update.txHash.substring(0, 10)}...{update.txHash.substring(update.txHash.length - 8)}
                                </span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-slate-700 font-medium">
                                {new Date(update.updateDate).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-slate-700">{update.organizationId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="bg-gradient-to-br from-slate-100 to-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <FaCubes className="h-12 w-12 text-blue-600" />
                      </div>
                      <p className="text-slate-700 text-lg font-medium">No material updates found</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Activities */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-8 py-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <FaHistory className="text-white w-6 h-6" />
                      </div>
                      Recent Activities
                    </h3>
                  </div>

                  {loadingActivities ? (
                    <div className="p-16 text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-6"></div>
                      <p className="text-slate-700 text-lg font-medium">Loading activities...</p>
                    </div>
                  ) : minerActivities.length > 0 ? (
                    <div className="p-8">
                      <div className="space-y-6">
                        {minerActivities.slice(0, 5).map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            <div className="flex-shrink-0">
                              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                                <FaCubes className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xl font-bold text-slate-900 mb-2">
                                {activity.type === "update_material" ? "Material Update" : activity.type}
                              </p>
                              <p className="text-slate-700 text-base mb-3">
                                {activity.details?.tokenId && `Token ID: ${activity.details.tokenId}`}
                                {activity.details?.batteryShortName && ` - ${activity.details.batteryShortName}`}
                              </p>
                              <p className="text-slate-500 text-sm font-medium">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="bg-gradient-to-br from-slate-100 to-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <FaHistory className="h-12 w-12 text-teal-600" />
                      </div>
                      <p className="text-slate-700 text-lg font-medium">No activities found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Update Material Tab */}
            {activeTab === "update-material" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Update Material Composition</h3>
                  <p className="text-slate-600 text-lg max-w-4xl mx-auto">
                    Update the material composition for battery passports. As a miner, you can update material data but
                    not due diligence information.
                  </p>
                </div>

                <form onSubmit={handleMaterialUpdate} className="space-y-8">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 shadow-lg">
                    <h4 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                        <FaCubes className="h-6 w-6 text-white" />
                      </div>
                      Battery Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="tokenId" className="block text-sm font-bold text-slate-900 mb-3">
                          Token ID *
                        </label>
                        <input
                          type="text"
                          id="tokenId"
                          name="tokenId"
                          value={materialForm.tokenId}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                          placeholder="Enter battery passport token ID"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 shadow-lg">
                    <h4 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl">
                        <FaIndustry className="h-6 w-6 text-white" />
                      </div>
                      Battery Chemistry
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-3">Chemistry Short Name</label>
                        <input
                          type="text"
                          value={materialForm.materialComposition.battery_chemistry__short_name}
                          onChange={(e) =>
                            setMaterialForm((prev) => ({
                              ...prev,
                              materialComposition: {
                                ...prev.materialComposition,
                                battery_chemistry__short_name: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                          placeholder="e.g., NMC"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-3">Chemistry Clear Name</label>
                        <input
                          type="text"
                          value={materialForm.materialComposition.battery_chemistry__clear_name}
                          onChange={(e) =>
                            setMaterialForm((prev) => ({
                              ...prev,
                              materialComposition: {
                                ...prev.materialComposition,
                                battery_chemistry__clear_name: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                          placeholder="e.g., Nickel Manganese Cobalt"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-bold text-slate-900 flex items-center gap-4">
                        <div className="bg-gradient-to-br from-copper-500 to-orange-600 p-3 rounded-xl">
                          <FaGlobe className="h-6 w-6 text-white" />
                        </div>
                        Battery Materials
                      </h4>
                      <button
                        type="button"
                        onClick={addBatteryMaterial}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:scale-105"
                      >
                        <FaPlus className="h-5 w-5" />
                        Add Material
                      </button>
                    </div>

                    <div className="space-y-8">
                      {materialForm.materialComposition.battery_materials.map((material, index) => (
                        <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-slate-200 shadow-lg">
                          <div className="flex items-center justify-between mb-8">
                            <h5 className="text-xl font-bold text-slate-900">Material {index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => removeBatteryMaterial(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-all duration-300"
                            >
                              <FaTimes className="h-6 w-6" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div>
                              <label className="block text-sm font-bold text-slate-900 mb-3">Component Name</label>
                              <input
                                type="text"
                                value={material.battery_material_location.component_name}
                                onChange={(e) =>
                                  updateBatteryMaterial(
                                    index,
                                    "battery_material_location.component_name",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                                placeholder="e.g., Cathode"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-900 mb-3">Material Name</label>
                              <input
                                type="text"
                                value={material.battery_material_name}
                                onChange={(e) => updateBatteryMaterial(index, "battery_material_name", e.target.value)}
                                className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                                placeholder="e.g., Nickel"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-900 mb-3">
                                Material Mass (kg)
                              </label>
                              <input
                                type="number"
                                value={material.battery_material_mass}
                                onChange={(e) =>
                                  updateBatteryMaterial(
                                    index,
                                    "battery_material_mass",
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-slate-900 placeholder-slate-400 bg-white/80 backdrop-blur-sm"
                                placeholder="0.0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-6 px-12 rounded-2xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-4 text-xl transition-all duration-300 shadow-2xl transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaUpload className="h-6 w-6" />
                          <span>Update Material Composition</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Activity Timeline</h3>
                  <p className="text-slate-600 text-lg">Track all your recent mining operations and updates</p>
                </div>

                <div className="space-y-6">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-2xl text-white shadow-lg">
                            <FaCubes className="h-10 w-10" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-slate-900 mb-2">{activity.action}</p>
                            <p className="text-slate-700 text-base">
                              Token ID:{" "}
                              <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-800 border border-slate-200">{activity.tokenId}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-600 text-base mb-3 font-medium">{activity.timestamp}</p>
                          <div>
                            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline connector */}
                      {index < stats.recentActivity.length - 1 && (
                        <div className="absolute left-12 top-20 w-1 h-12 bg-gradient-to-b from-slate-300 to-blue-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
