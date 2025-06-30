import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, clearError } from '../../store/slices/authSlice';
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
  Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { isAuthenticated, isLoading, error, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard or admin panel based on role
    if (isAuthenticated) {
      setLoginSuccess(true);
      
      // Redirect to appropriate page based on role (with a short delay)
      const redirectTimer = setTimeout(() => {
        if (user && user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }
    
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch, user]);

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
    
    if (!formData.email) {
      errors.email = t('errors.required', { field: t('auth.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('errors.email');
    }
    
    if (!formData.password) {
      errors.password = t('errors.required', { field: t('auth.password') });
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
      // Send either email or username to auth endpoint
      // The backend is looking for username OR email
      await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      setLoginSuccess(true);
    } catch (err) {
      // Error is handled by the reducer and displayed via the error state
      console.error('Login failed:', err);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleCloseSuccessAlert = () => {
    setLoginSuccess(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {/* Success Alert */}
      <Snackbar 
        open={loginSuccess} 
        autoHideDuration={5000} 
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessAlert} severity="success" variant="filled" sx={{ width: '100%' }}>
          {t('auth.loginSuccess')}
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
        {t('auth.login')}
      </Typography>
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label={t('auth.email')}
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label={t('auth.password')}
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
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
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : t('auth.signIn')}
      </Button>
      
      <Grid container justifyContent="center">
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            {t('auth.forgotPassword')}
          </Link>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
          <Link component={RouterLink} to="/register" variant="body2">
            {t('auth.dontHaveAccount')}
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login; 