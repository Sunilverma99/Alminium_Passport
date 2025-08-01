import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Shield, 
  Search, 
  Filter, 
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Lock,
  Unlock,
  Verified,
  Download,
  Upload
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import SupplierUpdateForm from '../../components/Supplier/SupplierUpdateForm';

const SupplierDueDiligence = () => {
  const { userAddress } = useSelector((state) => state.contract);
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [filters, setFilters] = useState({
    diligenceStatus: 'all',
    search: '',
    verificationStatus: 'all'
  });

  useEffect(() => {
    if (userAddress) {
      fetchBatteries();
    }
  }, [userAddress]);

  const fetchBatteries = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/supplier/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setBatteries(data.batteries || []);
      }
    } catch (error) {
      console.error('Error fetching batteries:', error);
      toast.error('Failed to load batteries');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (battery) => {
    setSelectedBattery(battery);
    setShowUpdateModal(true);
  };

  const getDiligenceStatus = (battery) => {
    if (battery.dueDiligenceHash && battery.isVerified) {
      return { status: 'verified', label: 'Verified', color: 'green', icon: Verified };
    } else if (battery.dueDiligenceHash) {
      return { status: 'submitted', label: 'Submitted', color: 'blue', icon: Upload };
    } else {
      return { status: 'pending', label: 'Pending', color: 'yellow', icon: Clock };
    }
  };

  const getVerificationStatus = (battery) => {
    if (battery.isVerified) {
      return { status: 'verified', label: 'Verified', color: 'green', icon: CheckCircle };
    } else if (battery.dueDiligenceHash) {
      return { status: 'pending_verification', label: 'Pending Verification', color: 'yellow', icon: Clock };
    } else {
      return { status: 'not_submitted', label: 'Not Submitted', color: 'red', icon: AlertCircle };
    }
  };

  const filteredBatteries = batteries.filter(battery => {
    const matchesSearch = battery.batteryId.toLowerCase().includes(filters.search.toLowerCase());
    const diligenceStatus = getDiligenceStatus(battery);
    const matchesDiligence = filters.diligenceStatus === 'all' || diligenceStatus.status === filters.diligenceStatus;
    const verificationStatus = getVerificationStatus(battery);
    const matchesVerification = filters.verificationStatus === 'all' || verificationStatus.status === filters.verificationStatus;
    
    return matchesSearch && matchesDiligence && matchesVerification;
  });

  const handleExportDiligence = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Battery ID,Due Diligence Status,Verification Status,Hash,Last Update\n"
      + batteries.map(b => {
          const diligence = getDiligenceStatus(b);
          const verification = getVerificationStatus(b);
          return `${b.batteryId},${diligence.label},${verification.label},${b.dueDiligenceHash || 'N/A'},${b.lastSupplierUpdate || 'Never'}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "due_diligence_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Due Diligence Management</h1>
            <p className="text-gray-600">Manage due diligence data and verification processes</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportDiligence}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
            <button
              onClick={fetchBatteries}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search batteries..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.diligenceStatus}
            onChange={(e) => setFilters({...filters, diligenceStatus: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Diligence Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
          </select>
          <select
            value={filters.verificationStatus}
            onChange={(e) => setFilters({...filters, verificationStatus: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Verification Status</option>
            <option value="not_submitted">Not Submitted</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Batteries</p>
              <p className="text-2xl font-bold text-gray-900">{batteries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Diligence</p>
              <p className="text-2xl font-bold text-gray-900">
                {batteries.filter(b => !b.dueDiligenceHash).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Verified className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {batteries.filter(b => b.isVerified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {batteries.filter(b => b.dueDiligenceHash && !b.isVerified).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batteries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diligence Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Diligence Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatteries.map((battery) => {
                const diligenceStatus = getDiligenceStatus(battery);
                const verificationStatus = getVerificationStatus(battery);
                const DiligenceIcon = diligenceStatus.icon;
                const VerificationIcon = verificationStatus.icon;
                
                return (
                  <tr key={battery.batteryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{battery.batteryId}</div>
                      <div className="text-sm text-gray-500">ID: {battery._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${diligenceStatus.color}-100 text-${diligenceStatus.color}-800`}>
                        <DiligenceIcon className="w-4 h-4 mr-1" />
                        {diligenceStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${verificationStatus.color}-100 text-${verificationStatus.color}-800`}>
                        <VerificationIcon className="w-4 h-4 mr-1" />
                        {verificationStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {battery.dueDiligenceHash ? (
                          <div className="flex items-center">
                            <Lock className="w-4 h-4 text-green-500 mr-2" />
                            <span className="font-mono text-xs">
                              {battery.dueDiligenceHash.substring(0, 10)}...
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Unlock className="w-4 h-4 text-red-500 mr-2" />
                            <span>No hash provided</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {battery.lastSupplierUpdate 
                        ? new Date(battery.lastSupplierUpdate).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openUpdateModal(battery)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Update
                        </button>
                        <button className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBatteries.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No batteries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Due Diligence Guidelines */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Due Diligence Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Material sourcing documentation</li>
              <li>• Supply chain verification</li>
              <li>• Environmental compliance certificates</li>
              <li>• Labor and safety standards verification</li>
              <li>• Conflict mineral declarations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Verification Process</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Submit due diligence hash</li>
              <li>• Government verification review</li>
              <li>• Blockchain recording</li>
              <li>• Status update notification</li>
              <li>• Compliance certification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedBattery && (
        <SupplierUpdateForm
          battery={selectedBattery}
          onUpdate={() => {
            setShowUpdateModal(false);
            setSelectedBattery(null);
            fetchBatteries();
          }}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedBattery(null);
          }}
        />
      )}
    </div>
  );
};

export default SupplierDueDiligence; 