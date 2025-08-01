import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import BatteryPassPortComponent from '../components/BatteryPassportComponent1.jsx'
import { Clock } from 'lucide-react'

function GetPassportStandalone() {
  const { tokenId } = useParams()
  const [error, setError] = useState('')

  // Handle pending passport creation
  if (tokenId === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Passport Creation in Progress</h1>
            <p className="mt-2 text-gray-600">
              This battery passport is currently being created on the blockchain. Please wait a moment and try again.
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If tokenId is valid, render the passport component
  if (tokenId && tokenId.trim()) {
    return <BatteryPassPortComponent tokenId={tokenId.trim()} />
  }

  // If no tokenId provided, show error
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Invalid Token ID</h1>
          <p className="mt-2 text-gray-600">
            Please provide a valid Token ID in the URL.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GetPassportStandalone 