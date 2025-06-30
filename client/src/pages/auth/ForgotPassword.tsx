import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Grid,
  Paper,
  Link,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage(t('validation.required', { field: t('auth.email') }));
      return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(t('validation.emailInvalid'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setSuccessMessage(t('auth.resetPasswordSuccess'));
      setErrorMessage(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('auth.resetPasswordError');
      setErrorMessage(errorMsg);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3}
        sx={{
          mt: 8,
          p: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          width: '100%'
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom fontSize="1.75rem" fontWeight="500">
          {t('auth.passwordReset')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          {t('auth.enterEmail')}
        </Typography>
        
        {successMessage && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('auth.email')}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            error={!!errorMessage}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, mb: 3, py: 1.5, fontSize: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('auth.resetLink')
            )}
          </Button>
          
          <Grid container justifyContent="center">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body1">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {t('auth.backToLogin')}
                </Box>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 