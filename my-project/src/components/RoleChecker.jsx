import React, { useEffect, useState } from 'react';
import { initializeContract, disconnectWallet, resetDisconnectFlag } from '../redux/contractSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

export default function RoleChecker({ children }) {
  const dispatch = useAppDispatch();
  const { userAddress, isConnected, manuallyDisconnected } = useAppSelector(state => state.contract);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeWallet = async () => {
      if (!manuallyDisconnected && !isConnected && window.ethereum) {
        try {
          const result = await dispatch(initializeContract()).unwrap();
          console.log('Wallet initialized:', result.userAddress);
        } catch (error) {
          console.error('Failed to initialize wallet:', error);
        }
      }
      setIsInitialized(true);
    };

    initializeWallet();
  }, [dispatch, isConnected, manuallyDisconnected]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        dispatch(disconnectWallet());
      } else {
        const newAccount = accounts[0];
        if (newAccount !== userAddress) {
          // User switched accounts
          try {
            await dispatch(initializeContract()).unwrap();
            console.log('Account switched to:', newAccount);
          } catch (error) {
            console.error('Failed to switch account:', error);
          }
        }
      }
    };

    const handleChainChanged = () => {
      // Reinitialize when chain changes
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [dispatch, userAddress]);

  useEffect(() => {
    if (!window.ethereum) return;

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0 && !isConnected && !manuallyDisconnected) {
          // User has accounts but not connected in our state, and hasn't manually disconnected
          try {
            const result = await dispatch(initializeContract()).unwrap();
            console.log('Reconnected wallet:', result.userAddress);
          } catch (error) {
            console.error('Failed to reconnect wallet:', error);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [dispatch, isConnected, manuallyDisconnected]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 