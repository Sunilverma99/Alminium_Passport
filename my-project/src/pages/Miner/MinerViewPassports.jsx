import React, { useState, useEffect } from 'react';
import { initializeContractInstance } from '../../contractInstance.js';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaEye, 
  FaSearch, 
  FaSpinner,
  FaInfoCircle,
  FaFilter,
  FaCubes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';

export default function MinerViewPassports() {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [passports, setPassports] = useState([]);
  const [selectedPassport, setSelectedPassport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('tokenId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [passportsPerPage] = useState(10);

  useEffect(() => {
    initializeAccount();
  }, []);

  useEffect(() => {
    if (account) {
      fetchPassports();
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
        exists: passport.exists,
        materialCompositionHash: passport.materialCompositionHash,
        carbonFootprintHash: passport.carbonFootprintHash
      };
    } catch (error) {
      console.error(`Error fetching passport ${tokenId}:`, error);
      return null;
    }
  };

  const fetchPassports = async () => {
    setLoading(true);
    try {
      const { evContract, bpQueries, web3 } = await initializeContractInstance();
      
      // Get token counter to know how many passports exist
      const tokenCounter = await evContract.methods.getTokenCounter().call();
      const totalTokens = Number(tokenCounter);
      
      if (totalTokens === 0) {
        setPassports([]);
        setLoading(false);
        return;
      }

      // Fetch passports in batches to avoid overwhelming the network
      const batchSize = 20;
      const allPassports = [];
      
      for (let i = 1; i <= Math.min(totalTokens, 100); i += batchSize) {
        const batchPromises = [];
        for (let j = i; j < Math.min(i + batchSize, totalTokens + 1); j++) {
          batchPromises.push(fetchPassportData(j, evContract, bpQueries, web3));
        }
        
        const batchResults = await Promise.all(batchPromises);
        const validPassports = batchResults.filter(passport => passport !== null);
        allPassports.push(...validPassports);
      }

      setPassports(allPassports);
      toast.success(`Loaded ${allPassports.length} battery passports`);

    } catch (error) {
      console.error('Error fetching passports:', error);
      toast.error('Failed to fetch passports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
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
    fetchPassportData(tokenId, evContract, bpQueries, web3).then(passport => {
      if (passport) {
        setPassports([passport]);
        setSelectedPassport(passport);
      } else {
        setPassports([]);
        toast.error('Passport not found');
      }
      setLoading(false);
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusText = (status) => {
    const statuses = ['Manufactured', 'In Use', 'Recycled', 'Retired'];
    return statuses[status] || 'Unknown';
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

  const getLifecycleStatusText = (status) => {
    const statuses = ['Original', 'Repurposed', 'Reused', 'Remanufactured', 'Waste'];
    return statuses[status] || 'Unknown';
  };

  const getLifecycleStatusColor = (status) => {
    const colors = {
      0: 'bg-blue-100 text-blue-800',
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter and sort passports
  const filteredPassports = passports
    .filter(passport => {
      const matchesSearch = !searchTerm || 
        passport.tokenId.toString().includes(searchTerm) ||
        passport.uniqueIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        passport.status.toString() === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const indexOfLastPassport = currentPage * passportsPerPage;
  const indexOfFirstPassport = indexOfLastPassport - passportsPerPage;
  const currentPassports = filteredPassports.slice(indexOfFirstPassport, indexOfLastPassport);
  const totalPages = Math.ceil(filteredPassports.length / passportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaEye className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">View Battery Passports</h1>
          </div>
          <p className="text-gray-600">
            View and search through battery passports. Filter by status and sort by different criteria.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter token ID or identifier"
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

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="0">Manufactured</option>
                <option value="1">In Use</option>
                <option value="2">Recycled</option>
                <option value="3">Retired</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchPassports}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Showing {currentPassports.length} of {filteredPassports.length} passports
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tokenId-asc">Token ID (Asc)</option>
                <option value="tokenId-desc">Token ID (Desc)</option>
                <option value="status-asc">Status (Asc)</option>
                <option value="status-desc">Status (Desc)</option>
                <option value="version-asc">Version (Asc)</option>
                <option value="version-desc">Version (Desc)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Passports Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading passports...</p>
          </div>
        ) : currentPassports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No passports found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tokenId')}>
                      <div className="flex items-center gap-1">
                        Token ID
                        {sortBy === 'tokenId' && (
                          sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === 'status' && (
                          sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifecycle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('version')}>
                      <div className="flex items-center gap-1">
                        Version
                        {sortBy === 'version' && (
                          sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPassports.map((passport) => (
                    <tr key={passport.tokenId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{passport.tokenId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {passport.uniqueIdentifier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(passport.status)}`}>
                          {getStatusText(passport.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLifecycleStatusColor(passport.lifecycleStatus)}`}>
                          {getLifecycleStatusText(passport.lifecycleStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        v{passport.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {passport.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedPassport(passport)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
            <div className="flex justify-center">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Passport Details Modal */}
        {selectedPassport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Passport Details - #{selectedPassport.tokenId}
                  </h2>
                  <button
                    onClick={() => setSelectedPassport(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Token ID</label>
                        <p className="text-lg font-semibold text-gray-900">#{selectedPassport.tokenId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Unique Identifier</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedPassport.uniqueIdentifier}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Version</label>
                        <p className="text-lg font-semibold text-gray-900">v{selectedPassport.version}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Batch ID</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedPassport.batchId}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Battery Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedPassport.status)}`}>
                          {getStatusText(selectedPassport.status)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Lifecycle Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLifecycleStatusColor(selectedPassport.lifecycleStatus)}`}>
                          {getLifecycleStatusText(selectedPassport.lifecycleStatus)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Organization ID</label>
                        <p className="text-sm font-semibold text-gray-900 break-all">{selectedPassport.organizationId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Hashes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Material Composition Hash</label>
                      <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-3 rounded border">
                        {selectedPassport.materialCompositionHash}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Carbon Footprint Hash</label>
                      <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-3 rounded border">
                        {selectedPassport.carbonFootprintHash}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedPassport.qrCodeUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
                    <div className="flex justify-center">
                      <img 
                        src={selectedPassport.qrCodeUrl} 
                        alt="QR Code" 
                        className="w-32 h-32 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 