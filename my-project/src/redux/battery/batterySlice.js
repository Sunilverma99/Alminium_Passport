import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

// Async thunks for battery operations
export const fetchSupplierBatteries = createAsyncThunk(
  'battery/fetchSupplierBatteries',
  async (supplierAddress) => {
    const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/supplier/${supplierAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supplier batteries');
    }

    const data = await response.json();
    return data.batteries;
  }
);

export const fetchBatteryDetails = createAsyncThunk(
  'battery/fetchBatteryDetails',
  async (batteryId) => {
    const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/${batteryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Battery not found');
    }

    const data = await response.json();
    return data.battery;
  }
);

export const updateBatteryData = createAsyncThunk(
  'battery/updateBatteryData',
  async (batteryData) => {
    const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batteryData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update battery data');
    }

    const data = await response.json();
    return data.battery;
  }
);

export const fetchSupplierStats = createAsyncThunk(
  'battery/fetchSupplierStats',
  async (supplierAddress) => {
    const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/supplier/stats/${supplierAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supplier stats');
    }

    const data = await response.json();
    return data;
  }
);

export const createBatteryPassport = createAsyncThunk(
  'battery/createBatteryPassport',
  async (batteryData) => {
    const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batteryData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create battery passport');
    }

    const data = await response.json();
    return data.battery;
  }
);

const initialState = {
  // Battery data
  batteries: [],
  currentBattery: null,
  
  // Statistics
  stats: {
    totalBatteries: 0,
    updatedToday: 0,
    pendingUpdates: 0,
    verifiedBatteries: 0
  },
  
  // Loading states
  loading: false,
  updating: false,
  creating: false,
  
  // Error handling
  error: null,
  
  // Form data
  formData: {
    batteryId: '',
    materialComposition: '',
    dueDiligenceHash: '',
    supplierNotes: ''
  }
};

const batterySlice = createSlice({
  name: 'battery',
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    resetFormData: (state) => {
      state.formData = {
        batteryId: '',
        materialComposition: '',
        dueDiligenceHash: '',
        supplierNotes: ''
      };
    },
    
    setCurrentBattery: (state, action) => {
      state.currentBattery = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearBatteries: (state) => {
      state.batteries = [];
      state.currentBattery = null;
      state.stats = {
        totalBatteries: 0,
        updatedToday: 0,
        pendingUpdates: 0,
        verifiedBatteries: 0
      };
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch supplier batteries
      .addCase(fetchSupplierBatteries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierBatteries.fulfilled, (state, action) => {
        state.loading = false;
        state.batteries = action.payload;
      })
      .addCase(fetchSupplierBatteries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch battery details
      .addCase(fetchBatteryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatteryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattery = action.payload;
      })
      .addCase(fetchBatteryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update battery data
      .addCase(updateBatteryData.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBatteryData.fulfilled, (state, action) => {
        state.updating = false;
        // Update the battery in the list
        const index = state.batteries.findIndex(b => b.batteryId === action.payload.batteryId);
        if (index !== -1) {
          state.batteries[index] = action.payload;
        }
        state.currentBattery = action.payload;
      })
      .addCase(updateBatteryData.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })
      
      // Fetch supplier stats
      .addCase(fetchSupplierStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSupplierStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create battery passport
      .addCase(createBatteryPassport.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBatteryPassport.fulfilled, (state, action) => {
        state.creating = false;
        state.batteries.push(action.payload);
      })
      .addCase(createBatteryPassport.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message;
      });
  }
});

export const {
  setFormData,
  resetFormData,
  setCurrentBattery,
  clearError,
  clearBatteries
} = batterySlice.actions;

export default batterySlice.reducer; 