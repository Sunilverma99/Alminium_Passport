import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Printer,
  Share2,
  Eye
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const SupplierReports = () => {
  const { userAddress } = useSelector((state) => state.contract);
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    dateRange: '30d',
    reportType: 'all',
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

  const reportTypes = [
    {
      id: 'activity',
      name: 'Activity Report',
      description: 'Daily, weekly, and monthly activity summaries',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: 'compliance',
      name: 'Compliance Report',
      description: 'Due diligence and verification status',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Completion rates and efficiency metrics',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'materials',
      name: 'Materials Report',
      description: 'Material composition and sourcing data',
      icon: FileText,
      color: 'orange'
    },
    {
      id: 'timeline',
      name: 'Timeline Report',
      description: 'Historical updates and milestones',
      icon: Clock,
      color: 'red'
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview and key metrics',
      icon: PieChart,
      color: 'indigo'
    }
  ];

  const generateReport = (reportType) => {
    setSelectedReport(reportType);
    toast.success(`Generating ${reportType.name}...`);
  };

  const exportReport = (reportType) => {
    let csvContent = '';
    let filename = '';

    switch (reportType.id) {
      case 'activity':
        csvContent = generateActivityReport();
        filename = 'activity_report.csv';
        break;
      case 'compliance':
        csvContent = generateComplianceReport();
        filename = 'compliance_report.csv';
        break;
      case 'performance':
        csvContent = generatePerformanceReport();
        filename = 'performance_report.csv';
        break;
      case 'materials':
        csvContent = generateMaterialsReport();
        filename = 'materials_report.csv';
        break;
      case 'timeline':
        csvContent = generateTimelineReport();
        filename = 'timeline_report.csv';
        break;
      case 'summary':
        csvContent = generateSummaryReport();
        filename = 'executive_summary.csv';
        break;
      default:
        return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${reportType.name} exported successfully!`);
  };

  const generateActivityReport = () => {
    const today = new Date();
    const last30Days = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const recentBatteries = batteries.filter(b => 
      b.lastSupplierUpdate && new Date(b.lastSupplierUpdate) >= last30Days
    );

    return "data:text/csv;charset=utf-8," 
      + "Date,Battery ID,Action,Status\n"
      + recentBatteries.map(b => 
          `${new Date(b.lastSupplierUpdate).toLocaleDateString()},${b.batteryId},Material Update,${b.status}`
        ).join("\n");
  };

  const generateComplianceReport = () => {
    const verified = batteries.filter(b => b.isVerified).length;
    const pending = batteries.filter(b => b.dueDiligenceHash && !b.isVerified).length;
    const notSubmitted = batteries.filter(b => !b.dueDiligenceHash).length;

    return "data:text/csv;charset=utf-8," 
      + "Compliance Status,Count,Percentage\n"
      + `Verified,${verified},${Math.round((verified / batteries.length) * 100)}%\n`
      + `Pending Verification,${pending},${Math.round((pending / batteries.length) * 100)}%\n`
      + `Not Submitted,${notSubmitted},${Math.round((notSubmitted / batteries.length) * 100)}%\n`;
  };

  const generatePerformanceReport = () => {
    const completed = batteries.filter(b => b.materialComposition).length;
    const pending = batteries.filter(b => !b.materialComposition).length;
    const completionRate = Math.round((completed / batteries.length) * 100);

    return "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Batteries,${batteries.length}\n`
      + `Completed Updates,${completed}\n`
      + `Pending Updates,${pending}\n`
      + `Completion Rate,${completionRate}%\n`;
  };

  const generateMaterialsReport = () => {
    return "data:text/csv;charset=utf-8," 
      + "Battery ID,Material Composition,Due Diligence Hash,Last Update\n"
      + batteries.map(b => 
          `${b.batteryId},${b.materialComposition ? 'Yes' : 'No'},${b.dueDiligenceHash || 'N/A'},${b.lastSupplierUpdate || 'Never'}`
        ).join("\n");
  };

  const generateTimelineReport = () => {
    const sortedBatteries = [...batteries].sort((a, b) => 
      new Date(b.lastSupplierUpdate || 0) - new Date(a.lastSupplierUpdate || 0)
    );

    return "data:text/csv;charset=utf-8," 
      + "Date,Battery ID,Event,Details\n"
      + sortedBatteries.map(b => 
          `${b.lastSupplierUpdate ? new Date(b.lastSupplierUpdate).toLocaleDateString() : 'Never'},${b.batteryId},Update,${b.status}`
        ).join("\n");
  };

  const generateSummaryReport = () => {
    const total = batteries.length;
    const completed = batteries.filter(b => b.materialComposition).length;
    const verified = batteries.filter(b => b.isVerified).length;
    const completionRate = Math.round((completed / total) * 100);
    const verificationRate = Math.round((verified / total) * 100);

    return "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Battery Passports,${total}\n`
      + `Material Updates Completed,${completed}\n`
      + `Due Diligence Verified,${verified}\n`
      + `Completion Rate,${completionRate}%\n`
      + `Verification Rate,${verificationRate}%\n`;
  };

  const getReportStats = () => {
    const total = batteries.length;
    const completed = batteries.filter(b => b.materialComposition).length;
    const verified = batteries.filter(b => b.isVerified).length;
    const pending = batteries.filter(b => !b.materialComposition).length;

    return {
      total,
      completed,
      verified,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
    };
  };

  const stats = getReportStats();

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
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and export comprehensive reports</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={reportFilters.dateRange}
              onChange={(e) => setReportFilters({...reportFilters, dateRange: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Batteries</p>
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
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verificationRate}%</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`p-2 bg-${report.color}-100 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">{report.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateReport(report)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Generate
                </button>
                <button
                  onClick={() => exportReport(report)}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => exportReport({ id: 'summary', name: 'Executive Summary' })}
            className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export All Reports
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Reports
          </button>
          <button
            onClick={() => toast.info('Sharing functionality coming soon!')}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {batteries
            .filter(b => b.lastSupplierUpdate)
            .sort((a, b) => new Date(b.lastSupplierUpdate) - new Date(a.lastSupplierUpdate))
            .slice(0, 5)
            .map((battery, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Updated {battery.batteryId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(battery.lastSupplierUpdate).toLocaleDateString()} • {battery.status}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(battery.lastSupplierUpdate).toLocaleTimeString()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierReports; 