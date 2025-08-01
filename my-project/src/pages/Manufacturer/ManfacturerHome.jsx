import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Battery, RefreshCw, PlusCircle, ChevronRight, LayoutGrid } from 'lucide-react';

export default function ManufacturerHome() {
  const navigate = useNavigate();
  const { roles, isConnected, userAddress } = useSelector((state) => state.contract);

  const handleUpdatePassport = () => {
    navigate('/update-passport');
  };

  return (
    <div className="min-h-screen bg-white relative">

      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 ] "
        style={{ maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)' }}
      />

      <div className="relative container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 text-transparent bg-clip-text">
            Revolutionizing Industries
          </h1>
          <p className="text-xl text-gray-400">
            Your Gateway to Smarter Manufacturing, Sustainability, and Growth
          </p>
        </header>

        <div className="grid  gap-12">
          {/* Left Column - Objective */}
          <div className="space-y-8">
            
            <div className="grid sm:grid-cols-2 gap-6">
              <Link
                to="/create-passport"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all block"
              >
                <div className="flex items-center mb-4">
                  <Battery className="w-8 h-8 text-white mr-3" />
                  <h3 className="text-xl font-semibold text-white">Create Passport</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Generate new battery passport with detailed specifications</p>
                <div className="flex items-center text-white text-sm">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <button
                onClick={handleUpdatePassport}
                className="group bg-[#111132] p-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all border border-blue-900/30"
              >
                <div className="flex items-center mb-4">
                  <RefreshCw className="w-8 h-8 text-blue-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Update Data</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Modify existing passport information</p>
                <div className="flex items-center text-blue-400 text-sm">
                  <span>Update Now</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}

