import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { register, clearAuthError } from '../store/slices/authSlice';
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
  Avatar,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AppRegistration as RegisterIcon
} from '@mui/icons-material';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get state from redux
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form validation
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [agreeTermsError, setAgreeTermsError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
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
    
    if (!firstName) {
      setFirstNameError(t('validation.firstNameRequired'));
      isValid = false;
    } else {
      setFirstNameError('');
    }
    
    if (!lastName) {
      setLastNameError(t('validation.lastNameRequired'));
      isValid = false;
    } else {
      setLastNameError('');
    }
    
    if (!username) {
      setUsernameError(t('validation.usernameRequired'));
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError(t('validation.usernameLength'));
      isValid = false;
    } else {
      setUsernameError('');
    }
    
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
    } else if (password.length < 8) {
      setPasswordError(t('validation.passwordLength'));
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError(t('validation.confirmPasswordRequired'));
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t('validation.passwordsDoNotMatch'));
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    if (phone && !/^\+?[0-9\s-()]{8,}$/.test(phone)) {
      setPhoneError(t('validation.phoneInvalid'));
      isValid = false;
    } else {
      setPhoneError('');
    }
    
    if (!agreeTerms) {
      setAgreeTermsError(t('validation.agreeTermsRequired'));
      isValid = false;
    } else {
      setAgreeTermsError('');
    }
    
    if (isValid) {
      dispatch(register({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone_number: phone || undefined
      }))
        .unwrap()
        .then(() => {
          // Başarılı kayıt durumunda yapılacak işlemler
          console.log('Registration successful');
        })
        .catch((err) => {
          // Hata durumunda yapılacak işlemler
          console.error('Registration failed:', err);
        });
    }
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%'
    }}>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
        <RegisterIcon fontSize="large" />
      </Avatar>
      
      <Typography component="h1" variant="h5" gutterBottom>
        {t('auth.createAccount')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.fillDetails')}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="firstName"
              label={t('auth.firstName')}
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={!!firstNameError}
              helperText={firstNameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="lastName"
              label={t('auth.lastName')}
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={!!lastNameError}
              helperText={lastNameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
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
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="phone"
              label={t('auth.phone')}
              type="tel"
              id="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!phoneError}
              helperText={phoneError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox 
                  value="agreeTerms" 
                  color="primary" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  {t('auth.agreeTerms')}{' '}
                  <Link component={RouterLink} to="/terms" variant="body2">
                    {t('auth.termsAndConditions')}
                  </Link>
                </Typography>
              }
            />
            {agreeTermsError && (
              <Typography variant="caption" color="error">
                {agreeTermsError}
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 3, mb: 2, py: 1.2 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t('auth.signUp')
          )}
        </Button>
        
        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                {t('auth.signIn')}
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Register; 