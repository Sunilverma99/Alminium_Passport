import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { toast, Toaster } from "react-hot-toast"
import {
  Building,
  Battery,
  Activity,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Users,
  RefreshCw,
  Calendar,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Activity as ActivityIcon,
  UserCheck,
  UserX,
  FileText,
  Recycle,
  Package,
  Settings,
  Download,
  Filter
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from "recharts"
import { apiFetch } from "../../utils/api"

const TenantDashboard = () => {
  const { userAddress, roles } = useSelector((state) => state.contract)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (userAddress) {
      fetchAnalyticsData()
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchAnalyticsData(true)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [userAddress, timeRange])

  const fetchAnalyticsData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      if (silent) setRefreshing(true)

      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/analytics/${userAddress}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('=== Frontend Analytics Debug ===')
        console.log('Analytics data received:', data.data)
        console.log('Battery status distribution:', data.data?.batteryStatusDistribution)
        console.log('Performance metrics:', data.data?.performanceMetrics)
        console.log('Recent activity:', data.data?.recentActivity?.slice(0, 5))
        console.log('Total lifecycle updates:', data.data?.performanceMetrics?.totalLifecycleUpdates)
        setAnalyticsData(data.data)
      } else {
        console.log("Failed to fetch analytics data, using fallback...")
        // Fallback data
        setAnalyticsData({
          organizationName: "Your Organization",
          roleDistribution: { manufacturers: 0, suppliers: 0, miners: 0, recyclers: 0 },
          performanceMetrics: {
          totalBatteries: 0,
            totalUpdates: 0,
            totalCarbonUpdates: 0,
            totalLifecycleUpdates: 0,
            totalSupplierUpdates: 0,
            totalMinerUpdates: 0,
            activeMembers: 0,
            inactiveMembers: 0
          },
          monthlyActivity: [],
          batteryStatusDistribution: { created: 0, supplier_updated: 0, verified: 0, transferred: 0 },
          recentActivity: [],
          activityHeatmap: []
        })
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      if (!silent) {
        toast.error("Failed to load analytics data")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalyticsData()
  }

  const handleExport = () => {
    if (!analyticsData) return
    
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tenant-analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Analytics data exported successfully!')
  }

  // Chart colors
  const COLORS = {
    primary: ["#3b82f6", "#1d4ed8", "#1e40af"],
    success: ["#10b981", "#059669", "#047857"],
    warning: ["#f59e0b", "#d97706", "#b45309"],
    danger: ["#ef4444", "#dc2626", "#b91c1c"],
    purple: ["#8b5cf6", "#7c3aed", "#6d28d9"],
    pink: ["#ec4899", "#db2777", "#be185d"],
    gradient: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#84cc16"],
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom pie chart tooltip
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p style={{ color: payload[0].color }} className="text-sm">
            Count: {payload[0].value}
          </p>
          <p style={{ color: payload[0].color }} className="text-sm">
            Percentage: {((payload[0].value / analyticsData?.totalMembers) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Building className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading tenant dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching your organization analytics</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const roleDistributionData = analyticsData ? [
    { name: 'Manufacturers', value: analyticsData.roleDistribution.manufacturers, color: COLORS.primary[0] },
    { name: 'Suppliers', value: analyticsData.roleDistribution.suppliers, color: COLORS.success[0] },
    { name: 'Miners', value: analyticsData.roleDistribution.miners, color: COLORS.warning[0] },
    { name: 'Recyclers', value: analyticsData.roleDistribution.recyclers, color: COLORS.purple[0] }
  ].filter(item => item.value > 0) : []



  const activityByRoleData = analyticsData ? Object.entries(analyticsData.activityByRole).map(([role, data]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    total: data.total,
    create_passport: data.create_passport,
    update_battery: data.update_battery,
    update_material: data.update_material,
    update_carbon_footprint: data.update_carbon_footprint,
    lifecycle_update: data.lifecycle_update
  })) : []

  // Lifecycle status data from backend - show all 5 statuses
  const lifecycleStatusData = analyticsData?.lifecycleStatusDistribution ? [
    { name: 'Original', value: analyticsData.lifecycleStatusDistribution[0] || 0, color: COLORS.primary[0] },
    { name: 'Repurposed', value: analyticsData.lifecycleStatusDistribution[1] || 0, color: COLORS.success[0] },
    { name: 'Reused', value: analyticsData.lifecycleStatusDistribution[2] || 0, color: COLORS.warning[0] },
    { name: 'Remanufactured', value: analyticsData.lifecycleStatusDistribution[3] || 0, color: COLORS.purple[0] },
    { name: 'Waste', value: analyticsData.lifecycleStatusDistribution[4] || 0, color: COLORS.pink[0] }
  ] : [] // Show all statuses even if zero

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tenant Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights into your organization's battery passport operations</p>
                {analyticsData?.organizationName && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                    <Building className="w-4 h-4 mr-2" />
                    {analyticsData.organizationName}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.totalMembers || 0}</p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center">
                  <UserCheck className="w-4 h-4 mr-1" />
                  {analyticsData?.performanceMetrics?.activeMembers || 0} Active
                </span>
                <span className="text-red-600 flex items-center">
                  <UserX className="w-4 h-4 mr-1" />
                  {analyticsData?.performanceMetrics?.inactiveMembers || 0} Inactive
                </span>
              </div>
            </div>

            {/* Total Batteries */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Battery className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.performanceMetrics?.totalBatteries || 0}</p>
                  <p className="text-sm text-gray-600">Battery Passports</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Total created</span>
              </div>
            </div>

            {/* Total Updates */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.performanceMetrics?.totalUpdates || 0}</p>
                  <p className="text-sm text-gray-600">Total Updates</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-purple-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>All activities</span>
              </div>
            </div>

            {/* Activity Score */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData?.recentActivity?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Recent Activities</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <ActivityIcon className="w-4 h-4 mr-1" />
                <span>Last 20 actions</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role Distribution Pie Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
                  <p className="text-sm text-gray-600">Organization member roles</p>
                </div>
                <PieChartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>



            {/* Lifecycle Status Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lifecycle Status</h3>
                  <p className="text-sm text-gray-600">Lifecycle updates count</p>
                </div>
                <Recycle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="h-80">
                {analyticsData?.performanceMetrics?.totalLifecycleUpdates > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lifecycleStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Recycle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No lifecycle updates available</p>
                      <p className="text-gray-400 text-xs mt-1">Lifecycle updates will appear here once processed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Activity Trends</h3>
                <p className="text-sm text-gray-600">Activity by role over the last 6 months</p>
              </div>
                              <LineChartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData?.monthlyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="manufacturers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="suppliers" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="miners" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recyclers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Activity by Role and Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity by Role */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activity by Role</h3>
                  <p className="text-sm text-gray-600">Detailed activity breakdown</p>
                </div>
                <BarChartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityByRoleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="create_passport" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="update_battery" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="update_material" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="update_carbon_footprint" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lifecycle_update" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Latest organization activities</p>
                </div>
                <ActivityIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="h-80 overflow-y-auto">
                <div className="space-y-4">
                  {analyticsData?.recentActivity?.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ActivityIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {activity.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.userName} ({activity.userRole}) • {activity.userAddress?.slice(0, 8)}...{activity.userAddress?.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <ActivityIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supplier Updates Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.performanceMetrics?.totalSupplierUpdates || 0}</p>
                    <p className="text-sm font-medium text-gray-600">Supplier Updates</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last 30 days</span>
                  <span className="text-blue-600 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Updates Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.performanceMetrics?.totalLifecycleUpdates || 0}</p>
                    <p className="text-sm font-medium text-gray-600">Lifecycle Updates</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last 30 days</span>
                  <span className="text-purple-600 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Miner Updates Card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-lg border border-pink-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-md">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.performanceMetrics?.totalMinerUpdates || 0}</p>
                    <p className="text-sm font-medium text-gray-600">Miner Updates</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-pink-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last 30 days</span>
                  <span className="text-pink-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TenantDashboard 