
import { useState } from "react"
import { useEffect } from "react"
import { pinata } from "../utils/config"
import toast from "react-hot-toast"


const documentTypes = [
  "Dismantling Manual",
  "Removal Manual",
  "Bill of Material",
  "Model 3D",
  "Other Manual",
  "Drawing",
]

const recycledMaterials = ["Cobalt", "Nickel", "Lithium", "Lead", "Manganese", "Aluminum"]

const extinguishingAgents = ["Class A", "Class B", "Class C", "Class D", "Class ABC", "Class BC", "Foam", "Water"]

export default function CircularityForm({ updateData, data = {} }) {

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
  const [formData, setFormData] = useState({
    dismantling_and_removal_information: data?.dismantling_and_removal_information || [
      { document_type: "", mime_type: "", document_u_r_l: "" },
    ],
    spare_part_sources: data?.spare_part_sources || [
      {
        name_of_supplier: "",
        address_of_supplier: {
          address_country: "",
          postal_code: "",
          street_address: "",
        },
        email_address_of_supplier: "",
        supplier_web_address: "",
        components: {
          part_name: "",
          part_number: "",
        },
      },
    ],
    recycled_content: data?.recycled_content || [
      { pre_consumer_share: 0, recycled_material: "", post_consumer_share: 0 },
    ],
    safety_measures__safety_instructions: data?.safety_measures__safety_instructions || "",
    safety_measures__extinguishing_agent: data?.safety_measures__extinguishing_agent || [""],
    end_of_life_information__waste_prevention: data?.end_of_life_information__waste_prevention || "",
    end_of_life_information__separate_collection: data?.end_of_life_information__separate_collection || "",
    end_of_life_information__information_on_collection: data?.end_of_life_information__information_on_collection || "",
    renewable_content: data?.renewable_content || 0,
  })

  const [uploadingDocuments, setUploadingDocuments] = useState({})

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayChange = (field, index, subField, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? { ...item, [subField]: value } : item)),
    }))
  }

  const handleNestedChange = (field, index, nestedField, subField, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index
          ? {
              ...item,
              [nestedField]: { ...item[nestedField], [subField]: value },
            }
          : item,
      ),
    }))
  }

  const addArrayItem = (field, template) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], template],
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleExtinguishingAgentChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      safety_measures__extinguishing_agent: prev.safety_measures__extinguishing_agent.map((agent, i) =>
        i === index ? value : agent,
      ),
    }))
  }

  const addExtinguishingAgent = () => {
    setFormData((prev) => ({
      ...prev,
      safety_measures__extinguishing_agent: [...prev.safety_measures__extinguishing_agent, ""],
    }))
  }

  const removeExtinguishingAgent = (index) => {
    setFormData((prev) => ({
      ...prev,
      safety_measures__extinguishing_agent: prev.safety_measures__extinguishing_agent.filter((_, i) => i !== index),
    }))
  }

  const handleDocumentUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingDocuments(prev => ({ ...prev, [index]: true }))
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        handleArrayChange("dismantling_and_removal_information", index, "document_u_r_l", url)
        handleArrayChange("dismantling_and_removal_information", index, "mime_type", file.type)
        toast.success("Document uploaded successfully!")
      }
    } catch (err) {
      toast.error("Failed to upload document to Pinata")
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitted Data:", formData)
    updateData(formData)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Circularity Information Form</h1>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dismantling and Removal Information */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Dismantling and Removal Information</h2>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("dismantling_and_removal_information", {
                      document_type: "",
                      mime_type: "",
                      document_u_r_l: "",
                    })
                  }
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Document
                </button>
              </div>
              <div className="p-6 space-y-4">
                {formData.dismantling_and_removal_information.map((doc, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-slate-900">Document {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("dismantling_and_removal_information", index)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-red-500 text-slate-50 hover:bg-red-500/90 h-8 w-8"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Document Type</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={doc.document_type}
                          onChange={(e) =>
                            handleArrayChange(
                              "dismantling_and_removal_information",
                              index,
                              "document_type",
                              e.target.value,
                            )
                          }
                          required
                        >
                          <option value="">Select Document Type</option>
                          {documentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">MIME Type</label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          placeholder="e.g., application/pdf"
                          value={doc.mime_type}
                          onChange={(e) =>
                            handleArrayChange("dismantling_and_removal_information", index, "mime_type", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Document File</label>
                        {uploadingDocuments[index] && (
                          <p className="text-sm text-blue-600">Uploading...</p>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleDocumentUpload(e, index)}
                          className="block w-full text-sm text-slate-900 border border-slate-200 rounded-md cursor-pointer bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-colors"
                          disabled={uploadingDocuments[index]}
                        />
                        {doc.document_u_r_l && (
                          <div className="mt-2">
                            <span className="block text-xs text-green-600 font-medium mb-1">
                              ✓ Document uploaded successfully!
                            </span>
                            <a 
                              href={doc.document_u_r_l} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-xs text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              View Document: {doc.document_u_r_l}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {formData.dismantling_and_removal_information.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No documents added yet. Click "Add Document" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Spare Part Sources */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Spare Part Sources</h2>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("spare_part_sources", {
                      name_of_supplier: "",
                      address_of_supplier: {
                        address_country: "",
                        postal_code: "",
                        street_address: "",
                      },
                      email_address_of_supplier: "",
                      supplier_web_address: "",
                      components: {
                        part_name: "",
                        part_number: "",
                      },
                    })
                  }
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Supplier
                </button>
              </div>
              <div className="p-6 space-y-6">
                {formData.spare_part_sources.map((supplier, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-slate-900">Supplier {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("spare_part_sources", index)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-red-500 text-slate-50 hover:bg-red-500/90 h-8 w-8"
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Name of Supplier</label>
                          <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                            placeholder="e.g., GreenBattery Spares Ltd."
                            value={supplier.name_of_supplier}
                            onChange={(e) =>
                              handleArrayChange("spare_part_sources", index, "name_of_supplier", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Email Address</label>
                          <input
                            type="email"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                            placeholder="support@greenbatteryspares.in"
                            value={supplier.email_address_of_supplier}
                            onChange={(e) =>
                              handleArrayChange(
                                "spare_part_sources",
                                index,
                                "email_address_of_supplier",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Supplier Web Address</label>
                        <input
                          type="url"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          placeholder="https://greenbatteryspares.in"
                          value={supplier.supplier_web_address}
                          onChange={(e) =>
                            handleArrayChange("spare_part_sources", index, "supplier_web_address", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-700">Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Country</label>
                            <input
                              type="text"
                              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                              placeholder="e.g., India"
                              value={supplier.address_of_supplier.address_country}
                              onChange={(e) =>
                                handleNestedChange(
                                  "spare_part_sources",
                                  index,
                                  "address_of_supplier",
                                  "address_country",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Postal Code</label>
                            <input
                              type="text"
                              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                              placeholder="e.g., 110001"
                              value={supplier.address_of_supplier.postal_code}
                              onChange={(e) =>
                                handleNestedChange(
                                  "spare_part_sources",
                                  index,
                                  "address_of_supplier",
                                  "postal_code",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2 md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700">Street Address</label>
                            <input
                              type="text"
                              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                              placeholder="123 Battery Street, New Delhi"
                              value={supplier.address_of_supplier.street_address}
                              onChange={(e) =>
                                handleNestedChange(
                                  "spare_part_sources",
                                  index,
                                  "address_of_supplier",
                                  "street_address",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-700">Components</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Part Name</label>
                            <input
                              type="text"
                              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                              placeholder="e.g., Battery Module A"
                              value={supplier.components.part_name}
                              onChange={(e) =>
                                handleNestedChange(
                                  "spare_part_sources",
                                  index,
                                  "components",
                                  "part_name",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Part Number</label>
                            <input
                              type="text"
                              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                              placeholder="e.g., MOD-A-001"
                              value={supplier.components.part_number}
                              onChange={(e) =>
                                handleNestedChange(
                                  "spare_part_sources",
                                  index,
                                  "components",
                                  "part_number",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {formData.spare_part_sources.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No suppliers added yet. Click "Add Supplier" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Recycled Content */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Recycled Content</h2>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("recycled_content", {
                      pre_consumer_share: 0,
                      recycled_material: "",
                      post_consumer_share: 0,
                    })
                  }
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Material
                </button>
              </div>
              <div className="p-6 space-y-4">
                {formData.recycled_content.map((content, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-slate-900">Recycled Material {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("recycled_content", index)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-red-500 text-slate-50 hover:bg-red-500/90 h-8 w-8"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Recycled Material</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          value={content.recycled_material}
                          onChange={(e) =>
                            handleArrayChange("recycled_content", index, "recycled_material", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Material</option>
                          {recycledMaterials.map((material) => (
                            <option key={material} value={material}>
                              {material}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Pre-Consumer Share (%)</label>
                        <input
                          
                          min="0"
                          max="100"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          placeholder="e.g., 12.5"
                          value={content.pre_consumer_share}
                          onChange={(e) =>
                            handleArrayChange(
                              "recycled_content",
                              index,
                              "pre_consumer_share",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Post-Consumer Share (%)</label>
                        <input
                          min="0"
                          max="100"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          placeholder="e.g., 18.3"
                          value={content.post_consumer_share}
                          onChange={(e) =>
                            handleArrayChange(
                              "recycled_content",
                              index,
                              "post_consumer_share",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.recycled_content.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No recycled materials added yet. Click "Add Material" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Safety Measures */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Safety Measures</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Safety Instructions</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                    placeholder="Handle used batteries with care. Store in cool, dry place. Avoid physical damage. Use personal protective equipment when handling."
                    value={formData.safety_measures__safety_instructions}
                    onChange={(e) => handleChange("safety_measures__safety_instructions", e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">Extinguishing Agents</h3>
                    <button
                      type="button"
                      onClick={addExtinguishingAgent}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Agent
                    </button>
                  </div>
                  {formData.safety_measures__extinguishing_agent.map((agent, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={agent}
                        onChange={(e) => handleExtinguishingAgentChange(index, e.target.value)}
                        required
                      >
                        <option value="">Select Extinguishing Agent</option>
                        {extinguishingAgents.map((agentType) => (
                          <option key={agentType} value={agentType}>
                            {agentType}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeExtinguishingAgent(index)}
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
                  ))}
                </div>
              </div>
            </div>

            {/* End of Life Information */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">End of Life Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Waste Prevention</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                    placeholder="Extend battery life by avoiding overcharging and storing in moderate temperatures. Reuse or repurpose before recycling."
                    value={formData.end_of_life_information__waste_prevention}
                    onChange={(e) => handleChange("end_of_life_information__waste_prevention", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Separate Collection</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                    placeholder="Dispose of batteries at designated collection centers to support proper treatment and recycling."
                    value={formData.end_of_life_information__separate_collection}
                    onChange={(e) => handleChange("end_of_life_information__separate_collection", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Information on Collection</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                    placeholder="Used battery collection is available at all certified dealers. Take-back options and repurposing programs are listed on our website."
                    value={formData.end_of_life_information__information_on_collection}
                    onChange={(e) => handleChange("end_of_life_information__information_on_collection", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Renewable Content */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Renewable Content</h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Renewable Content (%)</label>
                  <input
                   
                    min="0"
                    max="100"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                    placeholder="e.g., 7.8"
                    value={formData.renewable_content}
                    onChange={(e) => handleChange("renewable_content", e.target.value )}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-800 h-11 px-8 w-full shadow-sm"
            >
              Submit Circularity Information (Step 4)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
