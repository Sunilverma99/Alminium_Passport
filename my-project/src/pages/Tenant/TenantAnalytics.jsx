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
  Filter,
  ArrowLeft
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
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"
import { Link } from "react-router-dom"
import { apiFetch } from "../../utils/api"

const TenantAnalytics = () => {
  const { userAddress, roles } = useSelector((state) => state.contract)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedChart, setSelectedChart] = useState('overview')

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
          <p className="text-gray-600 font-medium">Loading analytics...</p>
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

  const batteryStatusData = analyticsData ? [
    { name: 'Created', value: analyticsData.batteryStatusDistribution.created, color: COLORS.primary[0] },
    { name: 'Supplier Updated', value: analyticsData.batteryStatusDistribution.supplier_updated, color: COLORS.success[0] },
    { name: 'Verified', value: analyticsData.batteryStatusDistribution.verified, color: COLORS.warning[0] },
    { name: 'Transferred', value: analyticsData.batteryStatusDistribution.transferred, color: COLORS.purple[0] }
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

  // Performance radar data
  const performanceRadarData = analyticsData ? [
    { metric: 'Battery Creation', value: analyticsData.performanceMetrics.totalBatteries, fullMark: 100 },
    { metric: 'Updates', value: analyticsData.performanceMetrics.totalUpdates, fullMark: 100 },
    { metric: 'Carbon Updates', value: analyticsData.performanceMetrics.totalCarbonUpdates, fullMark: 100 },
    { metric: 'Lifecycle Updates', value: analyticsData.performanceMetrics.totalLifecycleUpdates, fullMark: 100 },
    { metric: 'Supplier Updates', value: analyticsData.performanceMetrics.totalSupplierUpdates, fullMark: 100 },
    { metric: 'Miner Updates', value: analyticsData.performanceMetrics.totalMinerUpdates, fullMark: 100 }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/tenant" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600 mt-1">Deep insights into your organization's performance</p>
                {analyticsData?.organizationName && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm font-medium">
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        {/* Chart Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'roles', name: 'Role Analysis', icon: Users },
                { id: 'activity', name: 'Activity Trends', icon: Activity },
                { id: 'performance', name: 'Performance', icon: TrendingUp },
                { id: 'batteries', name: 'Battery Status', icon: Battery }
              ].map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedChart === chart.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <chart.icon className="w-4 h-4" />
                  <span>{chart.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overview Section */}
        {selectedChart === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Role Distribution */}
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

              {/* Performance Radar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                    <p className="text-sm text-gray-600">Key performance indicators</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Role Analysis Section */}
        {selectedChart === 'roles' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activity by Role</h3>
                  <p className="text-sm text-gray-600">Detailed activity breakdown by role</p>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="h-96">
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
          </motion.div>
        )}

        {/* Activity Trends Section */}
        {selectedChart === 'activity' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Activity Trends</h3>
                  <p className="text-sm text-gray-600">Activity by role over the last 6 months</p>
                </div>
                <LineChartIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="h-96">
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
        )}

        {/* Performance Section */}
        {selectedChart === 'performance' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                    <p className="text-sm text-gray-600">Key performance indicators</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Total Batteries', value: analyticsData?.performanceMetrics?.totalBatteries || 0, icon: Battery, color: 'text-blue-600' },
                    { label: 'Total Updates', value: analyticsData?.performanceMetrics?.totalUpdates || 0, icon: Activity, color: 'text-green-600' },
                    { label: 'Carbon Updates', value: analyticsData?.performanceMetrics?.totalCarbonUpdates || 0, icon: FileText, color: 'text-purple-600' },
                    { label: 'Lifecycle Updates', value: analyticsData?.performanceMetrics?.totalLifecycleUpdates || 0, icon: Recycle, color: 'text-orange-600' },
                    { label: 'Supplier Updates', value: analyticsData?.performanceMetrics?.totalSupplierUpdates || 0, icon: Package, color: 'text-teal-600' },
                    { label: 'Miner Updates', value: analyticsData?.performanceMetrics?.totalMinerUpdates || 0, icon: Settings, color: 'text-pink-600' }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Member Status</h3>
                    <p className="text-sm text-gray-600">Active vs inactive members</p>
                  </div>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: analyticsData?.performanceMetrics?.activeMembers || 0, color: '#10b981' },
                          { name: 'Inactive', value: analyticsData?.performanceMetrics?.inactiveMembers || 0, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Battery Status Section */}
        {selectedChart === 'batteries' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Battery Status Distribution</h3>
                  <p className="text-sm text-gray-600">Passport status breakdown</p>
                </div>
                <Battery className="w-6 h-6 text-green-600" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batteryStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Activity Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity Timeline</h3>
                <p className="text-sm text-gray-600">Latest organization activities</p>
              </div>
              <ActivityIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="h-96 overflow-y-auto">
              <div className="space-y-4">
                {analyticsData?.recentActivity?.slice(0, 15).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {activity.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.role} • {activity.batteryId}
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
        </motion.div>
      </div>
    </div>
  )
}

export default TenantAnalytics 