import React, { useState, useRef } from 'react';
import { Wallet, Menu, X, LogOut, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Demo function - does nothing when clicked
  const handleConnectWallet = () => {
    console.log('Connect wallet button clicked - demo mode');
    // Do nothing in demo mode
  };

  // Demo function - does nothing when clicked
  const handleDisconnect = () => {
    console.log('Disconnect button clicked - demo mode');
    // Do nothing in demo mode
  };

  // Demo function - does nothing when clicked
  const handleProfileClick = () => {
    console.log('Profile button clicked - demo mode');
    setIsProfileOpen(false);
    // Do nothing in demo mode
  };

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
            <img className="h-8 w-8 sm:h-10 sm:w-10" src="/image.png" alt="Logo" />
          </a>
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                {item.name}
              </a>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <img src={`https://avatar.vercel.sh/demo.png`} alt="Demo User" className="h-6 w-6 rounded-full" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    Demo User
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button onClick={handleProfileClick} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </button>
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
