import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage kullanımı
import { combineReducers } from 'redux';
import authReducer, { fetchUserProfile } from './slices/authSlice';
import deviceReducer from './slices/deviceSlice';
import consumptionReducer from './slices/consumptionSlice';
import invoiceReducer from './slices/invoiceSlice';
import suggestionReducer from './slices/suggestionSlice';
import settingsReducer from './slices/settingsSlice';
import dashboardReducer from './slices/dashboardSlice';
import surveyReducer from './slices/surveySlice';

// Persist konfigürasyonu
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'survey'], // Auth ve survey durumlarını kalıcı hale getiriyoruz
};

// Tüm reducerları birleştirelim
const rootReducer = combineReducers({
  auth: authReducer,
  devices: deviceReducer,
  consumption: consumptionReducer,
  invoices: invoiceReducer,
  suggestions: suggestionReducer,
  settings: settingsReducer,
  dashboard: dashboardReducer,
  survey: surveyReducer
});

// Persistant reducer oluşturalım
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persist store oluşturalım
export const persistor = persistStore(store);

// Uygulama başlangıcında kullanıcı bilgilerini getir (session varsa)
store.dispatch(fetchUserProfile());

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 