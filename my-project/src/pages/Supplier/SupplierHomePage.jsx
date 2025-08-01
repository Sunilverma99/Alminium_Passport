"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { apiFetch } from "../../utils/api"
import {
  Package,
  Search,
  FileText,
  Info,
  Eye,
  Truck,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Edit,
  Upload,
  Database,
  Shield,
  X,
} from "lucide-react"

const SupplierHomePage = () => {
  const { userAddress } = useSelector((state) => state.contract)
  const [supplierUpdates, setSupplierUpdates] = useState([])
  const [stats, setStats] = useState({
    totalBatteries: 0,
    pendingUpdates: 0,
    supplierUpdated: 0,
    verifiedBatteries: 0,
    updatedToday: 0,
    updatedThisWeek: 0,
    updatedThisMonth: 0,
    materialCompletionRate: 0,
    dueDiligenceCompletionRate: 0,
    verificationRate: 0,
    supplierUpdateRate: 0,
    recentActivity: []
  })

  const [batteries, setBatteries] = useState([])

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBattery, setSelectedBattery] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    materialComposition: "",
    dueDiligenceHash: "",
    supplierNotes: "",
  })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (userAddress) {
      fetchSupplierUpdates()
    }
  }, [userAddress])

  const fetchSupplierUpdates = async () => {
    try {
      setLoading(true)
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/supplier-battery-update/by-supplier/${userAddress}`)
      if (response.ok) {
        const data = await response.json()
        setSupplierUpdates(data.updates || [])
        updateStats(data.updates || [])
      }
    } catch (error) {
      console.error('Error fetching supplier updates:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (updates) => {
    const totalUpdates = updates.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const updatedToday = updates.filter(update => 
      new Date(update.updatedAt) >= today
    ).length

    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const updatedThisWeek = updates.filter(update => 
      new Date(update.updatedAt) >= lastWeek
    ).length

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const updatedThisMonth = updates.filter(update => 
      new Date(update.updatedAt) >= lastMonth
    ).length

    setStats({
      totalBatteries: totalUpdates,
      pendingUpdates: 0,
      supplierUpdated: totalUpdates,
      verifiedBatteries: 0,
      updatedToday,
      updatedThisWeek,
      updatedThisMonth,
      materialCompletionRate: 100,
      dueDiligenceCompletionRate: 100,
      verificationRate: 0,
      supplierUpdateRate: 100,
      recentActivity: updates.slice(0, 5).map(update => ({
        batteryId: update.tokenId,
        status: "supplier_updated",
        lastUpdate: update.updatedAt,
        materialComposition: !!update.batteryMaterial,
        dueDiligence: !!update.supplyChainDueDiligenceReport
      }))
    })
  }

  const handleUpdateBattery = async () => {
    if (!selectedBattery || !updateForm.materialComposition || !updateForm.dueDiligenceHash) {
      return
    }
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setShowUpdateModal(false)
      setSelectedBattery(null)
      setUpdateForm({
        materialComposition: "",
        dueDiligenceHash: "",
        supplierNotes: "",
      })
      setLoading(false)
    }, 1000)
  }

  const openUpdateModal = (battery) => {
    setSelectedBattery(battery)
    setUpdateForm({
      materialComposition: battery.materialComposition || "",
      dueDiligenceHash: battery.dueDiligenceHash || "",
      supplierNotes: battery.supplierNotes || "",
    })
    setShowUpdateModal(true)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "created":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <Clock className="w-4 h-4" />,
          label: "Created",
        }
      case "supplier_updated":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <Upload className="w-4 h-4" />,
          label: "Updated",
        }
      case "verified":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Verified",
        }
      case "transferred":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          icon: <Truck className="w-4 h-4" />,
          label: "Transferred",
        }
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          icon: <Info className="w-4 h-4" />,
          label: "Unknown",
        }
    }
  }

  const filteredBatteries = supplierUpdates.filter((update) =>
    update.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.shortName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-slate-50">
   

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* All Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Batteries</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBatteries}</p>
              <p className="text-xs text-slate-500 mt-1">Assigned to supplier</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Today's Updates</p>
              <p className="text-2xl font-bold text-slate-900">{stats.updatedToday}</p>
              <p className="text-xs text-slate-500 mt-1">Material submissions</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Database className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Supplier Updates</p>
              <p className="text-2xl font-bold text-slate-900">{stats.supplierUpdateRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Update completion rate</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Material Data</p>
              <p className="text-2xl font-bold text-slate-900">{stats.materialCompletionRate}%</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.materialCompletionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Composition submitted</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Due Diligence</p>
              <p className="text-2xl font-bold text-slate-900">{stats.dueDiligenceCompletionRate}%</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.dueDiligenceCompletionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Compliance submitted</p>
            </div>
          </motion.div>
        </div>



        {/* Battery Passports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Battery Passports</h2>
                <p className="text-sm text-slate-600 mt-1">Manage and track battery compliance data</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search batteries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Battery ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Battery Chemistry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Materials Count
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Due Diligence Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Supplier Updates
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredBatteries.map((update) => {
                  const statusConfig = getStatusConfig("supplier_updated")
                  const hasMaterial = update.batteryMaterial && update.batteryMaterial !== "{}"
                  const hasDueDiligence = update.supplyChainDueDiligenceReport && update.supplyChainDueDiligenceReport !== "{}"
                  
                  // Parse JSON data
                  let materialData = {}
                  let dueDiligenceData = {}
                  try {
                    if (update.batteryMaterial) materialData = JSON.parse(update.batteryMaterial)
                    if (update.supplyChainDueDiligenceReport) dueDiligenceData = JSON.parse(update.supplyChainDueDiligenceReport)
                  } catch (e) {
                    console.error('Error parsing JSON data:', e)
                  }
                  
                  return (
                    <motion.tr
                      key={update._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{update.tokenId}</div>
                        <div className="text-xs text-slate-500">{update.shortName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {statusConfig.icon}
                          <span className="ml-1.5">{statusConfig.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {update.updatedAt
                          ? new Date(update.updatedAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              hasMaterial && hasDueDiligence
                                ? "bg-emerald-500"
                                : hasMaterial || hasDueDiligence
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <div className="text-sm">
                            {hasMaterial && hasDueDiligence ? (
                              <span className="text-emerald-700 font-medium">Complete</span>
                            ) : hasMaterial || hasDueDiligence ? (
                              <span className="text-amber-700 font-medium">Partial</span>
                            ) : (
                              <span className="text-red-700 font-medium">Pending</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {hasMaterial ? "Material ✓" : "Material ✗"} •{" "}
                          {hasDueDiligence ? "Due Diligence ✓" : "Due Diligence ✗"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {materialData.battery_chemistry__clear_name || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {materialData.battery_chemistry__short_name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {materialData.battery_materials ? materialData.battery_materials.length : 0}
                        </div>
                        <div className="text-xs text-slate-500">
                          {materialData.hazardous_substances ? materialData.hazardous_substances.length : 0} hazardous
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {dueDiligenceData.supply_chain_indicies || update.supplyChainIndicesScore || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {dueDiligenceData.supply_chain_due_diligence_report ? "Report ✓" : "Report ✗"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        1
                      </td>

                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredBatteries.length === 0 && (
            <div className="text-center py-16">
              <Package className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-sm font-medium text-slate-900">No batteries found</h3>
              <p className="mt-2 text-sm text-slate-500">
                {searchTerm ? "Try adjusting your search terms." : "Get started by creating a new battery passport."}
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 mt-8"
        >
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <p className="text-sm text-slate-600 mt-1">Latest supplier actions and updates</p>
              </div>
              <button
                onClick={fetchSupplierUpdates}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Upload className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          Battery {activity.batteryId} Updated
                        </p>
                        <span className="text-xs text-slate-500">
                          {new Date(activity.lastUpdate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Material composition and due diligence data submitted
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.materialComposition 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {activity.materialComposition ? 'Material ✓' : 'Material ✗'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.dueDiligence 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {activity.dueDiligence ? 'Due Diligence ✓' : 'Due Diligence ✗'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-2">No recent activity</h3>
                <p className="text-sm text-slate-500">
                  Recent supplier updates will appear here
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedBattery && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl"
          >
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Update Battery: {selectedBattery.batteryId}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Provide material composition and due diligence information
                  </p>
                </div>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Material Composition *</label>
                  <textarea
                    value={updateForm.materialComposition}
                    onChange={(e) => setUpdateForm({ ...updateForm, materialComposition: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    rows="4"
                    placeholder="Enter detailed material composition including cathode, anode, electrolyte specifications..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Diligence Hash *</label>
                  <input
                    type="text"
                    value={updateForm.dueDiligenceHash}
                    onChange={(e) => setUpdateForm({ ...updateForm, dueDiligenceHash: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Supplier Notes</label>
                  <textarea
                    value={updateForm.supplierNotes}
                    onChange={(e) => setUpdateForm({ ...updateForm, supplierNotes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    rows="3"
                    placeholder="Additional notes about sourcing, certifications, or compliance..."
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-200">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBattery}
                  disabled={loading || !updateForm.materialComposition || !updateForm.dueDiligenceHash}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? "Updating..." : "Update Battery"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SupplierHomePage
