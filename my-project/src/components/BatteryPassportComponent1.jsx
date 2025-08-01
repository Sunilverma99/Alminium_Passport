
import { useState, useEffect } from "react"
import PassportQRCode from "./PassportQRCode.jsx"
import PieChartJs from "./PieChartJs.jsx"
import DonutChart from "./DonutCharJs.jsx"
import { GiHealthCapsule } from "react-icons/gi"
import InformationBar from "./InformationBar.jsx"
import { pinata } from "../utils/config.js"
import { apiFetch } from "../utils/api.js"
import { Leaf } from "lucide-react"

export default function BatteryPassportComponent({ tokenId: externalTokenId }) {
    const initialTokenId = externalTokenId || ''

  const [tokenId, setTokenId] = useState(initialTokenId)
  const [version, setVersion] = useState(0)
  const [batteryData, setBatteryData] = useState(null)
  const [materialCharts, setMaterialCharts] = useState([])
  const [carbonFootprint, setCarbonFootprint] = useState({ total: 0, byStage: [] })
  const [batteryHealth, setBatteryHealth] = useState(0)
  const [orbitDbData, setOrbitDbData] = useState({})
  const [recycledContentData, setRecycledContentData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [organizationData, setOrganizationData] = useState(null)

  // Function to fetch organization logo using token ID
  const fetchOrganizationLogo = async (tokenId) => {
    if (!tokenId) return;
    
    try {
      // 1. Get token data (which includes organizationId) from backend
      const tokenResponse = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenId}`);
      if (!tokenResponse.ok) {
        console.log('Token data not found for tokenId:', tokenId);
        return;
      }
      
      const tokenData = await tokenResponse.json();
      const organizationId = tokenData.organizationId;
      
      if (!organizationId) {
        console.log('No organizationId found in token data');
        return;
      }

      // 2. Get organization details using organizationId
      const orgResponse = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/${organizationId}`);
      if (!orgResponse.ok) {
        console.log('Organization not found for organizationId:', organizationId);
        return;
      }
      
      const orgData = await orgResponse.json();
      if (orgData.organization && orgData.organization.logoBrandingAssets) {
        const logoUrl = orgData.organization.logoBrandingAssets;
        console.log('Organization logo URL:', logoUrl);
        console.log('Organization name:', orgData.organization.organizationName);
        
        // Validate if the URL is a proper Pinata IPFS URL
        if (logoUrl && logoUrl.includes('gateway.pinata.cloud/ipfs/')) {
          setOrganizationData(orgData.organization);
        } else {
          console.warn('Invalid logo URL format. Expected Pinata IPFS URL, got:', logoUrl);
          // Set organization data without logo to show fallback
          setOrganizationData({
            ...orgData.organization,
            logoBrandingAssets: null
          });
        }
      } else {
        console.log('No logo found for organization:', orgData.organization);
      }
    } catch (error) {
      console.error('Error fetching organization logo:', error);
    }
  };

  async function fetchBatteryData() {
    if (!tokenId) {
      setError("Token ID is required")
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError("")
    try {
      // 1) On-chain fetch
      
      // 2) Off-chain fetch: get only hashes
      const offChainResp = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenId}`)
      if (!offChainResp.ok) {
        const msg = await offChainResp.text()
        throw new Error(`Off-chain fetch error: ${msg}`)
      }
      const offChainHashes = await offChainResp.json()
      
      console.log('Off-chain hashes received:', offChainHashes);
      console.log('Material composition hashes:', offChainHashes.materialCompositionHashes);

      // determine index - always get the latest version with safety checks
      const getLatestIndex = (array) => {
        if (!array || array.length === 0) return -1;
        return array.length - 1;
      };

      // helper to fetch actual JSON from Pinata
      const fetchFromPinata = async (hash) => {
        if (!hash) {
          throw new Error("Missing IPFS hash")
        }
        const json = await pinata.gateways.get(hash)
        return json.data
      }

      // 3) fetch all OrbitDB JSON data
      const [mat, cf, perf, circ, labels, dd, gpi] = await Promise.all([
        fetchFromPinata(offChainHashes.materialCompositionHashes[getLatestIndex(offChainHashes.materialCompositionHashes)]),
        fetchFromPinata(offChainHashes.carbonFootprintHashes[getLatestIndex(offChainHashes.carbonFootprintHashes)]),
        fetchFromPinata(offChainHashes.performanceDataHashes[getLatestIndex(offChainHashes.performanceDataHashes)]),
        fetchFromPinata(offChainHashes.circularityDataHashes[getLatestIndex(offChainHashes.circularityDataHashes)]),
        fetchFromPinata(offChainHashes.labelsDataHashes[getLatestIndex(offChainHashes.labelsDataHashes)]),
        fetchFromPinata(offChainHashes.dueDiligenceHashes[getLatestIndex(offChainHashes.dueDiligenceHashes)]),
        fetchFromPinata(offChainHashes.generalProductInfoHashes[getLatestIndex(offChainHashes.generalProductInfoHashes)]),
      ])

      // store raw OrbitDB data if needed
      setOrbitDbData({ mat, cf, perf, circ, labels, dd, gpi })
      console.log("Fetched OrbitDB data:", { mat, cf, perf, circ, labels, dd, gpi })

      // 4) Build UI state
      setBatteryData({
        passportId: gpi.battery_passport_identifier,
        model: mat.battery_chemistry__short_name,
        serialNumber: gpi.product_identifier,
        category: gpi.battery_category || "EV Battery",
        weight: Number(gpi.battery_mass) || 450, // Use real mass or fallback to 450
        status: gpi.battery_status || "Original",
        manufacturedDate: new Date(gpi.manufacturing_date).toLocaleDateString() || "2025-06-18",
        manufacturer: gpi.manufacturer_information__contact_name,
        economicOperator: gpi.operator_information__contact_name,
        sustainabilityScore: Math.round((Number(circ.renewable_content) || 0) * 10),
      })

      setCarbonFootprint({
        total: cf.batteryCarbonFootprint ? Number(cf.batteryCarbonFootprint) : 0,
        byStage: (cf.carbonFootprintPerLifecycleStage || []).map((s) => ({
          name: s.lifecycleStage,
          value: Number(s.carbonFootprint) || 0,
        })),
      })

      const fade = Number(perf.battery_condition__power_fade) || 0
      const effFade = Number(perf.battery_condition__round_trip_efficiency_fade) || 0
      const used = Number(perf.battery_condition__number_of_full_cycles__number_of_full_cycles_value) || 0
      const maxCycles = Number(perf.battery_techical_properties__expected_number_of_cycles) || 1
      const cyclePct = (used / maxCycles) * 100
      const health = Math.max(0, 100 - Math.max(fade, effFade, cyclePct))
      setBatteryHealth(Math.round(health))

      // Calculate total mass of all materials
      console.log('Processing material composition data:', mat);
      console.log('Battery materials array:', mat.battery_materials);
      
      if (!mat.battery_materials || mat.battery_materials.length === 0) {
        console.warn('No battery materials found in the data');
        setMaterialCharts([]);
      } else {
        const totalMaterialMass = (mat.battery_materials || []).reduce((sum, material) => {
          return sum + (Number(material.battery_material_mass) || 0)
        }, 0)

        setMaterialCharts(
          (mat.battery_materials || []).map((material) => {
            const mass = Number(material.battery_material_mass) || 0
            const percentage = totalMaterialMass > 0 ? Math.round((mass / totalMaterialMass) * 100) : 0

            return {
              material: material.battery_material_name,
              mass: mass,
              percentage: percentage,
              component: material.battery_material_location.component_name,
              isCritical: material.is_critical_raw_material,
              shares: [
                {
                  label: "Material Mass",
                  value: percentage,
                },
              ],
            }
          }),
        )
      }

      // Extract recycled content data from circularity data
      if (circ.recycled_content && Array.isArray(circ.recycled_content)) {
        setRecycledContentData(
          circ.recycled_content.map((item) => ({
            material: item.recycled_material,
            preConsumerShare: Number(item.pre_consumer_share) || 0,
            postConsumerShare: Number(item.post_consumer_share) || 0,
            totalRecycledShare: (Number(item.pre_consumer_share) || 0) + (Number(item.post_consumer_share) || 0),
          })),
        )
      } else {
        // Fallback to example data structure if not available in fetched data
        setRecycledContentData([
          {
            material: "Cobalt",
            preConsumerShare: 12,
            postConsumerShare: 4,
            totalRecycledShare: 16,
          },
          {
            material: "Nickel",
            preConsumerShare: 15,
            postConsumerShare: 5,
            totalRecycledShare: 20,
          },
          {
            material: "Lithium",
            preConsumerShare: 8,
            postConsumerShare: 2,
            totalRecycledShare: 10,
          },
          {
            material: "Aluminum",
            preConsumerShare: 20,
            postConsumerShare: 10,
            totalRecycledShare: 30,
          },
        ])
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tokenId) {
      fetchBatteryData()
      fetchOrganizationLogo(tokenId)
    }
  }, [tokenId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Battery Data</div>
          <div className="text-red-500">{error}</div>
          <button
            onClick={fetchBatteryData}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!batteryData) return null

  const currentURL = window.location.href

  return (
    <div className="max-w-7xl mx-auto p-8 mt-2 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-blue-800">Battery Passport</h1>
          <div className="text-sm text-gray-600">Unique ID</div>
          <div className="font-mono text-xs bg-white p-2 rounded-lg shadow-inner break-all">
            {batteryData.passportId}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-semibold">Verified</span>
        </div>
      </div>

      {/* BATTERY DETAILS & IMAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-8 bg-white p-6 rounded-xl shadow-md">
        {/* Battery Details */}
        <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {[
            { label: "Model", value: batteryData.model },
            { label: "Serial", value: batteryData.serialNumber },
            { label: "Category", value: batteryData.category },
            { label: "Weight", value: `${batteryData.weight} kg` },
            { label: "Rated Capacity", value: "94 KWh" },
            { label: "Chemistry", value: "Lithium-ion (Li-ion)" },
            { label: "Status", value: batteryData.status, status: true },
            { label: "Manufactured", value: batteryData.manufacturedDate },
          ].map((item, index) => (
            <div key={index}>
              <div className="text-gray-500 text-xs uppercase mb-1">{item.label}</div>
              {item.status ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-bold text-sm sm:text-lg">{item.value}</span>
                </div>
              ) : (
                <div className="font-bold text-sm sm:text-lg">{item.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Image Section */}
        <div className="flex justify-center">
          <img
            src="/ev-battery-removebg-preview.png"
            alt="Battery Image"
            className="w-56 h-56 object-cover rounded-lg"
          />
        </div>

        {/* MANUFACTURER INFO */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-md text-white">
          <div className="text-xs uppercase mb-1 opacity-80">Manufacturer</div>
          <div className="font-bold text-lg">{batteryData.manufacturer}</div>
          
          <div className="text-xs uppercase mb-1 opacity-80 mt-4">Economic Operator</div>
          <div className="font-bold text-lg">{batteryData.economicOperator}</div>
          
          {/* Economic Operator Organization Logo */}
          <div className="mt-2 flex items-center gap-3">
            {organizationData?.logoBrandingAssets && organizationData.logoBrandingAssets.includes('gateway.pinata.cloud/ipfs/') ? (
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <img 
                  src={organizationData.logoBrandingAssets} 
                  alt={`${organizationData.organizationName} Logo`} 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    console.log('Logo image failed to load:', organizationData.logoBrandingAssets);
                    console.log('Error details:', e);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log('Logo image loaded successfully:', organizationData.logoBrandingAssets);
                  }}
                />
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-gray-500 text-xs font-bold">
                    {organizationData.organizationName?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">
                  {organizationData?.organizationName?.substring(0, 2).toUpperCase() || 'NA'}
                </span>
              </div>
            )}
            {organizationData?.organizationName && (
              <div className="text-sm opacity-90">{organizationData.organizationName}</div>
            )}
          </div>
          
          <div className="mt-4">
            <div className="text-xs uppercase mb-1 opacity-80">Sustainability Score</div>
            <div className="w-full bg-blue-300 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${batteryData.sustainabilityScore}%` }}
              ></div>
            </div>
            <div className="text-right text-sm mt-1">{batteryData.sustainabilityScore}%</div>
          </div>
        </div>
      </div>

      {/* QR CODE, CARBON FOOTPRINT, HEALTH & MATERIALS */}
     <div className="bg-white p-6 sm:p-8 rounded-xl mt-6 shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
        {/* QR Code Section */}
        <div className="flex-shrink-0">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex flex-col items-center">
            <div className="w-full h-full bg-gray-100 rounded-lg shadow-inner flex items-center justify-center">
              <PassportQRCode url={currentURL} />
            </div>
          </div>
        </div>

        {/* Battery & Carbon Info Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Carbon Footprint Section */}
          <div className="text-center sm:text-left bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100 min-w-[140px]">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <div className="p-1.5 bg-green-100 rounded-full">
                <Leaf className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Carbon Footprint</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-0.5">{carbonFootprint.total}</div>
            <div className="text-xs text-gray-500">kgCO₂e/kWh</div>
          </div>

          {/* Battery Health Section */}
          <div className="text-center sm:text-left bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 min-w-[130px]">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <GiHealthCapsule className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Battery Health</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-0.5">{batteryHealth}%</div>
            <div className="text-xs text-gray-500">Excellent</div>
          </div>
        </div>

        {/* Material Composition Section */}
        <div className="w-full lg:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {materialCharts.slice(0, 4).map((material, index) => {
              const colors = [
                { bg: "bg-blue-500", text: "text-blue-600" },
                { bg: "bg-red-500", text: "text-red-600" },
                { bg: "bg-green-500", text: "text-green-600" },
                { bg: "bg-yellow-500", text: "text-yellow-600" },
              ]
              const color = colors[index] || colors[0]

              return (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 p-3 sm:p-4 rounded-lg shadow-md bg-white transition-transform transform hover:scale-105"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <circle
                        className="text-gray-300"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="transparent"
                        r="16"
                        cx="18"
                        cy="18"
                      />
                      <circle
                        className={`${color.bg} stroke-current`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="transparent"
                        r="16"
                        cx="18"
                        cy="18"
                        strokeDasharray="100"
                        strokeDashoffset={100 - material.percentage}
                      />
                    </svg>
                    <span className={`absolute text-sm sm:text-lg font-bold ${color.text}`}>
                      {material.percentage}%
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-xs sm:text-sm font-semibold text-gray-700">{material.material}</div>
                    <div className="text-xs text-gray-500">{material.mass}kg</div>
                    <div className="text-xs text-gray-400">{material.component}</div>
                    {material.isCritical && (
                      <div className="text-xs text-orange-600 font-medium">Critical Material</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>

      <InformationBar tokenId={tokenId} />

      {/* SUMMARY REPORT */}
      <div className="container mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center mb-8">Summary Report</h1>

        {/* Carbon Footprint */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Carbon Footprint</h2>
          <div className="flex justify-center items-center w-full rounded-lg">
            <PieChartJs data={carbonFootprint.byStage} />
          </div>
        </div>

        {/* Recycled Content Share */}
        <div className="mb-12 ">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recycled Content Share</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="w-full md:flex gap-2">
              <div className="grid grid-cols-3 w-full ">
                {recycledContentData.map((material, index) => (
                  <div key={index} className="flex justify-center">
                    <DonutChart
                      backendData={{
                        material: material.material,
                        preConsumerShare: material.preConsumerShare,
                        postConsumerShare: material.postConsumerShare,
                        totalRecycledShare: material.totalRecycledShare,
                        shares: [
                          {
                            label: "Pre-Consumer",
                            value: material.preConsumerShare,
                          },
                          {
                            label: "Post-Consumer",
                            value: material.postConsumerShare,
                          },
                          {
                            label: "Virgin Material",
                            value: Math.max(0, 100 - material.totalRecycledShare),
                          },
                        ],
                      }}
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
