import React from 'react';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Building, 
  Globe, 
  Users,
  Award,
  Database,
  ExternalLink
} from 'lucide-react';

const DueDiligenceDataDisplay = ({ data, tokenId }) => {
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertCircle className="w-5 h-5" />
              <span>No due diligence data available</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderKeyValue = (label, value, type = "text", description = "") => {
    if (!value || value === "N/A" || value === "") return null;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="text-sm text-slate-900">
          {type === "url" && value !== "N/A" ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 underline"
            >
              {value}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : type === "boolean" ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
              {value ? 'Yes' : 'No'}
            </span>
          ) : (
            <span className="text-slate-900">{value}</span>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
    );
  };

  const renderSupplier = (supplier, index) => (
    <div key={index} className="border-2 border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building className="w-4 h-4 text-slate-600" />
        <h3 className="text-base font-medium text-slate-900">{supplier.name_of_supplier || 'Unnamed Supplier'}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderKeyValue("Address", supplier.address_of_supplier?.street_address)}
        {renderKeyValue("Country", supplier.address_of_supplier?.address_country)}
        {renderKeyValue("Email", supplier.email_address_of_supplier, "email")}
        {renderKeyValue("Website", supplier.supplier_web_address, "url")}
        {renderKeyValue("Contact Person", supplier.contact_person_name)}
        {renderKeyValue("Phone", supplier.phone_number_of_supplier)}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Due Diligence Report</h1>
          <p className="text-sm text-slate-600 mt-1">
            Comprehensive due diligence information for battery token ID: {tokenId}
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Supply Chain Due Diligence Report */}
            {renderKeyValue(
              "Supply Chain Due Diligence Report",
              data.supply_chain_due_diligence_report,
              "url",
              "URL to the comprehensive due diligence report documenting responsible sourcing practices and supply chain transparency measures."
            )}

            {/* Third Party Assurances */}
            {renderKeyValue(
              "Third Party Assurances",
              data.third_party_aussurances,
              "text",
              "List of third-party certifications, audits, and assurances that validate responsible sourcing practices. Include certification bodies, standards, and verification details."
            )}

            {/* Supply Chain Indices */}
            {data.supply_chain_indicies && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Supply Chain Indices Score</label>
                <div className="relative">
                  <div className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm items-center">
                    <span className="text-slate-900">{data.supply_chain_indicies}</span>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-slate-500 text-sm">/ 10</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Composite score (0-10) reflecting supply chain transparency, traceability, and responsible sourcing performance based on industry standards and assessment frameworks.
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Poor (0-3)</span>
                    <span>Fair (3-5)</span>
                    <span>Good (5-7)</span>
                    <span>Excellent (7-10)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        data.supply_chain_indicies >= 7
                          ? "bg-green-500"
                          : data.supply_chain_indicies >= 5
                            ? "bg-yellow-500"
                            : data.supply_chain_indicies >= 3
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min((data.supply_chain_indicies / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Due Diligence Information */}
            {renderKeyValue("Manufacturer Address", data.manufacturer_address)}
            {renderKeyValue("Operator Address", data.operator_address)}
            {renderKeyValue("Supply Chain Transparency", data.supply_chain_transparency, "boolean")}
            {renderKeyValue("Traceability System", data.traceability_system)}
            {renderKeyValue("Certification Standards", data.certification_standards)}
            {renderKeyValue("Conflict Minerals Declaration", data.conflict_minerals_declaration, "boolean")}
            {renderKeyValue("Recycled Content Percentage", data.recycled_content_percentage)}
            {renderKeyValue("Responsible Sourcing Policy", data.responsible_sourcing_policy, "boolean")}
            {renderKeyValue("Material Origin Tracking", data.material_origin_tracking)}
            {renderKeyValue("Supplier Code of Conduct", data.supplier_code_of_conduct, "boolean")}
            {renderKeyValue("Environmental Certifications", data.environmental_certifications)}
            {renderKeyValue("Carbon Footprint Assessment", data.carbon_footprint_assessment, "boolean")}
            {renderKeyValue("Waste Management Policy", data.waste_management_policy, "boolean")}
            {renderKeyValue("Energy Efficiency Standards", data.energy_efficiency_standards)}
            {renderKeyValue("Renewable Energy Usage", data.renewable_energy_usage)}
            {renderKeyValue("Labor Rights Compliance", data.labor_rights_compliance, "boolean")}
            {renderKeyValue("Safety Standards Certification", data.safety_standards_certification)}
            {renderKeyValue("Working Conditions Assessment", data.working_conditions_assessment, "boolean")}
            {renderKeyValue("Child Labor Policy", data.child_labor_policy, "boolean")}
            {renderKeyValue("Health and Safety Training", data.health_safety_training, "boolean")}
            {renderKeyValue("Last Updated", data.last_updated)}
            {renderKeyValue("Verification Date", data.verification_date)}
            {renderKeyValue("Next Review Date", data.next_review_date)}
            {renderKeyValue("Audit Trail", data.audit_trail)}
            {renderKeyValue("Notes", data.notes)}

            {/* Spare Part Suppliers */}
            {data.spare_part_suppliers && data.spare_part_suppliers.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Spare Part Suppliers</label>
                <p className="text-sm text-slate-500 mb-4">
                  {data.spare_part_suppliers.length} supplier(s) identified for spare parts
                </p>
                {data.spare_part_suppliers.map((supplier, index) => renderSupplier(supplier, index))}
              </div>
            )}

            {/* Supply Chain Due Diligence Requirements */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-2">Supply Chain Due Diligence Requirements</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Documentation of mineral sourcing and supply chain mapping</li>
                <li>• Third-party verification of responsible mining practices</li>
                <li>• Conflict minerals compliance (3TG: Tin, Tantalum, Tungsten, Gold)</li>
                <li>• Environmental and social impact assessments</li>
                <li>• Supplier code of conduct and monitoring programs</li>
                <li>• Transparency reporting and stakeholder engagement</li>
              </ul>
            </div>

            {/* Raw Data (Collapsible) */}
            <details className="w-full">
              <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900 border-t border-slate-200 pt-4">
                View Raw Data
              </summary>
              <div className="mt-4">
                <pre className="bg-slate-50 rounded-lg p-4 text-xs overflow-x-auto border border-slate-200">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DueDiligenceDataDisplay; 