"use client"

import { useState, useEffect } from "react"
import {
  FaWeightHanging,
  FaIndustry,
  FaBolt,
  FaRecycle,
  FaRegClock,
  FaGlobe,
  FaBatteryFull,
  FaChartLine,
  FaLeaf,
  FaNutritionix,
  FaAtom,
  FaBatteryThreeQuarters,
  FaPencilAlt,
  FaCube,
  FaFlask,
} from "react-icons/fa"
import { GiBatteryPackAlt, GiFactory } from "react-icons/gi"
import { MdCategory, MdVerified, MdOutlineLocalShipping } from "react-icons/md"
import { initializeContractInstance } from "../contractInstance.js"
import { pinata } from "../utils/config"
import { apiFetch } from "../utils/api"

const materialIcons = {
  nickel: FaNutritionix,
  cobalt: FaAtom,
  lithium: FaBatteryThreeQuarters,
  graphite: FaPencilAlt,
  manganese: FaCube,
  "lithium hexafluorophosphate": FaFlask,
  polyethylene: FaCube,
  aluminum: FaCube,
}

const tabs = [
  { id: "general", label: "General", icon: <GiBatteryPackAlt className="w-6 h-6" /> },
  { id: "materialComposition", label: "Material", icon: <FaBolt className="w-6 h-6" /> },
  { id: "performance", label: "Performance", icon: <FaBatteryFull className="w-6 h-6" /> },
  { id: "compliance", label: "Compliance", icon: <FaGlobe className="w-6 h-6" /> },
  { id: "supplyChain", label: "Supply Chain", icon: <MdOutlineLocalShipping className="w-6 h-6" /> },
  { id: "circularity", label: "Circularity", icon: <FaRecycle className="w-6 h-6" /> },
  { id: "carbonFootprint", label: "Carbon", icon: <FaLeaf className="w-6 h-6" /> },
]

