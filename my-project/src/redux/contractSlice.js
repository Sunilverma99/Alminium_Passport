import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  userAddress: null,
  isConnected: false,
  isLoading: false,
  error: null,
  manuallyDisconnected: false, // Flag to prevent auto-reconnection
};

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
      console.log('Wallet connected:', userAddress);
      
      return { userAddress };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
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
    },
    resetDisconnectFlag: (state) => {
      state.manuallyDisconnected = false;
    },
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
      })
      .addCase(initializeContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.isConnected = false;
      });
  }
});

export const { setUserAddress, setConnectionStatus, clearError, disconnectWallet, resetDisconnectFlag } = contractSlice.actions;
export default contractSlice.reducer; 