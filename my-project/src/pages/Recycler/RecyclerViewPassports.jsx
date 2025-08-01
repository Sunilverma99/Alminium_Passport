import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Eye, 
  Search, 
  FileText, 
  Database, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Info,
  Battery,
  Filter,
  Grid,
  List,
  Calendar,
  Hash,
  Tag,
  Factory,
  Globe,
  X
} from 'lucide-react';
import { initializeContractInstance } from '../../contractInstance';
import { apiFetch } from '../../utils/api';

const RecyclerViewPassports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [passports, setPassports] = useState([]);
  const [selectedPassport, setSelectedPassport] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: '0', label: 'Manufactured' },
    { value: '1', label: 'In Use' },
    { value: '2', label: 'Recycled' },
    { value: '3', label: 'Retired' }
  ];

  const lifecycleOptions = [
    { value: 'all', label: 'All Lifecycle Stages' },
    { value: '0', label: 'Original' },
    { value: '1', label: 'Repurposed' },
    { value: '2', label: 'Reused' },
    { value: '3', label: 'Remanufactured' },
    { value: '4', label: 'Waste' }
  ];

  useEffect(() => {
    fetchPassports();
  }, [currentPage, filterStatus]);

  const fetchPassports = async () => {
    setLoading(true);
    try {
      const { evContract, bpQueries, account, web3 } = await initializeContractInstance();

      // Get total token counter
      const tokenCounter = await bpQueries.methods.getTokenCounter().call();
      const totalTokens = Number(tokenCounter);

      // Calculate pagination
      const startToken = (currentPage - 1) * itemsPerPage + 1;
      const endToken = Math.min(startToken + itemsPerPage - 1, totalTokens);
      
      setTotalPages(Math.ceil(totalTokens / itemsPerPage));

      // Fetch passports for current page
      const passportPromises = [];
      for (let i = startToken; i <= endToken; i++) {
        passportPromises.push(fetchPassportData(i, evContract, bpQueries));
      }

      const passportResults = await Promise.allSettled(passportPromises);
      const validPassports = passportResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      setPassports(validPassports);

    } catch (error) {
      console.error('Error fetching passports:', error);
      toast.error('Failed to fetch battery passports');
    } finally {
      setLoading(false);
    }
  };

  const fetchPassportData = async (tokenId, evContract, bpQueries, web3) => {
    try {
      // Check if token exists
      const exists = await bpQueries.methods.exists(tokenId).call();
      if (!exists) return null;

      // Get basic passport data
      const passport = await evContract.methods.getBatteryPassport(tokenId).call();
      
      // Get lifecycle status
      const passportId = web3.utils.keccak256(tokenId);
      const lifecycleStatus = await evContract.methods.getLifecycleStatus(passportId).call();

      return {
        tokenId: tokenId,
        uniqueIdentifier: passport.uniqueIdentifier,
        status: Number(passport.status),
        lifecycleStatus: Number(lifecycleStatus),
        version: Number(passport.version),
        batchId: Number(passport.batchId),
        qrCodeUrl: passport.qrCodeUrl,
        organizationId: passport.organizationId,
        exists: passport.exists
      };
    } catch (error) {
      console.error(`Error fetching passport ${tokenId}:`, error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchPassports();
      return;
    }

    const tokenId = parseInt(searchTerm);
    if (isNaN(tokenId)) {
      toast.error('Please enter a valid Token ID');
      return;
    }

    setLoading(true);
    try {
      const { evContract, bpQueries, web3 } = await initializeContractInstance();
      const passport = await fetchPassportData(tokenId, evContract, bpQueries, web3);
      
      if (passport) {
        setPassports([passport]);
        setSelectedPassport(passport);
      } else {
        setPassports([]);
        toast.error('Passport not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      0: 'bg-blue-100 text-blue-800',
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLifecycleColor = (status) => {
    const colors = {
      0: 'bg-blue-100 text-blue-800',
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      0: 'Manufactured',
      1: 'In Use',
      2: 'Recycled',
      3: 'Retired'
    };
    return labels[status] || 'Unknown';
  };

  const getLifecycleLabel = (status) => {
    const labels = {
      0: 'Original',
      1: 'Repurposed',
      2: 'Reused',
      3: 'Remanufactured',
      4: 'Waste'
    };
    return labels[status] || 'Unknown';
  };

  const filteredPassports = passports.filter(passport => {
    if (filterStatus !== 'all' && passport.status !== parseInt(filterStatus)) {
      return false;
    }
    if (searchTerm && !passport.uniqueIdentifier.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const downloadPassportData = (passport) => {
    const dataStr = JSON.stringify(passport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passport-${passport.tokenId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View Battery Passports</h1>
              <p className="text-gray-600">Browse and search battery passport data for recycling operations</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Token ID or Identifier
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter Token ID or search term..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battery Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center gap-2 ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center gap-2 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Battery Passports ({filteredPassports.length})
            </h2>
            <button
              onClick={fetchPassports}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading battery passports...</p>
            </div>
          ) : filteredPassports.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPassports.map((passport) => (
                    <motion.div
                      key={passport.tokenId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                      onClick={() => setSelectedPassport(passport)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Battery className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">#{passport.tokenId}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPassportData(passport);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Identifier</p>
                          <p className="font-medium text-gray-900 truncate">{passport.uniqueIdentifier}</p>
                        </div>

                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(passport.status)}`}>
                            {getStatusLabel(passport.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLifecycleColor(passport.lifecycleStatus)}`}>
                            {getLifecycleLabel(passport.lifecycleStatus)}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          <p>Version: {passport.version}</p>
                          <p>Batch: {passport.batchId}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPassports.map((passport) => (
                    <motion.div
                      key={passport.tokenId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                      onClick={() => setSelectedPassport(passport)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Battery className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">#{passport.tokenId}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{passport.uniqueIdentifier}</p>
                          <p className="text-sm text-gray-600">Version {passport.version} • Batch {passport.batchId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(passport.status)}`}>
                          {getStatusLabel(passport.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLifecycleColor(passport.lifecycleStatus)}`}>
                          {getLifecycleLabel(passport.lifecycleStatus)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPassportData(passport);
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No passports found matching your search criteria' : 'No battery passports available'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Selected Passport Modal */}
        {selectedPassport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPassport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Battery Passport #{selectedPassport.tokenId}
                  </h2>
                  <button
                    onClick={() => setSelectedPassport(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unique Identifier</label>
                      <p className="text-gray-900 font-medium">{selectedPassport.uniqueIdentifier}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                      <p className="text-gray-900">{selectedPassport.version}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
                      <p className="text-gray-900">{selectedPassport.batchId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedPassport.organizationId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Battery Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPassport.status)}`}>
                        {getStatusLabel(selectedPassport.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLifecycleColor(selectedPassport.lifecycleStatus)}`}>
                        {getLifecycleLabel(selectedPassport.lifecycleStatus)}
                      </span>
                    </div>
                  </div>

                  {selectedPassport.qrCodeUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code URL</label>
                      <a
                        href={selectedPassport.qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {selectedPassport.qrCodeUrl}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => downloadPassportData(selectedPassport)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Data
                    </button>
                    <button
                      onClick={() => setSelectedPassport(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecyclerViewPassports; 