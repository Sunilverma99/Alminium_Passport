import React, { useState, useEffect } from 'react';
import { initializeContractInstance } from '../../contractInstance.js';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaInfoCircle, 
  FaDownload, 
  FaSpinner,
  FaChartBar,
  FaCubes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaIndustry,
  FaRecycle,
  FaShieldAlt,
  FaFileAlt,
  FaPrint
} from 'react-icons/fa';

export default function MinerMiningReports() {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    initializeAccount();
  }, []);

  useEffect(() => {
    if (account) {
      loadReports();
    }
  }, [account, reportType, dateRange]);

  const initializeAccount = async () => {
    try {
      const { account } = await initializeContractInstance();
      setAccount(account);
    } catch (error) {
      console.error('Failed to initialize account:', error);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real implementation, fetch from contract/backend
      const mockReports = [
        {
          id: 'RPT-001',
          title: 'Monthly Mining Operations Report',
          type: 'operations',
          date: '2024-01-15',
          status: 'completed',
          summary: {
            totalOperations: 12,
            completedOperations: 10,
            activeOperations: 2,
            totalMaterialExtracted: '15,500 kg',
            environmentalCompliance: 92,
            safetyIncidents: 0,
            efficiency: 88
          },
          details: {
            materials: [
              { name: 'Lithium Carbonate', quantity: '5000 kg', efficiency: 95 },
              { name: 'Cobalt Sulfate', quantity: '2500 kg', efficiency: 87 },
              { name: 'Nickel Sulfate', quantity: '8000 kg', efficiency: 91 }
            ],
            locations: [
              { name: 'Greenbushes, Australia', operations: 4, material: 'Lithium' },
              { name: 'Katanga, DRC', operations: 3, material: 'Cobalt' },
              { name: 'Sulawesi, Indonesia', operations: 5, material: 'Nickel' }
            ],
            environmentalMetrics: {
              carbonFootprint: '-15%',
              waterUsage: '-8%',
              wasteReduction: '+12%',
              renewableEnergy: '85%'
            }
          }
        },
        {
          id: 'RPT-002',
          title: 'Material Composition Update Report',
          type: 'material_updates',
          date: '2024-01-14',
          status: 'completed',
          summary: {
            totalUpdates: 25,
            successfulUpdates: 23,
            failedUpdates: 2,
            averageProcessingTime: '2.3 hours',
            dataAccuracy: 98.5,
            complianceRate: 100
          },
          details: {
            updates: [
              { tokenId: '123', material: 'Lithium', status: 'success', timestamp: '2024-01-14 10:30' },
              { tokenId: '124', material: 'Cobalt', status: 'success', timestamp: '2024-01-14 11:15' },
              { tokenId: '125', material: 'Nickel', status: 'success', timestamp: '2024-01-14 12:00' },
              { tokenId: '126', material: 'Lithium', status: 'failed', timestamp: '2024-01-14 13:45' },
              { tokenId: '127', material: 'Cobalt', status: 'success', timestamp: '2024-01-14 14:20' }
            ],
            materials: {
              lithium: 10,
              cobalt: 8,
              nickel: 7
            }
          }
        },
        {
          id: 'RPT-003',
          title: 'Environmental Compliance Report',
          type: 'environmental',
          date: '2024-01-13',
          status: 'completed',
          summary: {
            overallCompliance: 94,
            environmentalScore: 88,
            certifications: 5,
            violations: 0,
            improvementAreas: 2
          },
          details: {
            certifications: [
              { name: 'ISO 14001', status: 'valid', expiry: '2025-06-15' },
              { name: 'Responsible Mining', status: 'valid', expiry: '2024-12-31' },
              { name: 'Carbon Neutral', status: 'valid', expiry: '2024-08-20' }
            ],
            metrics: {
              carbonEmissions: '2.3 tons CO2e',
              waterConsumption: '15,000 liters',
              wasteGenerated: '500 kg',
              recyclingRate: '85%'
            },
            recommendations: [
              'Implement additional solar panels at Greenbushes site',
              'Upgrade water recycling system at Katanga facility',
              'Increase use of electric vehicles in transportation'
            ]
          }
        },
        {
          id: 'RPT-004',
          title: 'Supply Chain Transparency Report',
          type: 'supply_chain',
          date: '2024-01-12',
          status: 'completed',
          summary: {
            totalShipments: 18,
            onTimeDeliveries: 17,
            delayedDeliveries: 1,
            averageTransitTime: '5.2 days',
            traceabilityScore: 96,
            supplierCompliance: 98
          },
          details: {
            shipments: [
              { id: 'SHP-001', origin: 'Greenbushes', destination: 'Factory A', status: 'delivered', transitTime: '4 days' },
              { id: 'SHP-002', origin: 'Katanga', destination: 'Factory B', status: 'delivered', transitTime: '6 days' },
              { id: 'SHP-003', origin: 'Sulawesi', destination: 'Factory C', status: 'in_transit', transitTime: '3 days' }
            ],
            suppliers: [
              { name: 'Supplier A', compliance: 100, rating: 'A+' },
              { name: 'Supplier B', compliance: 95, rating: 'A' },
              { name: 'Supplier C', compliance: 98, rating: 'A+' }
            ]
          }
        }
      ];

      setReports(mockReports);
      toast.success('Reports loaded successfully');

    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeColor = (type) => {
    const colors = {
      operations: 'bg-blue-100 text-blue-800',
      material_updates: 'bg-green-100 text-green-800',
      environmental: 'bg-purple-100 text-purple-800',
      supply_chain: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      operations: FaIndustry,
      material_updates: FaCubes,
      environmental: FaRecycle,
      supply_chain: FaShieldAlt
    };
    return icons[type] || FaFileAlt;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDownloadReport = (report) => {
    // Mock download functionality
    toast.success(`Downloading ${report.title}...`);
    // In real implementation, generate and download PDF/CSV
  };

  const handlePrintReport = (report) => {
    // Mock print functionality
    toast.success(`Printing ${report.title}...`);
    // In real implementation, open print dialog
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesType = reportType === 'all' || report.type === reportType;
    return matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaInfoCircle className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mining Reports</h1>
          </div>
          <p className="text-gray-600">
            View detailed reports on mining operations, material updates, environmental compliance, and supply chain transparency.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Reports</option>
                <option value="operations">Operations</option>
                <option value="material_updates">Material Updates</option>
                <option value="environmental">Environmental</option>
                <option value="supply_chain">Supply Chain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadReports}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaChartBar />}
                Refresh Reports
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reports found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => {
              const ReportIcon = getReportTypeIcon(report.type);
              return (
                <div key={report.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <ReportIcon className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">ID: {report.id}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportTypeColor(report.type)}`}>
                      {report.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Date and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="text-sm text-gray-600">{report.date}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(report.summary).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span className="font-semibold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaInfoCircle />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      title="Download Report"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => handlePrintReport(report)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                      title="Print Report"
                    >
                      <FaPrint />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedReport.title}
                  </h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Report Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Report ID</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedReport.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedReport.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedReport.summary).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Information</h3>
                  
                  {/* Materials */}
                  {selectedReport.details.materials && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Materials</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedReport.details.materials.map((material, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.efficiency}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {selectedReport.details.locations && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Locations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedReport.details.locations.map((location, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900">{location.name}</h5>
                            <p className="text-sm text-gray-600">Operations: {location.operations}</p>
                            <p className="text-sm text-gray-600">Material: {location.material}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environmental Metrics */}
                  {selectedReport.details.environmentalMetrics && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Environmental Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedReport.details.environmentalMetrics).map(([key, value]) => (
                          <div key={key} className="bg-green-50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <p className="text-lg font-semibold text-green-900">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Updates */}
                  {selectedReport.details.updates && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Updates</h4>
                      <div className="space-y-2">
                        {selectedReport.details.updates.slice(0, 5).map((update, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900">Token #{update.tokenId}</span>
                              <span className="text-sm text-gray-600 ml-2">({update.material})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                update.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {update.status}
                              </span>
                              <span className="text-sm text-gray-500">{update.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedReport.details.certifications && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Certifications</h4>
                      <div className="space-y-2">
                        {selectedReport.details.certifications.map((cert, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-900">{cert.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                cert.status === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {cert.status}
                              </span>
                              <span className="text-sm text-gray-500">Expires: {cert.expiry}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedReport.details.recommendations && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {selectedReport.details.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                            <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                            <span className="text-sm text-gray-900">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaDownload />
                    Download
                  </button>
                  <button
                    onClick={() => handlePrintReport(selectedReport)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <FaPrint />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 