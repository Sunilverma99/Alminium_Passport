import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  FaPlus,
  FaMinus,
  FaHome,
  FaCheckCircle,
  FaUserShield,
  FaBan,
  FaIdBadge,
  FaTruck,
  FaCog,
  FaCubes,
  FaUsers,
  FaRecycle,
  FaTools,
  FaUser,
  FaBuilding,
  FaSearch,
  FaFileAlt,
  FaLeaf,
  FaInfoCircle,
  FaEye,
  FaExclamationTriangle,
  FaChartBar,
  FaHistory,
  FaUpload,
  FaShieldAlt,
  FaChartLine,
  FaCog as FaSettings,
  FaBatteryHalf,
  FaIndustry,
  FaWarehouse,
  FaRecycle as FaRecycleIcon,
  FaMountain,
  FaUserTie
} from "react-icons/fa";

const Sidebar = () => {
  const {
    userAddress,
    isConnected,
    roles,
  } = useSelector((state) => state.contract);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected) return null;

  const getSidebarItems = () => {
    let items = [];

    if (roles?.supplier) {
      items = [
        { name: "Supplier Dashboard", path: "/supplier", icon: FaWarehouse, color: "from-blue-500 to-blue-600" },
        { name: "Material Updates", path: "/supplier/updates", icon: FaUpload, color: "from-green-500 to-green-600" },
        { name: "Query Due Diligence", path: "/supplier/query-due-diligence", icon: FaSearch, color: "from-purple-500 to-purple-600" },
        { name: "Query Material Composition", path: "/supplier/query-material-composition", icon: FaSearch, color: "from-indigo-500 to-indigo-600" }
      ];
      return items;
    }

    // Add Home for all roles except recycler and miner
    if (!roles?.recycler && !roles?.miner) {
      items.push({ name: "Home", path: "/dashboard", icon: FaHome, color: "from-gray-500 to-gray-600" });
    }

    if (roles?.government) {
      items.push(
        { name: "Government Dashboard", path: "/government/dashboard", icon: FaChartBar, color: "from-red-500 to-red-600" },
        { name: "Update Battery Status", path: "/battery/update-status", icon: FaCheckCircle, color: "from-green-500 to-green-600" },
        { name: "Verify Credential", path: "/credentials/verify", icon: FaUserShield, color: "from-blue-500 to-blue-600" },
        { name: "Revoke Credential", path: "/credentials/revoke", icon: FaBan, color: "from-red-500 to-red-600" },
        { name: "Check DID Verified", path: "/Did/is-verified", icon: FaIdBadge, color: "from-purple-500 to-purple-600" },
        { name: "Query Battery Material Composition", path: "/goverment/query/material-composition", icon: FaCheckCircle, color: "from-indigo-500 to-indigo-600" },
        { name: "Pending DID Registrations", path: "/government/pending-dids", icon: FaHistory, color: "from-orange-500 to-orange-600" },
      );
    }
    if (roles?.tenantAdmin) {
      items.push(
        { name: "Dashboard", path: "/tenant", icon: FaChartBar, color: "from-blue-500 to-blue-600" },
        { name: "Analytics", path: "/tenant/analytics", icon: FaChartLine, color: "from-purple-500 to-purple-600" },
        { name: "Organization Members", path: "/tenant/members", icon: FaUsers, color: "from-green-500 to-green-600" },
      );
    }
    if (roles?.manufacturer) {
      items.push(
        { name: "Manufacturer Dashboard", path: "/manufacturer/dashboard", icon: FaChartBar, color: "from-blue-500 to-blue-600" },
        { name: "Create Battery Passport", path: "/create-passport", icon: FaBatteryHalf, color: "from-green-500 to-green-600" },
        { name: "Update Battery passport", path: "/update-passport", icon: FaCubes, color: "from-purple-500 to-purple-600" },
        { name: "Update Carbon Footprint", path: "/manfacturer/update/carbon-footprint", icon: FaLeaf, color: "from-emerald-500 to-emerald-600" },
        { name: "Create Battery Passport Batch", path: "/create-passport-batch", icon: FaCheckCircle, color: "from-indigo-500 to-indigo-600" },
        { name: "Transfer Ownership", path: "/manfacturer/transfer-Ownership", icon: FaUserShield, color: "from-orange-500 to-orange-600" },
      );
    }
    if (roles?.thirdParty) {
      items.push({ name: "Third-Party Services", path: "/third-party/services", icon: FaUsers, color: "from-gray-500 to-gray-600" });
    }
    if (roles?.recycler) {
      items.push(
        { name: "Query Material Composition", path: "/recycler/query-material-composition", icon: FaSearch, color: "from-blue-500 to-blue-600" },
        { name: "Update Lifecycle Status", path: "/recycler/update-lifecycle-status", icon: FaRecycleIcon, color: "from-green-500 to-green-600" },
        { name: "View Battery Passports", path: "/recycler/view-passports", icon: FaEye, color: "from-purple-500 to-purple-600" },
        { name: "Recycling Operations Dashboard", path: "/dashboard", icon: FaTools, color: "from-orange-500 to-orange-600" },
      );
    }
    if (roles?.miner) {
      items.push(
        { name: "Miner Dashboard", path: "/miner", icon: FaChartBar, color: "from-amber-500 to-amber-600" },
        { name: "Update Material Composition", path: "/miner/update-material-composition", icon: FaMountain, color: "from-green-500 to-green-600" },
        { name: "View Battery Passports", path: "/miner/view-passports", icon: FaEye, color: "from-blue-500 to-blue-600" },
      );
    }

    // If no specific roles are detected, show a message
    if (items.length === 1) {
      items.push({ 
        name: "No roles detected", 
        path: "#", 
        icon: FaUser,
        color: "from-gray-400 to-gray-500",
        disabled: true 
      });
    }
    
    return items;
  };

  const getRoleDisplayName = () => {
    if (roles?.government) return "Government Official";
    if (roles?.tenantAdmin) return "Tenant Admin";
    if (roles?.manufacturer) return "Manufacturer";
    if (roles?.supplier) return "Supplier";
    if (roles?.recycler) return "Recycler";
    if (roles?.miner) return "Miner";
    if (roles?.thirdParty) return "Third Party";
    return "User";
  };

  const getRoleIcon = () => {
    if (roles?.government) return FaUserShield;
    if (roles?.tenantAdmin) return FaUserTie;
    if (roles?.manufacturer) return FaIndustry;
    if (roles?.supplier) return FaWarehouse;
    if (roles?.recycler) return FaRecycleIcon;
    if (roles?.miner) return FaMountain;
    if (roles?.thirdParty) return FaUsers;
    return FaUser;
  };

  const getRoleColor = () => {
    if (roles?.government) return "from-red-500 to-red-600";
    if (roles?.tenantAdmin) return "from-blue-500 to-blue-600";
    if (roles?.manufacturer) return "from-green-500 to-green-600";
    if (roles?.supplier) return "from-purple-500 to-purple-600";
    if (roles?.recycler) return "from-emerald-500 to-emerald-600";
    if (roles?.miner) return "from-amber-500 to-amber-600";
    if (roles?.thirdParty) return "from-gray-500 to-gray-600";
    return "from-gray-400 to-gray-500";
  };

  return (
    <>
      {/* Mobile Sidebar - Show Only Icons */}
      <div className="md:hidden fixed top-16 left-0 w-16 z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center py-5 shadow-xl">
        {getSidebarItems().map((item, index) => (
          <button key={index} className="mb-6 text-gray-300 hover:text-white transition-colors duration-200" onClick={() => setIsOpen(true)}>
            <item.icon size={20} />
          </button>
        ))}
      </div>

      {/* Floating Toggle Button */}
      <button
        className="md:hidden fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-lg focus:outline-none hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaMinus size={20} /> : <FaPlus size={20} />}
      </button>

      {/* Full Sidebar */}
      <div className={`fixed top-16 pt-16 left-0 w-56 h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-6 shadow-2xl border-r border-gray-200 transition-transform duration-300 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block z-40`}>
        
        {/* Header */}
       

        {/* User Role Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-r ${getRoleColor()} rounded-lg shadow-sm`}>
              {React.createElement(getRoleIcon(), { size: 16, className: "text-white" })}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{getRoleDisplayName()}</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="h-[calc(100vh-280px)] overflow-y-auto">
          <div className="space-y-2">
            {getSidebarItems().map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={index}>
                  {item.disabled ? (
                    <div className="flex items-center gap-3 p-3 text-gray-400 cursor-not-allowed bg-gray-100 rounded-xl">
                      <div className={`p-2 bg-gradient-to-r ${item.color} rounded-lg opacity-50`}>
                        <item.icon size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`p-2 rounded-lg shadow-sm transition-all duration-200 ${
                        isActive 
                          ? 'bg-white bg-opacity-20' 
                          : `bg-gradient-to-r ${item.color} group-hover:shadow-md`
                      }`}>
                        <item.icon size={16} className={isActive ? "text-white" : "text-white"} />
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Section */}
        {roles && !roles.government && (roles.manufacturer || roles.supplier || roles.tenantAdmin || roles.recycler || roles.miner) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-xl transition-all duration-200 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                <FaUser size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Profile Settings</span>
            </Link>
          </div>
        )}
      </div>
   
      {/* Background Overlay on Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
