import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import {
  setTheme,
  setLanguage,
  setCurrency,
  setMeasurementUnit,
  setNotificationSettings,
  resetSettings,
  fetchUserSettings,
  updateUserSettings,
  SupportedLanguage
} from '../store/slices/settingsSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Switch,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Container,
  TextField,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  CurrencyExchange as CurrencyIcon,
  Speed as SpeedIcon,
  RestartAlt as ResetIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  
  // Redux state
  const { settings, isLoading, error } = useSelector((state: RootState) => state.settings);
  
  // Fetch user settings on component mount
  useEffect(() => {
    dispatch(fetchUserSettings());
  }, [dispatch]);
  
  // Handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as 'light' | 'dark' | 'system';
    dispatch(setTheme(newTheme));
    dispatch(updateUserSettings({ theme: newTheme }));
  };
  
  // Handle language change
  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value as SupportedLanguage;
    dispatch(setLanguage(newLanguage));
    dispatch(updateUserSettings({ language: newLanguage }));
  };
  
  // Handle currency change
  const handleCurrencyChange = (event: SelectChangeEvent) => {
    dispatch(setCurrency(event.target.value));
    dispatch(updateUserSettings({ currency: event.target.value as 'USD' | 'EUR' | 'TRY' | 'GBP' }));
  };
  
  // Handle measurement unit change
  const handleMeasurementUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUnit = event.target.value as 'metric' | 'imperial';
    dispatch(setMeasurementUnit(newUnit));
    dispatch(updateUserSettings({ energyUnit: newUnit === 'metric' ? 'kWh' : 'MWh' }));
  };
  
  // Handle notification setting change
  const handleNotificationChange = (type: 'email' | 'push' | 'sms') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    dispatch(setNotificationSettings({ type, value: newValue }));
    
    const updatedNotifications = {
      ...settings.notifications,
      [type]: newValue
    };
    
    dispatch(updateUserSettings({ notifications: updatedNotifications }));
  };
  
  // Handle reset settings
  const handleResetSettings = () => {
    dispatch(resetSettings());
    dispatch(updateUserSettings({
      theme: 'system',
      language: 'en',
      currency: 'TRY',
      energyUnit: 'kWh',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }));
  };
  
  // Loading state
  if (isLoading && !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto',
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  JD
                </Avatar>
                <Typography variant="h6">John Doe</Typography>
                <Typography variant="body2" color="text.secondary">
                  Energy Manager
                </Typography>
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue="john.doe@company.com"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue="+1 (555) 123-4567"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Company"
                  defaultValue="Acme Corp"
                  margin="normal"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Settings */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Notifications */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <NotificationsIcon
                      sx={{ color: theme.palette.primary.main, mr: 1 }}
                    />
                    <Typography variant="h6">Notifications</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Email Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Push Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch />}
                        label="SMS Notifications"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Security */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon
                      sx={{ color: theme.palette.primary.main, mr: 1 }}
                    />
                    <Typography variant="h6">Security</Typography>
                  </Box>
                  <Button variant="outlined" sx={{ mb: 2 }}>
                    Change Password
                  </Button>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Two-Factor Authentication"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Login Notifications"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Data & Privacy */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DataUsageIcon
                      sx={{ color: theme.palette.primary.main, mr: 1 }}
                    />
                    <Typography variant="h6">Data & Privacy</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Data Analytics"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Share Usage Data"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button color="primary" variant="outlined">
                        Download My Data
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Language & Region */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LanguageIcon
                      sx={{ color: theme.palette.primary.main, mr: 1 }}
                    />
                    <Typography variant="h6">Language & Region</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Language"
                        defaultValue="en"
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="en">English</option>
                        <option value="tr">Türkçe</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Time Zone"
                        defaultValue="utc"
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="utc">UTC</option>
                        <option value="est">EST</option>
                        <option value="pst">PST</option>
                        <option value="cet">CET</option>
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings; 