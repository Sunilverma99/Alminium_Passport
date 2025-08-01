import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  organizations: [],
  selectedOrganization: null,
  loading: false,
  error: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganizations(state, action) {
      state.organizations = action.payload;
    },
    setSelectedOrganization(state, action) {
      state.selectedOrganization = action.payload;
    },
    setOrganizationLoading(state, action) {
      state.loading = action.payload;
    },
    setOrganizationError(state, action) {
      state.error = action.payload;
    },
    clearOrganizationError(state) {
      state.error = null;
    },
  },
});

export const {
  setOrganizations,
  setSelectedOrganization,
  setOrganizationLoading,
  setOrganizationError,
  clearOrganizationError,
} = organizationSlice.actions;

export default organizationSlice.reducer; 