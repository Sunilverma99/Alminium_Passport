import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Web3 from 'web3';
import EVBatteryPassportCoreABI from '../../abis/EVBatteryPassportCore.sol/EVBatteryPassportCore.json';
import { getContractAddress } from '../config/contracts';

const initialState = {
  evContract: null,
  userAddress: null,
  isConnected: false,
  isLoading: false,
  error: null,
  manuallyDisconnected: false, // Flag to prevent auto-reconnection
  roles: {
    government: false,
    globalAuditor: false,
    tenantAdmin: false,
    manufacturer: false,
    supplier: false,
    recycler: false,
    thirdParty: false,
    miner: false
  }
};

// Store Web3 instance outside of Redux to avoid serialization issues
let web3Instance = null;
let contractInstance = null;

export const initializeContract = createAsyncThunk(
  'contract/initializeContract',
  async (_, { dispatch }) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];
      
      // Initialize Web3 instance
      web3Instance = new Web3(window.ethereum);
      
      // Get the current network
      const networkId = await web3Instance.eth.net.getId();
      console.log('Connected to network ID:', networkId);
      
      // Get contract address for current network
      const contractAddress = getContractAddress('EVBatteryPassportCore', networkId);
      console.log('Using contract address:', contractAddress);
      
      // Initialize contract instance
      contractInstance = new web3Instance.eth.Contract(EVBatteryPassportCoreABI.abi, contractAddress);
      
      // Test if contract is accessible
      try {
        await contractInstance.methods.GOVERNMENT_ROLE().call();
        console.log('Contract is accessible');
      } catch (contractError) {
        console.warn('Contract might not be deployed or accessible:', contractError);
        // Don't throw here, just log the warning
      }
      
      return { userAddress };
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }
);

export const checkUserRoles = createAsyncThunk(
  'contract/checkUserRoles',
  async (userAddress, { getState }) => {
    try {
      if (!contractInstance || !userAddress) {
        console.log('Contract or user address not available, returning default roles');
        return {
          government: false,
          globalAuditor: false,
          tenantAdmin: false,
          manufacturer: false,
          supplier: false,
          recycler: false,
          thirdParty: false,
          miner: false
        };
      }

      console.log('Checking roles for address:', userAddress);
      console.log('Contract instance available:', !!contractInstance);

      // Simplified role checking - check one role at a time to isolate issues
      const roles = {
        government: false,
        globalAuditor: false,
        tenantAdmin: false,
        manufacturer: false,
        supplier: false,
        recycler: false,
        thirdParty: false,
        miner: false
      };

      try {
        // Check GOVERNMENT_ROLE
        const governmentRole = await contractInstance.methods.GOVERNMENT_ROLE().call();
        roles.government = await contractInstance.methods.hasRole(governmentRole, userAddress).call();
        console.log('Government role check completed');
      } catch (error) {
        console.warn('Error checking government role:', error.message);
      }

      try {
        // Check MANUFACTURER_ROLE
        const manufacturerRole = await contractInstance.methods.MANUFACTURER_ROLE().call();
        roles.manufacturer = await contractInstance.methods.hasRole(manufacturerRole, userAddress).call();
        console.log('Manufacturer role check completed');
      } catch (error) {
        console.warn('Error checking manufacturer role:', error.message);
      }

      try {
        // Check SUPPLIER_ROLE
        const supplierRole = await contractInstance.methods.SUPPLIER_ROLE().call();
        roles.supplier = await contractInstance.methods.hasRole(supplierRole, userAddress).call();
        console.log('Supplier role check completed');
      } catch (error) {
        console.warn('Error checking supplier role:', error.message);
      }

      try {
        // Check TENANT_ADMIN_ROLE
        const tenantAdminRole = await contractInstance.methods.TENANT_ADMIN_ROLE().call();
        roles.tenantAdmin = await contractInstance.methods.hasRole(tenantAdminRole, userAddress).call();
        console.log('Tenant Admin role check completed:', roles.tenantAdmin);
        console.log('Tenant Admin role hash:', tenantAdminRole);
      } catch (error) {
        console.warn('Error checking tenant admin role:', error.message);
      }

      try {
        // Check RECYCLER_ROLE
        const recyclerRole = await contractInstance.methods.RECYCLER_ROLE().call();
        roles.recycler = await contractInstance.methods.hasRole(recyclerRole, userAddress).call();
        console.log('Recycler role check completed');
      } catch (error) {
        console.warn('Error checking recycler role:', error.message);
      }

      try {
        // Check MINER_ROLE
        const minerRole = await contractInstance.methods.MINER_ROLE().call();
        roles.miner = await contractInstance.methods.hasRole(minerRole, userAddress).call();
        console.log('Miner role check completed');
      } catch (error) {
        console.warn('Error checking miner role:', error.message);
      }

      try {
        // Check GLOBAL_AUDITOR_ROLE
        const globalAuditorRole = await contractInstance.methods.GLOBAL_AUDITOR_ROLE().call();
        roles.globalAuditor = await contractInstance.methods.hasRole(globalAuditorRole, userAddress).call();
        console.log('Global Auditor role check completed');
      } catch (error) {
        console.warn('Error checking global auditor role:', error.message);
      }

      try {
        // Check THIRD_PARTY_ROLE
        const thirdPartyRole = await contractInstance.methods.THIRD_PARTY_ROLE().call();
        roles.thirdParty = await contractInstance.methods.hasRole(thirdPartyRole, userAddress).call();
        console.log('Third Party role check completed');
      } catch (error) {
        console.warn('Error checking third party role:', error.message);
      }

      console.log('Final user roles:', roles);
      return roles;
    } catch (error) {
      console.error('Error checking user roles:', error);
      // Return default roles instead of throwing
      return {
        government: false,
        globalAuditor: false,
        tenantAdmin: false,
        manufacturer: false,
        supplier: false,
        recycler: false,
        thirdParty: false,
        miner: false
      };
    }
  }
);



const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setUserAddress: (state, action) => {
      state.userAddress = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    disconnectWallet: (state) => {
      state.userAddress = null;
      state.isConnected = false;
      state.manuallyDisconnected = true;
      state.roles = {
        government: false,
        globalAuditor: false,
        tenantAdmin: false,
        manufacturer: false,
        supplier: false,
        recycler: false,
        thirdParty: false,
        miner: false
      };
      // Clear external instances
      web3Instance = null;
      contractInstance = null;
    },
    resetDisconnectFlag: (state) => {
      state.manuallyDisconnected = false;
    },
    updateRoles: (state, action) => {
      state.roles = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userAddress = action.payload.userAddress;
        state.isConnected = true;
        state.evContract = 'initialized'; // Just store a flag instead of the actual contract
      })
      .addCase(initializeContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.isConnected = false;
      })
      .addCase(checkUserRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkUserRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
      })
      .addCase(checkUserRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        // Don't clear roles on error, keep the previous state
      });
  }
});

export const { setUserAddress, setConnectionStatus, clearError, disconnectWallet, resetDisconnectFlag, updateRoles } = contractSlice.actions;
export default contractSlice.reducer; 