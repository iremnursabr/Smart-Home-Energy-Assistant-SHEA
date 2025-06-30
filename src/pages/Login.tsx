import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { login, clearAuthError } from '../store/slices/authSlice';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon
} from '@mui/icons-material';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get state from redux
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  // Form state
  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    
    if (!email) {
      setEmailError(t('validation.emailRequired'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('validation.emailInvalid'));
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError(t('validation.passwordRequired'));
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (isValid) {
      dispatch(login({ email, password }))
        .unwrap()
        .then(() => {
          // Başarılı giriş durumunda yapılacak işlemler
          console.log('Login successful');
        })
        .catch((err) => {
          // Hata durumunda yapılacak işlemler
          console.error('Login failed:', err);
        });
      
      // Store remember me preference locally
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
    }
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%'
    }}>
      <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
        <LoginIcon fontSize="large" />
      </Avatar>
      
      <Typography component="h1" variant="h5" gutterBottom>
        {t('auth.welcomeBack')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.loginToContinue')}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label={t('auth.email')}
          name="email"
          autoComplete="email"
          autoFocus={!email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
          helperText={emailError}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
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
            ),
          }}
        />
        
        <Grid container sx={{ mt: 2, mb: 2 }}>
          <Grid item xs>
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label={t('auth.rememberMe')}
            />
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              {t('auth.forgotPassword')}
            </Link>
          </Grid>
        </Grid>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.2 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t('auth.signIn')
          )}
        </Button>
        
        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">
              {t('auth.noAccount')}{' '}
              <Link component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                {t('auth.signUp')}
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Login; 