import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  AlertTriangle, 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  Info,
  Shield,
  Clock,
  History
} from 'lucide-react';
import { initializeContractInstance } from '../../contractInstance';
import { apiFetch } from '../../utils/api';

const RecyclerReportDiscrepancies = () => {
  const [tokenId, setTokenId] = useState('');
  const [discrepancyType, setDiscrepancyType] = useState('');
  const [discrepancyDescription, setDiscrepancyDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);

  const discrepancyTypes = [
    { value: 'material_mismatch', label: 'Material Composition Mismatch', description: 'Actual materials differ from documented composition' },
    { value: 'safety_hazard', label: 'Safety Hazard', description: 'Battery poses safety risks during recycling' },
    { value: 'performance_issue', label: 'Performance Issue', description: 'Battery performance differs from specifications' },
    { value: 'documentation_error', label: 'Documentation Error', description: 'Incorrect or missing documentation' },
    { value: 'physical_damage', label: 'Physical Damage', description: 'Unexpected physical damage or wear' },
    { value: 'contamination', label: 'Contamination', description: 'Battery contaminated with foreign substances' },
    { value: 'other', label: 'Other', description: 'Other discrepancy not listed above' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor issue, minimal impact on recycling process', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', description: 'Moderate issue, requires attention but not critical', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', description: 'Serious issue, significant impact on recycling process', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', description: 'Severe issue, may require immediate action', color: 'bg-red-100 text-red-800' }
  ];

  const getSeverityColor = (level) => {
    const severity = severityLevels.find(s => s.value === level);
    return severity ? severity.color : 'bg-gray-100 text-gray-800';
  };

  const handleReportDiscrepancy = async () => {
    if (!tokenId || !discrepancyType || !discrepancyDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { evContract, discrepancyManager, didManager, signatureManager, account, web3 } = await initializeContractInstance();

      // Check if token exists
      const tokenExists = await evContract.methods.exists(Number(tokenId)).call();
      if (!tokenExists) {
        throw new Error('Token ID does not exist');
      }

      // Fetch user DID info
      const userResponse = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/byEthereumAddress?ethereumAddress=${encodeURIComponent(account)}`
      );
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user credential data from backend");
      }
      const userData = await userResponse.json();
      if (!userData.user?.didName || !userData.user?.credentialId) {
        throw new Error("No valid user credentials found. Please ensure you are properly registered.");
      }
      const didName = userData.user.didName.toLowerCase();
      const credentialId = userData.user.credentialId;

      // Compute didHash
      const didHash = web3.utils.keccak256(didName);
      
      const isDIDRegistered = await didManager.methods.isDIDRegistered(didHash).call();
      
      if (!isDIDRegistered) {
        throw new Error("DID is not registered. Please wait for government approval.");
      }
      
      const didDetails = await didManager.methods.getDID(didHash).call();
      
      if (!didDetails.isVerified) {
        throw new Error("DID is not verified. Please wait for government verification.");
      }
      
      if (didDetails.publicKey.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Public key mismatch. DID was registered with a different account.");
      }
      
      // Check if user has RECYCLER role with sufficient trust level
      const hasRecyclerRole = didDetails.roles.some(role => 
        role.toUpperCase() === 'RECYCLER'
      );
      
      if (!hasRecyclerRole || didDetails.trustLevel < 3) {
        throw new Error(`Insufficient permissions. User has roles: ${didDetails.roles.join(', ')}, trust level: ${didDetails.trustLevel}. Required: RECYCLER role with trust level >= 3.`);
      }

      // Create signature for discrepancy report
      const structHash = web3.utils.keccak256(
        web3.utils.encodePacked(tokenId, web3.utils.keccak256(discrepancyDescription), account)
      );

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [web3.utils.toHex(structHash), account]
      });

      // Report discrepancy
      await discrepancyManager.methods.reportDiscrepancy(
        tokenId,
        didHash,
        discrepancyDescription,
        signature
      ).send({ from: account });

      toast.success('Discrepancy reported successfully!');
      
      // Add to report history
      setReportHistory(prev => [{
        tokenId,
        type: discrepancyTypes.find(t => t.value === discrepancyType)?.label || discrepancyType,
        severity,
        description: discrepancyDescription,
        timestamp: new Date().toLocaleString(),
        status: 'Success'
      }, ...prev.slice(0, 9)]);

      // Reset form
      setTokenId('');
      setDiscrepancyType('');
      setDiscrepancyDescription('');
      setSeverity('medium');

    } catch (error) {
      console.error('Error reporting discrepancy:', error);
      toast.error(error.message || 'Failed to report discrepancy');
      
      // Add failed report to history
      setReportHistory(prev => [{
        tokenId,
        type: discrepancyTypes.find(t => t.value === discrepancyType)?.label || discrepancyType,
        severity,
        description: discrepancyDescription,
        timestamp: new Date().toLocaleString(),
        status: 'Failed',
        error: error.message
      }, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReportHistory = () => {
    if (reportHistory.length === 0) return;
    
    const dataStr = JSON.stringify(reportHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `discrepancy-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Discrepancies</h1>
              <p className="text-gray-600">Report issues and discrepancies found during recycling operations</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Report Discrepancy</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Battery Token ID *
                  </label>
                  <input
                    type="number"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter battery token ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discrepancy Type *
                  </label>
                  <select
                    value={discrepancyType}
                    onChange={(e) => setDiscrepancyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select discrepancy type</option>
                    {discrepancyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {severityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={discrepancyDescription}
                    onChange={(e) => setDiscrepancyDescription(e.target.value)}
                    placeholder="Provide detailed description of the discrepancy..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleReportDiscrepancy}
                  disabled={loading || !tokenId || !discrepancyType || !discrepancyDescription.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Reporting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Report Discrepancy
                    </>
                  )}
                </button>
              </div>

              {/* Report History */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                  {reportHistory.length > 0 && (
                    <button
                      onClick={downloadReportHistory}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reportHistory.map((report, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        report.status === 'Success' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">Token ID: {report.tokenId}</p>
                          <p className="text-sm text-gray-600">{report.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {report.status === 'Success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            report.status === 'Success' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{report.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Severity:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {severityLevels.find(s => s.value === report.severity)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reportHistory.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No reports yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Information Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Discrepancy Reporting Guide</h2>
                </div>
              </div>

              <div className="p-6">
                {/* Discrepancy Types */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Discrepancy Types</h3>
                  <div className="space-y-3">
                    {discrepancyTypes.map((type) => (
                      <div key={type.value} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{type.label}</h4>
                        </div>
                        <p className="text-gray-700 text-sm">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Levels */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Levels</h3>
                  <div className="space-y-3">
                    {severityLevels.map((level) => (
                      <div key={level.value} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                              {level.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{level.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reporting Guidelines */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Guidelines</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-3 text-sm text-blue-800">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <p><strong>Be Specific:</strong> Provide detailed descriptions including location, extent, and potential impact of the discrepancy.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <p><strong>Include Evidence:</strong> Mention any supporting documentation, photos, or measurements that validate the discrepancy.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <p><strong>Assess Impact:</strong> Consider how the discrepancy affects recycling safety, efficiency, and compliance.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <p><strong>Suggest Solutions:</strong> If possible, include recommendations for addressing the discrepancy.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Important Notes</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Only authorized recyclers can report discrepancies</li>
                        <li>• All reports are permanently recorded on the blockchain</li>
                        <li>• Critical severity reports may trigger immediate review processes</li>
                        <li>• Provide accurate and truthful information - false reports may result in penalties</li>
                        <li>• Reports are reviewed by government authorities and may require follow-up action</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecyclerReportDiscrepancies; 