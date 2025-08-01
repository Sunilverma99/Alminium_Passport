import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  FileText,
  Package,
  Edit,
  Upload,
  Shield,
  TrendingUp
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const SupplierHistory = () => {
  const { userAddress } = useSelector((state) => state.contract);
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    activityType: 'all',
    dateRange: 'all',
    status: 'all'
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

  const generateHistoryData = () => {
    const history = [];
    
    batteries.forEach(battery => {
      // Add creation event
      if (battery.createdAt) {
        history.push({
          id: `${battery._id}_created`,
          batteryId: battery.batteryId,
          activity: 'Battery Created',
          description: 'Battery passport was created',
          timestamp: new Date(battery.createdAt),
          type: 'creation',
          status: 'completed',
          icon: Package
        });
      }

      // Add material update events
      if (battery.lastSupplierUpdate) {
        history.push({
          id: `${battery._id}_material_update`,
          batteryId: battery.batteryId,
          activity: 'Material Update',
          description: battery.materialComposition ? 'Material composition updated' : 'Material update initiated',
          timestamp: new Date(battery.lastSupplierUpdate),
          type: 'material_update',
          status: battery.materialComposition ? 'completed' : 'pending',
          icon: Edit
        });
      }

      // Add due diligence events
      if (battery.dueDiligenceHash) {
        history.push({
          id: `${battery._id}_due_diligence`,
          batteryId: battery.batteryId,
          activity: 'Due Diligence',
          description: battery.isVerified ? 'Due diligence verified' : 'Due diligence submitted',
          timestamp: new Date(battery.lastSupplierUpdate || battery.createdAt),
          type: 'due_diligence',
          status: battery.isVerified ? 'verified' : 'submitted',
          icon: Shield
        });
      }

      // Add status changes
      if (battery.status) {
        history.push({
          id: `${battery._id}_status_${battery.status}`,
          batteryId: battery.batteryId,
          activity: 'Status Update',
          description: `Status changed to ${battery.status}`,
          timestamp: new Date(battery.lastSupplierUpdate || battery.createdAt),
          type: 'status_update',
          status: 'completed',
          icon: TrendingUp
        });
      }
    });

    return history.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'creation': return Package;
      case 'material_update': return Edit;
      case 'due_diligence': return Shield;
      case 'status_update': return TrendingUp;
      default: return FileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'submitted': return Upload;
      default: return AlertCircle;
    }
  };

  const filteredHistory = generateHistoryData().filter(item => {
    const matchesSearch = item.batteryId.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.activity.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.activityType === 'all' || item.type === filters.activityType;
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    let matchesDate = true;
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const itemDate = item.timestamp;
      const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case '7d':
          matchesDate = daysDiff <= 7;
          break;
        case '30d':
          matchesDate = daysDiff <= 30;
          break;
        case '90d':
          matchesDate = daysDiff <= 90;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const exportHistory = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Time,Battery ID,Activity,Description,Status\n"
      + filteredHistory.map(item => 
          `${item.timestamp.toLocaleDateString()},${item.timestamp.toLocaleTimeString()},${item.batteryId},${item.activity},${item.description},${item.status}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "supplier_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('History exported successfully!');
  };

  const getActivityStats = () => {
    const total = filteredHistory.length;
    const completed = filteredHistory.filter(item => item.status === 'completed' || item.status === 'verified').length;
    const pending = filteredHistory.filter(item => item.status === 'pending').length;
    const submitted = filteredHistory.filter(item => item.status === 'submitted').length;

    return {
      total,
      completed,
      pending,
      submitted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = getActivityStats();

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
            <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
            <p className="text-gray-600">View all your past activities and updates</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportHistory}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export History
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
              placeholder="Search activities or battery IDs..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.activityType}
            onChange={(e) => setFilters({...filters, activityType: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Activities</option>
            <option value="creation">Creation</option>
            <option value="material_update">Material Updates</option>
            <option value="due_diligence">Due Diligence</option>
            <option value="status_update">Status Updates</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, index) => {
              const ActivityIcon = item.icon;
              const StatusIcon = getStatusIcon(item.status);
              
              return (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ActivityIcon className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.activity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Battery ID: {item.batteryId}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">
                        {item.description}
                      </p>
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Activity Types</h4>
            <div className="space-y-2">
              {['creation', 'material_update', 'due_diligence', 'status_update'].map(type => {
                const count = filteredHistory.filter(item => item.type === type).length;
                const percentage = filteredHistory.length > 0 ? Math.round((count / filteredHistory.length) * 100) : 0;
                const Icon = getActivityIcon(type);
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {filteredHistory.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate">{item.activity}</span>
                  <span className="text-gray-500">{item.timestamp.toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierHistory; 