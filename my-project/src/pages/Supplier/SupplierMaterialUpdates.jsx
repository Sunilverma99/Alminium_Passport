
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast, Toaster } from "react-hot-toast"
import { CheckCircle, Clock, AlertCircle, RefreshCw, Loader2, Battery } from "lucide-react"
import { apiFetch } from "../../utils/api"
import SupplierUpdateForm from "../../components/Supplier/SupplierUpdateForm"
import { initializeContractInstance } from "../../contractInstance"
import BatteryMaterialComposition from "../../components/BatteryMaterialComposition"
import SupplyChainDueDiligenceForm from "../../components/SupplyChainDueDiligenceForm"

const SupplierMaterialUpdates = () => {
  const { userAddress } = useSelector((state) => state.contract)
  const [batteries, setBatteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedBattery, setSelectedBattery] = useState(null)
  const [filters, setFilters] = useState({
    materialStatus: "all",
    search: "",
    priority: "all",
  })
  const [tokenIdInput, setTokenIdInput] = useState("")
  const [fetchingToken, setFetchingToken] = useState(false)
  const [prefillData, setPrefillData] = useState({ material: {}, dueDiligence: {} })
  const [dataFetched, setDataFetched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userAddress) {
      fetchBatteries()
    }
  }, [userAddress])

  const fetchBatteries = async () => {
    try {
      setLoading(true)
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/supplier/${userAddress}`)
      if (response.ok) {
        const data = await response.json()
        setBatteries(data.batteries || [])
      }
    } catch (error) {
      console.error("Error fetching batteries:", error)
      toast.error("Failed to load batteries")
    } finally {
      setLoading(false)
    }
  }

  const openUpdateModal = (battery) => {
    setSelectedBattery(battery)
    setShowUpdateModal(true)
  }

  const getMaterialStatus = (battery) => {
    if (battery.materialComposition) {
      return { status: "completed", label: "Completed", color: "green", icon: CheckCircle }
    } else if (battery.status === "created") {
      return { status: "pending", label: "Pending", color: "yellow", icon: Clock }
    } else {
      return { status: "incomplete", label: "Incomplete", color: "red", icon: AlertCircle }
    }
  }

  const getPriorityLevel = (battery) => {
    const daysSinceCreated = battery.createdAt
      ? Math.floor((new Date() - new Date(battery.createdAt)) / (1000 * 60 * 60 * 24))
      : 0
    if (daysSinceCreated > 30) return "high"
    if (daysSinceCreated > 7) return "medium"
    return "low"
  }

  const filteredBatteries = batteries.filter((battery) => {
    const matchesSearch = battery.batteryId.toLowerCase().includes(filters.search.toLowerCase())
    const materialStatus = getMaterialStatus(battery)
    const matchesStatus = filters.materialStatus === "all" || materialStatus.status === filters.materialStatus
    const priority = getPriorityLevel(battery)
    const matchesPriority = filters.priority === "all" || priority === filters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const fetchFromPinata = async (ipfsHash) => {
    if (!ipfsHash) return {}
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      const res = await fetch(url)
      if (!res.ok) return {}
      return await res.json()
    } catch {
      return {}
    }
  }

  const fetchBatteryByTokenId = async () => {
    if (!tokenIdInput) {
      setError("Please enter a Token ID")
      return
    }

    setFetchingToken(true)
    setError('')
    try {
      const { evContract, account } = await initializeContractInstance()

      const tokenExists = await evContract.methods.exists(Number(tokenIdInput)).call()
      if (!tokenExists) {
        setError("Token ID does not exist on-chain")
        setFetchingToken(false)
        return
      }

      const userResponse = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/member/${account}`)
      if (!userResponse.ok) {
        setError("Failed to fetch user credential data")
        setFetchingToken(false)
        return
      }

      const userData = await userResponse.json()
      console.log("User credential data:", userData)

      const batteryResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenIdInput}`,
      )
      let batteryData = null
      if (batteryResponse.ok) {
        batteryData = await batteryResponse.json()
        console.log("Battery data from backend:", batteryData)
      }

      let materialData = {}
      let dueDiligenceData = {}

      if (batteryData?.materialCompositionHashes?.[batteryData.materialCompositionHashes?.length - 1]) {
        try {
          materialData = await fetchFromPinata(
            batteryData.materialCompositionHashes[batteryData.materialCompositionHashes?.length - 1],
          )
          console.log("Material data from Pinata:", materialData)
        } catch (error) {
          console.error("Error fetching material data from Pinata:", error)
        }
      }

      if (batteryData?.dueDiligenceHashes?.[batteryData?.dueDiligenceHashes?.length - 1]) {
        try {
          dueDiligenceData = await fetchFromPinata(
            batteryData.dueDiligenceHashes[batteryData?.dueDiligenceHashes?.length - 1],
          )
          console.log("Due diligence data from Pinata:", dueDiligenceData)
        } catch (error) {
          console.error("Error fetching due diligence data from Pinata:", error)
        }
      }

      const battery = {
        batteryId: tokenIdInput,
        ...batteryData,
      }

      setPrefillData({
        material: materialData,
        dueDiligence: dueDiligenceData,
      })

      setSelectedBattery(battery)
      setShowUpdateModal(true)
      toast.success("Battery data fetched successfully")
      setDataFetched(true)
    } catch (error) {
      console.error("Error fetching battery:", error)
      setError("Failed to fetch battery data: " + error.message)
    } finally {
      setFetchingToken(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      {!dataFetched && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
              <Battery className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Battery Passport</h1>
            <p className="mt-2 text-gray-600">
              View detailed information about your battery&apos;s specifications and history
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 max-w-xl mx-auto space-y-6">
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
                Token ID
              </label>
              <input
                id="tokenId"
                type="text"
                value={tokenIdInput}
                onChange={(e) => {
                  setTokenIdInput(e.target.value)
                  setError('')
                }}
                placeholder="Enter Token ID (e.g., 123456)"
                className={`w-full mt-1 px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                  ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'}`}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={fetchBatteryByTokenId}
              disabled={fetchingToken || !tokenIdInput || !!error}
              className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchingToken ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Fetching Passport...</span>
                </>
              ) : (
                <>
                  <Battery className="w-5 h-5 mr-2" />
                  <span>View Battery Passport</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedBattery && (
        <SupplierUpdateForm
          battery={selectedBattery}
          prefillData={prefillData}
          onUpdate={() => {
            setShowUpdateModal(false)
            setSelectedBattery(null)
            setDataFetched(false)
            fetchBatteries()
          }}
          onClose={() => {
            setShowUpdateModal(false)
            setSelectedBattery(null)
            setDataFetched(false)
          }}
          MaterialComponent={BatteryMaterialComposition}
          DueDiligenceComponent={SupplyChainDueDiligenceForm}
        />
      )}
    </div>
  )
}

export default SupplierMaterialUpdates
