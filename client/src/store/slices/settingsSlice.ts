import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Supported languages
export type SupportedLanguage = 'en' | 'tr';

// Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: SupportedLanguage;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: 'daily' | 'weekly' | 'monthly';
    showCost: boolean;
    showConsumption: boolean;
    showComparison: boolean;
  };
  currency: 'USD' | 'EUR' | 'TRY' | 'GBP';
  energyUnit: 'kWh' | 'MWh' | 'J';
}

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

// API base URL
const API_URL = 'http://localhost:5000/api';

// Configure axios for session-based auth
const axiosConfig = {
  withCredentials: true
};

// Default settings
const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  dashboard: {
    defaultView: 'monthly',
    showCost: true,
    showConsumption: true,
    showComparison: true
  },
  currency: 'USD',
  energyUnit: 'kWh'
};

// Get initial theme from localStorage or system preference
const getInitialTheme = (): 'light' | 'dark' | 'system' => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  return 'system';
};

// Get initial language from localStorage or browser
const getInitialLanguage = (): SupportedLanguage => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && ['en', 'tr'].includes(savedLanguage)) {
    return savedLanguage as SupportedLanguage;
  }
  
  // Get browser language (first 2 chars)
  const browserLang = navigator.language.split('-')[0];
  
  // Check if browser language is supported, otherwise default to English
  return ['en', 'tr'].includes(browserLang) 
    ? browserLang as SupportedLanguage 
    : 'en';
};

// Async thunks
export const fetchUserSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/settings`, axiosConfig);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user settings');
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'settings/update',
  async (settingsData: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/users/settings`, settingsData, axiosConfig);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user settings');
    }
  }
);

// Initial state
const initialState: SettingsState = {
  settings: {
    theme: getInitialTheme(),
    language: getInitialLanguage(),
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      defaultView: 'monthly',
      showCost: true,
      showConsumption: true,
      showComparison: true
    },
    currency: 'TRY',
    energyUnit: 'kWh'
  },
  isLoading: false,
  error: null
};

// Slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.settings.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.settings.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.settings.currency = action.payload as 'USD' | 'EUR' | 'TRY' | 'GBP';
    },
    setMeasurementUnit: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.settings.energyUnit = action.payload === 'metric' ? 'kWh' : 'MWh';
    },
    setNotificationSettings: (state, action: PayloadAction<{ type: 'email' | 'push' | 'sms'; value: boolean }>) => {
      state.settings.notifications[action.payload.type] = action.payload.value;
    },
    resetSettings: (state) => {
      state.settings.theme = 'system';
      state.settings.language = 'en';
      state.settings.currency = 'TRY';
      state.settings.energyUnit = 'kWh';
      state.settings.notifications = {
        email: true,
        push: true,
        sms: false
      };
      
      // Clear localStorage settings
      localStorage.removeItem('theme');
      localStorage.removeItem('language');
    }
  },
  extraReducers: (builder) => {
    // Fetch user settings
    builder.addCase(fetchUserSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserSettings.fulfilled, (state, action: PayloadAction<UserSettings>) => {
      state.isLoading = false;
      state.settings = action.payload;
      // Update localStorage
      localStorage.setItem('theme', action.payload.theme);
      localStorage.setItem('language', action.payload.language);
    });
    builder.addCase(fetchUserSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      // If we can't fetch settings, use defaults from localStorage or fallback to defaults
      state.settings.theme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || defaultSettings.theme;
      state.settings.language = localStorage.getItem('language') as 'en' | 'tr' || defaultSettings.language;
    });

    // Update user settings
    builder.addCase(updateUserSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserSettings.fulfilled, (state, action: PayloadAction<UserSettings>) => {
      state.isLoading = false;
      state.settings = action.payload;
      // Update localStorage
      localStorage.setItem('theme', action.payload.theme);
      localStorage.setItem('language', action.payload.language);
    });
    builder.addCase(updateUserSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { 
  clearSettingsError, 
  setTheme, 
  setLanguage, 
  setCurrency, 
  setMeasurementUnit, 
  setNotificationSettings,
  resetSettings
} = settingsSlice.actions;

export default settingsSlice.reducer; 