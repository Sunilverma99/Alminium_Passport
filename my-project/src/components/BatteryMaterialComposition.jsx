
import { useState } from "react"
import { useEffect } from "react"

export default function BatteryMaterialComposition({ updateData, data = {}, loading = false }) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])

  const [batteryChemistry, setBatteryChemistry] = useState({
    battery_chemistry__short_name: data?.battery_chemistry__short_name || "",
    battery_chemistry__clear_name: data?.battery_chemistry__clear_name || "",
  })

  const [batteryMaterials, setBatteryMaterials] = useState(data?.battery_materials || [])
  const [hazardousSubstances, setHazardousSubstances] = useState(data?.hazardous_substances || [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = {
      battery_chemistry__short_name: batteryChemistry.battery_chemistry__short_name,
      battery_chemistry__clear_name: batteryChemistry.battery_chemistry__clear_name,
      battery_materials: batteryMaterials,
      hazardous_substances: hazardousSubstances,
    }
    console.log("Submitted Data:", formData)
    updateData(formData)
  }

  const addBatteryMaterial = () => {
    setBatteryMaterials((prev) => [
      ...prev,
      {
        battery_material_location: {
          component_name: "",
          component_id: "",
        },
        battery_material_identifier: "",
        battery_material_name: "",
        battery_material_mass: 0,
        is_critical_raw_material: false,
      },
    ])
  }

  const updateBatteryMaterial = (index, field, value) => {
    setBatteryMaterials((prev) => {
      const updated = [...prev]
      if (field.startsWith("battery_material_location.")) {
        const locationField = field.split(".")[1]
        updated[index].battery_material_location[locationField] = value
      } else {
        updated[index][field] = value
      }
      return updated
    })
  }

  const removeBatteryMaterial = (index) => {
    setBatteryMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  const addHazardousSubstance = () => {
    setHazardousSubstances((prev) => [
      ...prev,
      {
        hazardous_substance_class: "",
        hazardous_substance_name: "",
        hazardous_substance_concentration: 0,
        hazardous_substance_impact: "",
        hazardous_substance_location: {
          component_name: "",
          component_id: "",
        },
        hazardous_substance_identifier: "",
      },
    ])
  }

  const updateHazardousSubstance = (index, field, value) => {
    setHazardousSubstances((prev) => {
      const updated = [...prev]
      if (field.startsWith("hazardous_substance_location.")) {
        const locationField = field.split(".")[1]
        updated[index].hazardous_substance_location[locationField] = value
      } else {
        updated[index][field] = value
      }
      return updated
    })
  }

  const removeHazardousSubstance = (index) => {
    setHazardousSubstances((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Battery Material Composition</h1>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Battery Chemistry */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Battery Chemistry</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="shortName" className="block text-sm font-medium text-slate-700">
                    Short Name
                  </label>
                  <input
                    id="shortName"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={batteryChemistry.battery_chemistry__short_name}
                    onChange={(e) =>
                      setBatteryChemistry((prev) => ({
                        ...prev,
                        battery_chemistry__short_name: e.target.value,
                      }))
                    }
                    placeholder="e.g., NMC811"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="clearName" className="block text-sm font-medium text-slate-700">
                    Clear Name
                  </label>
                  <input
                    id="clearName"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={batteryChemistry.battery_chemistry__clear_name}
                    onChange={(e) =>
                      setBatteryChemistry((prev) => ({
                        ...prev,
                        battery_chemistry__clear_name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Lithium Nickel Manganese Cobalt Oxide (8:1:1)"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Battery Materials */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Battery Materials</h2>
                <button
                  type="button"
                  onClick={addBatteryMaterial}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Material
                </button>
              </div>
              <div className="p-6 space-y-4">
                {batteryMaterials.map((material, index) => (
                  <div key={index} className="rounded-lg border-2 border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3 flex flex-row items-center justify-between">
                      <h3 className="text-base font-medium text-slate-900">Material {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeBatteryMaterial(index)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-slate-50 hover:bg-red-500/90 h-8 w-8"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Component Name</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={material.battery_material_location.component_name}
                          onChange={(e) =>
                            updateBatteryMaterial(index, "battery_material_location.component_name", e.target.value)
                          }
                          placeholder="e.g., Cathode"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Component ID</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={material.battery_material_location.component_id}
                          onChange={(e) =>
                            updateBatteryMaterial(index, "battery_material_location.component_id", e.target.value)
                          }
                          placeholder="e.g., CMP-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Material Identifier (CAS Number)
                        </label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={material.battery_material_identifier}
                          onChange={(e) => updateBatteryMaterial(index, "battery_material_identifier", e.target.value)}
                          placeholder="e.g., 11111-22-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Material Name</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={material.battery_material_name}
                          onChange={(e) => updateBatteryMaterial(index, "battery_material_name", e.target.value)}
                          placeholder="e.g., Nickel"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Material Mass (kg)</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={material.battery_material_mass}
                          onChange={(e) =>
                            updateBatteryMaterial(
                              index,
                              "battery_material_mass",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 5.2"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id={`critical-${index}`}
                          className="h-4 w-4 shrink-0 rounded-sm border border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50"
                          checked={material.is_critical_raw_material}
                          onChange={(e) => updateBatteryMaterial(index, "is_critical_raw_material", e.target.checked)}
                        />
                        <label htmlFor={`critical-${index}`} className="text-sm font-medium text-slate-700">
                          Critical Raw Material
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                {batteryMaterials.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No battery materials added yet. Click "Add Material" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Hazardous Substances */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Hazardous Substances</h2>
                <button
                  type="button"
                  onClick={addHazardousSubstance}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Substance
                </button>
              </div>
              <div className="p-6 space-y-4">
                {hazardousSubstances.map((substance, index) => (
                  <div key={index} className="rounded-lg border-2 border-slate-200">
                    <div className="border-b border-slate-200 px-4 py-3 flex flex-row items-center justify-between">
                      <h3 className="text-base font-medium text-slate-900">Hazardous Substance {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeHazardousSubstance(index)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-slate-50 hover:bg-red-500/90 h-8 w-8"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Substance Class</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_class}
                          onChange={(e) => updateHazardousSubstance(index, "hazardous_substance_class", e.target.value)}
                          placeholder="e.g., Reproductive toxicity (Category 1B)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Substance Name</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_name}
                          onChange={(e) => updateHazardousSubstance(index, "hazardous_substance_name", e.target.value)}
                          placeholder="e.g., Cobalt Sulfate"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Concentration (%)</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_concentration}
                          onChange={(e) =>
                            updateHazardousSubstance(
                              index,
                              "hazardous_substance_concentration",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 0.2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Substance Identifier</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_identifier}
                          onChange={(e) =>
                            updateHazardousSubstance(index, "hazardous_substance_identifier", e.target.value)
                          }
                          placeholder="e.g., 10124-43-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Component Name</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_location.component_name}
                          onChange={(e) =>
                            updateHazardousSubstance(
                              index,
                              "hazardous_substance_location.component_name",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Cathode"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Component ID</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_location.component_id}
                          onChange={(e) =>
                            updateHazardousSubstance(index, "hazardous_substance_location.component_id", e.target.value)
                          }
                          placeholder="e.g., CMP-001"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Impact Description</label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={substance.hazardous_substance_impact}
                          onChange={(e) =>
                            updateHazardousSubstance(index, "hazardous_substance_impact", e.target.value)
                          }
                          placeholder="e.g., Toxic to reproduction, may damage fertility"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {hazardousSubstances.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No hazardous substances added yet. Click "Add Substance" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-11 px-8 w-full"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Update Material Composition"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
