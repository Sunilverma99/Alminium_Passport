import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { toast, Toaster } from "react-hot-toast"
import {
  Recycle,
  AlertTriangle,
  Eye,
  TrendingUp,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Database,
  Battery,
  Activity,
  Calendar,
  Filter,
} from "lucide-react"
import { apiFetch } from "../../utils/api"

const RecyclerDashboard = () => {
  const { userAddress, roles } = useSelector((state) => state.contract)
  const [stats, setStats] = useState({
    totalBatteriesProcessed: 0,
    pendingLifecycleUpdates: 0,
    discrepancyReports: 0,
    recycledToday: 0,
    recycledThisWeek: 0,
    recycledThisMonth: 0,
    averageProcessingTime: 0,
    complianceRate: 0,
    recentActivity: [],
  })
  const [batteries, setBatteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lifecycleUpdates, setLifecycleUpdates] = useState([])
  const [recyclerActivities, setRecyclerActivities] = useState([])

  useEffect(() => {
    if (userAddress) {
      fetchRecyclerData()
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchRecyclerData(true)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [userAddress])

  const fetchRecyclerData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      if (silent) setRefreshing(true)

      // Fetch comprehensive recycler dashboard data
      const dashboardResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/recycler/dashboard/${userAddress}`,
      )

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        const dashboardData = dashboardResult.data
        setStats(dashboardData.stats)
        setBatteries(dashboardData.batteries)
        setLifecycleUpdates(dashboardData.lifecycleUpdates)
        setRecyclerActivities(dashboardData.activities)
      } else {
        // Fallback to individual API calls if the dashboard endpoint fails
        console.log("Dashboard endpoint failed, using fallback APIs...")

        // Fetch lifecycle status updates for this recycler
        const lifecycleResponse = await apiFetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/lifecycle-status-update/by-address/${userAddress}`,
        )

        let lifecycleData = []
        if (lifecycleResponse.ok) {
          const lifecycleResult = await lifecycleResponse.json()
          lifecycleData = lifecycleResult.updates || []
          setLifecycleUpdates(lifecycleData)
        }

        // Fetch recycler activities
        const activitiesResponse = await apiFetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/role-activity/recycler/${userAddress}`,
        )

        let activitiesData = []
        if (activitiesResponse.ok) {
          const activitiesResult = await activitiesResponse.json()
          activitiesData = activitiesResult.activities || []
          setRecyclerActivities(activitiesData)
        }

        // Calculate statistics from real data
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Count lifecycle updates by time period
        const recycledToday = lifecycleData.filter((update) => new Date(update.updatedAt) >= today).length

        const recycledThisWeek = lifecycleData.filter((update) => new Date(update.updatedAt) >= weekAgo).length

        const recycledThisMonth = lifecycleData.filter((update) => new Date(update.updatedAt) >= monthAgo).length

        // Calculate average processing time (mock calculation for now)
        const averageProcessingTime =
          lifecycleData.length > 0
            ? (lifecycleData.reduce((acc, update) => acc + 2.5, 0) / lifecycleData.length).toFixed(1)
            : 0

        // Calculate efficiency rate (batteries marked as waste)
        const efficiencyRate =
          lifecycleData.length > 0
            ? Math.round((lifecycleData.filter((update) => update.toStatus === 4).length / lifecycleData.length) * 100)
            : 0

        // Get recent activities (last 10)
        const recentActivity = activitiesData.slice(0, 10).map((activity, index) => ({
          id: index + 1,
          action: activity.details || activity.type,
          tokenId: activity.batteryId || "N/A",
          status: activity.type === "LIFECYCLE_UPDATE" ? "Updated" : "Activity",
          timestamp: new Date(activity.timestamp).toLocaleString(),
          type: activity.type === "LIFECYCLE_UPDATE" ? "success" : "info",
        }))

        // Create battery processing data from lifecycle updates
                 const batteryProcessingData = lifecycleData.slice(0, 10).map((update, index) => ({
           tokenId: update.tokenId,
           fromStatus: update.fromStatus,
           toStatus: update.toStatus,
           lastUpdated: new Date(update.updatedAt).toLocaleString(),
           txHash: update.txHash || 'N/A',
         }))

        setStats({
          totalBatteriesProcessed: lifecycleData.length,
          pendingLifecycleUpdates: 0, // We don't have real data for this yet
          discrepancyReports: 0, // We don't have real data for this yet
          recycledToday,
          recycledThisWeek,
          recycledThisMonth,
          averageProcessingTime: Number.parseFloat(averageProcessingTime),
          efficiencyRate,
          recentActivity,
        })

        setBatteries(batteryProcessingData)
      }
    } catch (error) {
      console.error("Error fetching recycler data:", error)
      if (!silent) {
        toast.error("Failed to load recycler data")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusFromLifecycle = (lifecycleStatus) => {
    switch (lifecycleStatus) {
      case 0:
        return "Original"
      case 1:
        return "Repurposed"
      case 2:
        return "Reused"
      case 3:
        return "Remanufactured"
      case 4:
        return "Waste"
      default:
        return "Unknown"
    }
  }

  const getProcessingStatus = (lifecycleStatus, updatedAt) => {
    const now = new Date()
    const updateTime = new Date(updatedAt)
    const hoursSinceUpdate = (now - updateTime) / (1000 * 60 * 60)

    // If it's been updated to Waste status recently, it's completed
    if (lifecycleStatus === 4 && hoursSinceUpdate < 24) {
      return "Completed"
    }
    // If it's been updated to Waste status but more than 24 hours ago, it's archived
    else if (lifecycleStatus === 4 && hoursSinceUpdate >= 24) {
      return "Archived"
    }
    // If it's in any other lifecycle stage and updated recently, it's in process
    else if (hoursSinceUpdate < 2) {
      return "In Process"
    }
    // If it's been a while since the last update, it's pending
    else if (hoursSinceUpdate >= 2 && hoursSinceUpdate < 24) {
      return "Pending Review"
    }
    // If it's been more than 24 hours, it's stalled
    else {
      return "Stalled"
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      // Processing status colors
      Completed: "bg-green-100 text-green-800",
      "In Process": "bg-yellow-100 text-yellow-800",
      "Pending Review": "bg-blue-100 text-blue-800",
      Stalled: "bg-orange-100 text-orange-800",
      Archived: "bg-gray-100 text-gray-800",
      // Lifecycle status colors (fallback)
      Waste: "bg-red-100 text-red-800",
      Pending: "bg-blue-100 text-blue-800",
      Original: "bg-gray-100 text-gray-800",
      Repurposed: "bg-blue-100 text-blue-800",
      Reused: "bg-green-100 text-green-800",
      Remanufactured: "bg-purple-100 text-purple-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "info":
        return <Eye className="w-4 h-4 text-blue-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Recycle className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading recycler dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching your recycling data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recycler Dashboard</h1>
                <p className="text-gray-600 mt-1">Monitor and manage your recycling operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchRecyclerData(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/recycler/update-lifecycle-status'}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Update Lifecycle</span>
              </button>
              <button
                onClick={() => window.location.href = '/recycler/view-passports'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View Passports</span>
              </button>
              <button
                onClick={() => window.location.href = '/recycler/report-discrepancies'}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Report Issues</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Stats Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Processed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Recycle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBatteriesProcessed}</p>
                  <p className="text-sm text-gray-600">Total Processed</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+{stats.recycledThisMonth} this month</span>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.recycledThisWeek}</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.recycledThisWeek / 50) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 50 batteries</p>
            </div>

            {/* Monthly Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.recycledThisMonth}</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-purple-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Monthly progress</span>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Battery className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.recycledToday}</p>
                  <p className="text-sm text-gray-600">Today</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Processed today</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Battery className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Battery Processing Status</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>In Process</option>
                      <option>Completed</option>
                      <option>Waste</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                                 <thead className="bg-gray-50">
                   <tr>
                     <th className="text-left py-4 px-6 font-semibold text-gray-900">Token ID</th>
                     <th className="text-left py-4 px-6 font-semibold text-gray-900">From Status</th>
                     <th className="text-left py-4 px-6 font-semibold text-gray-900">To Status</th>
                     <th className="text-left py-4 px-6 font-semibold text-gray-900">Transaction Hash</th>
                     <th className="text-left py-4 px-6 font-semibold text-gray-900">Last Updated</th>
                   </tr>
                 </thead>
                <tbody className="divide-y divide-gray-100">
                  {batteries.length > 0 ? (
                    batteries.map((battery) => (
                      <tr key={battery.tokenId} className="hover:bg-gray-50 transition-colors">
                                                 <td className="py-4 px-6">
                           <span className="font-medium text-gray-900">#{battery.tokenId}</span>
                         </td>
                                                 <td className="py-4 px-6">
                           <span className="text-sm text-gray-600">
                             {battery.fromStatus === 0 && "Original"}
                             {battery.fromStatus === 1 && "Repurposed"}
                             {battery.fromStatus === 2 && "Reused"}
                             {battery.fromStatus === 3 && "Remanufactured"}
                             {battery.fromStatus === 4 && "Waste"}
                           </span>
                         </td>
                         <td className="py-4 px-6">
                           <span className="text-sm text-gray-600">
                             {battery.toStatus === 0 && "Original"}
                             {battery.toStatus === 1 && "Repurposed"}
                             {battery.toStatus === 2 && "Reused"}
                             {battery.toStatus === 3 && "Remanufactured"}
                             {battery.toStatus === 4 && "Waste"}
                           </span>
                         </td>
                         <td className="py-4 px-6">
                           <span className="text-xs text-gray-500 font-mono">
                             {battery.txHash}
                           </span>
                         </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{battery.lastUpdated}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Database className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">No batteries in processing</p>
                          <p className="text-gray-400 text-sm mt-1">Start processing batteries to see them here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity - Full Width */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              Recent Activity
            </h3>

            {stats.recentActivity.length > 0 ? (
              <div className="grid gap-4">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 w-full  p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 ">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                      <p className="text-xs text-gray-600">Token ID: {activity.tokenId}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">Activity will appear here as you process batteries</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RecyclerDashboard
