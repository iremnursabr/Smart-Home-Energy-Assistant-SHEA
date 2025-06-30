import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import DeviceStatus from '../components/Dashboard/DeviceStatus';
import RecentInvoices from '../components/Dashboard/RecentInvoices';
import SavingsTips from '../components/Dashboard/SavingsTips';
import DashboardHeader from '../components/Dashboard/DashboardHeader';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useSelector((state: RootState) => state.dashboard);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(fetchDashboardData());
  }, [dispatch, isAuthenticated, navigate]);
  
  const handleHomeNavigation = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleHomeNavigation}
          >
            {t('navigation.backToHome')}
          </Button>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader 
        title={t('dashboard.title')}
        breadcrumbs={[
          { text: t('dashboard.title') }
        ]}
      />
      
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>
              {t('dashboard.welcome', { 
                name: user?.first_name 
                  ? user.first_name
                  : user?.username || t('common.user')
              })}
            </Typography>
            <Typography variant="body1">
              {t('dashboard.overview')}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Device Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <DeviceStatus devices={data.devices} />
          </Paper>
        </Grid>
        
        {/* Recent Invoices */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <RecentInvoices invoices={data.invoices} />
          </Paper>
        </Grid>
        
        {/* Savings Tips */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <SavingsTips tips={data.savingsTips} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 