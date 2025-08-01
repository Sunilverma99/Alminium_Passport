import { useState } from "react"
import PassportQRCode from "./PassportQRCode.jsx"
import { useEffect } from "react"
import { apiFetch } from "../utils/api.js"

export default function BatteryPassportForm({ updateData, data = {} }) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
  const [formData, setFormData] = useState({
    uniqueIdentifier: data?.uniqueIdentifier || "",
    batchId: data?.batchId || "",
    qrCodeUrl: data?.qrCodeUrl || "",
  })

  const generateUniqueIdentifier = () => {
    const prefix = "UNIQUE_:"
    const uniquePart =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    return `${prefix}${uniquePart}`
  }

  const generateBatchId = () => {
    const timestamp = Date.now()
    const randomNumber = Math.floor(Math.random() * 1000)
    return Number.parseInt(`${timestamp}${randomNumber}`)
  }

  // Function to generate QR code URL with token ID
  // This function is used after passport creation to generate the final QR code URL
  const generateQRCodeUrl = (tokenId) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
    return `${frontendUrl}/battery-passport/${tokenId}`
  }

  // Function to get the next predicted token ID from the API
  const getNextTokenId = async () => {
    try {
      const response = await apiFetch('/api/manufacturer-battery/last-token-id')
      if (response.ok) {
        const data = await response.json()
        return data.nextTokenId
      } else {
        console.error('Failed to get next token ID')
        return null
      }
    } catch (error) {
      console.error('Error getting next token ID:', error)
      return null
    }
  }

  const handleGenerateUniqueIdentifier = async () => {
    const uniqueIdentifier = generateUniqueIdentifier()
    const batchId = generateBatchId()
    
    // Get the predicted next token ID from the API
    const nextTokenId = await getNextTokenId()
    
    if (nextTokenId) {
      // Generate QR code URL with the predicted token ID
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
      const qrCodeUrl = `${frontendUrl}/battery-passport/${nextTokenId}`
      
      setFormData({
        uniqueIdentifier,
        batchId,
        qrCodeUrl,
      })
    } else {
      // Fallback to pending URL if API call fails
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
      const qrCodeUrl = `${frontendUrl}/battery-passport/pending`
      
      setFormData({
        uniqueIdentifier,
        batchId,
        qrCodeUrl,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateData(formData)  // You can modify this to send anywhere
    console.log("Submitted Data:", formData)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Battery Passport Form</h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate unique identifiers and QR codes for battery passport tracking
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Generator Button */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-center space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Generate Passport Identifiers</h2>
              <button
                type="button"
                onClick={handleGenerateUniqueIdentifier}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-11 px-8"
              >
                Generate All Identifiers
              </button>
            </div>

            {/* Unique Identifier */}
            {formData.uniqueIdentifier && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Unique Identifier
                </label>
                <input
                  type="text"
                  value={formData.uniqueIdentifier}
                  readOnly
                  className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
            )}

            {/* Batch ID */}
            {formData.batchId && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Batch ID</label>
                <input
                  type="text"
                  value={formData.batchId}
                  readOnly
                  className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
            )}

            {/* Passport URL */}
            {formData.qrCodeUrl && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Passport URL</label>
                <input
                  type="text"
                  value={formData.qrCodeUrl}
                  readOnly
                  className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
            )}

            {/* QR Code */}
            {formData.qrCodeUrl && (
              <div className="mt-6 text-center">
                <PassportQRCode url={formData.qrCodeUrl} />
              </div>
            )}

            <button
              type="submit"
              disabled={!formData.uniqueIdentifier}
              className="w-full mt-6 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-11 px-8"
            >
              Submit Battery Passport (Step 8)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
