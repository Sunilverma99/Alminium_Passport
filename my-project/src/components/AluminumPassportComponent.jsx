"use client"

import { useState, useEffect } from "react"
import PassportQRCode from "./PassportQRCode"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ComposedChart, LineChart, Line } from "recharts"
import { Info, CheckCircle, AlertCircle, TrendingUp, Leaf, Zap, Droplets, Recycle, Settings, Shield, Database } from "lucide-react"

export default function AluminumPassportComponent({ tokenId: externalTokenId }) {
  const initialTokenId = externalTokenId || "AL-001"
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
  const [activeTab, setActiveTab] = useState("cbam")

  // CBAM & ESPR Compliance Data - Now integrated into main aluminum data
  const getCbamEsprData = () => {
    if (!aluminumData?.cbam_espr_compliance) {
      return {
        cbam: {
          scope: "Aluminum Product",
          material_type: "Secondary (Recycled Content)",
          ki_primary: 16.1,
          ki_secondary: 0.6,
          primary_share: 0.5,
          secondary_share: 0.5,
          weighted_value: 8.35,
          declared_emissions: 4.3,
          verifier: "DNV GL",
          scope_emissions: {
            scope_1: 3.1,
            scope_2: 1.2
          },
          cbam_ready: true,
          benchmark_emissions: 12.5,
          compliance_score: 85
        },
        espr: {
          repairability_index: 7.5,
          recyclability_index: 1.0,
          composition_verified: true,
          recycled_content: 0.5,
          carbon_intensity_disclosed: true,
          smart_passport_ready: true,
          energy_source: "Hydropower",
          renewable_energy_percent: 0.95,
          water_usage_m3_per_tonne: 1.2,
          circularity_score: 92,
          sustainability_rating: "A+",
          compliance_score: 88
        }
      }
    }
    return aluminumData.cbam_espr_compliance
  }

  // CBAM Chart Data
  const cbamChartData = [
    { name: "Your Emissions", value: 4.3, type: "current" },
    { name: "CBAM Benchmark", value: 12.5, type: "benchmark" },
    { name: "Industry Average", value: 8.7, type: "average" }
  ]

  // Material Ratio Data for Donut Chart
  const materialRatioData = [
    { name: "Primary", value: 50, fill: "#3B82F6" },
    { name: "Secondary", value: 50, fill: "#10B981" }
  ]

  // ESPR Compliance Checklist
  const esprChecklist = [
    { 
      item: "Repairability Index", 
      value: "7.5/10", 
      status: "pass", 
      threshold: 7.0,
      description: "Measures ease of repair and maintenance"
    },
    { 
      item: "Recyclability Index", 
      value: "100%", 
      status: "pass", 
      threshold: 80,
      description: "Percentage of material that can be recycled"
    },
    { 
      item: "Composition Verified", 
      value: "Yes", 
      status: "pass", 
      threshold: null,
      description: "Material composition has been verified"
    },
    { 
      item: "Recycled Content", 
      value: "50%", 
      status: "pass", 
      threshold: 30,
      description: "Percentage of recycled material used"
    },
    { 
      item: "Carbon Intensity Disclosed", 
      value: "Yes", 
      status: "pass", 
      threshold: null,
      description: "Carbon footprint data is publicly available"
    },
    { 
      item: "Smart Passport Ready", 
      value: "Yes", 
      status: "pass", 
      threshold: null,
      description: "Compatible with digital product passport systems"
    }
  ]

  // Simple aluminum data
  const dummyAluminumData = {
    passportId: "AL-PASSPORT-2024-001",
    serialNumber: "AL-SN-2024-001",
    qrCodeUrl: "https://example.com/qr/AL-PASSPORT-2024-001",
    status: "Active",
    version: "1.2.0",
    createdAt: "2024-01-15T10:00:00Z",
    lastUpdated: "2025-07-30T15:30:00Z",
    model: "Aluminum Alloy 6061-T6",
    category: "Industrial Aluminum",
    weight: 2500,
    purity: 99.7,
    dimensions: {
      thickness: "12 mm",
      width: "1000 mm",
      length: "3000 mm",
    },
    materialProperties: {
      tensileStrength: "310 MPa",
      yieldStrength: "276 MPa",
      elongation: "12%",
      hardness: "95 HB",
      density: "2.70 g/cm³",
      meltingPoint: "650°C",
      thermalConductivity: "167 W/m·K",
      corrosionResistance: "Excellent",
    },
    sustainabilityScore: 85,
    carbonFootprint: {
      total: 4.3,
      verifier: "DNV GL",
      methodology: "ISO 14064",
      verificationDate: "2024-07-01",
    },
    recycledContent: {
      postConsumer: 30,
      preConsumer: 20,
    },
    recyclability: "100%",
    waterUsage: "1.2 m³/tonne",
    energySource: {
      type: "Hydropower",
      renewablePercentage: 95,
    },
    esgCertificates: ["ISO 14001", "ASI Performance Standard", "IRMA"],
    supplyChain: {
      bauxiteMining: {
        company: "Global Bauxite Co.",
        location: "Queensland, Australia",
        date: "2023-01-01",
        emissions: 0.8,
        energySource: "Solar",
      },
      aluminaRefining: {
        company: "Alumina Solutions",
        location: "Louisiana, USA",
        date: "2023-03-10",
        emissions: 1.8,
        energySource: "Natural Gas",
      },
      aluminumSmelting: {
        company: "EcoSmelt Inc.",
        location: "Quebec, Canada",
        date: "2023-06-20",
        emissions: 1.2,
        energySource: "Hydropower",
        certification: ["ASI Chain of Custody"],
      },
      castingFabrication: {
        company: "Precision Alloys",
        location: "Ohio, USA",
        date: "2023-09-15",
        emissions: 0.3,
        energySource: "Grid Mix",
      },
      finalAssembly: {
        company: "GreenMetal Solutions",
        location: "Detroit, USA",
        date: "2024-01-10",
        emissions: 0.2,
        energySource: "Renewable",
      },
    },
    compliance: {
      certifications: ["ISO 9001", "ISO 14001", "AS9100", "REACH", "RoHS"],
      cbamReady: true,
      digitalProductPassportReady: true,
      productCategoryCode: "HS 7606.11",
    },
    cbam_espr_compliance: {
      cbam: {
        scope: "Aluminum Product",
        material_type: "Secondary (Recycled Content)",
        ki_primary: 16.1,
        ki_secondary: 0.6,
        primary_share: 0.5,
        secondary_share: 0.5,
        weighted_value: 8.35,
        declared_emissions: 4.3,
        verifier: "DNV GL",
        scope_emissions: {
          scope_1: 3.1,
          scope_2: 1.2
        },
        cbam_ready: true
      },
      espr: {
        repairability_index: 7.5,
        recyclability_index: 1.0,
        composition_verified: true,
        recycled_content: 0.5,
        carbon_intensity_disclosed: true,
        smart_passport_ready: true,
        energy_source: "Hydropower",
        renewable_energy_percent: 0.95,
        water_usage_m3_per_tonne: 1.2
      }
    },
    applications: ["Automotive", "Aerospace", "Construction", "Electronics"],
    lifecycle: {
      estimatedServiceLife: "20 years",
      maintenanceRequired: "Low",
      expectedEndUse: "Vehicle Body Panels",
      disassemblyInstructionsUrl: "https://example.com/disassembly-instructions",
    },
    hashOnChain: "0x3d5d9aef71f487db84c11e2a3a24a981f53ba12b",
    digitalSignature: {
      signerDID: "did:org:aluminumcorp#signing-key-1",
      signature: "0xa34d1083aeef1229387b981cbadf2a7a18e981f4f23b7d5912b32a98c3bd981f",
    },
    ipfsCid: "QmW8kPiFKnX1YZX3xQbGhR2LVn6XgUz3RmFv6U5WrnL9sz",
    notes: "Batch processed using updated low-temperature casting technique.",
    userFeedback: [
      { customer: "Tesla Inc.", feedback: "Great recyclability and very high conductivity.", date: "2024-05-20" },
    ],
  }

  // Enhanced material composition data
  const dummyMaterialComposition = [
    { material: "Aluminum (Al)", mass: 2485, percentage: 99.4, component: "Primary Metal", isCritical: false },
    { material: "Silicon (Si)", mass: 8.5, percentage: 0.34, component: "Alloying Element", isCritical: false },
    { material: "Magnesium (Mg)", mass: 4.0, percentage: 0.16, component: "Alloying Element", isCritical: false },
    { material: "Iron (Fe)", mass: 2.0, percentage: 0.08, component: "Impurity", isCritical: false },
    { material: "Copper (Cu)", mass: 0.5, percentage: 0.02, component: "Alloying Element", isCritical: false },
  ]

  // Enhanced carbon footprint data
  const dummyCarbonFootprint = {
    total: 4.3,
    scope1: 1.5,
    scope2: 2.8,
    byStage: [
      { name: "Bauxite Mining", value: 0.8, scope: "Scope 1" },
      { name: "Alumina Refining", value: 1.8, scope: "Scope 1" },
      { name: "Aluminum Smelting", value: 1.2, scope: "Scope 2" },
      { name: "Casting & Fabrication", value: 0.3, scope: "Scope 1" },
      { name: "Transportation", value: 0.2, scope: "Scope 1" },
    ],
  }

  // Enhanced recycled content data for Recharts
  const dummyRecycledContent = [
    { name: "Aluminum", material: "Aluminum", preConsumer: 20, postConsumer: 30, virgin: 50, totalRecycled: 50 },
    { name: "Silicon", material: "Silicon", preConsumer: 15, postConsumer: 5, virgin: 80, totalRecycled: 20 },
    { name: "Magnesium", material: "Magnesium", preConsumer: 10, postConsumer: 5, virgin: 85, totalRecycled: 15 },
    { name: "Other Alloys", material: "Other Alloys", preConsumer: 8, postConsumer: 2, virgin: 90, totalRecycled: 10 },
  ]

  // Organization data
  const dummyOrganizationData = {
    organizationName: "GreenMetal Solutions",
    logoBrandingAssets: null,
  }

  async function fetchAluminumData() {
    setLoading(true)
    setError("")
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Set dummy dataset
      setAluminumData(dummyAluminumData)
      setMaterialCharts(dummyMaterialComposition)
      setCarbonFootprint(dummyCarbonFootprint)
      setRecycledContentData(dummyRecycledContent)
      setOrganizationData(dummyOrganizationData)

      // Calculate aluminum health based on purity, sustainability score, and certifications
      const healthScore = Math.min(
        100,
        dummyAluminumData.purity * 0.4 +
          dummyAluminumData.sustainabilityScore * 0.3 +
          dummyAluminumData.compliance.certifications.length * 10 * 0.3,
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
      <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
        <div className="flex h-64 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold text-red-600">Error Loading Aluminum Data</div>
          <div className="text-red-500">{error}</div>
          <button
            onClick={fetchAluminumData}
            className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!aluminumData) return null

  const currentURL = typeof window !== "undefined" ? window.location.href : aluminumData.qrCodeUrl

  return (
    <div className="mx-auto mt-2 max-w-7xl rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
      {/* HEADER SECTION */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-800 bg-clip-text text-2xl font-bold text-transparent">
            ALtrail
          </h1>
          <div className="text-sm text-gray-600">Unique ID</div>
          <div className="break-all rounded-lg bg-white p-2 font-mono text-xs shadow-inner">
            {aluminumData.passportId}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Version: {aluminumData.version}</span>
            <span>Created: {new Date(aluminumData.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(aluminumData.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
          <div className="h-4 w-4 animate-pulse rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-emerald-700">{aluminumData.status}</span>
        </div>
      </div>

      {/* ALUMINUM DETAILS & MANUFACTURER INFO */}
      <div className="grid grid-cols-1 gap-6 rounded-xl bg-white p-6 shadow-md lg:grid-cols-3">
        {/* Enhanced Aluminum Details */}
        <div className="lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            Product Specifications
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Alloy", value: aluminumData.model, highlight: true },
              { label: "Serial Number", value: aluminumData.serialNumber },
              { label: "Category", value: aluminumData.category },
              { label: "Weight", value: `${aluminumData.weight} kg` },
              { label: "Purity", value: `${aluminumData.purity}%`, highlight: true },
              { label: "Density", value: aluminumData.materialProperties.density },
              { label: "Status", value: aluminumData.status, status: true },
              { label: "Recyclability", value: aluminumData.recyclability, highlight: true },
            ].map((item, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 ${item.highlight ? "border border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100" : "bg-gray-50"}`}
              >
                <div className="mb-1 text-xs font-medium uppercase text-gray-500">{item.label}</div>
                {item.status ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-500"></div>
                    <span className="text-base font-bold text-gray-800">{item.value}</span>
                  </div>
                ) : (
                  <div className={`text-base font-bold ${item.highlight ? "text-blue-700" : "text-gray-800"}`}>
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dimensions Section */}
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Dimensions</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Thickness", value: aluminumData.dimensions.thickness },
                { label: "Width", value: aluminumData.dimensions.width },
                { label: "Length", value: aluminumData.dimensions.length },
              ].map((dim, index) => (
                <div key={index} className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="mb-1 text-xs uppercase text-gray-500">{dim.label}</div>
                  <div className="text-sm font-bold text-gray-800">{dim.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Manufacturer Info */}
        <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 p-4 text-white shadow-md">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            Manufacturer Details
          </h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs uppercase opacity-80">Final Assembly</div>
              <div className="text-base font-bold">{aluminumData.supplyChain.finalAssembly.company}</div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase opacity-80">Location</div>
              <div className="text-base font-bold">{aluminumData.supplyChain.finalAssembly.location}</div>
            </div>
            {/* Organization Logo */}
            <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-xs font-bold text-gray-500">
                  {organizationData?.organizationName?.substring(0, 2).toUpperCase() || "GS"}
                </span>
              </div>
              {organizationData?.organizationName && (
                <div className="text-xs opacity-90">{organizationData.organizationName}</div>
              )}
            </div>
            {/* Enhanced Sustainability Score */}
            <div className="rounded-lg bg-white/10 p-3">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-xs uppercase opacity-80">Sustainability Score</div>
                <div className="text-xs font-bold">{aluminumData.sustainabilityScore}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-300">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 transition-all duration-500"
                  style={{ width: `${aluminumData.sustainabilityScore}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs opacity-80">Certified by {aluminumData.carbonFootprint.verifier}</div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/20 p-2 text-center">
                <div className="text-xs opacity-80">Carbon Footprint</div>
                <div className="text-sm font-bold">{carbonFootprint.total}</div>
                <div className="text-xs opacity-80">kgCO₂e/kg</div>
              </div>
              <div className="rounded-lg bg-white/20 p-2 text-center">
                <div className="text-xs opacity-80">Recycled Content</div>
                <div className="text-sm font-bold">
                  {aluminumData.recycledContent.preConsumer + aluminumData.recycledContent.postConsumer}%
                </div>
                <div className="text-xs opacity-80">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR CODE, CARBON FOOTPRINT, HEALTH & MATERIALS */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center justify-between space-y-6 lg:flex-row lg:space-x-8 lg:space-y-0">
          {/* QR Code Section */}
          <div className="flex-shrink-0">
                           <div className="relative flex h-36 w-36 flex-col items-center sm:h-40 sm:w-40">
                 <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-gray-100 shadow-inner">
                   <PassportQRCode 
                     url={currentURL}
                     size={160} 
                   />
                 </div>
                 <div className="mt-2 text-xs text-gray-500">Scan for details</div>
               </div>
          </div>

          {/* Carbon & Health Info Section */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            {/* Carbon Footprint Section */}
            <div className="flex h-48 min-w-[140px] flex-col justify-center space-y-6 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:h-52">
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-white/50 p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    CF
                  </div>
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">Carbon Footprint</span>
              </div>
              <div className="text-4xl font-bold text-gray-800">{carbonFootprint.total}</div>
              <div className="text-xs font-medium text-gray-500">kgCO₂e/kg</div>
              <div className="text-xs font-medium text-gray-600">
                Verified by {aluminumData.carbonFootprint.verifier}
              </div>
            </div>

            {/* Aluminum Health Section */}
            <div className="flex h-48 min-w-[130px] flex-col justify-center space-y-6 rounded-lg border border-cyan-100 bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:h-52">
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-white/50 p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
                    AQ
                  </div>
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">Aluminum Quality</span>
              </div>
              <div className="text-4xl font-bold text-cyan-700">{aluminumHealth}%</div>
              <div className="text-xs font-medium text-gray-500">Premium Grade</div>
              <div className="text-xs font-medium text-gray-600">{aluminumData.recyclability} Recyclable</div>
            </div>
          </div>

          {/* Material Composition Section */}
          <div className="w-full lg:w-auto">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {materialCharts.slice(0, 4).map((material, index) => {
                const colors = [
                  { bg: "bg-blue-500", text: "text-blue-700", stroke: "stroke-blue-500" }, // Primary Aluminum
                  { bg: "bg-emerald-500", text: "text-emerald-700", stroke: "stroke-emerald-500" }, // Silicon
                  { bg: "bg-purple-500", text: "text-purple-700", stroke: "stroke-purple-500" }, // Magnesium
                  { bg: "bg-orange-500", text: "text-orange-700", stroke: "stroke-orange-500" }, // Iron/Copper
                ]
                const color = colors[index] || colors[0]
                return (
                  <div
                    key={index}
                    className="flex h-48 w-32 flex-col items-center justify-center space-y-2 rounded-lg bg-white p-3 shadow-md transition-transform hover:scale-105 transform sm:h-52 sm:w-36 sm:p-4"
                  >
                    <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
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
                          className={`${color.stroke} stroke-current`}
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
                      <span className={`absolute text-sm font-bold ${color.text} sm:text-lg`}>
                        {material.percentage}%
                      </span>
                    </div>
                    <div className="space-y-1 text-center">
                      <div className="text-xs font-semibold text-gray-700 sm:text-sm">{material.material}</div>
                      <div className="text-xs text-gray-500">{material.mass}kg</div>
                      <div className="text-xs text-gray-400">{material.component}</div>
                      {material.isCritical && (
                        <div className="text-xs font-medium text-orange-600">Critical Material</div>
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
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Technical Specifications</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Tensile Strength", value: aluminumData.materialProperties.tensileStrength },
            { label: "Yield Strength", value: aluminumData.materialProperties.yieldStrength },
            { label: "Elongation", value: aluminumData.materialProperties.elongation },
            { label: "Hardness", value: aluminumData.materialProperties.hardness },
            { label: "Melting Point", value: aluminumData.materialProperties.meltingPoint },
            { label: "Thermal Conductivity", value: aluminumData.materialProperties.thermalConductivity },
            { label: "Corrosion Resistance", value: aluminumData.materialProperties.corrosionResistance },
            { label: "Recyclability", value: aluminumData.recyclability },
          ].map((spec, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 text-xs uppercase text-gray-500">{spec.label}</div>
              <div className="font-semibold text-gray-800">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SUSTAINABILITY METRICS */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Sustainability Metrics</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Water Usage", value: aluminumData.waterUsage, color: "text-blue-700" },
            { label: "Energy Source", value: aluminumData.energySource.type, color: "text-blue-700" },
            {
              label: "Renewable Energy",
              value: `${aluminumData.energySource.renewablePercentage}%`,
              color: "text-blue-700",
            },
            {
              label: "Recycled Content",
              value: `${aluminumData.recycledContent.preConsumer + aluminumData.recycledContent.postConsumer}%`,
              color: "text-blue-700",
            },
            { label: "Pre-Consumer", value: `${aluminumData.recycledContent.preConsumer}%`, color: "text-blue-700" },
            { label: "Post-Consumer", value: `${aluminumData.recycledContent.postConsumer}%`, color: "text-blue-700" },
            {
              label: "CBAM Ready",
              value: aluminumData.compliance.cbamReady ? "Yes" : "No",
              color: aluminumData.compliance.cbamReady ? "text-gray-700" : "text-red-600",
            },
            {
              label: "DPP Ready",
              value: aluminumData.compliance.digitalProductPassportReady ? "Yes" : "No",
              color: aluminumData.compliance.digitalProductPassportReady ? "text-gray-700" : "text-red-600",
            },
          ].map((metric, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 text-xs uppercase text-gray-500">{metric.label}</div>
              <div className={`font-semibold ${metric.color}`}>{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* APPLICATIONS & CERTIFICATIONS */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Applications</h2>
          <div className="space-y-2">
            {aluminumData.applications.map((app, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                <span className="text-gray-700">{app}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Certifications & Compliance</h2>
          <div className="space-y-2">
            {aluminumData.compliance.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                <span className="text-gray-700">{cert}</span>
              </div>
            ))}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                Product Category Code: {aluminumData.compliance.productCategoryCode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESG CERTIFICATES */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">ESG Certificates</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {aluminumData.esgCertificates.map((cert, index) => (
            <div
              key={index}
              className="rounded-lg border border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4"
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                <span className="text-sm font-semibold text-emerald-800">{cert}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED SUPPLY CHAIN */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Supply Chain Journey</h2>
        <div className="space-y-4">
          {Object.entries(aluminumData.supplyChain).map(([stage, details], index) => (
            <div key={index} className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-gray-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <span className="text-sm font-semibold uppercase text-gray-700">
                  {stage.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <span className="text-gray-500">Location: </span>
                  <span className="font-semibold text-gray-800">{details.location || details.source}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date: </span>
                  <span className="font-semibold text-gray-800">{details.date}</span>
                </div>
                <div>
                  <span className="text-gray-500">Company: </span>
                  <span className="font-semibold text-gray-800">
                    {details.company || details.miner || details.refiner || details.plant}
                  </span>
                </div>
                {details.emissions && (
                  <div>
                    <span className="text-gray-500">Emissions: </span>
                    <span className="font-semibold text-gray-800">{details.emissions} kgCO₂e</span>
                  </div>
                )}
                {details.energySource && (
                  <div>
                    <span className="text-gray-500">Energy: </span>
                    <span className="font-semibold text-gray-800">{details.energySource}</span>
                  </div>
                )}
                {details.certification && (
                  <div>
                    <span className="text-gray-500">Certifications: </span>
                    <span className="font-semibold text-gray-800">{details.certification.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIFECYCLE INFORMATION */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Lifecycle Information</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Service Life", value: aluminumData.lifecycle.estimatedServiceLife },
            { label: "Maintenance", value: aluminumData.lifecycle.maintenanceRequired },
            { label: "Expected End Use", value: aluminumData.lifecycle.expectedEndUse },
            { label: "Disassembly", value: "Available", link: aluminumData.lifecycle.disassemblyInstructionsUrl },
          ].map((info, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 text-xs uppercase text-gray-500">{info.label}</div>
              {info.link ? (
                <a
                  href={info.link}
                  className="font-semibold text-gray-700 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {info.value}
                </a>
              ) : (
                <div className="font-semibold text-gray-800">{info.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY REPORT */}
      <div className="container mx-auto pt-8">
        <h1 className="mb-8 text-center text-3xl font-bold">Summary Report</h1>
        {/* Carbon Footprint */}
        <div className="mb-12 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Carbon Footprint Analysis</h2>
          <div className="mb-4 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Methodology: {aluminumData.carbonFootprint.methodology}</div>
                <div className="text-sm text-gray-600">Verifier: {aluminumData.carbonFootprint.verifier}</div>
                <div className="text-sm text-gray-600">
                  Verification Date: {aluminumData.carbonFootprint.verificationDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700">{carbonFootprint.total} kgCO₂e/kg</div>
                <div className="text-sm text-gray-600">Total Carbon Footprint</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {carbonFootprint.byStage.map((stage, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-36 text-right text-sm font-medium text-gray-600">{stage.name}</div>
                <div className="flex-1 h-4 rounded-full bg-gray-200">
                  <div
                    className="h-4 rounded-full bg-blue-500"
                    style={{ width: `${(stage.value / carbonFootprint.total) * 100}%` }}
                  ></div>
                </div>
                <div className="w-24 text-left text-sm font-semibold text-gray-800">{stage.value} kgCO₂e</div>
                <div className="w-20 text-left text-xs text-gray-500">{stage.scope}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CBAM & ESPR Compliance */}
        <div className="mb-12 rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">CBAM & ESPR Compliance</h2>
            <div className="flex items-center gap-2">
              {getCbamEsprData().cbam.cbam_ready && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  CBAM Ready
                </span>
              )}
              {getCbamEsprData().espr.smart_passport_ready && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  <Database className="h-3 w-3" />
                  ESPR Verified
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("cbam")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "cbam" 
                  ? "border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="h-4 w-4" />
              CBAM Compliance
            </button>
            <button
              onClick={() => setActiveTab("espr")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "espr" 
                  ? "border-b-2 border-green-600 text-green-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Leaf className="h-4 w-4" />
              ESPR Compliance
            </button>
          </div>

          {/* CBAM Tab Content */}
          {activeTab === "cbam" && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">Carbon Border Adjustment Mechanism (CBAM)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      EU regulation requiring carbon pricing for imported goods. Your aluminum product demonstrates excellent compliance with emissions standards.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{getCbamEsprData().cbam.compliance_score}%</div>
                    <div className="text-xs text-gray-500">Compliance Score</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-600">Scope</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().cbam.scope}</div>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-600">Material Type</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{getCbamEsprData().cbam.material_type}</div>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-gray-600">Weighted Value</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().cbam.weighted_value} kgCO₂e/kg</div>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-gray-600">Declared Emissions</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().cbam.declared_emissions} kgCO₂e</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* CBAM Benchmark Comparison */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h4 className="mb-4 text-lg font-semibold text-gray-800">CBAM Benchmark Comparison</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cbamChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                        <Tooltip
                          formatter={(value) => [`${value} kgCO₂e/kg`, "Emissions"]}
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill={(entry) => {
                            if (entry.type === "current") return "#10B981";
                            if (entry.type === "benchmark") return "#EF4444";
                            return "#6B7280";
                          }}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Material Ratio Donut Chart */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h4 className="mb-4 text-lg font-semibold text-gray-800">Primary vs Secondary Material Ratio</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={materialRatioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {materialRatioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Material Share"]}
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h4 className="text-lg font-semibold text-gray-800">CBAM Compliance Details</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Metric</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">KI Primary</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{getCbamEsprData().cbam.ki_primary} kgCO₂e/kg</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Compliant
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">KI Secondary</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{getCbamEsprData().cbam.ki_secondary} kgCO₂e/kg</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Compliant
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Scope 1 Emissions</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{getCbamEsprData().cbam.scope_emissions.scope_1} kgCO₂e</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Scope 2 Emissions</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{getCbamEsprData().cbam.scope_emissions.scope_2} kgCO₂e</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Verifier</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{getCbamEsprData().cbam.verifier}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            <Shield className="h-3 w-3" />
                            Accredited
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ESPR Tab Content */}
          {activeTab === "espr" && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">European Sustainability Passport for Recycled Products (ESPR)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Voluntary certification scheme ensuring sustainable practices in recycled material production and circular economy compliance.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{getCbamEsprData().espr.compliance_score}%</div>
                    <div className="text-xs text-gray-500">Compliance Score</div>
                  </div>
                </div>
              </div>

              {/* Key Indicators Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Recycle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Circularity Score</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().espr.circularity_score}%</div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600" 
                      style={{ width: `${getCbamEsprData().espr.circularity_score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Repairability Index</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().espr.repairability_index}/10</div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" 
                      style={{ width: `${(getCbamEsprData().espr.repairability_index / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">Renewable Energy</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().espr.renewable_energy_percent * 100}%</div>
                  <div className="text-xs text-gray-500">{getCbamEsprData().espr.energy_source}</div>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm font-medium text-gray-600">Water Usage</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{getCbamEsprData().espr.water_usage_m3_per_tonne} m³/tonne</div>
                  <div className="text-xs text-gray-500">Efficient</div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h4 className="text-lg font-semibold text-gray-800">ESPR Compliance Checklist</h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {esprChecklist.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                        <div className={`flex-shrink-0 ${item.status === "pass" ? "text-green-600" : "text-red-600"}`}>
                          {item.status === "pass" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-gray-900">{item.item}</h5>
                            <span className="text-sm font-semibold text-gray-600">({item.value})</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                          {item.threshold !== null && (
                            <p className="mt-1 text-xs text-gray-500">
                              Threshold: {item.threshold} {item.item.includes("Index") ? "/10" : "%"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sustainability Rating */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Sustainability Rating</h4>
                    <p className="text-sm text-gray-600">Overall sustainability performance assessment</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{getCbamEsprData().espr.sustainability_rating}</div>
                    <div className="text-sm text-gray-500">Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recycled Content Share */}
        <div className="mb-12 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">Recycled Content Share</h2>
          {/* Enhanced Progress Bars */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {recycledContentData.map((material, index) => (
              <div
                key={index}
                className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                  <div
                    className={`h-3 w-3 rounded-full ${index === 0 ? "bg-emerald-500" : index === 1 ? "bg-sky-500" : index === 2 ? "bg-purple-500" : "bg-amber-500"}`}
                  ></div>
                  {material.material}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Pre-Consumer</span>
                      <span className="font-bold text-emerald-600">{material.preConsumer}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                        style={{ width: `${material.preConsumer}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Post-Consumer</span>
                      <span className="font-bold text-sky-600">{material.postConsumer}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-700 ease-out"
                        style={{ width: `${material.postConsumer}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Virgin Material</span>
                      <span className="font-bold text-rose-600">{material.virgin}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-700 ease-out"
                        style={{ width: `${material.virgin}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base">
                      <span className="font-bold text-gray-800">Total Recycled</span>
                      <span className="font-bold text-indigo-600">{material.totalRecycled}%</span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-gray-200">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-700 ease-out"
                        style={{ width: `${material.totalRecycled}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Enhanced Chart Visualizations */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Stacked Bar Chart */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Material Composition Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={recycledContentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="material" tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      labelStyle={{ color: "#374151", fontWeight: "bold" }}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="preConsumer" stackId="a" fill="#10B981" name="Pre-Consumer" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="postConsumer" stackId="a" fill="#3B82F6" name="Post-Consumer" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="virgin" stackId="a" fill="#EF4444" name="Virgin Material" radius={[0, 0, 4, 4]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Pie Chart for Total Recycled Content */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Total Recycled Content Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recycledContentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="totalRecycled"
                    >
                      {recycledContentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Recycled Content"]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
