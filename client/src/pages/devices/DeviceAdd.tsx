import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Box,
  FormHelperText,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeviceIcon from '@mui/icons-material/DevicesOther';
import SaveIcon from '@mui/icons-material/Save';

// Temporary API_BASE_URL until config is properly set up
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Cihaz tiplerine göre ortalama güç tüketimi değerleri (Watt)
const devicePowerConsumptionMap: { [key: string]: number } = {
  refrigerator: 150, // Buzdolabı
  washing_machine: 1000, // Çamaşır Makinesi
  dishwasher: 1300, // Bulaşık Makinesi
  oven: 2500, // Fırın
  air_conditioner: 2000, // Klima
  television: 150, // Televizyon
  computer: 250, // Bilgisayar
  lighting: 80, // Aydınlatma
  water_heater: 2000, // Su Isıtıcı
  other: 0 // Diğer
};

// Cihaz tiplerine göre ortalama kullanım sıklığı (saat/gün)
const deviceUsageFrequencyMap: { [key: string]: number } = {
  refrigerator: 24, // Buzdolabı (sürekli çalışır)
  washing_machine: 1, // Çamaşır Makinesi (günde 1 saat)
  dishwasher: 1, // Bulaşık Makinesi (günde 1 saat)
  oven: 1, // Fırın (günde 1 saat)
  air_conditioner: 3, // Klima (günde 3 saat)
  television: 4, // Televizyon (günde 4 saat)
  computer: 8, // Bilgisayar (günde 8 saat)
  lighting: 6, // Aydınlatma (günde 6 saat)
  water_heater: 0.5, // Su Isıtıcı (günde 0.5 saat)
  other: 0 // Diğer
};

