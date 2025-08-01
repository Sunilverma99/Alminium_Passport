import React, { useState } from 'react';
import { useEffect } from 'react';
import { pinata } from "../utils/config"
import toast from "react-hot-toast"

const LifecycleStageEnum = [
  "RawMaterialExtraction",
  "MainProduction",
  "Distribution",
  "Recycling"
];

export default function BatteryCarbonFootprintForm({updateData,data}) {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })  // Or just: window.scrollTo(0, 0)
}, [])
  const [batteryCarbonFootprint, setBatteryCarbonFootprint] = useState(data?.batteryCarbonFootprint || 0);
  const [carbonFootprintPerLifecycleStage, setCarbonFootprintPerLifecycleStage] = useState(data?.carbonFootprintPerLifecycleStage || []);
  const [carbonFootprintPerformanceClass, setCarbonFootprintPerformanceClass] = useState(data?.carbonFootprintPerformanceClass || '');
  const [carbonFootprintStudy, setCarbonFootprintStudy] = useState(data?.carbonFootprintStudy || '');
  const [uploadingStudy, setUploadingStudy] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      batteryCarbonFootprint,
      carbonFootprintPerLifecycleStage,
      carbonFootprintPerformanceClass,
      carbonFootprintStudy
    };
    console.log('Form data:', formData);
    updateData(formData);
  };

  const addLifecycleStage = () => {
    setCarbonFootprintPerLifecycleStage([
      ...carbonFootprintPerLifecycleStage,
      { lifecycleStage: '', carbonFootprint: 0 }
    ]);
  };

  const updateLifecycleStage = (index, field, value) => {
    const updatedStages = [...carbonFootprintPerLifecycleStage];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setCarbonFootprintPerLifecycleStage(updatedStages);
  };

  const handleStudyUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingStudy(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setCarbonFootprintStudy(url)
        toast.success("Carbon Footprint Study uploaded successfully!")
      }
    } catch (err) {
      toast.error("Failed to upload Carbon Footprint Study to Pinata")
    } finally {
      setUploadingStudy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Battery Carbon Footprint Form</h2>

      <div className="mb-4">
        <label htmlFor="batteryCarbonFootprint" className="block text-sm font-medium text-gray-700 mb-1">
          Battery Carbon Footprint (kg CO2 eq/kWh)
        </label>
        <input
        
          id="batteryCarbonFootprint"
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
          value={batteryCarbonFootprint}
          onChange={(e) => setBatteryCarbonFootprint(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Carbon Footprint Per Lifecycle Stage</h3>
        {carbonFootprintPerLifecycleStage.map((stage, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Stage</label>
                <select
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  value={stage.lifecycleStage}
                  onChange={(e) => updateLifecycleStage(index, 'lifecycleStage', e.target.value)}
                  required
                >
                  <option value="">Select a stage</option>
                  {LifecycleStageEnum.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbon Footprint</label>
                <input
                  type="String"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  value={stage.carbonFootprint}
                  onChange={(e) => updateLifecycleStage(index, 'carbonFootprint', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addLifecycleStage}
          className="mt-2 px-4 py-2 text-white bg-gray-800  rounded  focus:outline-none  focus:ring-opacity-50"
        >
          Add Lifecycle Stage
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="carbonFootprintPerformanceClass" className="block text-sm font-medium text-gray-700 mb-1">
          Carbon Footprint Performance Class
        </label>
        <input
          type="text"
          id="carbonFootprintPerformanceClass"
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
          value={carbonFootprintPerformanceClass}
          onChange={(e) => setCarbonFootprintPerformanceClass(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="carbonFootprintStudy" className="block text-sm font-medium text-gray-700 mb-1">
          Carbon Footprint Study Document
        </label>
        {uploadingStudy && <span className="text-blue-600 text-xs">Uploading...</span>}
        <input
          type="file"
          id="carbonFootprintStudy"
          accept=".pdf,image/*,.doc,.docx"
          onChange={handleStudyUpload}
          disabled={uploadingStudy}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-colors"
        />
        {carbonFootprintStudy && (
          <div className="mt-2">
            <span className="block text-xs text-green-600 font-medium mb-1">
              ✓ Carbon study uploaded successfully!
            </span>
            <a 
              href={carbonFootprintStudy} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-xs text-blue-600 hover:text-blue-800 underline break-all"
            >
              View Document: {carbonFootprintStudy}
            </a>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:bg-slate-800 transition-colors shadow-sm"
      >
        Submit Battery Carbon Footprint Data 
      </button>
    </form>
  );
}

