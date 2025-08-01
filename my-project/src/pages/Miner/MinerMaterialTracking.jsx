import React, { useState, useEffect } from 'react';
import { initializeContractInstance } from '../../contractInstance.js';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaFileAlt, 
  FaSearch, 
  FaSpinner,
  FaInfoCircle,
  FaCubes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaTruck,
  FaIndustry,
  FaRecycle,
  FaShieldAlt,
  FaCalendarAlt
} from 'react-icons/fa';

export default function MinerMaterialTracking() {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    initializeAccount();
  }, []);

  useEffect(() => {
    if (account) {
      loadMaterialData();
    }
  }, [account]);

  const initializeAccount = async () => {
    try {
      const { account } = await initializeContractInstance();
      setAccount(account);
    } catch (error) {
      console.error('Failed to initialize account:', error);
    }
  };

  const loadMaterialData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real implementation, fetch from contract/backend
      const mockMaterials = [
        {
          id: 'MAT-001',
          name: 'Lithium Carbonate',
          type: 'Lithium',
          source: 'Greenbushes, Australia',
          extractionDate: '2024-01-10',
          quantity: '5000 kg',
          purity: '99.5%',
          status: 'in_transit',
          currentLocation: 'Port of Fremantle',
          destination: 'Battery Factory A',
          estimatedArrival: '2024-01-20',
          batteryTokens: ['123', '124', '125'],
          certification: 'ISO 14001',
          environmentalScore: 88,
          trackingHistory: [
            {
              timestamp: '2024-01-10 08:00',
              location: 'Greenbushes Mine',
              action: 'Extraction Complete',
              status: 'completed'
            },
            {
              timestamp: '2024-01-12 14:30',
              location: 'Processing Plant',
              action: 'Purification Complete',
              status: 'completed'
            },
            {
              timestamp: '2024-01-15 09:15',
              location: 'Port of Fremantle',
              action: 'Loaded for Shipment',
              status: 'in_progress'
            }
          ]
        },
        {
          id: 'MAT-002',
          name: 'Cobalt Sulfate',
          type: 'Cobalt',
          source: 'Katanga, DRC',
          extractionDate: '2024-01-08',
          quantity: '2500 kg',
          purity: '99.2%',
          status: 'delivered',
          currentLocation: 'Battery Factory B',
          destination: 'Battery Factory B',
          estimatedArrival: '2024-01-18',
          batteryTokens: ['126', '127'],
          certification: 'Responsible Mining',
          environmentalScore: 92,
          trackingHistory: [
            {
              timestamp: '2024-01-08 06:00',
              location: 'Katanga Mine',
              action: 'Extraction Complete',
              status: 'completed'
            },
            {
              timestamp: '2024-01-10 16:45',
              location: 'Local Processing',
              action: 'Initial Processing',
              status: 'completed'
            },
            {
              timestamp: '2024-01-12 11:20',
              location: 'International Port',
              action: 'Export Documentation',
              status: 'completed'
            },
            {
              timestamp: '2024-01-18 13:00',
              location: 'Battery Factory B',
              action: 'Delivered',
              status: 'completed'
            }
          ]
        },
        {
          id: 'MAT-003',
          name: 'Nickel Sulfate',
          type: 'Nickel',
          source: 'Sulawesi, Indonesia',
          extractionDate: '2024-01-05',
          quantity: '8000 kg',
          purity: '99.8%',
          status: 'processing',
          currentLocation: 'Refinery Plant',
          destination: 'Battery Factory C',
          estimatedArrival: '2024-01-25',
          batteryTokens: ['128', '129', '130'],
          certification: 'ISO 9001',
          environmentalScore: 85,
          trackingHistory: [
            {
              timestamp: '2024-01-05 07:30',
              location: 'Sulawesi Mine',
              action: 'Extraction Complete',
              status: 'completed'
            },
            {
              timestamp: '2024-01-08 15:20',
              location: 'Refinery Plant',
              action: 'Refining Process',
              status: 'in_progress'
            }
          ]
        }
      ];

      setMaterials(mockMaterials);
      toast.success('Material tracking data loaded successfully');

    } catch (error) {
      console.error('Error loading material data:', error);
      toast.error('Failed to load material data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadMaterialData();
      return;
    }

    const filtered = materials.filter(material =>
      material.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setMaterials(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      extraction: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      extraction: FaIndustry,
      processing: FaIndustry,
      in_transit: FaTruck,
      delivered: FaCheckCircle,
      completed: FaCheckCircle,
      in_progress: FaSpinner
    };
    return icons[status] || FaInfoCircle;
  };

  const getMaterialTypeColor = (type) => {
    const colors = {
      Lithium: 'bg-blue-100 text-blue-800',
      Cobalt: 'bg-purple-100 text-purple-800',
      Nickel: 'bg-green-100 text-green-800',
      Manganese: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
      material.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaFileAlt className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Material Tracking</h1>
          </div>
          <p className="text-gray-600">
            Track materials from extraction to battery integration. Monitor supply chain transparency and environmental compliance.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Materials
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by ID, name, or source"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                </button>
              </div>
            </div>

            {/* Material Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Lithium">Lithium</option>
                <option value="Cobalt">Cobalt</option>
                <option value="Nickel">Nickel</option>
                <option value="Manganese">Manganese</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="extraction">Extraction</option>
                <option value="processing">Processing</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading material tracking data...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No materials found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMaterials.map((material) => {
              const StatusIcon = getStatusIcon(material.status);
              return (
                <div key={material.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{material.name}</h3>
                      <p className="text-sm text-gray-500">ID: {material.id}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMaterialTypeColor(material.type)}`}>
                      {material.type}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <StatusIcon className="text-blue-600" />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(material.status)}`}>
                      {material.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Quantity</label>
                      <p className="text-sm font-semibold text-gray-900">{material.quantity}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Purity</label>
                      <p className="text-sm font-semibold text-gray-900">{material.purity}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Source</label>
                      <p className="text-sm text-gray-900">{material.source}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Environmental Score</label>
                      <p className="text-sm font-semibold text-gray-900">{material.environmentalScore}/100</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Current Location</span>
                    </div>
                    <p className="text-sm text-gray-900">{material.currentLocation}</p>
                  </div>

                  {/* Battery Tokens */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Battery Tokens</label>
                    <div className="flex flex-wrap gap-1">
                      {material.batteryTokens.map((token) => (
                        <span key={token} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          #{token}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedMaterial(material)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSearch />
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Material Details Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Material Details - {selectedMaterial.name}
                  </h2>
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Material Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Material ID</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Type</label>
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getMaterialTypeColor(selectedMaterial.type)}`}>
                          {selectedMaterial.type}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Quantity</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.quantity}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Purity</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.purity}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Status</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Source</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.source}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Current Location</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.currentLocation}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Destination</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.destination}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Estimated Arrival</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedMaterial.estimatedArrival}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environmental & Certification */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental & Certification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Environmental Score</label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">{selectedMaterial.environmentalScore}/100</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${selectedMaterial.environmentalScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Certification</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedMaterial.certification}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
                  <div className="space-y-3">
                    {selectedMaterial.trackingHistory.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <FaCalendarAlt className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{event.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                          <p className="text-xs text-gray-500">{event.timestamp}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 