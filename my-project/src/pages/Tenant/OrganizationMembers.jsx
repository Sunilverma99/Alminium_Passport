import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { useSelector } from "react-redux"
import {
  Users,
  AlertCircle,
  CheckCircle,
  Edit3,
  X,
} from "lucide-react"
import { apiFetch } from "../../utils/api"

export default function OrganizationMembers() {
  const { userAddress } = useSelector((state) => state.contract)
  const [organizationMembers, setOrganizationMembers] = useState([])
  const [organizationId, setOrganizationId] = useState("")
  const [pendingDIDs, setPendingDIDs] = useState([])
  const [editingMember, setEditingMember] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userAddress) {
      fetchOrganizationData()
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchOrganizationData(true)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [userAddress])

  const fetchOrganizationData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/admin/${userAddress}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        setOrganizationMembers(data.members || [])
        setOrganizationId(data.organizationId)
        if (data.organizationId) {
          fetchPendingDIDs(data.organizationId)
        }
      } else {
        console.log("Failed to fetch organization data, using fallback...")
        setOrganizationMembers([])
        setOrganizationId("")
      }
    } catch (error) {
      console.error("Error fetching organization data:", error)
      if (!silent) {
        toast.error("Failed to load organization data")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingDIDs = async (orgId) => {
    try {
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/pending-did`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        const data = await response.json()
        const orgPendingDIDs =
          data.entries?.filter((entry) => entry.organizationId === orgId && entry.status === "pending") || []
        setPendingDIDs(orgPendingDIDs)
      }
    } catch (error) {
      console.error("Error fetching pending DIDs:", error)
      setPendingDIDs([])
    }
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setEditForm({
      name: member.name || "",
      email: member.email || "",
    })
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveEdit = async () => {
    if (!editingMember || !organizationId) return
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/organization/${organizationId}/members/${editingMember.ethereumAddress}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        },
      )
      if (response.ok) {
        toast.success("Member details updated successfully!")
        setEditingMember(null)
        setEditForm({ name: "", email: "" })
        await fetchOrganizationData() // Refresh the data
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update member details")
      }
    } catch (error) {
      console.error("Error updating member:", error)
      toast.error("Failed to update member details")
    }
  }

  const handleCancelEdit = () => {
    setEditingMember(null)
    setEditForm({ name: "", email: "" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading organization members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900">Organization Members</h1>
              <p className="mt-1 text-gray-600">Manage and view your organization's members</p>
            </div>
          </div>
        </div>

        {/* Organization Members List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="bg-gray-900 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Current Members</h2>
                <p className="mt-1 text-gray-300">All members in your organization</p>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-white font-bold">{organizationMembers.length} members</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {organizationMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500 mb-2">No members yet</p>
                <p className="text-gray-400">Start by adding your first organization member</p>
              </div>
            ) : (
              <div className="space-y-4">
                {organizationMembers.map((member, index) => (
                  <div
                    key={member.ethereumAddress}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">
                              {member.ethereumAddress.slice(2, 4).toUpperCase()}
                            </span>
                          </div>
                          {(member.isActive === true || String(member.isActive).toLowerCase() === "true") && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            {member.ethereumAddress.slice(0, 6)}...{member.ethereumAddress.slice(-4)}
                          </p>
                          {member.email && <p className="text-xs text-gray-500 mt-1">{member.email}</p>}
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {member.isActive === true || String(member.isActive).toLowerCase() === "true" ? (
                          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">Pending</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          title="Edit member details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Assignments */}
        {pendingDIDs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-yellow-500 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Pending Assignments</h2>
                  <p className="mt-1 text-yellow-100">Waiting for government approval</p>
                </div>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="text-white font-bold">{pendingDIDs.length} pending</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingDIDs.map((pending, index) => (
                  <div key={pending._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 font-mono text-sm">{pending.userAddress}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {pending.role.toLowerCase()}
                            </span>
                            <span className="text-sm text-gray-600">
                              Requested: {new Date(pending.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-200 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-yellow-800">Pending Approval</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {editingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Edit Member Details</h3>
                <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter member name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter member email"
                  />
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>
                    <strong>Address:</strong> {editingMember.ethereumAddress}
                  </p>
                  <p>
                    <strong>Role:</strong> {editingMember.role}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 