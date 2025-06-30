import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Survey form data interface
export interface SurveyFormData {
  location: string;
  householdSize: string;
  children: string;
  workingAdults: string;
  homeHours: string;
}

// API response interface
interface SurveyResponseData {
  id: string;
  user_id: string;
  location: string;
  household_size: number;
  children: number;
  working_adults: number; 
  home_hours: string;
  created_at: string;
  updated_at: string;
}

// Survey state interface
interface SurveyState {
  formData: SurveyFormData;
  hasSubmitted: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: SurveyState = {
  formData: {
    location: '',
    householdSize: '',
    children: '',
    workingAdults: '',
    homeHours: '',
  },
  hasSubmitted: false,
  isLoading: false,
  error: null
};

// Async thunks for survey API operations
export const fetchUserSurvey = createAsyncThunk(
  'survey/fetchUserSurvey',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log(`SurveySlice: Fetching survey for user ${userId}`);
      const response = await api.get(`/survey/user/${userId}`);
      
      if (response.data && response.data.data) {
        const surveyData = response.data.data;
        console.log('SurveySlice: Retrieved survey data:', surveyData);
        
        return surveyData;
      }
      
      return null;
    } catch (error: any) {
      console.error('SurveySlice: Error fetching survey:', error);
      if (error.response && error.response.status === 404) {
        // 404 is expected for users with no survey
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch survey data');
    }
  }
);

export const saveSurvey = createAsyncThunk(
  'survey/saveSurvey',
  async (data: {
    user_id: string;
    location: string;
    household_size: number;
    children: number;
    working_adults: number;
    home_hours: string;
  }, { rejectWithValue }) => {
    try {
      console.log('SurveySlice: Saving survey data:', data);
      const response = await api.post('/survey', data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('SurveySlice: Error saving survey:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to save survey data');
    }
  }
);

// Survey slice
const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Partial<SurveyFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.hasSubmitted = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user survey
      .addCase(fetchUserSurvey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSurvey.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload) {
          const surveyData = action.payload as SurveyResponseData;
          
          state.formData = {
            location: surveyData.location || '',
            householdSize: surveyData.household_size ? String(surveyData.household_size) : '',
            children: surveyData.children ? String(surveyData.children) : '',
            workingAdults: surveyData.working_adults ? String(surveyData.working_adults) : '',
            homeHours: surveyData.home_hours || '',
          };
          
          state.hasSubmitted = true;
        }
      })
      .addCase(fetchUserSurvey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Save survey
      .addCase(saveSurvey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveSurvey.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload) {
          const surveyData = action.payload as SurveyResponseData;
          
          state.formData = {
            location: surveyData.location || '',
            householdSize: surveyData.household_size ? String(surveyData.household_size) : '',
            children: surveyData.children ? String(surveyData.children) : '',
            workingAdults: surveyData.working_adults ? String(surveyData.working_adults) : '',
            homeHours: surveyData.home_hours || '',
          };
          
          state.hasSubmitted = true;
        }
      })
      .addCase(saveSurvey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { updateFormData, resetForm, clearError } = surveySlice.actions;

export default surveySlice.reducer; 