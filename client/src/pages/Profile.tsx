import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUserProfile, updateUserProfile } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/Dashboard/DashboardHeader';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
  });
  
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
      return;
    }
    
    // Fetch user profile if authenticated and no user data
    if (isAuthenticated && (!user || !user.email)) {
      setIsPageLoading(true);
      try {
        dispatch(fetchUserProfile());
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        // Set loading to false with a slight delay for smoother UI
        setTimeout(() => setIsPageLoading(false), 300);
      }
    } else {
      setIsPageLoading(false);
    }
  }, [isAuthenticated, isLoading, user, dispatch, navigate]);
  
  useEffect(() => {
    // Update form data when user data is loaded
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
      });
      setIsPageLoading(false);
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setUpdateSuccess(true);
      setUpdateError('');
    } catch (err) {
      setUpdateError(t('profile.updateFailed'));
      setUpdateSuccess(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setUpdateSuccess(false);
  };
  
  const handleHomeNavigation = () => {
    navigate('/');
  };
  
  if (isLoading || isPageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleHomeNavigation}
          sx={{ mb: 2 }}
        >
          {t('navigation.backToHome')}
        </Button>
        <Alert severity="error">{t('profile.userNotFound')}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader 
        title={t('profile.title')}
        breadcrumbs={[
          { text: t('navigation.profile') }
        ]}
      />
      
      <Snackbar
        open={updateSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {t('profile.updateSuccess')}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  {user.first_name && user.last_name 
                    ? `${user.first_name[0]}${user.last_name[0]}`
                    : user.username ? user.username[0].toUpperCase() : '?'}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('profile.memberSince')}: {user.created_at ? new Date(user.created_at).toLocaleDateString() : t('profile.unknown')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.personalInfo')}
              </Typography>
              
              {updateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {updateError}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.firstName')}
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.lastName')}
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.email')}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.phone')}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {t('profile.address')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.streetAddress')}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.city')}
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.postalCode')}
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.country')}
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 3 }}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : t('profile.saveChanges')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 