import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
// Import mock services
import mockAuthService, { mockUpdateProfile } from '../../services/mockAuthService';

// Configuration flag for using mock services
// In a real app, this might be controlled by environment variables
const USE_MOCK_SERVICES = false;

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string; // admin, standard, energy_consultant
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  preferred_language?: string;
  theme_preference?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  profile_picture?: string | null;
  notification_settings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    monthlyReports: boolean;
    savingsTips: boolean;
  };
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// API base URL
const API_URL = 'http://localhost:5000/api/auth';

// Configure axios defaults
axios.defaults.withCredentials = true; // Enable credentials for all requests

// Add more axios configurations to handle session cookies properly
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      let user;
      
      if (USE_MOCK_SERVICES) {
        // Use mock service
        const result = await mockAuthService.login(credentials);
        user = result.user;
      } else {
        // Use real API
        const response = await axios.post(`${API_URL}/login`, {
          email: credentials.email,
          password: credentials.password
        });
        user = response.data.data.user;
      }
      
      return { user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      let user;
      
      if (USE_MOCK_SERVICES) {
        // Use mock service
        const result = await mockAuthService.register(userData);
        user = result.user;
      } else {
        // Use real API
        const response = await axios.post(`${API_URL}/register`, userData);
        user = response.data.data.user;
      }
      
      return { user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Use mock service
        await mockAuthService.logout();
      } else {
        // Use real API
        await axios.post(`${API_URL}/logout`);
      }
      
      return {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      let user;
      
      if (USE_MOCK_SERVICES) {
        // Use mock service
        const result = await mockAuthService.fetchUserProfile();
        user = result;
      } else {
        // Use real API
        const response = await axios.get(`${API_URL}/profile`);
        user = response.data.data.user;
      }
      
      return { user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      let updatedUser;
      
      if (USE_MOCK_SERVICES) {
        // Use mock service
        updatedUser = await mockUpdateProfile(profileData);
      } else {
        // Use real API
        const response = await axios.put(`${API_URL}/profile`, profileData);
        
        // Extract user data from response using correct path
        updatedUser = response.data.data.user;
      }
      
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 