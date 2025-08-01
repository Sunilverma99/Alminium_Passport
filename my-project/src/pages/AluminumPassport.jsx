import { useState } from "react"
import AluminumPassportComponent from "../components/AluminumPassportComponent.jsx"

export default function AluminumPassport() {
  const [tokenId, setTokenId] = useState("AL-001")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">




        {/* Aluminum Passport Component */}
        <AluminumPassportComponent tokenId={tokenId} />
      </div>
    </div>
  )
} 