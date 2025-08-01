
import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { initializeContractInstance } from "../../contractInstance"
import {
  UserPlus,
  Briefcase,
  Building,
  Package,
  CheckCircle,
  CloudCog,
  Battery,
  ChevronDown,
  Users,
} from "lucide-react"
import { apiFetch } from "../../utils/api"
import Web3 from "web3"
import { pinata } from "../../utils/config"

export default function TenantAdminDashboard() {
  const [contracts, setContracts] = useState(null)
  const [account, setAccount] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState("")

  const initialEntityDetails = {
    address: "",
    name: "",
    email: "",
    credentialDuration: 12,
    organizationName: "",
    trustLevel: 3,
    entityRole: "",
    pointOfContactFullName: "",
    pointOfContactEmail: "",
    pointOfContactPhone: "",
    ukCompanyNumber: "",
    businessOperationalLicenseNumber: "",
    businessLicenseFile: "",
    directorIdProofFile: "",
    wasteCarrierLicenseFile: "",
    insuranceCertificateFile: "",
    registeredBusinessAddress: "",
    operationalFacilityAddress: "",
    city: "",
    postcode: "",
    country: "UK",
  }

  const [entityDetails, setEntityDetails] = useState(initialEntityDetails)
  const [organizationStats, setOrganizationStats] = useState({
    totalMembers: 0,
    manufacturers: 0,
    suppliers: 0,
    miners: 0,
    recyclers: 0,
    activeCredentials: 0,
    batteryPassportsCreated: 0,
    totalBatteries: 0,
  })
  const [organizationId, setOrganizationId] = useState("")

  // Uploading states for each file
  const [uploadingBusinessLicense, setUploadingBusinessLicense] = useState(false)
  const [uploadingDirectorId, setUploadingDirectorId] = useState(false)
  const [uploadingWasteCarrier, setUploadingWasteCarrier] = useState(false)
  const [uploadingInsurance, setUploadingInsurance] = useState(false)

  useEffect(() => {
    initializeContracts()
  }, [])

  useEffect(() => {
    if (account) {
      fetchOrganizationData()
    }
  }, [account])

  useEffect(() => {
    if (account && organizationId) {
      const interval = setInterval(() => {
        fetchOrganizationData()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [account, organizationId])

  const initializeContracts = async () => {
    try {
      const contractInstances = await initializeContractInstance()
      setContracts(contractInstances)
      setAccount(contractInstances.account)
    } catch (error) {
      console.error("Error initializing contracts:", error)
      toast.error("Failed to connect to blockchain")
    }
  }

  const fetchOrganizationData = async () => {
    try {
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/admin/${account}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      console.log("=== DEBUG: Organization Data ===")
      if (response.ok) {
        const data = await response.json()
        setOrganizationStats(data.stats)
        setEntityDetails((prev) => ({
          ...prev,
          organizationName: data.organizationName,
        }))
        setOrganizationId(data.organizationId)
      }
    } catch (error) {
      console.error("Error fetching organization data:", error)
    }
  }



  const findCorrectOrganizationName = async () => {
    if (!contracts) return
    const { evContract, account, web3 } = contracts
    const tenantAdminOrg = await evContract.methods.getUserOrganization(account).call()
    console.log("=== DEBUG: Finding Correct Organization Name ===")
    console.log("Tenant admin organization hash:", tenantAdminOrg)
    const possibleNames = [
      "mahindra",
      "mahindra01",
      "Mahindra",
      "Mahindra01",
      "MAHINDRA",
      "MAHINDRA01",
      "mahindra-01",
      "Mahindra-01",
      "mahindra_01",
      "Mahindra_01",
    ]
    for (const name of possibleNames) {
      const testOrgId = `${name}-${account}`
      const testHash = web3.utils.keccak256(testOrgId)
      console.log(`Testing "${name}": ${testHash}`)
      if (testHash === tenantAdminOrg) {
        console.log(`✅ FOUND MATCH: Organization name should be "${name}"`)
        console.log(`Correct organization ID: ${testOrgId}`)
        return name
      }
    }
    console.log("❌ No match found with common variations")
    return null
  }

  const handleRoleChange = (e) => {
    const role = e.target.value
    setSelectedRole(role)
    // Trust levels based on smart contract requirements
    const trustLevels = {
      manufacturer: 4, // MANUFACTURER_ROLE requires trust level 4
      supplier: 3, // SUPPLIER_ROLE requires trust level 3
      miner: 2, // MINER_ROLE requires trust level 2
      recycler: 3, // RECYCLER_ROLE requires trust level 3
    }
    setEntityDetails((prev) => ({
      ...prev,
      trustLevel: trustLevels[role] || 3,
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEntityDetails((prev) => ({
      ...prev,
      [name]: name === "trustLevel" || name === "credentialDuration" ? Number.parseInt(value) || 0 : value,
    }))
  }



  const handleSubmit = async () => {
    if (!contracts || !selectedRole || !entityDetails.address) {
      toast.error("Please select a role and enter an Ethereum address")
      return
    }
    if (!organizationId) {
      toast.error("Organization ID not loaded. Please refresh or try again.")
      return
    }
    setLoading(true)
    try {
      const { evContract, account, web3 } = contracts
      const address = entityDetails.address.trim()
      if (!web3.utils.isAddress(address)) {
        toast.error("Invalid Ethereum address")
        setLoading(false)
        return
      }

      console.log("=== DEBUG: Organization Assignment Check ===")
      console.log("Tenant admin address:", account)
      console.log("Organization ID from backend:", organizationId)
      console.log("Organization ID hash:", Web3.utils.keccak256(organizationId))

      const tenantAdminOrg = await evContract.methods.getUserOrganization(account).call()
      console.log("Tenant admin assigned to organization:", tenantAdminOrg)

      if (tenantAdminOrg === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        toast.error(
          "You are not assigned to any organization. Please contact the government to configure your tenant admin role properly.",
        )
        setLoading(false)
        return
      }

      const actualOrgIdBytes32 = tenantAdminOrg
      console.log("Using actual organization ID from contract:", actualOrgIdBytes32)

      const expectedOrgHash = Web3.utils.keccak256(organizationId)
      if (tenantAdminOrg !== expectedOrgHash) {
        console.warn("Organization ID mismatch detected!")
        console.warn("Expected (from backend):", expectedOrgHash)
        console.warn("Actual (from contract):", tenantAdminOrg)
        console.warn("This is expected if the organization was created with a different name.")
      }

      const roleConstant = await evContract.methods[`${selectedRole.toUpperCase()}_ROLE`]().call()
      if (!roleConstant) {
        toast.error(`Invalid role for ${selectedRole}`)
        setLoading(false)
        return
      }

      await evContract.methods
        .grantRole(roleConstant, address, actualOrgIdBytes32)
        .send({ from: account, gas: 1000000 })
      console.log("Role granted successfully in EVBatteryPassportCore")

      await evContract.methods.assignOrganization(address, actualOrgIdBytes32).send({ from: account, gas: 1000000 })
      console.log("Organization assigned successfully")

      await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/pending-did`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          role: selectedRole.toUpperCase(),
          organizationId: organizationId,
        }),
      })

      // Create user profile if name or email is provided
      if (entityDetails.name || entityDetails.email) {
        try {
          await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ethereumAddress: address,
              profile: {
                contactPerson: entityDetails.name || "",
                email: entityDetails.email || "",
                companyName: entityDetails.name || "",
              },
            }),
          })
        } catch (profileError) {
          console.error("Error creating user profile:", profileError)
          // Don't fail the entire operation if profile creation fails
        }
      }

      toast.success("Member added to organization and pending government approval created!")
      setLoading(false)
      setEntityDetails((prev) => ({ ...prev, address: "", name: "", email: "" }))
      await fetchOrganizationData()
    } catch (error) {
      console.error("Failed to assign role or create pending DID:", error.message)
      toast.error("Failed to assign role or create pending DID.")
      setLoading(false)
    }
  }

  // Pinata upload handlers
  const handleBusinessLicenseUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingBusinessLicense(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setEntityDetails((prev) => ({ ...prev, businessLicenseFile: url }))
      }
    } catch (err) {
      toast.error("Failed to upload business license to Pinata")
    } finally {
      setUploadingBusinessLicense(false)
    }
  }

  const handleDirectorIdUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingDirectorId(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setEntityDetails((prev) => ({ ...prev, directorIdProofFile: url }))
      }
    } catch (err) {
      toast.error("Failed to upload director/officer ID to Pinata")
    } finally {
      setUploadingDirectorId(false)
    }
  }

  const handleWasteCarrierUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingWasteCarrier(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setEntityDetails((prev) => ({ ...prev, wasteCarrierLicenseFile: url }))
      }
    } catch (err) {
      toast.error("Failed to upload waste carrier/environmental license to Pinata")
    } finally {
      setUploadingWasteCarrier(false)
    }
  }

  const handleInsuranceUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingInsurance(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setEntityDetails((prev) => ({ ...prev, insuranceCertificateFile: url }))
      }
    } catch (err) {
      toast.error("Failed to upload insurance certificate to Pinata")
    } finally {
      setUploadingInsurance(false)
    }
  }

  const roles = [
    { value: "manufacturer", label: "Manufacturer" },
    { value: "supplier", label: "Supplier" },
    { value: "miner", label: "Miner" },
    { value: "recycler", label: "Recycler" },
  ]

  const countries = [
    { value: "UK", label: "United Kingdom" },
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "IT", label: "Italy" },
    { value: "ES", label: "Spain" },
    { value: "NL", label: "Netherlands" },
    { value: "BE", label: "Belgium" },
    { value: "CH", label: "Switzerland" },
    { value: "AT", label: "Austria" },
    { value: "SE", label: "Sweden" },
    { value: "NO", label: "Norway" },
    { value: "DK", label: "Denmark" },
    { value: "FI", label: "Finland" },
    { value: "IE", label: "Ireland" },
    { value: "PT", label: "Portugal" },
    { value: "GR", label: "Greece" },
    { value: "PL", label: "Poland" },
    { value: "CZ", label: "Czech Republic" },
    { value: "HU", label: "Hungary" },
    { value: "SK", label: "Slovakia" },
    { value: "SI", label: "Slovenia" },
    { value: "HR", label: "Croatia" },
    { value: "BG", label: "Bulgaria" },
    { value: "RO", label: "Romania" },
    { value: "EE", label: "Estonia" },
    { value: "LV", label: "Latvia" },
    { value: "LT", label: "Lithuania" },
    { value: "LU", label: "Luxembourg" },
    { value: "MT", label: "Malta" },
    { value: "CY", label: "Cyprus" },
    { value: "JP", label: "Japan" },
    { value: "KR", label: "South Korea" },
    { value: "CN", label: "China" },
    { value: "IN", label: "India" },
    { value: "SG", label: "Singapore" },
    { value: "HK", label: "Hong Kong" },
    { value: "TW", label: "Taiwan" },
    { value: "MY", label: "Malaysia" },
    { value: "TH", label: "Thailand" },
    { value: "ID", label: "Indonesia" },
    { value: "PH", label: "Philippines" },
    { value: "VN", label: "Vietnam" },
    { value: "BR", label: "Brazil" },
    { value: "MX", label: "Mexico" },
    { value: "AR", label: "Argentina" },
    { value: "CL", label: "Chile" },
    { value: "CO", label: "Colombia" },
    { value: "PE", label: "Peru" },
    { value: "ZA", label: "South Africa" },
    { value: "EG", label: "Egypt" },
    { value: "NG", label: "Nigeria" },
    { value: "KE", label: "Kenya" },
    { value: "MA", label: "Morocco" },
    { value: "TN", label: "Tunisia" },
    { value: "IL", label: "Israel" },
    { value: "AE", label: "United Arab Emirates" },
    { value: "SA", label: "Saudi Arabia" },
    { value: "TR", label: "Turkey" },
    { value: "RU", label: "Russia" },
    { value: "UA", label: "Ukraine" },
    { value: "BY", label: "Belarus" },
    { value: "KZ", label: "Kazakhstan" },
    { value: "UZ", label: "Uzbekistan" },
    { value: "NZ", label: "New Zealand" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-900 p-3 rounded-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">Tenant Admin Dashboard</h1>
                <p className="mt-1 text-gray-600">Manage your organization's manufacturers and suppliers</p>
                {entityDetails.organizationName && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium">
                    <Building className="w-4 h-4 mr-2" />
                    {entityDetails.organizationName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Battery className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{organizationStats.totalBatteries}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">Battery Passports</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{organizationStats.totalMembers}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">Total Members</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{organizationStats.manufacturers}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">Manufacturers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{organizationStats.suppliers}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">Suppliers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CloudCog className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{organizationStats.miners}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">Miners</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CloudCog className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{organizationStats.recyclers}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">Recyclers</p>
          </div>
        </div>

        {/* Full Width Add Member Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="bg-gray-900 p-6 rounded-t-lg">
            <h2 className="text-xl font-bold text-white">Assign Organization Role</h2>
            <p className="mt-1 text-gray-300">Add manufacturers and suppliers to your organization</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  name="organizationName"
                  value={entityDetails.organizationName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ethereum Wallet Address</label>
                <input
                  type="text"
                  name="address"
                  value={entityDetails.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name of Point of Contact</label>
                <input
                  type="text"
                  name="pointOfContactFullName"
                  value={entityDetails.pointOfContactFullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name of Point of Contact</label>
                <input
                  type="text"
                  name="pointOfContactFullName"
                  value={entityDetails.pointOfContactFullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="pointOfContactEmail"
                  value={entityDetails.pointOfContactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="pointOfContactPhone"
                  value={entityDetails.pointOfContactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UK Company Number</label>
                <input
                  type="text"
                  name="ukCompanyNumber"
                  value={entityDetails.ukCompanyNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Companies House Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business/Operational License Number
                </label>
                <input
                  type="text"
                  name="businessOperationalLicenseNumber"
                  value={entityDetails.businessOperationalLicenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter license number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={entityDetails.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                <input
                  type="text"
                  name="postcode"
                  value={entityDetails.postcode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter postcode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <div className="relative">
                  <select
                    name="country"
                    value={entityDetails.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                  >
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registered Business Address</label>
                <input
                  type="text"
                  name="registeredBusinessAddress"
                  value={entityDetails.registeredBusinessAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter registered address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operational Facility Address (optional)
                </label>
                <input
                  type="text"
                  name="operationalFacilityAddress"
                  value={entityDetails.operationalFacilityAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter operational address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Business License (PDF/Image)
                </label>
                <input
                  type="file"
                  name="businessLicenseFile"
                  accept=".pdf,image/*"
                  onChange={handleBusinessLicenseUpload}
                  disabled={uploadingBusinessLicense}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {uploadingBusinessLicense && <span className="text-blue-600 text-xs">Uploading...</span>}
                {entityDetails.businessLicenseFile && (
                  <a
                    href={entityDetails.businessLicenseFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-600 mt-1 hover:underline"
                  >
                    View Uploaded License
                  </a>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Director/Officer ID Proof (PDF/Image)
                </label>
                <input
                  type="file"
                  name="directorIdProofFile"
                  accept=".pdf,image/*"
                  onChange={handleDirectorIdUpload}
                  disabled={uploadingDirectorId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {uploadingDirectorId && <span className="text-blue-600 text-xs">Uploading...</span>}
                {entityDetails.directorIdProofFile && (
                  <a
                    href={entityDetails.directorIdProofFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-600 mt-1 hover:underline"
                  >
                    View Uploaded ID
                  </a>
                )}
              </div>
            </div>

            {(selectedRole === "recycler" || selectedRole === "miner") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waste Carrier/Environmental License (PDF/Image)
                  </label>
                  <input
                    type="file"
                    name="wasteCarrierLicenseFile"
                    accept=".pdf,image/*"
                    onChange={handleWasteCarrierUpload}
                    disabled={uploadingWasteCarrier}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                  {uploadingWasteCarrier && <span className="text-blue-600 text-xs">Uploading...</span>}
                  {entityDetails.wasteCarrierLicenseFile && (
                    <a
                      href={entityDetails.wasteCarrierLicenseFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 mt-1 hover:underline"
                    >
                      View Uploaded License
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Certificate (optional)</label>
                <input
                  type="file"
                  name="insuranceCertificateFile"
                  accept=".pdf,image/*"
                  onChange={handleInsuranceUpload}
                  disabled={uploadingInsurance}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {uploadingInsurance && <span className="text-blue-600 text-xs">Uploading...</span>}
                {entityDetails.insuranceCertificateFile && (
                  <a
                    href={entityDetails.insuranceCertificateFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-600 mt-1 hover:underline"
                  >
                    View Uploaded Certificate
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                disabled={loading || !selectedRole || !entityDetails.address}
                onClick={handleSubmit}
                className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add to Organization
                  </>
                )}
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
