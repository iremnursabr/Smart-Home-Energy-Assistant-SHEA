import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { fetchDeviceById } from '../store/slices/deviceSlice';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PowerSettingsNew as PowerIcon,
  Category as CategoryIcon,
  Memory as MemoryIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  EmojiObjects as EnergyIcon
} from '@mui/icons-material';

// Status chip colors - Eğer status alanı tanımlı değilse varsayılan olarak 'active' kullanacağız
const statusColors: { [key: string]: 'success' | 'error' | 'warning' } = {
  active: 'success',
  inactive: 'error',
  maintenance: 'warning'
};

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { selectedDevice, isLoading: deviceLoading, error: deviceError } = useSelector((state: RootState) => state.devices);
  
  // Fetch device on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchDeviceById(id));
    }
  }, [dispatch, id]);

  // Navigate back to devices list
  const handleBack = () => {
    navigate('/devices');
  };

  // Navigate to edit device page
  const handleEdit = () => {
    navigate(`/devices/${id}/edit`);
  };

  // Loading state
  if (deviceLoading && !selectedDevice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (deviceError || !selectedDevice) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">
          {deviceError || t('devices.deviceNotFound')}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          {t('common.back')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {selectedDevice.name}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Device Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={t('devices.deviceInfo')}
              action={
                <Chip 
                  label={t(`devices.${selectedDevice.status || 'active'}`)} 
                  color={(statusColors[selectedDevice.status || 'active'] as 'success' | 'error' | 'warning')} 
                />
              }
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <CategoryIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.deviceType')} 
                    secondary={t(`deviceTypes.${selectedDevice.device_type}`)} 
                  />
                </ListItem>
                
                <ListItem>
                  <LocationIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.deviceLocation')} 
                    secondary={selectedDevice.location ? t(`devices.locationOptions.${selectedDevice.location}`) : t('common.notAvailable')} 
                  />
                </ListItem>
                
                <ListItem>
                  <MemoryIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.brand')} 
                    secondary={selectedDevice.brand || t('common.notAvailable')} 
                  />
                </ListItem>
                
                <ListItem>
                  <MemoryIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.model')} 
                    secondary={selectedDevice.model || t('common.notAvailable')} 
                  />
                </ListItem>
                
                <ListItem>
                  <EnergyIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.energyEfficiency')} 
                    secondary={selectedDevice.energy_efficiency_class ? t(`devices.energyClasses.${selectedDevice.energy_efficiency_class}`) : t('common.notAvailable')} 
                  />
                </ListItem>
                
                <ListItem>
                  <PowerIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.powerConsumption')} 
                    secondary={`${selectedDevice.power_consumption_watts || 0} W`} 
                  />
                </ListItem>
                
                <ListItem>
                  <TimeIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.usageDaysPerWeek')} 
                    secondary={selectedDevice.usage_days_per_week ? `${selectedDevice.usage_days_per_week} ${t('devices.days')}` : t('common.notAvailable')} 
                  />
                </ListItem>
                
                <ListItem>
                  <TimeIcon sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={t('devices.usageHoursPerDay')} 
                    secondary={selectedDevice.usage_hours_per_day ? `${selectedDevice.usage_hours_per_day} ${t('devices.hours')}` : t('common.notAvailable')} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceDetail; 