
import { useState } from "react"
import { useEffect } from "react"
import { pinata } from "../utils/config"
import toast from "react-hot-toast"

export default function SupplyChainDueDiligenceForm({ updateData, data = {} }) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
  const [formData, setFormData] = useState({
    supply_chain_due_diligence_report: data?.supply_chain_due_diligence_report || "",
    third_party_aussurances: data?.third_party_aussurances || "",
    supply_chain_indicies: data?.supply_chain_indicies || 0,
  })

  const [uploadingReport, setUploadingReport] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleReportUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingReport(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setFormData((prev) => ({ ...prev, supply_chain_due_diligence_report: url }))
        toast.success("Due Diligence Report uploaded successfully!")
      }
    } catch (err) {
      toast.error("Failed to upload Due Diligence Report to Pinata")
    } finally {
      setUploadingReport(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitted Data:", formData)
    updateData(formData)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Supply Chain Due Diligence</h1>
          <p className="text-sm text-slate-600 mt-1">
            Information on responsible sourcing and supply chain transparency
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supply Chain Due Diligence Report */}
            <div className="space-y-2">
              <label htmlFor="supplyChainReport" className="block text-sm font-medium text-slate-700">
                Supply Chain Due Diligence Report
              </label>
              {uploadingReport && <span className="text-blue-600 text-xs">Uploading...</span>}
              <input
                type="file"
                id="supplyChainReport"
                accept=".pdf,image/*,.doc,.docx"
                onChange={handleReportUpload}
                disabled={uploadingReport}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-colors"
              />
              {formData.supply_chain_due_diligence_report && (
                <div className="mt-2">
                  <span className="block text-xs text-green-600 font-medium mb-1">
                    ✓ Report uploaded successfully!
                  </span>
                  <a 
                    href={formData.supply_chain_due_diligence_report} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    View Document: {formData.supply_chain_due_diligence_report}
                  </a>
                </div>
              )}
              <p className="text-sm text-slate-500">
                Upload the comprehensive due diligence report documenting responsible sourcing practices and supply
                chain transparency measures.
              </p>
            </div>

            {/* Third Party Assurances */}
            <div className="space-y-2">
              <label htmlFor="thirdPartyAssurances" className="block text-sm font-medium text-slate-700">
                Third Party Assurances
              </label>
              <textarea
                id="thirdPartyAssurances"
                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                placeholder="Certified by RMI (Responsible Minerals Initiative), IRMA (Initiative for Responsible Mining Assurance)"
                value={formData.third_party_aussurances}
                onChange={(e) => handleChange("third_party_aussurances", e.target.value)}
                rows={4}
                required
              />
              <p className="text-sm text-slate-500">
                List of third-party certifications, audits, and assurances that validate responsible sourcing practices.
                Include certification bodies, standards, and verification details.
              </p>
            </div>

            {/* Supply Chain Indices */}
            <div className="space-y-2">
              <label htmlFor="supplyChainIndices" className="block text-sm font-medium text-slate-700">
                Supply Chain Indices Score
              </label>
              <div className="relative">
                <input
                  id="supplyChainIndices"
                  min="0"
                  max="10"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  placeholder="8.7"
                  value={formData.supply_chain_indicies}
                  onChange={(e) => handleChange("supply_chain_indicies", e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-slate-500 text-sm">/ 10</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Composite score (0-10) reflecting supply chain transparency, traceability, and responsible sourcing
                practices.
              </p>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-800 h-11 px-8 shadow-sm"
            >
              Submit Supply Chain Due Diligence Data
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
