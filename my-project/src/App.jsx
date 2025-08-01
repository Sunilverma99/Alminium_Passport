import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Header from './pages/Header';
import Footer from './pages/Footer';

import GetPassport from './pages/GetBatteryById';
import GetPassportStandalone from './pages/GetPassportStandalone';
import Products from './pages/Product';
import Fastfact from './pages/Fast-fact';
import Contact from "./pages/Contact";
import NewspaperSubscription from './pages/NewsLetter';
import Resources from './pages/Resources';
import CreateBatteryPassport from './pages/Manufacturer/CreateBatteryPassport';
import UpdateBatteryPassport from './pages/Manufacturer/UpdateBatteryPassport';
import ScrollToTop from './components/ScrollToTop';
import AluminumPassport from './pages/AluminumPassport';

import UpdateStatus from './pages/Government/UpdateStatus';
import RevokeCredential from './pages/Government/RevokeCredential';
import VerifyCredential from './pages/Government/VerifyCredential';
import CheckDIDVerification from './pages/Government/IsDidVerified';
import UpdateCarbonFootprint from './pages/Manufacturer/UpdateCarbonFootprint';
import BatteryPassportTransferOwnership from './pages/Manufacturer/BatteryPassportTrasferOwnership';
import CreateBatteryPassportBatch from './pages/Manufacturer/CreateBatteryPassportBatch';
import MaterialCompostion from './pages/Query/MaterialCompostion';
import Profile from './pages/Profile';
import TenantDashboard from './pages/Tenant/TenantDashboard';
import TenantHome from './pages/Tenant/Home';
import OrganizationMembers from './pages/Tenant/OrganizationMembers';
import TenantAnalytics from './pages/Tenant/TenantAnalytics';
import SupplierHomePage from './pages/Supplier/SupplierHomePage';
import SupplierBatteryManagement from './pages/Supplier/SupplierBatteryManagement';
import SupplierMaterialUpdates from './pages/Supplier/SupplierMaterialUpdates';
import SupplierDueDiligence from './pages/Supplier/SupplierDueDiligence';
import SupplierQueryDueDiligence from './pages/Supplier/SupplierQueryDueDiligence';
import SupplierQueryMaterialComposition from './pages/Supplier/SupplierQueryMaterialComposition';
import SupplierReports from './pages/Supplier/SupplierReports';
import SupplierAnalytics from './pages/Supplier/SupplierAnalytics';
import SupplierHistory from './pages/Supplier/SupplierHistory';
import SupplierSettings from './pages/Supplier/SupplierSettings';
import RecyclerDashboard from './pages/Recycler/RecyclerDashboard';
import RecyclerQueryMaterialComposition from './pages/Recycler/RecyclerQueryMaterialComposition';
import RecyclerUpdateLifecycleStatus from './pages/Recycler/RecyclerUpdateLifecycleStatus';
import RecyclerReportDiscrepancies from './pages/Recycler/RecyclerReportDiscrepancies';
import RecyclerViewPassports from './pages/Recycler/RecyclerViewPassports';
import MinerHomePage from './pages/Miner/MinerHomePage';
import MinerUpdateMaterialComposition from './pages/Miner/MinerUpdateMaterialComposition';

import MinerViewPassports from './pages/Miner/MinerViewPassports';
import MinerMaterialTracking from './pages/Miner/MinerMaterialTracking';
import MinerMiningReports from './pages/Miner/MinerMiningReports';
import RoleChecker from './components/RoleChecker';
import PendingDIDRegistrations from './pages/Government/PendingDIDRegistrations';
import GovernmentDashboard from './pages/Government/GovernmentDashboard';
import ManufacturerDashboard from './components/ManufacturerDashboard';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRoles, fallback = <Home /> }) => {
  const { roles, isConnected } = useSelector((state) => state.contract);
  const { manufacturer = false, government = false, supplier = false, tenantAdmin = false, recycler = false, miner = false } = roles || {};
  
  if (!isConnected) {
    return fallback;
  }

  const hasRequiredRole = requiredRoles.some(role => {
    switch (role) {
      case 'manufacturer': return manufacturer;
      case 'government': return government;
      case 'supplier': return supplier;
      case 'tenantAdmin': return tenantAdmin;
      case 'recycler': return recycler;
      case 'miner': return miner;
      default: return false;
    }
  });

  return hasRequiredRole ? element : fallback;
};

