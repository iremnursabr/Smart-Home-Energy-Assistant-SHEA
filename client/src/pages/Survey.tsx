import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Container,
  Card,
  CardContent,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import api, { USE_MOCK_SERVICES } from '../services/api';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import { 
  fetchUserSurvey, 
  saveSurvey, 
  updateFormData, 
  resetForm,
  SurveyFormData
} from '../store/slices/surveySlice';

// Configuration flag for using mock services
const SURVEY_API_URL = '/survey';

// Interface for survey data errors
interface SurveyFormErrors {
  location?: string;
  householdSize?: string;
  children?: string;
  workingAdults?: string;
  homeHours?: string;
}

const Survey: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // User ID from Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Get survey data from Redux store
  const { formData, hasSubmitted, isLoading: storeLoading, error: storeError } = useSelector((state: RootState) => state.survey);
  
  // Local state
  const [errors, setErrors] = useState<SurveyFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Check for unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = t('survey.unsavedChanges');
        return t('survey.unsavedChanges');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, t]);
  
  // Fetch survey data on component mount
  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch survey data from Redux store
    console.log('Dispatching fetchUserSurvey for user:', user.id);
    dispatch(fetchUserSurvey(user.id));
  }, [dispatch, user]);
  
  // Display error message if there's an error in the store
  useEffect(() => {
    if (storeError) {
      setErrorMessage(storeError);
    }
  }, [storeError]);
  
  // Validate form field
  const validateField = (name: keyof SurveyFormData, value: string): string | undefined => {
    if (['householdSize', 'children', 'workingAdults'].includes(name)) {
      if (value === '') {
        return t('survey.validationError.required');
      }
      
      const numValue = parseInt(value, 10);
      
      if (isNaN(numValue) || numValue < 0) {
        return t('survey.validationError.positiveNumber');
      }
      
      if (name === 'householdSize' && numValue === 0) {
        return t('survey.validationError.greaterThanZero');
      }

      // Validate working adults cannot be more than household size
      if (name === 'workingAdults') {
        const householdSize = parseInt(formData.householdSize, 10);
        if (!isNaN(householdSize) && numValue > householdSize) {
          return t('survey.validationError.workingAdultsExceedHousehold');
        }
      }

      // Validate children cannot be more than household size
      if (name === 'children') {
        const householdSize = parseInt(formData.householdSize, 10);
        if (!isNaN(householdSize) && numValue > householdSize) {
          return t('survey.validationError.childrenExceedHousehold');
        }
      }

      // Validate total of children and working adults cannot exceed household size
      if (name === 'children' || name === 'workingAdults') {
        const householdSize = parseInt(formData.householdSize, 10);
        const children = parseInt(formData.children, 10);
        const workingAdults = parseInt(formData.workingAdults, 10);
        
        if (!isNaN(householdSize) && !isNaN(children) && !isNaN(workingAdults)) {
          if (children + workingAdults > householdSize) {
            return t('survey.validationError.totalExceedHousehold');
          }
        }
      }
    } else if (name === 'location' && value.trim() === '') {
      return t('survey.validationError.required');
    } else if (name === 'homeHours' && value === '') {
      return t('survey.validationError.required');
    }
    
    return undefined;
  };
  
  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: SurveyFormErrors = {};
    let isValid = true;
    
    Object.entries(formData).forEach(([key, value]) => {
      const fieldName = key as keyof SurveyFormData;
      const error = validateField(fieldName, value);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle text field change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
    setIsDirty(true);
    
    // Validate field
    const error = validateField(name as keyof SurveyFormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  // Handle number field change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow digits
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    dispatch(updateFormData({ [name]: value }));
    setIsDirty(true);
    
    // Validate field
    const error = validateField(name as keyof SurveyFormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  // Handle select change
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
    setIsDirty(true);
    
    // Validate field
    const error = validateField(name as keyof SurveyFormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user?.id) {
      setErrorMessage('User not authenticated');
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const surveyData = {
        user_id: user.id,
        location: formData.location,
        household_size: parseInt(formData.householdSize, 10),
        children: parseInt(formData.children, 10),
        working_adults: parseInt(formData.workingAdults, 10),
        home_hours: formData.homeHours,
      };
      
      console.log('Submitting survey data:', surveyData);
      
      if (USE_MOCK_SERVICES) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccessMessage(t('survey.updateSuccess'));
        setIsDirty(false);
      } else {
        // Dispatch Redux action to save survey
        const resultAction = await dispatch(saveSurvey(surveyData));
        
        if (saveSurvey.fulfilled.match(resultAction)) {
          setSuccessMessage(t('survey.updateSuccess'));
          setIsDirty(false);
        } else if (saveSurvey.rejected.match(resultAction)) {
          throw new Error(resultAction.payload as string || 'Failed to save survey');
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in handleSubmit:', error);
      setErrorMessage(error.message || t('survey.updateError'));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    dispatch(resetForm());
    setErrors({});
    setIsDirty(true);
  };
  
  // Loading state
  if (isLoading || storeLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {t('survey.loading')}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader title={t('survey.title')} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('survey.formTitle')}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {t('survey.description')}
            </Typography>
            
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}
            
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    id="location"
                    name="location"
                    label={t('survey.location')}
                    placeholder={t('survey.locationPlaceholder')}
                    value={formData.location}
                    onChange={handleTextChange}
                    error={!!errors.location}
                    helperText={errors.location}
                    InputProps={{
                      startAdornment: (
                        <HomeIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    id="householdSize"
                    name="householdSize"
                    label={t('survey.householdSize')}
                    placeholder={t('survey.householdSizePlaceholder')}
                    value={formData.householdSize}
                    onChange={handleNumberChange}
                    error={!!errors.householdSize}
                    helperText={errors.householdSize}
                    type="number"
                    InputProps={{
                      inputProps: { min: 1 },
                      startAdornment: (
                        <PersonIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    id="children"
                    name="children"
                    label={t('survey.children')}
                    placeholder={t('survey.childrenPlaceholder')}
                    value={formData.children}
                    onChange={handleNumberChange}
                    error={!!errors.children}
                    helperText={errors.children}
                    type="number"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <ChildIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    id="workingAdults"
                    name="workingAdults"
                    label={t('survey.workingAdults')}
                    placeholder={t('survey.workingAdultsPlaceholder')}
                    value={formData.workingAdults}
                    onChange={handleNumberChange}
                    error={!!errors.workingAdults}
                    helperText={errors.workingAdults}
                    type="number"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <WorkIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth required error={!!errors.homeHours}>
                    <InputLabel id="homeHours-label">{t('survey.homeHours')}</InputLabel>
                    <Select
                      labelId="homeHours-label"
                      id="homeHours"
                      name="homeHours"
                      value={formData.homeHours}
                      onChange={handleSelectChange}
                      label={t('survey.homeHours')}
                      startAdornment={<TimeIcon color="action" sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="allDay">{t('survey.homeHoursOptions.allDay')}</MenuItem>
                      <MenuItem value="morningEvening">{t('survey.homeHoursOptions.morningEvening')}</MenuItem>
                      <MenuItem value="eveningOnly">{t('survey.homeHoursOptions.eveningOnly')}</MenuItem>
                      <MenuItem value="weekendsOnly">{t('survey.homeHoursOptions.weekendsOnly')}</MenuItem>
                      <MenuItem value="irregular">{t('survey.homeHoursOptions.irregular')}</MenuItem>
                    </Select>
                    {errors.homeHours && (
                      <FormHelperText>{errors.homeHours}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleReset}
                      disabled={isSaving}
                    >
                      {t('common.reset')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
                      disabled={isSaving}
                    >
                      {t('survey.submit')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {hasSubmitted && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('survey.savedSurvey')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('survey.savedSurveyDescription')}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    {t('survey.location')}
                  </Typography>
                  <Typography variant="body1">
                    {formData.location || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    {t('survey.householdSize')}
                  </Typography>
                  <Typography variant="body1">
                    {formData.householdSize || '-'} {t('survey.people')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    {t('survey.children')}
                  </Typography>
                  <Typography variant="body1">
                    {formData.children || '0'} {t('survey.childrenCount')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    {t('survey.workingAdults')}
                  </Typography>
                  <Typography variant="body1">
                    {formData.workingAdults || '0'} {t('survey.adults')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    {t('survey.homeHours')}
                  </Typography>
                  <Typography variant="body1">
                    {formData.homeHours ? t(`survey.homeHoursOptions.${formData.homeHours}`) : '-'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Survey; 