const DeviceAdd: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  // State for form data
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: '',
    location: '',
    manufacturer: '',
    model: '',
    energyEfficiencyClass: '',
    powerConsumption: '',
    usageDaysPerWeek: '',
    usageHoursPerDay: '',
    status: 'active'
  });

  // State for form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Handle field changes for text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user modifies it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    // Cihaz tipi değiştiğinde güç tüketimi otomatik güncelle
    if (name === 'deviceType') {
      const powerConsumption = devicePowerConsumptionMap[value] || '';
      
      setFormData({
        ...formData,
        [name]: value,
        powerConsumption: powerConsumption.toString()
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field when user modifies it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Validate basic information
    if (!formData.deviceName.trim()) {
      newErrors.deviceName = t('devices.deviceNameRequired');
      isValid = false;
    }
    if (!formData.deviceType) {
      newErrors.deviceType = t('devices.deviceTypeRequired');
      isValid = false;
    }
    if (!formData.location) {
      newErrors.location = t('devices.locationRequired');
      isValid = false;
    }

    // Validate usage patterns
    if (!formData.powerConsumption.trim()) {
      newErrors.powerConsumption = t('devices.powerConsumptionRequired');
      isValid = false;
    } else if (isNaN(Number(formData.powerConsumption))) {
      newErrors.powerConsumption = t('devices.validConsumption');
      isValid = false;
    }
    
    if (!formData.usageDaysPerWeek.trim()) {
      newErrors.usageDaysPerWeek = t('devices.usageDaysPerWeekRequired');
      isValid = false;
    } else if (isNaN(Number(formData.usageDaysPerWeek)) || Number(formData.usageDaysPerWeek) < 1 || Number(formData.usageDaysPerWeek) > 7) {
      newErrors.usageDaysPerWeek = t('devices.validDaysPerWeek');
      isValid = false;
    }
    
    if (!formData.usageHoursPerDay.trim()) {
      newErrors.usageHoursPerDay = t('devices.usageHoursPerDayRequired');
      isValid = false;
    } else if (isNaN(Number(formData.usageHoursPerDay)) || Number(formData.usageHoursPerDay) < 0 || Number(formData.usageHoursPerDay) > 24) {
      newErrors.usageHoursPerDay = t('devices.validHoursPerDay');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu yap
    if (validateForm()) {
      try {
        // Veri formatını backend'in beklediği şekle dönüştür
        const deviceData = {
          name: formData.deviceName,
          device_type: formData.deviceType,
          location: formData.location,
          brand: formData.manufacturer,
          model: formData.model,
          energy_efficiency_class: formData.energyEfficiencyClass,
          power_consumption_watts: formData.powerConsumption ? Number(formData.powerConsumption) : undefined,
          usage_days_per_week: formData.usageDaysPerWeek ? Number(formData.usageDaysPerWeek) : undefined,
          usage_hours_per_day: formData.usageHoursPerDay ? Number(formData.usageHoursPerDay) : undefined,
          status: formData.status
        };
        
        const response = await fetch('http://localhost:5000/api/devices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(deviceData)
        });

        if (response.ok) {
          setNotification({
            open: true,
            message: t('devices.deviceAdded'),
            severity: 'success'
          });
          setTimeout(() => {
            navigate('/devices');
          }, 2000);
        } else {
          const data = await response.json();
          setNotification({
            open: true,
            message: data.message || 'An error occurred',
            severity: 'error'
          });
        }
      } catch (error) {
        setNotification({
          open: true,
          message: 'Network error',
          severity: 'error'
        });
      }
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/devices')}
            sx={{ mr: 2 }}
          >
            {t('common.back')}
          </Button>
          <DeviceIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5" component="h1">
            {t('devices.addNewDevice')}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            {t('devices.basicInformation')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={t('devices.deviceName')}
                name="deviceName"
                value={formData.deviceName}
                onChange={handleInputChange}
                error={!!errors.deviceName}
                helperText={errors.deviceName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.deviceType}>
                <InputLabel>{t('devices.deviceType')}</InputLabel>
                <Select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleSelectChange}
                  label={t('devices.deviceType')}
                >
                  <MenuItem value="refrigerator">{t('devices.deviceTypeOptions.refrigerator')}</MenuItem>
                  <MenuItem value="washing_machine">{t('devices.deviceTypeOptions.washing_machine')}</MenuItem>
                  <MenuItem value="dishwasher">{t('devices.deviceTypeOptions.dishwasher')}</MenuItem>
                  <MenuItem value="oven">{t('devices.deviceTypeOptions.oven')}</MenuItem>
                  <MenuItem value="air_conditioner">{t('devices.deviceTypeOptions.air_conditioner')}</MenuItem>
                  <MenuItem value="television">{t('devices.deviceTypeOptions.television')}</MenuItem>
                  <MenuItem value="computer">{t('devices.deviceTypeOptions.computer')}</MenuItem>
                  <MenuItem value="lighting">{t('devices.deviceTypeOptions.lighting')}</MenuItem>
                  <MenuItem value="water_heater">{t('devices.deviceTypeOptions.water_heater')}</MenuItem>
                  <MenuItem value="other">{t('devices.deviceTypeOptions.other')}</MenuItem>
                </Select>
                {errors.deviceType && <FormHelperText>{errors.deviceType}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.location}>
                <InputLabel>{t('devices.deviceLocation')}</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleSelectChange}
                  label={t('devices.deviceLocation')}
                >
                  <MenuItem value="living_room">{t('devices.locationOptions.living_room')}</MenuItem>
                  <MenuItem value="kitchen">{t('devices.locationOptions.kitchen')}</MenuItem>
                  <MenuItem value="bedroom">{t('devices.locationOptions.bedroom')}</MenuItem>
                  <MenuItem value="bathroom">{t('devices.locationOptions.bathroom')}</MenuItem>
                  <MenuItem value="kids_room">{t('devices.locationOptions.kids_room')}</MenuItem>
                  <MenuItem value="dressing_room">{t('devices.locationOptions.dressing_room')}</MenuItem>
                  <MenuItem value="pantry">{t('devices.locationOptions.pantry')}</MenuItem>
                  <MenuItem value="office">{t('devices.locationOptions.office')}</MenuItem>
                  <MenuItem value="hallway">{t('devices.locationOptions.hallway')}</MenuItem>
                  <MenuItem value="other">{t('devices.locationOptions.other')}</MenuItem>
                </Select>
                {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('devices.deviceStatus')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label={t('devices.deviceStatus')}
                >
                  <MenuItem value="active">{t('devices.active')}</MenuItem>
                  <MenuItem value="inactive">{t('devices.inactive')}</MenuItem>
                  <MenuItem value="maintenance">{t('devices.maintenance')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Technical Details Section */}
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            {t('devices.technicalDetails')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('devices.manufacturer')}
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('devices.model')}
                name="model"
                value={formData.model}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('devices.energyEfficiency')}</InputLabel>
                <Select
                  name="energyEfficiencyClass"
                  value={formData.energyEfficiencyClass}
                  onChange={handleSelectChange}
                  label={t('devices.energyEfficiency')}
                >
                  <MenuItem value="A+++">{t('devices.energyClasses.A+++')}</MenuItem>
                  <MenuItem value="A++">{t('devices.energyClasses.A++')}</MenuItem>
                  <MenuItem value="A+">{t('devices.energyClasses.A+')}</MenuItem>
                  <MenuItem value="A">{t('devices.energyClasses.A')}</MenuItem>
                  <MenuItem value="B">{t('devices.energyClasses.B')}</MenuItem>
                  <MenuItem value="C">{t('devices.energyClasses.C')}</MenuItem>
                  <MenuItem value="D">{t('devices.energyClasses.D')}</MenuItem>
                  <MenuItem value="E">{t('devices.energyClasses.E')}</MenuItem>
                  <MenuItem value="F">{t('devices.energyClasses.F')}</MenuItem>
                  <MenuItem value="G">{t('devices.energyClasses.G')}</MenuItem>
                  <MenuItem value="unknown">{t('devices.energyClasses.unknown')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Usage Patterns Section */}
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            {t('devices.usagePatterns')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={t('devices.powerConsumption')}
                name="powerConsumption"
                value={formData.powerConsumption}
                onChange={handleInputChange}
                error={!!errors.powerConsumption}
                helperText={errors.powerConsumption || t('devices.powerConsumptionAutoFilled')}
                InputProps={{ endAdornment: 'W' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={t('devices.usageDaysPerWeek')}
                name="usageDaysPerWeek"
                value={formData.usageDaysPerWeek}
                onChange={handleInputChange}
                error={!!errors.usageDaysPerWeek}
                helperText={errors.usageDaysPerWeek}
                type="number"
                inputProps={{ min: 1, max: 7 }}
                InputProps={{ endAdornment: t('devices.usageDaysPerWeek') }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={t('devices.usageHoursPerDay')}
                name="usageHoursPerDay"
                value={formData.usageHoursPerDay}
                onChange={handleInputChange}
                error={!!errors.usageHoursPerDay}
                helperText={errors.usageHoursPerDay}
                type="number"
                inputProps={{ min: 0, max: 24 }}
                InputProps={{ endAdornment: t('devices.usageHoursPerDay') }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              type="submit"
            >
              {t('common.save')}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeviceAdd; 