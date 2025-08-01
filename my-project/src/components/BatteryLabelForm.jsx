
import { useState } from "react"
import { useEffect } from "react"
import { pinata } from "../utils/config"
import toast from "react-hot-toast"

const labelingSubjects = [
  "Separate Collection",
  "Cadmium Symbol",
  "Lead Symbol",
  "Mercury Symbol",
  "Carbon Footprint Performance Class",
  "Extinguishing Agent",
  "Material Composition",
  "Recycling Information",
  "Safety Warning",
  "Other",
]

export default function LabelsForm({ updateData, data = {} }) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
  const [formData, setFormData] = useState({
    declaration_of_conformity: data?.declaration_of_conformity || "",
    result_of_test_report: data?.result_of_test_report || "",
    labels: data?.labels || [],
  })

  const [uploadingDeclaration, setUploadingDeclaration] = useState(false)
  const [uploadingTestReport, setUploadingTestReport] = useState(false)

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

  const handleDeclarationUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingDeclaration(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setFormData((prev) => ({ ...prev, declaration_of_conformity: url }))
        toast.success("Declaration of Conformity uploaded successfully!")
      }
    } catch (err) {
      toast.error("Failed to upload Declaration of Conformity to Pinata")
    } finally {
      setUploadingDeclaration(false)
    }
  }

  const handleTestReportUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingTestReport(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setFormData((prev) => ({ ...prev, result_of_test_report: url }))
        toast.success("Test Report uploaded successfully!")
      }
    } catch (err) {
      toast.error("Failed to upload Test Report to Pinata")
    } finally {
      setUploadingTestReport(false)
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
          <h1 className="text-2xl font-bold text-slate-900">Labels Information Form</h1>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Declaration Documents */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Declaration Documents</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="declarationOfConformity" className="block text-sm font-medium text-slate-700">
                    Declaration of Conformity Document
                  </label>
                                      <input
                      type="file"
                      id="declarationOfConformity"
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={handleDeclarationUpload}
                      disabled={uploadingDeclaration}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-colors"
                    />
                  {uploadingDeclaration && <span className="text-blue-600 text-xs">Uploading...</span>}
                  {formData.declaration_of_conformity && (
                    <div className="mt-2">
                      <span className="block text-xs text-green-600 font-medium mb-1">
                        ✓ Declaration uploaded successfully!
                      </span>
                      <a 
                        href={formData.declaration_of_conformity} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        View Document: {formData.declaration_of_conformity}
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="resultOfTestReport" className="block text-sm font-medium text-slate-700">
                    Result of Test Report Document
                  </label>
                                      <input
                      type="file"
                      id="resultOfTestReport"
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={handleTestReportUpload}
                      disabled={uploadingTestReport}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-colors"
                    />
                  {uploadingTestReport && <span className="text-blue-600 text-xs">Uploading...</span>}
                  {formData.result_of_test_report && (
                    <div className="mt-2">
                      <span className="block text-xs text-green-600 font-medium mb-1">
                        ✓ Test Report uploaded successfully!
                      </span>
                      <a 
                        href={formData.result_of_test_report} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        View Document: {formData.result_of_test_report}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Labels</h2>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("labels", {
                      labeling_symbol: "",
                      labeling_meaning: "",
                      labeling_subject: "",
                    })
                  }
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-3"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Label
                </button>
              </div>
              <div className="p-6 space-y-6">
                {formData.labels.map((label, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-slate-900">Label {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("labels", index)}
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
                          <label className="block text-sm font-medium text-slate-700">Labeling Subject</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                            value={label.labeling_subject}
                            onChange={(e) => handleArrayChange("labels", index, "labeling_subject", e.target.value)}
                            required
                          >
                            <option value="">Select Labeling Subject</option>
                            {labelingSubjects.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Labeling Symbol</label>
                          <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                            placeholder="e.g., ♻️, Cd, Pb, 🌱 CO₂-B"
                            value={label.labeling_symbol}
                            onChange={(e) => handleArrayChange("labels", index, "labeling_symbol", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Labeling Meaning</label>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          placeholder="e.g., Indicates the product must be collected separately for recycling (WEEE label)."
                          value={label.labeling_meaning}
                          onChange={(e) => handleArrayChange("labels", index, "labeling_meaning", e.target.value)}
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.labels.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No labels added yet. Click "Add Label" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-800 h-11 px-8 w-full shadow-sm"
            >
              Submit Labels Information (Step 5)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
