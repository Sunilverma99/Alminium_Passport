import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const SupplierAnalytics = () => {
  const { userAddress } = useSelector((state) => state.contract);
  const [stats, setStats] = useState({
    totalBatteries: 0,
    pendingUpdates: 0,
    completedUpdates: 0,
    verifiedBatteries: 0,
    updatedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (userAddress) {
      fetchAnalytics();
    }
  }, [userAddress, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/supplier/stats/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (stats.totalBatteries === 0) return 0;
    return Math.round((stats.completedUpdates / stats.totalBatteries) * 100);
  };

  const getVerificationRate = () => {
    if (stats.totalBatteries === 0) return 0;
    return Math.round((stats.verifiedBatteries / stats.totalBatteries) * 100);
  };

  const mockChartData = [
    { month: 'Jan', updated: 12, verified: 8 },
    { month: 'Feb', updated: 19, verified: 15 },
    { month: 'Mar', updated: 15, verified: 12 },
    { month: 'Apr', updated: 22, verified: 18 },
    { month: 'May', updated: 18, verified: 14 },
    { month: 'Jun', updated: 25, verified: 20 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your battery passport performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Batteries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBatteries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Updates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingUpdates}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.completedUpdates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Activity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.updatedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Rate</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Battery Updates</span>
            <span className="text-sm font-medium text-gray-900">{getCompletionRate()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionRate()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.completedUpdates} of {stats.totalBatteries} batteries updated
          </p>
        </div>

        {/* Verification Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Rate</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Verified Batteries</span>
            <span className="text-sm font-medium text-gray-900">{getVerificationRate()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getVerificationRate()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.verifiedBatteries} of {stats.totalBatteries} batteries verified
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Monthly Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Updated</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Verified</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {mockChartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center space-y-1 mb-2">
                <div 
                  className="w-full bg-blue-600 rounded-t"
                  style={{ height: `${(data.updated / 25) * 120}px` }}
                ></div>
                <div 
                  className="w-full bg-green-600 rounded-t"
                  style={{ height: `${(data.verified / 25) * 120}px` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Updated material composition', battery: 'BAT-001', time: '2 hours ago', status: 'success' },
            { action: 'Verified due diligence', battery: 'BAT-002', time: '4 hours ago', status: 'success' },
            { action: 'Pending update', battery: 'BAT-003', time: '1 day ago', status: 'pending' },
            { action: 'Completed verification', battery: 'BAT-004', time: '2 days ago', status: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.battery} • {activity.time}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activity.status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierAnalytics; 