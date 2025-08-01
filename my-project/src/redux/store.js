import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from 'redux';

// Import all slices
import contractReducer from './contractSlice';
import batteryReducer from './battery/batterySlice';
import organizationReducer from './organization/organizationSlice';

// Configure persist settings
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['contract'], // Only persist contract state (user connection, roles)
};

// Combine reducers
const rootReducer = combineReducers({
  contract: contractReducer,
  battery: batteryReducer,
  organization: organizationReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Fix: Add middleware config to ignore redux-persist actions
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist non-serializable actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
const persistor = persistStore(store);

// Export store and persistor
export { store, persistor };
