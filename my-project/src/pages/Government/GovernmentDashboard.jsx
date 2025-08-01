"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Line,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  CartesianGrid,
} from "recharts"

const API_BASE = import.meta.env.VITE_BACKEND_URL || ""

// Helper: Count by key
function countBy(arr, key) {
  const counts = {}
  arr.forEach((item) => {
    if (item[key]) {
      counts[item[key]] = (counts[item[key]] || 0) + 1
    }
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// Helper: Count battery chemistries
function countChemistries(arr) {
  const counts = {}
  arr.forEach((item) => {
    if (Array.isArray(item.supportedBatteryChemistries)) {
      item.supportedBatteryChemistries.forEach((chem) => {
        if (chem) counts[chem] = (counts[chem] || 0) + 1
      })
    }
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// Helper: Group by month
function groupByMonth(arr, dateKey) {
  const counts = {}
  arr.forEach((item) => {
    if (!item[dateKey]) return
    const date = new Date(item[dateKey])
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    counts[month] = (counts[month] || 0) + 1
  })
  // Sort by month ascending
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }))
}

// Helper: Count roles
function countRoles(orgs) {
  const counts = {}
  orgs.forEach((org) => {
    ;(org.members || []).forEach((member) => {
      if (member.role) counts[member.role] = (counts[member.role] || 0) + 1
    })
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// Helper: Get recent orgs
function getRecentOrgs(orgs, n = 5) {
  return [...orgs]
    .filter((org) => org.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, n)
}

// Custom tooltip components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{data.name}</p>
        <p className="text-sm text-slate-600">Count: {data.value}</p>
        <p className="text-sm text-slate-600">Percentage: {((data.value / data.payload.total) * 100).toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export default function GovernmentDashboard() {
  const [pendingDIDs, setPendingDIDs] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      // Fetch pending DIDs
      const didRes = await fetch(`${API_BASE}/api/pending-did`)
      const didData = await didRes.json()
      setPendingDIDs(didData.entries || [])

      // Fetch organizations
      const orgRes = await fetch(`${API_BASE}/api/organization/`)
      const orgData = await orgRes.json()
      setOrganizations(orgData.organizations || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Stat calculations
  const totalPendingDIDs = pendingDIDs.length
  const orgsWithAdmins = organizations.filter((org) => org.tenantAdminAddress).length
  const orgsWithoutAdmins = organizations.length - orgsWithAdmins
  const totalTenantAdmins = orgsWithAdmins

  // Enhanced pie chart data with totals for percentage calculation
  const pieData = [
    { name: "With Admin", value: orgsWithAdmins, total: organizations.length },
    { name: "Without Admin", value: orgsWithoutAdmins, total: organizations.length },
  ]

  // Enhanced color schemes
  const COLORS = {
    primary: ["#3b82f6", "#1d4ed8", "#1e40af"],
    success: ["#10b981", "#059669", "#047857"],
    warning: ["#f59e0b", "#d97706", "#b45309"],
    danger: ["#ef4444", "#dc2626", "#b91c1c"],
    purple: ["#8b5cf6", "#7c3aed", "#6d28d9"],
    pink: ["#ec4899", "#db2777", "#be185d"],
    gradient: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#84cc16"],
  }

  // OEM analytics with enhanced data
  const countryData = countBy(organizations, "countryRegion")
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 countries

  const oemTypeData = countBy(organizations, "oemType").sort((a, b) => b.value - a.value)

  const chemistryData = countChemistries(organizations)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 chemistries

  // Enhanced monthly data with cumulative totals
  const orgsByMonth = groupByMonth(organizations, "createdAt")
  let cumulative = 0
  const enhancedMonthlyData = orgsByMonth.map((item) => {
    cumulative += item.value
    return {
      ...item,
      cumulative,
      monthName: new Date(item.name + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
    }
  })

  // Roles distribution with radial bar data
  const rolesData = countRoles(organizations)
  const maxRoleValue = Math.max(...rolesData.map((r) => r.value))
  const radialRolesData = rolesData.map((role, index) => ({
    ...role,
    fill: COLORS.gradient[index % COLORS.gradient.length],
    percentage: (role.value / maxRoleValue) * 100,
  }))

  // Quick stats
  const totalOrgs = organizations.length
  const totalMembers = organizations.reduce((sum, org) => sum + (org.members ? org.members.length : 0), 0)
  const avgMembers = totalOrgs ? (totalMembers / totalOrgs).toFixed(1) : 0

  // Recent orgs
  const recentOrgs = getRecentOrgs(organizations, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Government Dashboard</h1>
          <p className="text-slate-600 text-lg">Monitor organizations, DIDs, and system analytics</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending DIDs</p>
                <p className="text-3xl font-bold text-orange-600">{totalPendingDIDs}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Tenant Admins</p>
                <p className="text-3xl font-bold text-blue-600">{totalTenantAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Organizations</p>
                <p className="text-3xl font-bold text-green-600">{totalOrgs}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-purple-600">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending DIDs Table */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-xl font-bold text-slate-800">Pending DIDs</h2>
              <p className="text-sm text-slate-600 mt-1">Review and approve pending DID requests</p>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Requested At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {pendingDIDs.map((did, idx) => (
                    <tr key={did._id || idx} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 bg-slate-100 rounded-md mx-2 my-1">
                        {did.userAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {did.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{did.organizationId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(did.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {pendingDIDs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                          </div>
                          <p>No pending DIDs</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Admin Coverage Donut Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-slate-800">Admin Coverage</h2>
              <p className="text-sm text-slate-600 mt-1">Organizations with and without tenant admins</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="noAdminGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      <Cell fill="url(#adminGradient)" />
                      <Cell fill="url(#noAdminGradient)" />
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontWeight: "600" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{orgsWithAdmins}</div>
                  <div className="text-sm text-slate-600">With Admin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{orgsWithoutAdmins}</div>
                  <div className="text-sm text-slate-600">Without Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Enhanced OEMs by Country - Horizontal Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-lg font-bold text-slate-800">Top Countries</h2>
              <p className="text-xs text-slate-600">OEM distribution by region</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} layout="vertical" margin={{ left: 60 }}>
                    <defs>
                      <linearGradient id="countryGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={60} fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#countryGradient)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Enhanced OEM Types - Vertical Bar Chart with Animation */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h2 className="text-lg font-bold text-slate-800">OEM Types</h2>
              <p className="text-xs text-slate-600">Organization categories</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oemTypeData}>
                    <defs>
                      <linearGradient id="oemGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#oemGradient)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Enhanced Battery Chemistries - Radial Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <h2 className="text-lg font-bold text-slate-800">Battery Types</h2>
              <p className="text-xs text-slate-600">Chemistry distribution</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    data={chemistryData.map((item, index) => ({
                      ...item,
                      fill: COLORS.gradient[index % COLORS.gradient.length],
                    }))}
                  >
                    <RadialBar dataKey="value" cornerRadius={4} fill="#8884d8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" fontSize={12} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Trends and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Organization Growth - Area Chart with Cumulative Line */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-slate-800">Organization Growth</h2>
              <p className="text-sm text-slate-600 mt-1">Monthly registrations and cumulative total</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enhancedMonthlyData}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="monthName" fontSize={12} />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="url(#areaGradient)"
                      name="Monthly New"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                      name="Cumulative Total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Enhanced Roles Distribution - Radial Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h2 className="text-xl font-bold text-slate-800">Roles Distribution</h2>
              <p className="text-sm text-slate-600 mt-1">Member roles across all organizations</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="80%"
                    data={radialRolesData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={8}
                      label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" fontSize={12} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Admins Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-slate-800">Tenant Admins</h2>
            <p className="text-sm text-slate-600 mt-1">Organizations with assigned tenant administrators</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Admin Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {organizations
                  .filter((org) => org.tenantAdminAddress)
                  .map((org, idx) => (
                    <tr key={org._id || idx} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {org.organizationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 bg-slate-100 rounded-md">
                        {org.tenantAdminAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {org.createdAt ? new Date(org.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                {orgsWithAdmins === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        </div>
                        <p>No tenant admins assigned</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-bold text-slate-800">Recent Organizations</h2>
            <p className="text-sm text-slate-600 mt-1">Latest organizations registered in the system</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Organization Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    OEM Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentOrgs.map((org, idx) => (
                  <tr key={org._id || idx} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {org.organizationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {org.countryRegion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {org.oemType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {org.createdAt ? new Date(org.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
                {recentOrgs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        </div>
                        <p>No recent organizations</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

