"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  Car,
  Battery,
  Factory,
  Server,
  HelpCircle,
  History,
  Calendar,
  User,
  FileText,
  ExternalLink,
} from "lucide-react"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ""

const ManufacturerDashboard = () => {
  const { userAddress, roles, isConnected } = useSelector((state) => state.contract)
  const [batteries, setBatteries] = useState([])
  const [orgNames, setOrgNames] = useState({}) // { orgId: orgName }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState("")
  const [activities, setActivities] = useState([])
  const [updatedBatteries, setUpdatedBatteries] = useState([])
  const [updatedLoading, setUpdatedLoading] = useState(false)
  const [updatedError, setUpdatedError] = useState("")
  const [carbonUpdates, setCarbonUpdates] = useState([])
  const [carbonLoading, setCarbonLoading] = useState(false)
  const [carbonError, setCarbonError] = useState("")

  // Fetch all batteries for the manufacturer
  useEffect(() => {
    const fetchBatteries = async () => {
      if (!userAddress || !roles?.manufacturer) return
      setLoading(true)
      setError("")
      try {
        const resp = await fetch(`${BACKEND_URL}/api/manufacturer-battery/manufacturer/${userAddress}`)
        if (!resp.ok) throw new Error("Failed to fetch batteries")
        const data = await resp.json()
        setBatteries(data.batteries || [])
      } catch (err) {
        setError(err.message || "Error fetching batteries")
      } finally {
        setLoading(false)
      }
    }
    fetchBatteries()
  }, [userAddress, roles])

  // Fetch organization names as needed
  useEffect(() => {
    const fetchOrgNames = async () => {
      const missingOrgIds = Array.from(new Set(batteries.map((b) => b.organizationId))).filter(
        (orgId) => orgId && !orgNames[orgId],
      )
      if (missingOrgIds.length === 0) return
      const newOrgNames = { ...orgNames }
      for (const orgId of missingOrgIds) {
        try {
          const resp = await fetch(`${BACKEND_URL}/api/organization/${orgId}`)
          if (resp.ok) {
            const data = await resp.json()
            newOrgNames[orgId] = data.organization?.organizationName || orgId
          } else {
            newOrgNames[orgId] = orgId
          }
        } catch {
          newOrgNames[orgId] = orgId
        }
      }
      setOrgNames(newOrgNames)
    }
    if (batteries.length > 0) fetchOrgNames()
  }, [batteries])

  // Fetch recent user activity for this manufacturer
  useEffect(() => {
    const fetchActivities = async () => {
      if (!userAddress || !roles?.manufacturer) return
      setActivityLoading(true)
      setActivityError("")
      try {
        const resp = await fetch(`${BACKEND_URL}/api/role-activity/manufacturer/${userAddress}`)
        if (!resp.ok) throw new Error("Failed to fetch activity")
        const data = await resp.json()
        setActivities(Array.isArray(data.activities) ? data.activities : [])
      } catch (err) {
        setActivityError(err.message || "Error fetching activity")
      } finally {
        setActivityLoading(false)
      }
    }
    fetchActivities()
  }, [userAddress, roles])

  // Fetch batteries updated by the manufacturer
  useEffect(() => {
    const fetchUpdatedBatteries = async () => {
      if (!userAddress || !roles?.manufacturer) return
      setUpdatedLoading(true)
      setUpdatedError("")
      try {
        const resp = await fetch(`${BACKEND_URL}/api/battery-update-log/manufacturer/${userAddress}`)
        if (!resp.ok) throw new Error("Failed to fetch updated batteries")
        const data = await resp.json()
        setUpdatedBatteries(data.logs || [])
      } catch (err) {
        setUpdatedError(err.message || "Error fetching updated batteries")
      } finally {
        setUpdatedLoading(false)
      }
    }
    fetchUpdatedBatteries()
  }, [userAddress, roles])

  // Fetch carbon footprint updates by the manufacturer
  useEffect(() => {
    const fetchCarbonUpdates = async () => {
      if (!userAddress || !roles?.manufacturer) return
      setCarbonLoading(true)
      setCarbonError("")
      try {
        const resp = await fetch(`${BACKEND_URL}/api/carbon-footprint-update-log/manufacturer/${userAddress}`)
        if (!resp.ok) throw new Error("Failed to fetch carbon footprint updates")
        const data = await resp.json()
        setCarbonUpdates(data.logs || [])
      } catch (err) {
        setCarbonError(err.message || "Error fetching carbon footprint updates")
      } finally {
        setCarbonLoading(false)
      }
    }
    fetchCarbonUpdates()
  }, [userAddress, roles])

  // Calculate stats
  const totalBatteries = batteries.length
  const batteryTypeCounts = batteries.reduce((acc, b) => {
    const type = b.batteryType || "Unknown"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  // Correct: count by batteryCategory for category stats and pie chart
  const batteryCategoryCounts = batteries.reduce((acc, b) => {
    const category = b.batteryCategory || "Unknown"
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  // Category icon and label map
  const categoryMeta = {
    "electric vehicle battery": {
      label: "Electric Vehicle Battery",
      icon: <Car className="text-blue-600 w-6 h-6" />,
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    "lmt battery": {
      label: "LMT Battery",
      icon: <Battery className="text-green-600 w-6 h-6" />,
      color: "bg-green-50 border-green-200 text-green-700",
    },
    "industrial battery": {
      label: "Industrial Battery",
      icon: <Factory className="text-yellow-600 w-6 h-6" />,
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    "stationary battery energy storage system": {
      label: "Stationary Battery ESS",
      icon: <Server className="text-purple-600 w-6 h-6" />,
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
    Unknown: {
      label: "Other/Unknown",
      icon: <HelpCircle className="text-gray-400 w-6 h-6" />,
      color: "bg-gray-50 border-gray-200 text-gray-700",
    },
  }

  // Parse activity details for better display
  const parseActivityDetails = (details) => {
    if (!details) return null
    try {
      const parsed = typeof details === "string" ? JSON.parse(details) : details
      return parsed
    } catch {
      return details
    }
  }

  // Format activity for display
  const formatActivity = (activity) => {
    const details = parseActivityDetails(activity.details)
    const activityType = activity.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

    return {
      type: activityType,
      timestamp: activity.timestamp,
      batteryTokenId: details?.batteryTokenId,
      productIdentifier: details?.productIdentifier,
      batteryType: details?.batteryType,
      batteryModel: details?.batteryModel,
      batteryCategory: details?.batteryCategory,
      totalCO2: details?.totalCO2,
      renewableContentPercent: details?.renewableContentPercent,
      batteryStatus: details?.batteryStatus,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          {/* Main Overview Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Manufacturing Overview</h2>
                <p className="text-blue-100 mb-4">Your battery production statistics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{totalBatteries}</div>
                    <div className="text-sm text-blue-200">Total Batteries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Object.keys(batteryTypeCounts).length}</div>
                    <div className="text-sm text-blue-200">Battery Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Object.keys(batteryCategoryCounts).length}</div>
                    <div className="text-sm text-blue-200">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{activities.length}</div>
                    <div className="text-sm text-blue-200">Activities</div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 p-4 rounded-xl">
                  <Battery className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Battery Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Battery Types</h3>
                <Factory className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-4">
                {Object.entries(batteryTypeCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => {
                    const percentage = totalBatteries > 0 ? Math.round((count / totalBatteries) * 100) : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 truncate">{type}</span>
                            <span className="text-sm text-gray-500">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold text-gray-900">{count}</div>
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(batteryTypeCounts).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Factory className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No battery types found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "electric vehicle battery",
                  "lmt battery", 
                  "industrial battery",
                  "stationary battery energy storage system",
                ].map((category) => {
                  const meta = categoryMeta[category];
                  const count = batteryCategoryCounts[category] || 0;
                  const percentage = totalBatteries > 0 ? Math.round((count / totalBatteries) * 100) : 0;
                  
                  return (
                    <div key={category} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${meta.color.split(' ')[0]}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{meta.label}</span>
                          <span className="text-sm text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${meta.color.split(' ')[0].replace('bg-', 'bg-')}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-gray-900">{count}</div>
                        <div className="text-xs text-gray-500">units</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Batteries Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">{totalBatteries}</div>
                  <div className="text-sm text-blue-700">Total Batteries</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600">Manufactured</span>
                <span className="text-blue-800 font-medium">100%</span>
              </div>
            </div>

            {/* Most Popular Type */}
            {(() => {
              const mostPopular = Object.entries(batteryTypeCounts)
                .sort(([,a], [,b]) => b - a)[0];
              return mostPopular ? (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500 p-3 rounded-xl">
                      <Factory className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-900">{mostPopular[1]}</div>
                      <div className="text-sm text-green-700">Most Popular</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 truncate">{mostPopular[0]}</div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gray-500 p-3 rounded-xl">
                      <Factory className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-700">Most Popular</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">No data</div>
                </div>
              );
            })()}

            {/* Top Category */}
            {(() => {
              const topCategory = Object.entries(batteryCategoryCounts)
                .sort(([,a], [,b]) => b - a)[0];
              return topCategory ? (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-500 p-3 rounded-xl">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-900">{topCategory[1]}</div>
                      <div className="text-sm text-purple-700">Top Category</div>
                    </div>
                  </div>
                  <div className="text-sm text-purple-600 truncate">
                    {categoryMeta[topCategory[0]]?.label || topCategory[0]}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gray-500 p-3 rounded-xl">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-700">Top Category</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">No data</div>
                </div>
              );
            })()}

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900">{activities.length}</div>
                  <div className="text-sm text-orange-700">Activities</div>
                </div>
              </div>
              <div className="text-sm text-orange-600">
                {activities.length > 0 ? 'Recent activity' : 'No recent activity'}
              </div>
            </div>
          </div>
        </div>

        {/* Battery Table Section - Improved */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Battery Inventory</h2>
            <p className="mt-1 text-sm text-gray-600">Complete list of manufactured batteries</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading batteries...</span>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-red-600 bg-red-50 rounded-lg p-4">{error}</div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Battery Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total CO2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batteries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Battery className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No batteries found</h3>
                        <p className="mt-1 text-sm text-gray-500">Start manufacturing batteries to see them here.</p>
                      </td>
                    </tr>
                  ) : (
                    batteries.map((battery) => (
                      <tr key={battery.batteryTokenId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              #{battery.batteryTokenId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{battery.batteryType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {orgNames[battery.organizationId] || battery.organizationId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {battery.totalCO2} kg
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {battery.batteryCategory && (
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                categoryMeta[battery.batteryCategory]?.color || categoryMeta.Unknown.color
                              }`}
                            >
                              {categoryMeta[battery.batteryCategory]?.icon || categoryMeta.Unknown.icon}
                              <span className="ml-2">
                                {categoryMeta[battery.batteryCategory]?.label || battery.batteryCategory}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {battery.qrCodeUrl ? (
                            <a
                              href={battery.qrCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              QR Link
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Updated Batteries Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Batteries Updated by You</h2>
            <p className="mt-1 text-sm text-gray-600">All batteries you have updated</p>
          </div>
          {updatedLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading updated batteries...</span>
            </div>
          ) : updatedError ? (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-red-600 bg-red-50 rounded-lg p-4">{updatedError}</div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total CO2</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passport Link</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {updatedBatteries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <Battery className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No updated batteries found</h3>
                        <p className="mt-1 text-sm text-gray-500">Update a battery to see it here.</p>
                      </td>
                    </tr>
                  ) : (
                    updatedBatteries.map((battery, idx) => (
                      <tr key={battery._id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{battery.batteryTokenId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{battery.batteryType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {orgNames[battery.organizationId] || battery.organizationId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {battery.totalCO2} kg
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {battery.batteryCategory && (
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                categoryMeta[battery.batteryCategory]?.color || categoryMeta.Unknown.color
                              }`}
                            >
                              {categoryMeta[battery.batteryCategory]?.icon || categoryMeta.Unknown.icon}
                              <span className="ml-2">
                                {categoryMeta[battery.batteryCategory]?.label || battery.batteryCategory}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {battery.qrCodeUrl ? (
                            <a
                              href={battery.qrCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              QR Link
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {battery.updatedAt ? new Date(battery.updatedAt).toLocaleString() : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {battery.batteryPassportUrl ? (
                            <a
                              href={battery.batteryPassportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Passport
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Carbon Footprint Updates Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Carbon Footprint Updates</h2>
            <p className="mt-1 text-sm text-gray-600">All carbon footprint updates you have made</p>
          </div>
          {carbonLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading carbon footprint updates...</span>
            </div>
          ) : carbonError ? (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-red-600 bg-red-50 rounded-lg p-4">{carbonError}</div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Carbon Footprint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Carbon Footprint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {carbonUpdates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Battery className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No carbon footprint updates found</h3>
                        <p className="mt-1 text-sm text-gray-500">Update a battery's carbon footprint to see it here.</p>
                      </td>
                    </tr>
                  ) : (
                    carbonUpdates.map((update, idx) => (
                      <tr key={update._id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{update.batteryTokenId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {update.newCarbonFootprint}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {update.previousCarbonFootprint !== null && update.previousCarbonFootprint !== undefined ? update.previousCarbonFootprint : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {orgNames[update.organizationId] || update.organizationId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {update.updatedAt ? new Date(update.updatedAt).toLocaleString() : ''}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Recent Activity Section - Improved */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <History className="text-gray-600 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
            </div>

            <div className="p-6">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading activity...</span>
                </div>
              ) : activityError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 bg-red-50 rounded-lg p-4">{activityError}</div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Recent activities will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities
                    .slice(-5)
                    .reverse()
                    .map((activity, idx) => {
                      const formattedActivity = formatActivity(activity)
                      return (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-medium text-gray-900">{formattedActivity.type}</h3>
                                  {formattedActivity.batteryTokenId && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Token #{formattedActivity.batteryTokenId}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                  {formattedActivity.productIdentifier && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Product ID:</span>
                                      <span className="font-mono text-gray-900">
                                        {formattedActivity.productIdentifier}
                                      </span>
                                    </div>
                                  )}
                                  {formattedActivity.batteryType && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Type:</span>
                                      <span className="text-gray-900">{formattedActivity.batteryType}</span>
                                    </div>
                                  )}
                                  {formattedActivity.batteryModel && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Model:</span>
                                      <span className="text-gray-900">{formattedActivity.batteryModel}</span>
                                    </div>
                                  )}
                                  {formattedActivity.batteryCategory && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Category:</span>
                                      <span className="text-gray-900">{formattedActivity.batteryCategory}</span>
                                    </div>
                                  )}
                                  {formattedActivity.totalCO2 && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">CO2:</span>
                                      <span className="text-gray-900">{formattedActivity.totalCO2}</span>
                                    </div>
                                  )}
                                  {formattedActivity.batteryStatus && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Status:</span>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {formattedActivity.batteryStatus}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(formattedActivity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">© 2025 AEIFORO. All Rights Reserved.</div>
      </div>
    </div>
  )
}

export default ManufacturerDashboard
