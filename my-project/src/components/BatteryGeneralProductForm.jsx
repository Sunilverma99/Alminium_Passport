

import { useState } from "react"
import { useEffect } from "react"
9654510253
const batteryCategories = [
  "electric vehicle battery",
  "lmt battery",
  "industrial battery",
  "stationary battery energy storage system",
]

const batteryStatuses = ["original", "repurposed", "reused", "remanufactured", "waste"]

const sustainabilityRatings = ["A+", "A", "B+", "B", "C+", "C", "D"]

// Helper functions for auto-generation
const generateProductIdentifier = (country = "UK") => {
  const timestamp = Date.now().toString().slice(-9)
  return `BAT-${country.toUpperCase()}-${timestamp}`
}

const generateBatteryPassportIdentifier = (country = "UK") => {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-9)
  return `PASS-${year}-${country.toUpperCase()}-${timestamp}`
}

export default function GeneralProductInformationForm({ updateData, data = {} }) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
  const [formData, setFormData] = useState({
    product_identifier: data?.product_identifier || "",
    battery_passport_identifier: data?.battery_passport_identifier || "",
    battery_category: data?.battery_category || "",
    battery_status: data?.battery_status || "",
    battery_weight: data?.battery_weight || 0,
    sustainability_score: data?.sustainability_score || 0,
    sustainability_rating: data?.sustainability_rating || "",
    manufacturer_information__contact_name: data?.manufacturer_information__contact_name || "",
    manufacturer_information__postal_address__address_country:
      data?.manufacturer_information__postal_address__address_country || "",
    manufacturer_information__postal_address__postal_code:
      data?.manufacturer_information__postal_address__postal_code || "",
    manufacturer_information__postal_address__street_address:
      data?.manufacturer_information__postal_address__street_address || "",
    manufacturer_information__identifier: data?.manufacturer_information__identifier || "",
    manufacturing_date: data?.manufacturing_date || "",
    manufacturing_place__address_country: data?.manufacturing_place__address_country || "",
    manufacturing_place__postal_code: data?.manufacturing_place__postal_code || "",
    manufacturing_place__street_address: data?.manufacturing_place__street_address || "",
    operator_information__contact_name: data?.operator_information__contact_name || "",
    operator_information__postal_address__address_country:
      data?.operator_information__postal_address__address_country || "",
    operator_information__postal_address__postal_code: data?.operator_information__postal_address__postal_code || "",
    operator_information__postal_address__street_address:
      data?.operator_information__postal_address__street_address || "",
    operator_information__identifier: data?.operator_information__identifier || "",
    putting_into_service: data?.putting_into_service || "",
    warrenty_period: data?.warrenty_period || "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      // Auto-assign rating based on sustainability score
      if (field === "sustainability_score") {
        const score = Number.parseFloat(value) || 0
        if (score >= 90) newData.sustainability_rating = "A+"
        else if (score >= 80) newData.sustainability_rating = "A"
        else if (score >= 70) newData.sustainability_rating = "B+"
        else if (score >= 60) newData.sustainability_rating = "B"
        else if (score >= 50) newData.sustainability_rating = "C+"
        else if (score >= 40) newData.sustainability_rating = "C"
        else newData.sustainability_rating = "D"
      }

      return newData
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitted Data:", formData)
    updateData(formData)
  }

  const getCurrentDateTime = () => {
    return new Date().toISOString()
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">General Product Information</h1>
          <p className="text-sm text-slate-600 mt-1">
            Basic identification and classification information for the battery product
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Identification */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Product Identification</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="productIdentifier" className="block text-sm font-medium text-slate-700">
                      Product Identifier
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="productIdentifier"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="BAT-UK-000123456"
                        value={formData.product_identifier}
                        onChange={(e) => handleChange("product_identifier", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const country = formData.manufacturer_information__postal_address__address_country || "UK"
                          handleChange("product_identifier", generateProductIdentifier(country))
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-3"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="batteryPassportIdentifier" className="block text-sm font-medium text-slate-700">
                      Battery Passport Identifier
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="batteryPassportIdentifier"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="PASS-2025-UK-000123456"
                        value={formData.battery_passport_identifier}
                        onChange={(e) => handleChange("battery_passport_identifier", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const country = formData.manufacturer_information__postal_address__address_country || "UK"
                          handleChange("battery_passport_identifier", generateBatteryPassportIdentifier(country))
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-3"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="batteryCategory" className="block text-sm font-medium text-slate-700">
                      Battery Category
                    </label>
                    <select
                      id="batteryCategory"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_category}
                      onChange={(e) => handleChange("battery_category", e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {batteryCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="batteryStatus" className="block text-sm font-medium text-slate-700">
                      Battery Status
                    </label>
                    <select
                      id="batteryStatus"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.battery_status}
                      onChange={(e) => handleChange("battery_status", e.target.value)}
                      required
                    >
                      <option value="">Select status</option>
                      {batteryStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="batteryWeight" className="block text-sm font-medium text-slate-700">
                      Battery Weight (kg)
                    </label>
                    <input
                      type="string"
                      id="batteryWeight"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      placeholder="25.5"
                      value={formData.battery_weight}
                      onChange={(e) => handleChange("battery_weight", Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sustainabilityScore" className="block text-sm font-medium text-slate-700">
                      Sustainability Score (0-100)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="string"
                        id="sustainabilityScore"
                       
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.sustainability_score}
                        onChange={(e) => handleChange("sustainability_score", Number.parseFloat(e.target.value) || 0)}
                      />
                      <div
                        className={`flex items-center justify-center h-10 px-3 rounded-md text-sm font-medium text-white ${
                          formData.sustainability_score >= 80
                            ? "bg-green-600"
                            : formData.sustainability_score >= 60
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                      >
                        {formData.sustainability_rating || "N/A"}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Enter sustainability score (0-100)</p>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const country = formData.manufacturer_information__postal_address__address_country || "UK"
                      handleChange("product_identifier", generateProductIdentifier(country))
                      handleChange("battery_passport_identifier", generateBatteryPassportIdentifier(country))
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-green-600 text-white hover:bg-green-700 h-9 px-4"
                  >
                    Generate Both Identifiers
                  </button>
                </div>
              </div>
            </div>

            {/* Manufacturer Information */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Manufacturer Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="manufacturerContactName" className="block text-sm font-medium text-slate-700">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="manufacturerContactName"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      placeholder="GreenVolt Industries Pvt Ltd"
                      value={formData.manufacturer_information__contact_name}
                      onChange={(e) => handleChange("manufacturer_information__contact_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="manufacturerIdentifier" className="block text-sm font-medium text-slate-700">
                      Manufacturer Identifier
                    </label>
                    <input
                      type="text"
                      id="manufacturerIdentifier"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      placeholder="GV-IND-2025"
                      value={formData.manufacturer_information__identifier}
                      onChange={(e) => handleChange("manufacturer_information__identifier", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Manufacturer Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="manufacturerCountry" className="block text-sm font-medium text-slate-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="manufacturerCountry"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="India"
                        value={formData.manufacturer_information__postal_address__address_country}
                        onChange={(e) =>
                          handleChange("manufacturer_information__postal_address__address_country", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="manufacturerPostalCode" className="block text-sm font-medium text-slate-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="manufacturerPostalCode"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="560001"
                        value={formData.manufacturer_information__postal_address__postal_code}
                        onChange={(e) =>
                          handleChange("manufacturer_information__postal_address__postal_code", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="manufacturerStreetAddress" className="block text-sm font-medium text-slate-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="manufacturerStreetAddress"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="12 Industrial Lane, Bengaluru"
                        value={formData.manufacturer_information__postal_address__street_address}
                        onChange={(e) =>
                          handleChange("manufacturer_information__postal_address__street_address", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturing Information */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Manufacturing Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="manufacturingDate" className="block text-sm font-medium text-slate-700">
                    Manufacturing Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      id="manufacturingDate"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.manufacturing_date ? formData.manufacturing_date.slice(0, 16) : ""}
                      onChange={(e) =>
                        handleChange("manufacturing_date", e.target.value ? new Date(e.target.value).toISOString() : "")
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("manufacturing_date", getCurrentDateTime())}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                    >
                      Now
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Manufacturing Place</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="manufacturingCountry" className="block text-sm font-medium text-slate-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="manufacturingCountry"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="India"
                        value={formData.manufacturing_place__address_country}
                        onChange={(e) => handleChange("manufacturing_place__address_country", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="manufacturingPostalCode" className="block text-sm font-medium text-slate-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="manufacturingPostalCode"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="560001"
                        value={formData.manufacturing_place__postal_code}
                        onChange={(e) => handleChange("manufacturing_place__postal_code", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="manufacturingStreetAddress" className="block text-sm font-medium text-slate-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="manufacturingStreetAddress"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="12 Industrial Lane, Bengaluru"
                        value={formData.manufacturing_place__street_address}
                        onChange={(e) => handleChange("manufacturing_place__street_address", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operator Information */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Operator Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="operatorContactName" className="block text-sm font-medium text-slate-700">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="operatorContactName"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      placeholder="VoltOps Energy Solutions"
                      value={formData.operator_information__contact_name}
                      onChange={(e) => handleChange("operator_information__contact_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="operatorIdentifier" className="block text-sm font-medium text-slate-700">
                      Operator Identifier
                    </label>
                    <input
                      type="text"
                      id="operatorIdentifier"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      placeholder="VOES-IND-2025"
                      value={formData.operator_information__identifier}
                      onChange={(e) => handleChange("operator_information__identifier", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Operator Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="operatorCountry" className="block text-sm font-medium text-slate-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="operatorCountry"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="India"
                        value={formData.operator_information__postal_address__address_country}
                        onChange={(e) =>
                          handleChange("operator_information__postal_address__address_country", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="operatorPostalCode" className="block text-sm font-medium text-slate-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="operatorPostalCode"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="400001"
                        value={formData.operator_information__postal_address__postal_code}
                        onChange={(e) =>
                          handleChange("operator_information__postal_address__postal_code", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="operatorStreetAddress" className="block text-sm font-medium text-slate-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="operatorStreetAddress"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="45 Energy Hub Road, Mumbai"
                        value={formData.operator_information__postal_address__street_address}
                        onChange={(e) =>
                          handleChange("operator_information__postal_address__street_address", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="puttingIntoService" className="block text-sm font-medium text-slate-700">
                      Putting Into Service Date
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        id="puttingIntoService"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.putting_into_service ? formData.putting_into_service.slice(0, 16) : ""}
                        onChange={(e) =>
                          handleChange(
                            "putting_into_service",
                            e.target.value ? new Date(e.target.value).toISOString() : "",
                          )
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleChange("putting_into_service", getCurrentDateTime())}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-3"
                      >
                        Now
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-slate-700">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      id="warrantyPeriod"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      placeholder="8 years or 160,000 km"
                      value={formData.warrenty_period}
                      onChange={(e) => handleChange("warrenty_period", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-11 px-8 w-full"
            >
              Submit General Product Information (Step 7)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
