import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkUserRoles, initializeContract, disconnectWallet, resetDisconnectFlag } from '../redux/contractSlice';

const RoleChecker = () => {
  const dispatch = useDispatch();
  const { userAddress, isConnected, isLoading, manuallyDisconnected } = useSelector((state) => state.contract);
  const isDisconnected = !isConnected;

  useEffect(() => {
    const checkRoles = async () => {
      if (!isDisconnected && userAddress) {
        try {
          await dispatch(checkUserRoles(userAddress)).unwrap();
        } catch (error) {
          console.error('Error checking user roles:', error);
        }
      }
    };

    checkRoles();
  }, [userAddress, isDisconnected, dispatch]);

  // Listen for account changes from MetaMask
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        dispatch(disconnectWallet());
        return;
      }
      
      const newAccount = accounts[0];
      if (newAccount !== userAddress) {
        try {
          await dispatch(checkUserRoles(newAccount)).unwrap();
        } catch (error) {
          console.error('Error checking user roles after account change:', error);
        }
      }
    };

    const handleChainChanged = async () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    // Add event listeners for MetaMask events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [userAddress, dispatch]);

  // Auto-connect on app load if user was previously connected
  useEffect(() => {
    const autoConnect = async () => {
      // Don't auto-connect if user manually disconnected
      if (manuallyDisconnected) {
        console.log('Skipping auto-connect due to manual disconnect');
        return;
      }
      
      if (window.ethereum && isDisconnected) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const result = await dispatch(initializeContract()).unwrap();
            await dispatch(checkUserRoles(result.userAddress)).unwrap();
          }
        } catch (error) {
          console.error('Error auto-connecting:', error);
        }
      }
    };

    autoConnect();
  }, [dispatch, isDisconnected, manuallyDisconnected]);

  return null; // This component doesn't render anything
};

export default RoleChecker; 