export default function BatteryInfoRealData({ tokenId: externalTokenId }) {
  const [activeTab, setActiveTab] = useState("general")
  const [tokenId, setTokenId] = useState(externalTokenId || "3")
  const [version, setVersion] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchRealBatteryData() {
    setLoading(true)
    setError("")
    try {
      // 1) On-chain fetch - make this optional
      let passportRaw = null
      try {
        const { evContract } = await initializeContractInstance()
        passportRaw = await evContract.methods.getBatteryPassport(tokenId).call()
      } catch (blockchainError) {
        console.warn('Blockchain connection not available, proceeding with off-chain data only:', blockchainError.message)
        // Continue without blockchain data - this allows the component to work without MetaMask
      }

      // 2) Off-chain fetch: get only hashes
      const offChainResp = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/offchain/getDataOffChain/${tokenId}`)
      if (!offChainResp.ok) {
        const msg = await offChainResp.text()
        throw new Error(`Off-chain fetch error: ${msg}`)
      }
      const offChainHashes = await offChainResp.json()
      
      console.log('Off-chain hashes received:', offChainHashes);
      console.log('Material composition hashes:', offChainHashes.materialCompositionHashes);

      // determine index - always get the latest version
      const getLatestIndex = (array) => {
        if (!array || array.length === 0) return -1;
        return array.length - 1;
      };

      // helper to fetch actual JSON from Pinata
      const fetchFromPinata = async (hash) => {
        if (!hash) {
          throw new Error("Missing IPFS hash");
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

      // 4) Process and structure the real data
      const processedData = {
        general: {
          name: `${mat.battery_chemistry__clear_name || mat.battery_chemistry__short_name || "Battery Pack"}`,
          passportId: gpi.battery_passport_identifier || "N/A",
          productId: gpi.product_identifier || "N/A",
          manufacturedDate: gpi.manufacturing_date ? new Date(gpi.manufacturing_date).toLocaleDateString() : "N/A",
          facilityId:
            `${gpi.manufacturing_place__street_address || ""}, ${gpi.manufacturing_place__address_country || ""}`.trim(),
          manufacturedBy: gpi.manufacturer_information__contact_name || "N/A",
          category: gpi.battery_category || "EV Battery",
          status: gpi.battery_status || "Active",
          weight: gpi.battery_mass ? `${gpi.battery_mass} kg` : "N/A",
          operatedBy: gpi.operator_information__contact_name || "N/A",
          warrantyPeriod: gpi.warrenty_period || "N/A",
          serviceDate: gpi.putting_into_service ? new Date(gpi.putting_into_service).toLocaleDateString() : "N/A",
        },
        materialComposition: (() => {
          console.log('Processing material composition data:', mat);
          console.log('Battery materials array:', mat.battery_materials);
          
          if (!mat.battery_materials || mat.battery_materials.length === 0) {
            console.warn('No battery materials found in the data');
            return {};
          }
          
          return (mat.battery_materials || []).reduce((acc, material) => {
            const materialName = material.battery_material_name?.toLowerCase() || "unknown"
            const mass = Number(material.battery_material_mass) || 0
            const totalMass = (mat.battery_materials || []).reduce(
              (sum, m) => sum + (Number(m.battery_material_mass) || 0),
              0,
            )
            const percentage = totalMass > 0 ? ((mass / totalMass) * 100).toFixed(1) : "0"

            acc[materialName] = {
              percentage: `${percentage}%`,
              mass: `${mass} kg`,
              component: material.battery_material_location?.component_name || "Unknown",
              identifier: material.battery_material_identifier || "N/A",
              isCritical: material.is_critical_raw_material || false,
            }
            return acc
          }, {})
        })(),
        performance: {
          ratedCapacity: perf.battery_techical_properties__rated_capacity
            ? `${perf.battery_techical_properties__rated_capacity} Ah`
            : "N/A",
          ratedEnergy: perf.battery_techical_properties__rated_energy
            ? `${perf.battery_techical_properties__rated_energy} kWh`
            : "N/A",
          nominalVoltage: perf.battery_techical_properties__nominal_voltage
            ? `${perf.battery_techical_properties__nominal_voltage}V`
            : "N/A",
          maxVoltage: perf.battery_techical_properties__maximum_voltage
            ? `${perf.battery_techical_properties__maximum_voltage}V`
            : "N/A",
          minVoltage: perf.battery_techical_properties__minimum_voltage
            ? `${perf.battery_techical_properties__minimum_voltage}V`
            : "N/A",
          maxPower: perf.battery_techical_properties__rated_maximum_power
            ? `${perf.battery_techical_properties__rated_maximum_power} kW`
            : "N/A",
          expectedCycles: perf.battery_techical_properties__expected_number_of_cycles
            ? `${perf.battery_techical_properties__expected_number_of_cycles} cycles`
            : "N/A",
          roundtripEfficiency: perf.battery_techical_properties__roundtrip_efficiency
            ? `${perf.battery_techical_properties__roundtrip_efficiency}%`
            : "N/A",
          expectedLifetime: perf.battery_techical_properties__expected_lifetime
            ? `${perf.battery_techical_properties__expected_lifetime} years`
            : "N/A",
          currentCycles: perf.battery_condition__number_of_full_cycles__number_of_full_cycles_value
            ? `${perf.battery_condition__number_of_full_cycles__number_of_full_cycles_value} cycles`
            : "N/A",
          stateOfCharge: perf.battery_condition__state_of_charge__state_of_charge_value
            ? `${perf.battery_condition__state_of_charge__state_of_charge_value}%`
            : "N/A",
          powerFade: perf.battery_condition__power_fade ? `${perf.battery_condition__power_fade}%` : "N/A",
          efficiencyFade: perf.battery_condition__round_trip_efficiency_fade
            ? `${perf.battery_condition__round_trip_efficiency_fade}%`
            : "N/A",
        },
        compliance: {
          standards: labels.labels ? labels.labels.map((label) => label.labeling_subject || "N/A") : ["N/A"],
          safetyCertifications: [labels.declaration_of_conformity ? "Declaration of Conformity" : "N/A"],
          testReports: [labels.result_of_test_report ? "Test Report Available" : "N/A"],
          safetyInstructions: circ.safety_measures__safety_instructions ? "Available" : "N/A",
          extinguishingAgents: circ.safety_measures__extinguishing_agent || ["N/A"],
        },
        supplyChain: {
          dueDiligenceReport: dd.supply_chain_due_diligence_report ? "Available" : "N/A",
          thirdPartyAssurances: dd.third_party_aussurances ? "Available" : "N/A",
          supplyChainIndex: dd.supply_chain_indicies || "N/A",
          sparePartSuppliers: circ.spare_part_sources || [],
          manufacturerAddress:
            `${gpi.manufacturer_information__postal_address__street_address || ""}, ${gpi.manufacturer_information__postal_address__address_country || ""}`.trim(),
          operatorAddress:
            `${gpi.operator_information__postal_address__street_address || ""}, ${gpi.operator_information__postal_address__address_country || ""}`.trim(),
        },
        circularity: {
          recycledContent: circ.recycled_content || [],
          renewableContent: circ.renewable_content ? `${circ.renewable_content}%` : "N/A",
          dismantlingInfo: circ.dismantling_and_removal_information ? "Available" : "N/A",
          wastePreventionInfo: circ.end_of_life_information__waste_prevention ? "Available" : "N/A",
          collectionInfo: circ.end_of_life_information__information_on_collection ? "Available" : "N/A",
        },
        carbonFootprint: {
          totalFootprint: cf.batteryCarbonFootprint ? `${cf.batteryCarbonFootprint} kgCO₂e/kWh` : "N/A",
          lifecycleStages: cf.carbonFootprintPerLifecycleStage || [],
          performanceClass: cf.carbonFootprintPerformanceClass ? "Available" : "N/A",
          studyReference: cf.carbonFootprintStudy ? "Available" : "N/A",
        },
      }

      setData(processedData)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tokenId) {
      fetchRealBatteryData()
    }
  }, [tokenId])

  const getIcon = (key) => {
    const icons = {
      name: <GiBatteryPackAlt />,
      passportId: <MdVerified />,
      productId: <MdCategory />,
      manufacturedDate: <FaRegClock />,
      facilityId: <GiFactory />,
      manufacturedBy: <FaIndustry />,
      category: <MdCategory />,
      status: <MdVerified />,
      weight: <FaWeightHanging />,
      default: <FaChartLine />,
    }
    return icons[key] || icons.default
  }

  const renderGeneralTab = () => (
    <div className="grid grid-cols-1  gap-6">
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">{data.general.name}</h2>
        <div className="space-y-3">
          {Object.entries(data.general)
            .slice(1)
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  {getIcon(key)}
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </div>
                <span className="font-semibold text-right max-w-xs truncate">{value}</span>
              </div>
            ))}
        </div>
      </div>
      
    </div>
  )

  const renderMaterialComposition = () => {
    console.log('Rendering material composition with data:', data.materialComposition);
    console.log('Number of materials:', Object.keys(data.materialComposition).length);
    
    if (!data.materialComposition || Object.keys(data.materialComposition).length === 0) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center text-gray-500">
            <p className="text-lg">No material composition data available</p>
            <p className="text-sm">This could be due to missing data or processing issues</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {Object.entries(data.materialComposition).map(([material, details]) => {
          const Icon = materialIcons[material] || FaCube
          return (
            <div key={material} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <Icon className="text-blue-600 text-2xl" />
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium text-gray-700 capitalize">{material}</span>
                    <span className="text-lg font-bold text-blue-600">{details.percentage}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Mass: {details.mass}</div>
                    <div>Component: {details.component}</div>
                    <div>ID: {details.identifier}</div>
                    {details.isCritical && <div className="text-orange-600 font-medium">Critical Material</div>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: details.percentage }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderPerformance = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(data.performance).map(([key, value]) => (
        <div key={key} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h3>
            <FaBatteryFull className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{value}</p>
        </div>
      ))}
    </div>
  )

  const renderCompliance = () => (
    <div className="space-y-6">
      {Object.entries(data.compliance).map(([key, values]) => (
        <div key={key} className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h3>
          {Array.isArray(values) ? (
            <ul className="list-disc list-inside space-y-2">
              {values.map((value, index) => (
                <li key={index} className="text-gray-700">
                  {value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">{values}</p>
          )}
        </div>
      ))}
    </div>
  )

  const renderSupplyChain = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Due Diligence</h3>
          <div className="space-y-2">
            <p>
              <strong>Report:</strong> {data.supplyChain.dueDiligenceReport}
            </p>
            <p>
              <strong>Third Party Assurances:</strong> {data.supplyChain.thirdPartyAssurances}
            </p>
            <p>
              <strong>Supply Chain Index:</strong> {data.supplyChain.supplyChainIndex}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Locations</h3>
          <div className="space-y-2">
            <p>
              <strong>Manufacturer:</strong> {data.supplyChain.manufacturerAddress}
            </p>
            <p>
              <strong>Operator:</strong> {data.supplyChain.operatorAddress}
            </p>
          </div>
        </div>
      </div>
      {data.supplyChain.sparePartSuppliers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Spare Part Suppliers</h3>
          {data.supplyChain.sparePartSuppliers.map((supplier, index) => (
            <div key={index} className="border-b pb-4 mb-4 last:border-b-0">
              <p>
                <strong>{supplier.name_of_supplier}</strong>
              </p>
              <p>
                {supplier.address_of_supplier?.street_address}, {supplier.address_of_supplier?.address_country}
              </p>
              <p>Email: {supplier.email_address_of_supplier}</p>
              <p>Web: {supplier.supplier_web_address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderCircularity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Renewable Content</h3>
          <p className="text-3xl font-bold text-green-600">{data.circularity.renewableContent}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Dismantling Info</h3>
          <p className="text-lg text-blue-600">{data.circularity.dismantlingInfo}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Collection Info</h3>
          <p className="text-lg text-blue-600">{data.circularity.collectionInfo}</p>
        </div>
      </div>

      {data.circularity.recycledContent.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recycled Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.circularity.recycledContent.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">{item.recycled_material}</h4>
                <div className="space-y-1 text-sm">
                  <p>Pre-consumer: {item.pre_consumer_share}%</p>
                  <p>Post-consumer: {item.post_consumer_share}%</p>
                  <p className="font-semibold">
                    Total: {Number(item.pre_consumer_share) + Number(item.post_consumer_share)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderCarbonFootprint = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Total Carbon Footprint</h3>
        <p className="text-3xl font-bold text-green-600">{data.carbonFootprint.totalFootprint}</p>
      </div>

      {data.carbonFootprint.lifecycleStages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Lifecycle Stages</h3>
          <div className="space-y-4">
            {data.carbonFootprint.lifecycleStages.map((stage, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">{stage.lifecycleStage}</span>
                <span className="text-lg font-bold text-green-600">{stage.carbonFootprint} kgCO₂e</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderActiveTabContent = () => {
    if (!data) return null

    switch (activeTab) {
      case "general":
        return renderGeneralTab()
      case "materialComposition":
        return renderMaterialComposition()
      case "performance":
        return renderPerformance()
      case "compliance":
        return renderCompliance()
      case "supplyChain":
        return renderSupplyChain()
      case "circularity":
        return renderCircularity()
      case "carbonFootprint":
        return renderCarbonFootprint()
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 mt-4">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 mt-4">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="text-center p-8">
            <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Battery Data</div>
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchRealBatteryData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 mt-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 p-4 bg-blue-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="p-6 bg-gray-50">{renderActiveTabContent()}</div>
      </div>
    </div>
  )
}
