"use client"

import { useState, useEffect } from "react"
import PassportQRCode from "./PassportQRCode"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ComposedChart, Area } from 'recharts'

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
      length: "3000 mm"
    },
    materialProperties: {
      tensileStrength: "310 MPa",
      yieldStrength: "276 MPa",
      elongation: "12%",
      hardness: "95 HB",
      density: "2.70 g/cm³",
      meltingPoint: "650°C",
      thermalConductivity: "167 W/m·K",
      corrosionResistance: "Excellent"
    },
    sustainabilityScore: 85,
    carbonFootprint: {
      total: 4.3,
      verifier: "DNV GL"
    },
    recycledContent: {
      postConsumer: 30,
      preConsumer: 20
    },
    recyclability: "100%",
    waterUsage: "1.2 m³/tonne",
    energySource: {
      type: "Hydropower",
      renewablePercentage: 95
    },
    esgCertificates: ["ISO 14001", "ASI Performance Standard", "IRMA"],
    supplyChain: {
      finalAssembly: {
        company: "GreenMetal Solutions",
        location: "Detroit, USA"
      }
    },
    compliance: {
      certifications: ["ISO 9001", "ISO 14001", "AS9100", "REACH", "RoHS"],
      cbamReady: true,
      digitalProductPassportReady: true
    },
    applications: ["Automotive", "Aerospace", "Construction", "Electronics"],
    lifecycle: {
      estimatedServiceLife: "20 years",
      maintenanceRequired: "Low",
      expectedEndUse: "Vehicle Body Panels",
      disassemblyInstructionsUrl: "https://example.com/disassembly-instructions"
    },
    hashOnChain: "0x3d5d9aef71f487db84c11e2a3a24a981f53ba12b",
    digitalSignature: {
      signerDID: "did:org:aluminumcorp#signing-key-1",
      signature: "0xa34d1083aeef1229387b981cbadf2a7a18e981f4f23b7d5912b32a98c3bd981f"
    },
    ipfsCid: "QmW8kPiFKnX1YZX3xQbGhR2LVn6XgUz3RmFv6U5WrnL9sz",
    notes: "Batch processed using updated low-temperature casting technique.",
    userFeedback: [
      {
        customer: "Tesla Inc.",
        feedback: "Great recyclability and very high conductivity.",
        date: "2024-05-20"
      }
    ]
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
    { 
      material: "Aluminum", 
      preConsumer: 20, 
      postConsumer: 30, 
      virgin: 50,
      totalRecycled: 50 
    },
    { 
      material: "Silicon", 
      preConsumer: 15, 
      postConsumer: 5, 
      virgin: 80,
      totalRecycled: 20 
    },
    { 
      material: "Magnesium", 
      preConsumer: 10, 
      postConsumer: 5, 
      virgin: 85,
      totalRecycled: 15 
    },
    { 
      material: "Other Alloys", 
      preConsumer: 8, 
      postConsumer: 2, 
      virgin: 90,
      totalRecycled: 10 
    },
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

      // Set dummy data
      setAluminumData(dummyAluminumData)
      setMaterialCharts(dummyMaterialComposition)
      setCarbonFootprint(dummyCarbonFootprint)
      setRecycledContentData(dummyRecycledContent)
      setOrganizationData(dummyOrganizationData)

      // Calculate aluminum health based on purity, sustainability score, and certifications
      const healthScore = Math.min(100, 
        dummyAluminumData.purity * 0.4 + 
        dummyAluminumData.sustainabilityScore * 0.3 + 
        (dummyAluminumData.compliance.certifications.length * 10) * 0.3
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

  const currentURL = typeof window !== "undefined" ? window.location.href : aluminumData.qrCodeUrl

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
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Version: {aluminumData.version}</span>
            <span>Created: {new Date(aluminumData.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(aluminumData.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-semibold">{aluminumData.status}</span>
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
            { label: "Density", value: aluminumData.materialProperties.density },
            { label: "Status", value: aluminumData.status, status: true },
            { label: "Thickness", value: aluminumData.dimensions.thickness },
            { label: "Width", value: aluminumData.dimensions.width },
            { label: "Length", value: aluminumData.dimensions.length },
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
          <div className="w-56 h-56 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src="/Industrial_Aluminum_Profile_Custom_Aluminium_Extrusion_Profiles-Metalli_Industrial-removebg-preview.png"
              alt="Aluminum Profiles Collection"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* MANUFACTURER INFO */}
        <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-xl shadow-md text-white">
          <div className="text-xs uppercase mb-1 opacity-80">Final Assembly</div>
          <div className="font-bold text-lg">{aluminumData.supplyChain.finalAssembly.company}</div>
          <div className="text-xs uppercase mb-1 opacity-80 mt-4">Location</div>
          <div className="font-bold text-lg">{aluminumData.supplyChain.finalAssembly.location}</div>
          {/* Organization Logo */}
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs font-bold">
                {organizationData?.organizationName?.substring(0, 2).toUpperCase() || "GS"}
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
              <div className="w-full h-full bg-gray-100 rounded-lg shadow-inner flex items-center justify-center relative">
                <PassportQRCode 
                  url="http://localhost:5173/aluminum-passport" 
                  size={160} 
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">Scan for details</div>
            </div>
          </div>

          {/* Carbon & Health Info Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Carbon Footprint Section */}
            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100 min-w-[140px] h-48 sm:h-52 flex flex-col justify-center space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    CF
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Carbon Footprint</span>
              </div>
              <div className="text-4xl font-bold text-gray-800">{carbonFootprint.total}</div>
              <div className="text-xs text-gray-500 font-medium">kgCO₂e/kg</div>
              <div className="text-xs text-green-600 font-medium">Verified by {aluminumData.carbonFootprint.verifier}</div>
            </div>
            {/* Aluminum Health Section */}
            <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-100 min-w-[130px] h-48 sm:h-52 flex flex-col justify-center space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    AQ
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Aluminum Quality</span>
              </div>
              <div className="text-4xl font-bold text-green-600">{aluminumHealth}%</div>
              <div className="text-xs text-gray-500 font-medium">Premium Grade</div>
              <div className="text-xs text-blue-600 font-medium">{aluminumData.recyclability} Recyclable</div>
            </div>
          </div>

          {/* Material Composition Section */}
          <div className="w-full lg:w-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {materialCharts.slice(0, 4).map((material, index) => {
                const colors = [
                  { bg: "bg-slate-500", text: "text-slate-600", stroke: "stroke-slate-500" },
                  { bg: "bg-blue-500", text: "text-blue-600", stroke: "stroke-blue-500" },
                  { bg: "bg-green-500", text: "text-green-600", stroke: "stroke-green-500" },
                  { bg: "bg-yellow-500", text: "text-yellow-600", stroke: "stroke-yellow-500" },
                ]
                const color = colors[index] || colors[0]
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center space-y-2 p-3 sm:p-4 rounded-lg shadow-md bg-white transition-transform transform hover:scale-105 w-32 h-48 sm:w-36 sm:h-52"
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
            { label: "Tensile Strength", value: aluminumData.materialProperties.tensileStrength },
            { label: "Yield Strength", value: aluminumData.materialProperties.yieldStrength },
            { label: "Elongation", value: aluminumData.materialProperties.elongation },
            { label: "Hardness", value: aluminumData.materialProperties.hardness },
            { label: "Melting Point", value: aluminumData.materialProperties.meltingPoint },
            { label: "Thermal Conductivity", value: aluminumData.materialProperties.thermalConductivity },
            { label: "Corrosion Resistance", value: aluminumData.materialProperties.corrosionResistance },
            { label: "Recyclability", value: aluminumData.recyclability },
          ].map((spec, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">{spec.label}</div>
              <div className="font-semibold text-slate-800">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SUSTAINABILITY METRICS */}
      <div className="bg-white p-6 rounded-xl mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Sustainability Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Water Usage", value: aluminumData.waterUsage, color: "text-blue-600" },
            { label: "Energy Source", value: aluminumData.energySource.type, color: "text-green-600" },
            { label: "Renewable Energy", value: `${aluminumData.energySource.renewablePercentage}%`, color: "text-green-600" },
            { label: "Recycled Content", value: `${aluminumData.recycledContent.preConsumer + aluminumData.recycledContent.postConsumer}%`, color: "text-purple-600" },
            { label: "Pre-Consumer", value: `${aluminumData.recycledContent.preConsumer}%`, color: "text-blue-600" },
            { label: "Post-Consumer", value: `${aluminumData.recycledContent.postConsumer}%`, color: "text-green-600" },
            { label: "CBAM Ready", value: aluminumData.compliance.cbamReady ? "Yes" : "No", color: aluminumData.compliance.cbamReady ? "text-green-600" : "text-red-600" },
            { label: "DPP Ready", value: aluminumData.compliance.digitalProductPassportReady ? "Yes" : "No", color: aluminumData.compliance.digitalProductPassportReady ? "text-green-600" : "text-red-600" },
          ].map((metric, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">{metric.label}</div>
              <div className={`font-semibold ${metric.color}`}>{metric.value}</div>
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
          <h2 className="text-xl font-bold text-slate-800 mb-4">Certifications & Compliance</h2>
          <div className="space-y-2">
            {aluminumData.compliance.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-700">{cert}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">Product Category Code: {aluminumData.compliance.productCategoryCode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ESG CERTIFICATES */}
      <div className="bg-white p-6 rounded-xl mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">ESG Certificates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aluminumData.esgCertificates.map((cert, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-800">{cert}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED SUPPLY CHAIN */}
      <div className="bg-white p-6 rounded-xl mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Supply Chain Journey</h2>
        <div className="space-y-4">
          {Object.entries(aluminumData.supplyChain).map(([stage, details], index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-slate-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase">{stage.replace(/([A-Z])/g, " $1").trim()}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Location: </span>
                  <span className="font-semibold text-slate-800">{details.location || details.source}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date: </span>
                  <span className="font-semibold text-slate-800">{details.date}</span>
                </div>
                <div>
                  <span className="text-gray-500">Company: </span>
                  <span className="font-semibold text-slate-800">{details.company || details.miner || details.refiner || details.plant}</span>
                </div>
                {details.emissions && (
                  <div>
                    <span className="text-gray-500">Emissions: </span>
                    <span className="font-semibold text-slate-800">{details.emissions} kgCO₂e</span>
                  </div>
                )}
                {details.energySource && (
                  <div>
                    <span className="text-gray-500">Energy: </span>
                    <span className="font-semibold text-slate-800">{details.energySource}</span>
                  </div>
                )}
                {details.certification && (
                  <div>
                    <span className="text-gray-500">Certifications: </span>
                    <span className="font-semibold text-slate-800">{details.certification.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIFECYCLE INFORMATION */}
      <div className="bg-white p-6 rounded-xl mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Lifecycle Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Service Life", value: aluminumData.lifecycle.estimatedServiceLife },
            { label: "Maintenance", value: aluminumData.lifecycle.maintenanceRequired },
            { label: "Expected End Use", value: aluminumData.lifecycle.expectedEndUse },
            { label: "Disassembly", value: "Available", link: aluminumData.lifecycle.disassemblyInstructionsUrl },
          ].map((info, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">{info.label}</div>
              {info.link ? (
                <a href={info.link} className="font-semibold text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {info.value}
                </a>
              ) : (
                <div className="font-semibold text-slate-800">{info.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>





      {/* SUMMARY REPORT */}
      <div className="container mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center mb-8">Summary Report</h1>

        {/* Carbon Footprint */}
        <div className="mb-12 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Carbon Footprint Analysis</h2>
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Methodology: {aluminumData.carbonFootprint.methodology}</div>
                <div className="text-sm text-gray-600">Verifier: {aluminumData.carbonFootprint.verifier}</div>
                <div className="text-sm text-gray-600">Verification Date: {aluminumData.carbonFootprint.verificationDate}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{carbonFootprint.total} kgCO₂e/kg</div>
                <div className="text-sm text-gray-600">Total Carbon Footprint</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {carbonFootprint.byStage.map((stage, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-36 text-right text-sm font-medium text-gray-600">{stage.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${(stage.value / carbonFootprint.total) * 100}%` }}
                  ></div>
                </div>
                <div className="w-24 text-left text-sm font-semibold text-gray-800">{stage.value} kgCO₂e</div>
                <div className="w-20 text-left text-xs text-gray-500">{stage.scope}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recycled Content Share */}
        <div className="mb-12 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recycled Content Share</h2>
          
          {/* Enhanced Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {recycledContentData.map((material, index) => (
              <div key={index} className="border border-gray-200 p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                  {material.material}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Pre-Consumer</span>
                      <span className="font-bold text-emerald-600">{material.preConsumer}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${material.preConsumer}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Post-Consumer</span>
                      <span className="font-bold text-blue-600">{material.postConsumer}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${material.postConsumer}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Virgin Material</span>
                      <span className="font-bold text-rose-600">{material.virgin}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-rose-400 to-rose-600 h-3 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${material.virgin}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-base">
                      <span className="font-bold text-gray-800">Total Recycled</span>
                      <span className="font-bold text-purple-600">{material.totalRecycled}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${material.totalRecycled}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced Chart Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stacked Bar Chart */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Material Composition Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={recycledContentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="material" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Total Recycled Content Distribution</h3>
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
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Recycled Content']}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => [value, entry.payload.material]}
                    />
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
