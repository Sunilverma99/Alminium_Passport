"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { useEffect } from "react"

export default function BatteryTechnicalForm({ updateData, data = {} }) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
   const [formData, setFormData] = useState({
    battery_techical_properties__original_power_capability: data?.battery_techical_properties__original_power_capability || [{ at_so_c: 0, power_capability_at: 0 }],
    battery_techical_properties__rated_maximum_power: data?.battery_techical_properties__rated_maximum_power || 0,
    battery_techical_properties__power_capability_ratio: data?.battery_techical_properties__power_capability_ratio || 0,
    battery_techical_properties__rated_energy: data?.battery_techical_properties__rated_energy || 0,
    battery_techical_properties__expected_number_of_cycles: data?.battery_techical_properties__expected_number_of_cycles || 0,
    battery_techical_properties__initial_self_discharge: data?.battery_techical_properties__initial_self_discharge || 0,
    battery_techical_properties__roundtrip_efficiency: data?.battery_techical_properties__roundtrip_efficiency || 0,
    battery_techical_properties__rated_capacity: data?.battery_techical_properties__rated_capacity || 0,
    battery_techical_properties__initial_internal_resistance: data?.battery_techical_properties__initial_internal_resistance || [{ ohmic_resistance: 0, battery_component: "" }],
    battery_techical_properties__expected_lifetime: data?.battery_techical_properties__expected_lifetime || 0,
    battery_techical_properties__c_rate: data?.battery_techical_properties__c_rate || 0,
    battery_techical_properties__nominal_voltage: data?.battery_techical_properties__nominal_voltage || 0,
    battery_techical_properties__minimum_voltage: data?.battery_techical_properties__minimum_voltage || 0,
    battery_techical_properties__maximum_voltage: data?.battery_techical_properties__maximum_voltage || 0,
    battery_techical_properties__capacity_threshold_for_exhaustion: data?.battery_techical_properties__capacity_threshold_for_exhaustion || 0,
    battery_techical_properties__lifetime_reference_test: data?.battery_techical_properties__lifetime_reference_test || "",
    battery_techical_properties__c_rate_life_cycle_test: data?.battery_techical_properties__c_rate_life_cycle_test || 0,
    battery_techical_properties__temperature_range_idle_state: data?.battery_techical_properties__temperature_range_idle_state || 0,
    battery_condition__energy_throughput: data?.battery_condition__energy_throughput || 0,
    battery_condition__capacity_throughput__capacity_throughput_value: data?.battery_condition__capacity_throughput__capacity_throughput_value || 0,
    battery_condition__capacity_throughput__last_update: data?.battery_condition__capacity_throughput__last_update || "",
    battery_condition__number_of_full_cycles__number_of_full_cycles_value: data?.battery_condition__number_of_full_cycles__number_of_full_cycles_value || 0,
    battery_condition__number_of_full_cycles__last_update: data?.battery_condition__number_of_full_cycles__last_update || "",
    battery_condition__state_of_certified_energy__state_of_certified_energy_value: data?.battery_condition__state_of_certified_energy__state_of_certified_energy_value || 0,
    battery_condition__state_of_certified_energy__last_update: data?.battery_condition__state_of_certified_energy__last_update || "",
    battery_condition__capacity_fade__capacity_fade_value: data?.battery_condition__capacity_fade__capacity_fade_value || 0,
    battery_condition__capacity_fade__last_update: data?.battery_condition__capacity_fade__last_update || "",
    battery_condition__remaining_energy__remaining_energyalue: data?.battery_condition__remaining_energy__remaining_energyalue || 0,
    battery_condition__remaining_energy__last_update: data?.battery_condition__remaining_energy__last_update || "",
    battery_condition__remaining_capacity__remaining_capacity_value: data?.battery_condition__remaining_capacity__remaining_capacity_value || 0,
    battery_condition__remaining_capacity__last_update: data?.battery_condition__remaining_capacity__last_update || "",
    battery_condition__negative_events: data?.battery_condition__negative_events || [{ negative_event: "", last_update: "" }],
    battery_condition__temperature_information__time_extreme_high_temp: data?.battery_condition__temperature_information__time_extreme_high_temp || 0,
    battery_condition__temperature_information__time_extreme_low_temp: data?.battery_condition__temperature_information__time_extreme_low_temp || 0,
    battery_condition__temperature_information__time_extreme_high_temp_charging: data?.battery_condition__temperature_information__time_extreme_high_temp_charging || 0,
    battery_condition__temperature_information__time_extreme_low_temp_charging: data?.battery_condition__temperature_information__time_extreme_low_temp_charging || 0,
    battery_condition__temperature_information__last_update: data?.battery_condition__temperature_information__last_update || "",
    battery_condition__remaining_power_capability: data?.battery_condition__remaining_power_capability || [{
      remaining_power_capability_value: {
        r_p_c_last_updated: "",
        at_so_c: 0,
        power_capability_at: 0,
      },
      last_update: "",
    }],
    battery_condition__power_fade: data?.battery_condition__power_fade || 0,
    battery_condition__round_trip_efficiency_fade: data?.battery_condition__round_trip_efficiency_fade || 0,
    battery_condition__evolution_of_self_discharge__evolution_of_self_discharge_entity_value: data?.battery_condition__evolution_of_self_discharge__evolution_of_self_discharge_entity_value || 0,
    battery_condition__current_self_discharging_rate__current_self_discharging_rate_entity: data?.battery_condition__current_self_discharging_rate__current_self_discharging_rate_entity || 0,
    battery_condition__current_self_discharging_rate__last_update: data?.battery_condition__current_self_discharging_rate__last_update || "",
    battery_condition__internal_resistance_increase: data?.battery_condition__internal_resistance_increase || [{
      internal_resistance_increase_value: 0,
      last_update: "",
      battery_component: "",
    }],
    battery_condition__round_trip_efficiencyat50_per_cent_cycle_life: data?.battery_condition__round_trip_efficiencyat50_per_cent_cycle_life || 0,
    battery_condition__remaining_round_trip_energy_efficiency__remaining_round_trip_energy_efficiency_value: data?.battery_condition__remaining_round_trip_energy_efficiency__remaining_round_trip_energy_efficiency_value || 0,
    battery_condition__remaining_round_trip_energy_efficiency__last_update: data?.battery_condition__remaining_round_trip_energy_efficiency__last_update || "",
    battery_condition__state_of_charge__state_of_charge_value: data?.battery_condition__state_of_charge__state_of_charge_value || 0,
    battery_condition__state_of_charge__last_update: data?.battery_condition__state_of_charge__last_update || "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, index, subField, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [subField]: value } : item
      ),
    }))
  }

  const handleNestedArrayChange = (field, index, nestedField, subField, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index
          ? {
              ...item,
              [nestedField]: { ...item[nestedField], [subField]: value },
            }
          : item
      ),
    }))
  }

  const addArrayItem = (field, template) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], template] }))
  }

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

   const isFormPartiallyComplete = () => {
    const requiredFields = [
      "battery_techical_properties__rated_maximum_power",
      "battery_techical_properties__rated_energy",
      "battery_techical_properties__nominal_voltage",
      "battery_techical_properties__rated_capacity",
      "battery_condition__energy_throughput",
      "battery_condition__capacity_throughput__capacity_throughput_value",
    ]

    for (let field of requiredFields) {
      const value = formData[field]
      if (value === null || value === undefined || value === "") {
        return false
      }
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormPartiallyComplete(formData)) {
      toast.error("Please fill all fields before submitting the form.")
      return
    }
    updateData(formData)
  }

  const getCurrentDateTime = () => new Date().toISOString()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Battery Technical Properties & Conditions</h1>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Technical Properties Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Technical Properties</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Rated Maximum Power (kW)</label>
                    <input
                      
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__rated_maximum_power}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__rated_maximum_power",
                         e.target.value,
                        )
                      }
                      placeholder="e.g., 150.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Power Capability Ratio</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__power_capability_ratio}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__power_capability_ratio",
                         e.target.value,
                        )
                      }
                      placeholder="e.g., 0.8"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Rated Energy (kWh)</label>
                    <input
                     
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__rated_energy}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__rated_energy",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 50.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Expected Number of Cycles</label>
                    <input
                     
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__expected_number_of_cycles}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__expected_number_of_cycles",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 1500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Initial Self Discharge (%)</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__initial_self_discharge}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__initial_self_discharge",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Roundtrip Efficiency</label>
                    <input
                    
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__roundtrip_efficiency}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__roundtrip_efficiency",
                         e.target.value,
                        )
                      }
                      placeholder="e.g., 0.92"
                    />
                  </div>
                </div>

                {/* Voltage and Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Nominal Voltage (V)</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__nominal_voltage}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__nominal_voltage",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 400.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Minimum Voltage (V)</label>
                    <input
                    
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__minimum_voltage}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__minimum_voltage",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 300.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Maximum Voltage (V)</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__maximum_voltage}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__maximum_voltage",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 450.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Rated Capacity (Ah)</label>
                    <input
                     
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__rated_capacity}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__rated_capacity",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 100.0"
                    />
                  </div>
                </div>

                {/* Additional Properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Expected Lifetime (years)</label>
                    <input
                      
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__expected_lifetime}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__expected_lifetime",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">C-Rate</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__c_rate}
                      onChange={(e) =>
                        handleChange("battery_techical_properties__c_rate",e.target.value)
                      }
                      placeholder="e.g., 1.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">C-Rate Life Cycle Test</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__c_rate_life_cycle_test}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__c_rate_life_cycle_test",
                         e.target.value,
                        )
                      }
                      placeholder="e.g., 1.2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Capacity Threshold for Exhaustion (%)
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__capacity_threshold_for_exhaustion}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__capacity_threshold_for_exhaustion",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 70.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Temperature Range Idle State (°C)
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_techical_properties__temperature_range_idle_state}
                      onChange={(e) =>
                        handleChange(
                          "battery_techical_properties__temperature_range_idle_state",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 45.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Lifetime Reference Test</label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                    value={formData.battery_techical_properties__lifetime_reference_test}
                    onChange={(e) =>
                      handleChange("battery_techical_properties__lifetime_reference_test", e.target.value)
                    }
                    placeholder="e.g., Standard ISO-TR-1234"
                  />
                </div>

                {/* Original Power Capability Array */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">Original Power Capability</h3>
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem("battery_techical_properties__original_power_capability", {
                          at_so_c: 0,
                          power_capability_at: 0,
                        })
                      }
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Entry
                    </button>
                  </div>
                  {formData.battery_techical_properties__original_power_capability.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">At SoC (%)</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={item.at_so_c}
                          onChange={(e) =>
                            handleArrayChange(
                              "battery_techical_properties__original_power_capability",
                              index,
                              "at_so_c",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 80.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Power Capability At (kW)</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={item.power_capability_at}
                          onChange={(e) =>
                            handleArrayChange(
                              "battery_techical_properties__original_power_capability",
                              index,
                              "power_capability_at",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 120.0"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("battery_techical_properties__original_power_capability", index)
                          }
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-red-500 text-slate-50 hover:bg-red-500/90 h-10 w-10"
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
                    </div>
                  ))}
                </div>

                {/* Initial Internal Resistance Array */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">Initial Internal Resistance</h3>
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem("battery_techical_properties__initial_internal_resistance", {
                          ohmic_resistance: 0,
                          battery_component: "",
                        })
                      }
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Entry
                    </button>
                  </div>
                  {formData.battery_techical_properties__initial_internal_resistance.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Ohmic Resistance (Ω)</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={item.ohmic_resistance}
                          onChange={(e) =>
                            handleArrayChange(
                              "battery_techical_properties__initial_internal_resistance",
                              index,
                              "ohmic_resistance",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 0.015"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Battery Component</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={item.battery_component}
                          onChange={(e) =>
                            handleArrayChange(
                              "battery_techical_properties__initial_internal_resistance",
                              index,
                              "battery_component",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Module-A"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("battery_techical_properties__initial_internal_resistance", index)
                          }
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-red-500 text-slate-50 hover:bg-red-500/90 h-10 w-10"
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battery Condition Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Battery Condition</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Condition Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Energy Throughput (kWh)</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_condition__energy_throughput}
                      onChange={(e) =>
                        handleChange("battery_condition__energy_throughput",e.target.value)
                      }
                      placeholder="e.g., 8000.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Power Fade (%)</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_condition__power_fade}
                      onChange={(e) =>
                        handleChange("battery_condition__power_fade",e.target.value)
                      }
                      placeholder="e.g., 8.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Round Trip Efficiency Fade (%)</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_condition__round_trip_efficiency_fade}
                      onChange={(e) =>
                        handleChange(
                          "battery_condition__round_trip_efficiency_fade",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 5.0"
                    />
                  </div>
                </div>

                {/* Values with Timestamps */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-slate-900">Capacity Throughput</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Capacity Throughput Value (Ah)</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__capacity_throughput__capacity_throughput_value}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__capacity_throughput__capacity_throughput_value",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 7500.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Last Update</label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={
                            formData.battery_condition__capacity_throughput__last_update
                              ? formData.battery_condition__capacity_throughput__last_update.slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            handleChange(
                              "battery_condition__capacity_throughput__last_update",
                              e.target.value ? new Date(e.target.value).toISOString() : "",
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleChange("battery_condition__capacity_throughput__last_update", getCurrentDateTime())
                          }
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                        >
                          Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Similar pattern for other condition values with timestamps */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-slate-900">Number of Full Cycles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Number of Full Cycles Value</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__number_of_full_cycles__number_of_full_cycles_value}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__number_of_full_cycles__number_of_full_cycles_value",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 1200.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Last Update</label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={
                            formData.battery_condition__number_of_full_cycles__last_update
                              ? formData.battery_condition__number_of_full_cycles__last_update.slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            handleChange(
                              "battery_condition__number_of_full_cycles__last_update",
                              e.target.value ? new Date(e.target.value).toISOString() : "",
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleChange("battery_condition__number_of_full_cycles__last_update", getCurrentDateTime())
                          }
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                        >
                          Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* State of Charge */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-slate-900">State of Charge</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">State of Charge Value (%)</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__state_of_charge__state_of_charge_value}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__state_of_charge__state_of_charge_value",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 75.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Last Update</label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={
                            formData.battery_condition__state_of_charge__last_update
                              ? formData.battery_condition__state_of_charge__last_update.slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            handleChange(
                              "battery_condition__state_of_charge__last_update",
                              e.target.value ? new Date(e.target.value).toISOString() : "",
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleChange("battery_condition__state_of_charge__last_update", getCurrentDateTime())
                          }
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                        >
                          Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Temperature Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-slate-900">Temperature Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Time Extreme High Temp (hours)</label>
                      <input
                        
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__temperature_information__time_extreme_high_temp}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__temperature_information__time_extreme_high_temp",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 12.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Time Extreme Low Temp (hours)</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__temperature_information__time_extreme_low_temp}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__temperature_information__time_extreme_low_temp",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 4.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Time Extreme High Temp Charging (hours)
                      </label>
                      <input
                        
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__temperature_information__time_extreme_high_temp_charging}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__temperature_information__time_extreme_high_temp_charging",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 3.2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Time Extreme Low Temp Charging (hours)
                      </label>
                      <input
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.battery_condition__temperature_information__time_extreme_low_temp_charging}
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__temperature_information__time_extreme_low_temp_charging",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="e.g., 2.8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Temperature Information Last Update
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={
                          formData.battery_condition__temperature_information__last_update
                            ? formData.battery_condition__temperature_information__last_update.slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          handleChange(
                            "battery_condition__temperature_information__last_update",
                            e.target.value ? new Date(e.target.value).toISOString() : "",
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleChange("battery_condition__temperature_information__last_update", getCurrentDateTime())
                        }
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                      >
                        Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Negative Events Array */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">Negative Events</h3>
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem("battery_condition__negative_events", { negative_event: "", last_update: "" })
                      }
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Event
                    </button>
                  </div>
                  {formData.battery_condition__negative_events.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Negative Event</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={item.negative_event}
                          onChange={(e) =>
                            handleArrayChange(
                              "battery_condition__negative_events",
                              index,
                              "negative_event",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Overheat incident"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Last Update</label>
                        <div className="flex gap-2">
                          <input
                            type="datetime-local"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                            value={item.last_update ? item.last_update.slice(0, 16) : ""}
                            onChange={(e) =>
                              handleArrayChange(
                                "battery_condition__negative_events",
                                index,
                                "last_update",
                                e.target.value ? new Date(e.target.value).toISOString() : "",
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleArrayChange(
                                "battery_condition__negative_events",
                                index,
                                "last_update",
                                getCurrentDateTime(),
                              )
                            }
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                          >
                            Now
                          </button>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeArrayItem("battery_condition__negative_events", index)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-red-500 text-slate-50 hover:bg-red-500/90 h-10 w-10"
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-11 px-8 w-full"
            >
              Submit Battery Technical Data (Step 3)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
