import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
  Snackbar,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.first_name) {
      errors.first_name = t('errors.required', { field: t('auth.firstName') });
    }
    
    if (!formData.last_name) {
      errors.last_name = t('errors.required', { field: t('auth.lastName') });
    }
    
    if (!formData.username) {
      errors.username = t('errors.required', { field: t('auth.username') });
    }
    
    if (!formData.email) {
      errors.email = t('errors.required', { field: t('auth.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('errors.email');
    }
    
    if (!formData.password) {
      errors.password = t('errors.required', { field: t('auth.password') });
    } else if (formData.password.length < 6) {
      errors.password = t('errors.passwordLength');
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('errors.required', { field: t('auth.confirmPassword') });
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('errors.passwordsDoNotMatch');
    }
    
    if (!acceptTerms) {
      errors.terms = t('errors.acceptTerms');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Extract required registration data (exclude confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      await dispatch(register(registrationData)).unwrap();
      
      setRegisterSuccess(true);
      
      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error is handled by the reducer and displayed via the error state
      console.error('Registration failed:', err);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptTerms(e.target.checked);
    if (e.target.checked && formErrors.terms) {
      const { terms, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };
  
  const handleCloseSuccessAlert = () => {
    setRegisterSuccess(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {/* Success Alert */}
      <Snackbar 
        open={registerSuccess} 
        autoHideDuration={5000} 
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessAlert} severity="success" variant="filled" sx={{ width: '100%' }}>
          {t('auth.registerSuccess')}
        </Alert>
      </Snackbar>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Form Title */}
      <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
        {t('auth.register')}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="first_name"
            label={t('auth.firstName')}
            name="first_name"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!formErrors.first_name}
            helperText={formErrors.first_name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="last_name"
            label={t('auth.lastName')}
            name="last_name"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!formErrors.last_name}
            helperText={formErrors.last_name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="username"
            label={t('auth.username')}
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            error={!!formErrors.username}
            helperText={formErrors.username}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="email"
            label={t('auth.email')}
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="password"
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="phone_number"
            label={t('auth.phoneNumber')}
            name="phone_number"
            autoComplete="tel"
            value={formData.phone_number}
            onChange={handleChange}
            error={!!formErrors.phone_number}
            helperText={formErrors.phone_number}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox 
                value="terms" 
                color="primary" 
                checked={acceptTerms}
                onChange={handleTermsChange}
              />
            }
            label={
              <Typography variant="body2">
                Kullanım şartlarını{' '}
                <Link component={RouterLink} to="/terms" variant="body2">
                  Kullanım Şartları
                </Link>{' '}
                ve{' '}
                <Link component={RouterLink} to="/privacy" variant="body2">
                  Gizlilik Politikası
                </Link>
                'nı kabul ediyorum.
              </Typography>
            }
          />
          {formErrors.terms && (
            <Typography color="error" variant="caption" sx={{ display: 'block', ml: 2 }}>
              {formErrors.terms}
            </Typography>
          )}
        </Grid>
      </Grid>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : t('auth.signUp')}
      </Button>
      
      <Grid container justifyContent="center">
        <Grid item>
          <Link component={RouterLink} to="/login" variant="body2">
            {t('auth.alreadyHaveAccount')}
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register; 