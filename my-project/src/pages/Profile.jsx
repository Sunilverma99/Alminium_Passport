"use client"

import { useEffect, useState } from "react"
import {
  Clipboard,
  Clock,
  ExternalLink,
  Shield,
  User,
  Building2,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { toast } from "react-hot-toast"


export default function Profile() {
  const [copied, setCopied] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [debugMode, setDebugMode] = useState(false)

  const fetchUserCredential = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Requesting Ethereum accounts...")
      const accounts = await window.ethereum.request({ method: "eth_accounts" })

      if (!accounts || accounts.length === 0) {
        setError("No connected Ethereum account found. Please connect your wallet.")
        setLoading(false)
        return
      }

      const ethereumAddress = accounts[0]
      console.log("Ethereum Address:", ethereumAddress)

      const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(ethereumAddress)}`
      console.log("Fetching from:", requestUrl)

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      console.log("Response status:", response.status)

              if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User profile not found. Please ensure your account has been registered. You may need to create a user credential first.")
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`)
        }

              const data = await response.json()
        console.log("User Credential Data:", data)
        
        // Handle new API response format
        const userData = data.user || data
        
        // Validate required fields
        if (!userData.ethereumAddress || !userData.didName || !userData.role) {
          throw new Error("Invalid user data received from server")
        }
        
        toast.success("User credentials loaded successfully!")
        setUserData(userData)
    } catch (error) {
      console.error("Error fetching user credentials:", error)
      const errorMessage = error instanceof Error ? error.message : "Error fetching user credentials"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserCredential()
  }, [])

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date))
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const truncateAddress = (address) => {
    if (!address) return "N/A"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const truncateDID = (did) => {
    if (!did) return "Unknown DID"
    const parts = did.split("#")[0]
    if (parts.length > 25) {
      return `${parts.substring(0, 22)}...`
    }
    return parts
  }

  const getRoleColor = (role) => {
    if (!role) return "bg-gray-100 text-gray-800 border border-gray-200"
    
    switch (role.toLowerCase()) {
      case "manufacturer":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "tenant_admin":
      case "tenantadmin":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      case "government":
        return "bg-red-100 text-red-800 border border-red-200"
      case "supplier":
        return "bg-green-100 text-green-800 border border-green-200"
      case "recycler":
        return "bg-orange-100 text-orange-800 border border-orange-200"
      case "miner":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "consumer":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200"
      case "public":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getRoleDisplayName = (role) => {
    if (!role) return "Unknown"
    
    switch (role.toLowerCase()) {
      case "tenant_admin":
      case "tenantadmin":
        return "Tenant Admin"
      case "manufacturer":
        return "Manufacturer"
      case "government":
        return "Government"
      case "supplier":
        return "Supplier"
      case "recycler":
        return "Recycler"
      case "miner":
        return "Miner"
      case "consumer":
        return "Consumer"
      case "public":
        return "Public"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-96">
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Profile</h2>
            <p className="text-gray-500 text-center">Fetching your credential information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-96">
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Profile</h2>
            <p className="text-gray-500 text-center mb-4">{error || "Failed to load user data"}</p>
            <div className="flex space-x-2">
              <button
                onClick={fetchUserCredential}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reload Page
              </button>
            </div>
            {debugMode && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Backend URL: {import.meta.env.VITE_BACKEND_URL}</p>
                <p>Error: {error}</p>
              </div>
            )}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              {debugMode ? "Hide Debug Info" : "Show Debug Info"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            User Profile
          </h1>
          <p className="text-gray-500">Manage your digital identity and credentials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 min-w-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="text-center p-6 pb-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                  {userData.didName && userData.didName.split(":")[2]?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-semibold break-all overflow-hidden" title={userData.didName ? userData.didName.split("#")[0] : "Unknown DID"}>
                    {truncateDID(userData.didName)}
                  </h3>
                  {userData.didName && userData.didName.split("#")[0].length > 25 && (
                    <button
                      onClick={() => copyToClipboard(userData.didName.split("#")[0], "didName")}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy full DID name"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${getRoleColor(userData.role)}`}
                >
                  {getRoleDisplayName(userData.role)}
                </span>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Address</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {truncateAddress(userData.ethereumAddress)}
                      </code>
                      <button
                        className="h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                        onClick={() => copyToClipboard(userData.ethereumAddress, "address")}
                      >
                        <Clipboard className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">User ID</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{userData.id ? userData.id.slice(-8) : "N/A"}</code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Member Since</span>
                    <span className="text-xs">{formatDate(userData.createdAt).split(",")[0]}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-500">Verified Account</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                      activeTab === "overview"
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("credentials")}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                      activeTab === "credentials"
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Credentials
                  </button>
                  <button
                    onClick={() => setActiveTab("organization")}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                      activeTab === "organization"
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Organization
                  </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                        <User className="h-5 w-5" />
                        Account Details
                      </h2>
                      <p className="text-gray-500 text-sm">Complete information about your profile and identity</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">DID Name</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm break-all">
                              {userData.didName || "N/A"}
                            </code>
                            <button
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              onClick={() => copyToClipboard(userData.didName, "didName")}
                            >
                              <Clipboard className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Ethereum Address</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm break-all">
                              {userData.ethereumAddress || "N/A"}
                            </code>
                            <button
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              onClick={() => copyToClipboard(userData.ethereumAddress, "fullAddress")}
                            >
                              <Clipboard className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Credential ID</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm break-all">
                              {userData.credentialId || "N/A"}
                            </code>
                            <button
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              onClick={() => copyToClipboard(userData.credentialId, "credentialId")}
                            >
                              <Clipboard className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Organization ID</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm break-all">
                              {userData.organizationId || "N/A"}
                            </code>
                            <button
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              onClick={() => copyToClipboard(userData.organizationId, "organizationId")}
                            >
                              <Clipboard className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Created</p>
                              <p className="text-sm text-gray-500">{formatDate(userData.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Last Updated</p>
                              <p className="text-sm text-gray-500">{formatDate(userData.updatedAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Credentials Tab */}
                {activeTab === "credentials" && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5" />
                        Credential Information
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Details about your authentication credentials and security status
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-full bg-green-100">
                            <Shield className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-green-900">Verified Credential</h3>
                            <p className="text-sm text-green-700">
                              Your credential has been verified and is currently active
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
                                Active
                              </span>
                              <span className="px-3 py-1 text-xs font-medium rounded-full border border-green-500 text-green-700 bg-white">
                                High Security
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Credential Details</h3>
                        <div className="p-4 rounded-lg border border-gray-200 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Credential ID</span>
                              <code className="text-sm font-mono">
                                {userData.credentialId
                                  ? `${userData.credentialId.slice(0, 16)}...${userData.credentialId.slice(-4)}`
                                  : 'N/A'}
                              </code>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Type</span>
                              <span className="text-sm">Ethereum Wallet</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Status</span>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                Active
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Last Verified</span>
                              <span className="text-sm">{formatDate(userData.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center pt-4">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View on Blockchain
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Organization Tab */}
                {activeTab === "organization" && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5" />
                        Organization Details
                      </h2>
                      <p className="text-gray-500 text-sm">Information about your organization and membership</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-full bg-blue-100">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-blue-900">Organization Member</h3>
                            <p className="text-sm text-blue-700">You are an active member of this organization</p>
                            <span
                              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(userData.role)}`}
                            >
                              {getRoleDisplayName(userData.role)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Organization Information</h3>
                        <div className="p-4 rounded-lg border border-gray-200 bg-white space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-500">Organization ID</span>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono break-all max-w-xs text-right">
                                {userData.organizationId || "N/A"}
                              </code>
                              <button
                                className="h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                                onClick={() => copyToClipboard(userData.organizationId, "orgId")}
                              >
                                <Clipboard className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Your Role</span>
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(userData.role)}`}
                              >
                                {getRoleDisplayName(userData.role)}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Member Since</span>
                            <span className="text-sm">{formatDate(userData.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
