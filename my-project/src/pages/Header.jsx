import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Menu, X, LogOut, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { initializeContract, disconnectWallet, resetDisconnectFlag } from '../redux/contractSlice';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Product', href: '/product' },
  { name: 'Fast Facts', href: '/fast-facts' },
  { name: 'Resources', href: '/resources' },
  { name: 'Contact us', href: '/contact-us' },
  { name: 'Newsletter', href: '/newsletter' },
  { name: 'Aluminum Passport', href: '/aluminum-passport' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const { userAddress, isConnected, isLoading, error, manuallyDisconnected } = useAppSelector(state => state.contract);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      console.log('Connecting wallet...');
      // Reset disconnect flag to allow reconnection
      dispatch(resetDisconnectFlag());
      await dispatch(initializeContract()).unwrap();
      console.log('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    console.log('Disconnecting wallet...');
    dispatch(disconnectWallet());
    setIsProfileOpen(false);
    console.log('Wallet disconnected');
  };

  // Handle profile click
  const handleProfileClick = () => {
    setIsProfileOpen(false);
    navigate('/profile');
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.log('User disconnected wallet from MetaMask');
          dispatch(disconnectWallet());
        } else if (accounts[0] !== userAddress && !manuallyDisconnected) {
          // User switched accounts and hasn't manually disconnected
          console.log('User switched accounts');
          dispatch(initializeContract());
        }
      };

      const handleChainChanged = () => {
        // Reinitialize contract when chain changes instead of reloading
        console.log('Chain changed, reinitializing contract...');
        if (!manuallyDisconnected) {
          dispatch(initializeContract());
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [dispatch, userAddress, manuallyDisconnected]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[1000] w-full bg-white text-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <img className="h-4 w-6  sm:h-10 sm:w-16" src="/aeiforo.png" alt="Logo" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-400 to-blue-800 bg-clip-text text-transparent">
              ALtrail
            </span>
          </a>
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                {item.name}
              </a>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {isConnected && userAddress ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <img src={`https://avatar.vercel.sh/${userAddress}.png`} alt="User Avatar" className="h-6 w-6 rounded-full" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 font-mono">
                    {formatAddress(userAddress)}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button onClick={handleDisconnect} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <LogOut className="mr-3 h-4 w-4" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={handleConnectWallet} 
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </span>
                <span className="sm:hidden">
                  {isLoading ? 'Connecting...' : 'Connect'}
                </span>
              </button>
            )}
            <div className="relative lg:hidden" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <a key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
