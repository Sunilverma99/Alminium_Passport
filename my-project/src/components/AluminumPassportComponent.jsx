import { useState, useEffect } from "react"
import PassportQRCode from "./PassportQRCode.jsx"
import PieChartJs from "./PieChartJs.jsx"
import DonutChart from "./DonutCharJs.jsx"
import { GiHealthCapsule } from "react-icons/gi"
import InformationBar from "./InformationBar.jsx"
import { Leaf, Factory, Package, Truck } from "lucide-react"

export default function AluminumPassportComponent({ tokenId: externalTokenId }) {
  const initialTokenId = externalTokenId || 'AL-001'

  const [tokenId, setTokenId] = useState(initialTokenId)
  const [version, setVersion] = useState(0)
  const [aluminumData, setAluminumData] = useState(null)
  const [materialCharts, setMaterialCharts] = useState([])
  const [carbonFootprint, setCarbonFootprint] = useState({ total: 0, byStage: [] })
  const [aluminumHealth, setAluminumHealth] = useState(0)
  const [recycledContentData, setRecycledContentData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [organizationData, setOrganizationData] = useState(null)

  // Dummy aluminum data
  const dummyAluminumData = {
    passportId: "AL-PASSPORT-2024-001",
    model: "Aluminum Alloy 6061-T6",
    serialNumber: "AL-SN-2024-001",
    category: "Industrial Aluminum",
    weight: 2500, // kg
    status: "Active",
    manufacturedDate: "2024-01-15",
    manufacturer: "AluminumCorp Industries",
    economicOperator: "GreenMetal Solutions",
    sustainabilityScore: 85,
    purity: 99.7, // percentage
    alloyComposition: "6061-T6",
    tensileStrength: "310 MPa",
    yieldStrength: "276 MPa",
    elongation: "12%",
    hardness: "95 HB",
    density: "2.70 g/cm³",
    meltingPoint: "650°C",
    conductivity: "167 W/m·K",
    corrosionResistance: "Excellent",
    recyclability: "100%",
    applications: ["Automotive", "Aerospace", "Construction", "Electronics"],
    certifications: ["ISO 9001", "AS9100", "RoHS Compliant", "REACH Registered"],
    supplyChain: {
      bauxiteSource: "Australia",
      smeltingLocation: "Canada",
      processingFacility: "Germany",
      finalAssembly: "USA"
    }
  }

  // Dummy material composition data
  const dummyMaterialComposition = [
    {
      material: "Aluminum (Al)",
      mass: 2485,
      percentage: 99.4,
      component: "Primary Metal",
      isCritical: false
    },
    {
      material: "Silicon (Si)",
      mass: 8.5,
      percentage: 0.34,
      component: "Alloying Element",
      isCritical: false
    },
    {
      material: "Magnesium (Mg)",
      mass: 4.0,
      percentage: 0.16,
      component: "Alloying Element",
      isCritical: false
    },
    {
      material: "Iron (Fe)",
      mass: 2.0,
      percentage: 0.08,
      component: "Impurity",
      isCritical: false
    },
    {
      material: "Copper (Cu)",
      mass: 0.5,
      percentage: 0.02,
      component: "Alloying Element",
      isCritical: false
    }
  ]

  // Dummy carbon footprint data
  const dummyCarbonFootprint = {
    total: 8.2, // kgCO2e/kg
    byStage: [
      { name: "Bauxite Mining", value: 1.2 },
      { name: "Alumina Refining", value: 2.8 },
      { name: "Aluminum Smelting", value: 3.5 },
      { name: "Fabrication", value: 0.4 },
      { name: "Transportation", value: 0.3 }
    ]
  }

  // Dummy recycled content data
  const dummyRecycledContent = [
    {
      material: "Aluminum",
      preConsumerShare: 25,
      postConsumerShare: 35,
      totalRecycledShare: 60
    },
    {
      material: "Silicon",
      preConsumerShare: 15,
      postConsumerShare: 5,
      totalRecycledShare: 20
    },
    {
      material: "Magnesium",
      preConsumerShare: 10,
      postConsumerShare: 5,
      totalRecycledShare: 15
    },
    {
      material: "Other Alloys",
      preConsumerShare: 8,
      postConsumerShare: 2,
      totalRecycledShare: 10
    }
  ]

  // Dummy organization data
  const dummyOrganizationData = {
    organizationName: "AluminumCorp Industries",
    logoBrandingAssets: null
  }

  async function fetchAluminumData() {
    setLoading(true)
    setError("")
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Set dummy data
      setAluminumData(dummyAluminumData)
      setMaterialCharts(dummyMaterialComposition)
      setCarbonFootprint(dummyCarbonFootprint)
      setRecycledContentData(dummyRecycledContent)
      setOrganizationData(dummyOrganizationData)
      
      // Calculate aluminum health based on purity and certifications
      const healthScore = Math.min(100, 
        (dummyAluminumData.purity * 0.6) + 
        (dummyAluminumData.sustainabilityScore * 0.4)
      )
      setAluminumHealth(Math.round(healthScore))
      
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tokenId) {
      fetchAluminumData()
    }
  }, [tokenId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Aluminum Data</div>
          <div className="text-red-500">{error}</div>
          <button
            onClick={fetchAluminumData}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!aluminumData) return null

  const currentURL = window.location.href

  return (
    <div className="max-w-7xl mx-auto p-8 mt-2 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl shadow-lg">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Aluminum Passport</h1>
          <div className="text-sm text-gray-600">Unique ID</div>
          <div className="font-mono text-xs bg-white p-2 rounded-lg shadow-inner break-all">
            {aluminumData.passportId}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-semibold">Verified</span>
        </div>
      </div>

      {/* ALUMINUM DETAILS & IMAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-8 bg-white p-6 rounded-xl shadow-md">
        {/* Aluminum Details */}
        <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {[
            { label: "Alloy", value: aluminumData.model },
            { label: "Serial", value: aluminumData.serialNumber },
            { label: "Category", value: aluminumData.category },
            { label: "Weight", value: `${aluminumData.weight} kg` },
            { label: "Purity", value: `${aluminumData.purity}%` },
            { label: "Density", value: aluminumData.density },
            { label: "Status", value: aluminumData.status, status: true },
            { label: "Manufactured", value: aluminumData.manufacturedDate },
          ].map((item, index) => (
            <div key={index}>
              <div className="text-gray-500 text-xs uppercase mb-1">{item.label}</div>
              {item.status ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
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
          <div className="w-56 h-56 bg-gradient-to-br from-slate-300 to-gray-400 rounded-lg flex items-center justify-center">
            <Package className="w-32 h-32 text-slate-600" />
          </div>
        </div>

        {/* MANUFACTURER INFO */}
        <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-xl shadow-md text-white">
          <div className="text-xs uppercase mb-1 opacity-80">Manufacturer</div>
          <div className="font-bold text-lg">{aluminumData.manufacturer}</div>
          
          <div className="text-xs uppercase mb-1 opacity-80 mt-4">Economic Operator</div>
          <div className="font-bold text-lg">{aluminumData.economicOperator}</div>
          
          {/* Economic Operator Organization Logo */}
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs font-bold">
                {organizationData?.organizationName?.substring(0, 2).toUpperCase() || 'AC'}
              </span>
            </div>
            {organizationData?.organizationName && (
              <div className="text-sm opacity-90">{organizationData.organizationName}</div>
            )}
          </div>
          
          <div className="mt-4">
            <div className="text-xs uppercase mb-1 opacity-80">Sustainability Score</div>
            <div className="w-full bg-slate-300 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${aluminumData.sustainabilityScore}%` }}
              ></div>
            </div>
            <div className="text-right text-sm mt-1">{aluminumData.sustainabilityScore}%</div>
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

          {/* Aluminum & Carbon Info Section */}
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
              <div className="text-xs text-gray-500">kgCO₂e/kg</div>
            </div>

            {/* Aluminum Health Section */}
            <div className="text-center sm:text-left bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 min-w-[130px]">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <GiHealthCapsule className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-600">Aluminum Quality</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-0.5">{aluminumHealth}%</div>
              <div className="text-xs text-gray-500">Premium Grade</div>
            </div>
          </div>

          {/* Material Composition Section */}
          <div className="w-full lg:w-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {materialCharts.slice(0, 4).map((material, index) => {
                const colors = [
                  { bg: "bg-slate-500", text: "text-slate-600" },
                  { bg: "bg-blue-500", text: "text-blue-600" },
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

      {/* TECHNICAL SPECIFICATIONS */}
      <div className="bg-white p-6 rounded-xl mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Technical Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tensile Strength", value: aluminumData.tensileStrength },
            { label: "Yield Strength", value: aluminumData.yieldStrength },
            { label: "Elongation", value: aluminumData.elongation },
            { label: "Hardness", value: aluminumData.hardness },
            { label: "Melting Point", value: aluminumData.meltingPoint },
            { label: "Conductivity", value: aluminumData.conductivity },
            { label: "Corrosion Resistance", value: aluminumData.corrosionResistance },
            { label: "Recyclability", value: aluminumData.recyclability },
          ].map((spec, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">{spec.label}</div>
              <div className="font-semibold text-slate-800">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* APPLICATIONS & CERTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Applications</h2>
          <div className="space-y-2">
            {aluminumData.applications.map((app, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-slate-700">{app}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Certifications</h2>
          <div className="space-y-2">
            {aluminumData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-700">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUPPLY CHAIN */}
      <div className="bg-white p-6 rounded-xl mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Supply Chain</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(aluminumData.supplyChain).map(([stage, location], index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-gray-500 uppercase">{stage.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <div className="font-semibold text-slate-800">{location}</div>
            </div>
          ))}
        </div>
      </div>

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
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recycled Content Share</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="w-full md:flex gap-2">
              <div className="grid grid-cols-2 md:grid-cols-4 w-full">
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