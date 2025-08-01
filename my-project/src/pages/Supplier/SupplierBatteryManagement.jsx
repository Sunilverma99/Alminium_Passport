import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import SupplierUpdateForm from '../../components/Supplier/SupplierUpdateForm';

const SupplierBatteryManagement = () => {
  const { userAddress } = useSelector((state) => state.contract);
  const [batteries, setBatteries] = useState([]);
  const [supplierUpdates, setSupplierUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBatteries, setSelectedBatteries] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all'
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
        // Fetch supplier updates after batteries are loaded
        await fetchSupplierUpdates(data.batteries || []);
      }
    } catch (error) {
      console.error('Error fetching batteries:', error);
      toast.error('Failed to load batteries');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierUpdates = async (batteryList = batteries) => {
    try {
      // Fetch supplier updates for all batteries
      const updates = {};
      for (const battery of batteryList) {
        try {
          const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/supplier-battery-update/${battery.batteryId}`);
          if (response.ok) {
            const data = await response.json();
            updates[battery.batteryId] = data.updates || [];
          }
        } catch (error) {
          console.error(`Error fetching updates for battery ${battery.batteryId}:`, error);
        }
      }
      setSupplierUpdates(updates);
    } catch (error) {
      console.error('Error fetching supplier updates:', error);
    }
  };

  const handleBatterySelect = (batteryId) => {
    setSelectedBatteries(prev => 
      prev.includes(batteryId) 
        ? prev.filter(id => id !== batteryId)
        : [...prev, batteryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatteries.length === batteries.length) {
      setSelectedBatteries([]);
    } else {
      setSelectedBatteries(batteries.map(b => b.batteryId));
    }
  };

  const openUpdateModal = (battery) => {
    setSelectedBattery(battery);
    setShowUpdateModal(true);
  };

  const handleBulkUpdate = () => {
    if (selectedBatteries.length === 0) {
      toast.error('Please select batteries to update');
      return;
    }
    // Implement bulk update logic
    toast.info(`Bulk update for ${selectedBatteries.length} batteries`);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Battery ID,Status,Material Composition,Due Diligence,Last Update\n"
      + batteries.map(b => 
          `${b.batteryId},${b.status},${b.materialComposition ? 'Yes' : 'No'},${b.dueDiligenceHash ? 'Yes' : 'No'},${b.lastSupplierUpdate || 'Never'}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "battery_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return 'bg-yellow-100 text-yellow-800';
      case 'supplier_updated': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created': return <Clock className="w-4 h-4" />;
      case 'supplier_updated': return <Upload className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'transferred': return <Package className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredBatteries = batteries.filter(battery => {
    const matchesSearch = battery.batteryId.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || battery.status === filters.status;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Battery Management</h1>
            <p className="text-gray-600">Manage and update battery passport data</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={async () => {
                await fetchBatteries();
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search batteries..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="created">Created</option>
              <option value="supplier_updated">Supplier Updated</option>
              <option value="verified">Verified</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedBatteries.length} of {batteries.length} selected
            </span>
            <button
              onClick={handleBulkUpdate}
              disabled={selectedBatteries.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Update
            </button>
          </div>
        </div>
      </div>

      {/* Batteries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBatteries.length === batteries.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Composition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Diligence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier Updates
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatteries.map((battery) => (
                <tr key={battery.batteryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedBatteries.includes(battery.batteryId)}
                      onChange={() => handleBatterySelect(battery.batteryId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{battery.batteryId}</div>
                    <div className="text-sm text-gray-500">ID: {battery._id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(battery.status)}`}>
                      {getStatusIcon(battery.status)}
                      <span className="ml-1">{battery.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {battery.materialComposition ? (
                        <span className="text-green-600">✓ Updated</span>
                      ) : (
                        <span className="text-red-600">✗ Missing</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {battery.dueDiligenceHash ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-red-600">✗ Pending</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {battery.lastSupplierUpdate 
                      ? new Date(battery.lastSupplierUpdate).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplierUpdates[battery.batteryId] && supplierUpdates[battery.batteryId].length > 0 ? (
                      <span className="text-green-600">✓ Updated</span>
                    ) : (
                      <span className="text-red-600">✗ Missing</span>
                    )}
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredBatteries.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No batteries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedBattery && (
        <SupplierUpdateForm
          battery={selectedBattery}
          onUpdate={() => {
            setShowUpdateModal(false);
            setSelectedBattery(null);
            fetchBatteries();
            fetchSupplierUpdates(); // Refresh updates after update
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

export default SupplierBatteryManagement; 