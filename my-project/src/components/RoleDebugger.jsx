import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

export default function RoleDebugger() {
  const dispatch = useAppDispatch();
  const { userAddress, isConnected, isLoading, error } = useAppSelector(state => state.contract);
  const [debugInfo, setDebugInfo] = useState('');

  const checkConnection = async () => {
    try {
      setDebugInfo('Checking connection...');
      
      if (!window.ethereum) {
        setDebugInfo('MetaMask not found');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      setDebugInfo(`Found ${accounts.length} accounts: ${accounts.join(', ')}`);
      
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const checkNetwork = async () => {
    try {
      setDebugInfo('Checking network...');
      
      if (!window.ethereum) {
        setDebugInfo('MetaMask not found');
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = await window.ethereum.request({ method: 'net_version' });
      
      setDebugInfo(`Chain ID: ${chainId}, Network ID: ${networkId}`);
      
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const clearDebug = () => {
    setDebugInfo('');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="text-lg font-bold mb-2">Debug Info</h3>
      
      <div className="space-y-2 mb-4">
        <div><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</div>
        <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Address:</strong> {userAddress || 'None'}</div>
        {error && <div><strong>Error:</strong> {error}</div>}
      </div>

      <div className="space-y-2">
        <button 
          onClick={checkConnection}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Check Connection
        </button>
        
        <button 
          onClick={checkNetwork}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Check Network
        </button>
        
        <button 
          onClick={clearDebug}
          className="w-full bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
} 