// Layout Component that renders header without sidebar
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current route is the standalone passport route
  const isStandalonePassport = location.pathname.startsWith('/get-passport/');
  
  // If it's the standalone passport route, don't render header
  if (isStandalonePassport) {
    return <>{children}</>;
  }
  
  // Otherwise, render the normal layout with header only
  return (
    <>
      <Header />
      <div className="flex-1 min-h-screen overflow-y-auto">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default function App() {
  const { roles, isConnected } = useSelector((state) => state.contract);
  console.log(roles);
  const { manufacturer = false, government = false, supplier = false, tenantAdmin = false, recycler = false, miner = false } = roles || {};
  console.log(manufacturer, government, supplier, tenantAdmin, recycler, miner);
  const isDisconnected = !isConnected;

  return (
    <BrowserRouter>
      <RoleChecker />
      <ScrollToTop />
      
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/battery-passport/:id" element={<GetPassport />} />
          <Route path="/get-passport" element={<GetPassport />} />
          <Route path="/get-passport/:tokenId" element={<GetPassportStandalone />} />
          <Route path="/aluminum-passport" element={<AluminumPassport />} />
          <Route path="/product" element={<Products />} />
          <Route path="/fast-facts" element={<Fastfact />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/newsletter" element={<NewspaperSubscription />} />
          <Route path="/resources" element={<Resources />} />
           
            {/* Manufacturer Routes - Always rendered but protected */}
            <Route path="/create-passport" element={
              <ProtectedRoute 
                element={<CreateBatteryPassport />} 
                requiredRoles={['manufacturer']} 
              />
            } />
            <Route path="/create-passport-batch" element={
              <ProtectedRoute 
                element={<CreateBatteryPassportBatch />} 
                requiredRoles={['manufacturer']} 
              />
            } />
            <Route path="/update-passport" element={
              <ProtectedRoute 
                element={<UpdateBatteryPassport />} 
                requiredRoles={['manufacturer']} 
              />
            } />
            <Route path="/manfacturer/update/carbon-footprint" element={
              <ProtectedRoute 
                element={<UpdateCarbonFootprint />} 
                requiredRoles={['manufacturer']} 
              />
            } />
            <Route path="/manfacturer/transfer-Ownership" element={
              <ProtectedRoute 
                element={<BatteryPassportTransferOwnership />} 
                requiredRoles={['manufacturer']} 
              />
            } />
            <Route path="/profile" element={
              <ProtectedRoute 
                element={<Profile />} 
                requiredRoles={['manufacturer', 'supplier', 'tenantAdmin', 'recycler', 'miner']} 
              />
            } />
            {/* Manufacturer Dashboard Route */}
            <Route path="/manufacturer/dashboard" element={
              <ProtectedRoute 
                element={<ManufacturerDashboard />} 
                requiredRoles={['manufacturer']} 
              />
            } />

            {/* Government Routes - Always rendered but protected */}
            <Route path="/battery/update-status" element={
              <ProtectedRoute 
                element={<UpdateStatus />} 
                requiredRoles={['government', 'supplier']} 
              />
            } />
            <Route path="/credentials/revoke" element={
              <ProtectedRoute 
                element={<RevokeCredential />} 
                requiredRoles={['government']} 
              />
            } />
            <Route path="/credentials/verify" element={
              <ProtectedRoute 
                element={<VerifyCredential />} 
                requiredRoles={['government']} 
              />
            } />
            <Route path="/Did/is-verified" element={
              <ProtectedRoute 
                element={<CheckDIDVerification />} 
                requiredRoles={['government']} 
              />
            } />
            <Route path="/goverment/query/material-composition" element={
              <ProtectedRoute 
                element={<MaterialCompostion />} 
                requiredRoles={['government']} 
              />
            } />
            <Route path="/government/pending-dids" element={
              <ProtectedRoute 
                element={<PendingDIDRegistrations />} 
                requiredRoles={['government']} 
              />
            } />
            <Route path="/government/dashboard" element={
              <ProtectedRoute 
                element={<GovernmentDashboard />} 
                requiredRoles={['government']} 
              />
            } />

            {/* Tenant Admin Routes - Always rendered but protected */}
            <Route path="/tenant/home" element={
              <ProtectedRoute 
                element={<TenantHome />} 
                requiredRoles={['tenantAdmin']} 
              />
            } />
            <Route path="/tenant" element={
              <ProtectedRoute 
                element={<TenantDashboard />} 
                requiredRoles={['tenantAdmin']} 
              />
            } />
            <Route path="/tenant/members" element={
              <ProtectedRoute 
                element={<OrganizationMembers />} 
                requiredRoles={['tenantAdmin']} 
              />
            } />
            <Route path="/tenant/analytics" element={
              <ProtectedRoute 
                element={<TenantAnalytics />} 
                requiredRoles={['tenantAdmin']} 
              />
            } />

            {/* Supplier Routes - Always rendered but protected */}
            <Route path="/supplier" element={
              <ProtectedRoute 
                element={<SupplierHomePage />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/batteries" element={
              <ProtectedRoute 
                element={<SupplierBatteryManagement />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/updates" element={
              <ProtectedRoute 
                element={<SupplierMaterialUpdates />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/due-diligence" element={
              <ProtectedRoute 
                element={<SupplierDueDiligence />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/query-due-diligence" element={
              <ProtectedRoute 
                element={<SupplierQueryDueDiligence />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/query-material-composition" element={
              <ProtectedRoute 
                element={<SupplierQueryMaterialComposition />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/reports" element={
              <ProtectedRoute 
                element={<SupplierReports />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/analytics" element={
              <ProtectedRoute 
                element={<SupplierAnalytics />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/history" element={
              <ProtectedRoute 
                element={<SupplierHistory />} 
                requiredRoles={['supplier']} 
              />
            } />
            <Route path="/supplier/settings" element={
              <ProtectedRoute 
                element={<SupplierSettings />} 
                requiredRoles={['supplier']} 
              />
            } />

            {/* Recycler Routes - Always rendered but protected */}
            <Route path="/recycler" element={
              <ProtectedRoute 
                element={<RecyclerDashboard />} 
                requiredRoles={['recycler']} 
              />
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute 
                element={<RecyclerDashboard />} 
                requiredRoles={['recycler']} 
              />
            } />
            <Route path="/recycler/query-material-composition" element={
              <ProtectedRoute 
                element={<RecyclerQueryMaterialComposition />} 
                requiredRoles={['recycler']} 
              />
            } />
            <Route path="/recycler/update-lifecycle-status" element={
              <ProtectedRoute 
                element={<RecyclerUpdateLifecycleStatus />} 
                requiredRoles={['recycler']} 
              />
            } />
            <Route path="/recycler/report-discrepancies" element={
              <ProtectedRoute 
                element={<RecyclerReportDiscrepancies />} 
                requiredRoles={['recycler']} 
              />
            } />
           
            <Route path="/recycler/view-passports" element={
              <ProtectedRoute 
                element={<GetPassport />} 
                requiredRoles={['recycler']} 
              />
            } />

            {/* Miner Routes - Always rendered but protected */}
            <Route path="/miner" element={
              <ProtectedRoute 
                element={<MinerHomePage />} 
                requiredRoles={['miner']} 
              />
            } />
            <Route path="/miner/update-material-composition" element={
              <ProtectedRoute 
                element={<MinerUpdateMaterialComposition />} 
                requiredRoles={['miner']} 
              />
            } />

            <Route path="/miner/view-passports" element={
              <ProtectedRoute 
                element={<GetPassport />} 
                requiredRoles={['miner']} 
              />
            } />

           
           

            {/* Catch-All Route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    );
  }
