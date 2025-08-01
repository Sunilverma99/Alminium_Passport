import React from 'react';

const MaterialCompositionDataDisplay = ({ data = {}, tokenId }) => {
  // Defensive: fallback to empty arrays if not present
  const batteryMaterials = data.battery_materials || [];
  const hazardousSubstances = data.hazardous_substances || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Battery Material Composition</h1>
          {tokenId && (
            <p className="text-sm text-slate-600 mt-1">
              Material composition for battery token ID: {tokenId}
            </p>
          )}
        </div>
        <div className="p-6 space-y-6">
          {/* Battery Chemistry */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Battery Chemistry</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Short Name</label>
                <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                  {data.battery_chemistry__short_name || <span className="text-slate-400">N/A</span>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Clear Name</label>
                <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                  {data.battery_chemistry__clear_name || <span className="text-slate-400">N/A</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Battery Materials */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Battery Materials</h2>
            </div>
            <div className="p-6 space-y-4">
              {batteryMaterials.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No battery materials found.
                </div>
              )}
              {batteryMaterials.map((material, index) => (
                <div key={index} className="rounded-lg border-2 border-slate-200 mb-4">
                  <div className="border-b border-slate-200 px-4 py-3 flex flex-row items-center justify-between">
                    <h3 className="text-base font-medium text-slate-900">Material {index + 1}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Component Name</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {material.battery_material_location?.component_name || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Component ID</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {material.battery_material_location?.component_id || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Material Identifier (CAS Number)</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {material.battery_material_identifier || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Material Name</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {material.battery_material_name || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Material Mass (kg)</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {material.battery_material_mass || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2 flex items-center pt-6">
                      <label className="block text-sm font-medium text-slate-700 mr-2">Critical Raw Material</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${material.is_critical_raw_material ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{material.is_critical_raw_material ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hazardous Substances */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Hazardous Substances</h2>
            </div>
            <div className="p-6 space-y-4">
              {hazardousSubstances.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hazardous substances found.
                </div>
              )}
              {hazardousSubstances.map((substance, index) => (
                <div key={index} className="rounded-lg border-2 border-slate-200 mb-4">
                  <div className="border-b border-slate-200 px-4 py-3 flex flex-row items-center justify-between">
                    <h3 className="text-base font-medium text-slate-900">Hazardous Substance {index + 1}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Substance Class</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_class || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Substance Name</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_name || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Concentration (%)</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_concentration || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Substance Identifier</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_identifier || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Impact</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_impact || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Component Name</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_location?.component_name || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Component ID</label>
                      <div className="flex h-10 items-center px-3 py-2 text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200">
                        {substance.hazardous_substance_location?.component_id || <span className="text-slate-400">N/A</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCompositionDataDisplay; 