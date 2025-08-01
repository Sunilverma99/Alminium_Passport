import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import BatteryPassPortComponent from '../components/BatteryPassportComponent1.jsx'
import { Battery, AlertCircle, Clock } from 'lucide-react'

function GetBatteryById() {
  const { id } = useParams()
  const [tokenId, setTokenId] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Handle URL parameter
  useEffect(() => {
    if (id && id !== 'xyz') {
      setTokenId(id)
      setSubmitted(true)
    }
  }, [id])

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!tokenId.trim()) {
      setError('Please enter a Token ID')
      setSubmitted(false)
    } else {
      setError('')
      setSubmitted(true)
    }
  }

  // Handle pending passport creation
  if (submitted && tokenId === 'pending') {
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

  // Once submitted and tokenId is valid, render the passport component
  if (submitted && tokenId.trim()) {
    return <BatteryPassPortComponent tokenId={tokenId.trim()} />
  }

  // Otherwise, show the input form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg mb-4">
            <Battery className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Battery Passport</h1>
          <p className="mt-2 text-gray-600">
            View detailed information about your battery&apos;s specifications and history
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 max-w-xl mx-auto space-y-6">
          <div>
            <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
              Token ID
            </label>
            <input
              id="tokenId"
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter Token ID (e.g., 123456)"
              className={`w-full mt-1 px-4 py-3 border-2 rounded-lg bg-gray-50 focus:bg-white transition-all duration-200
                ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'}`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            <Battery className="w-5 h-5 mr-2" />
            <span>View Battery Passport</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default GetBatteryById
