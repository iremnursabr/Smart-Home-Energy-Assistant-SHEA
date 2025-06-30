import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// System Settings interface
interface SystemSettings {
  siteName: string;
  contactEmail: string;
  defaultLanguage: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  dataRetentionDays: number;
  apiRateLimit: number;
  defaultTheme: string;
}

const SystemSettings: React.FC = () => {
  const { t } = useTranslation();
  
  // State
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Smart Energy Assistant',
    contactEmail: 'contact@example.com',
    defaultLanguage: 'tr',
    defaultCurrency: 'TRY',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotificationsEnabled: true,
    dataRetentionDays: 365,
    apiRateLimit: 100,
    defaultTheme: 'light'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
    setSuccessMessage(null);
  };
  
  // Handle switch change
  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [name]: e.target.checked }));
    setIsFormDirty(true);
    setSuccessMessage(null);
  };
  
  // Handle slider change
  const handleSliderChange = (name: string) => (e: Event, value: number | number[]) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
    setSuccessMessage(null);
  };
  
  // Handle select change
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
    setSuccessMessage(null);
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // API call would be implemented here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      setSuccessMessage('System settings have been saved successfully');
      setIsFormDirty(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrorMessage(error.response?.data?.message || 'Error saving settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset settings to default
  const handleResetSettings = () => {
    setSettings({
      siteName: 'Smart Energy Assistant',
      contactEmail: 'contact@example.com',
      defaultLanguage: 'tr',
      defaultCurrency: 'TRY',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotificationsEnabled: true,
      dataRetentionDays: 365,
      apiRateLimit: 100,
      defaultTheme: 'light'
    });
    setIsFormDirty(true);
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('admin.systemSettings')}
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Name"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleTextChange}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={handleTextChange}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="default-language-label">Default Language</InputLabel>
                  <Select
                    labelId="default-language-label"
                    name="defaultLanguage"
                    value={settings.defaultLanguage}
                    label="Default Language"
                    onChange={handleSelectChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="tr">Türkçe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="default-currency-label">Default Currency</InputLabel>
                  <Select
                    labelId="default-currency-label"
                    name="defaultCurrency"
                    value={settings.defaultCurrency}
                    label="Default Currency"
                    onChange={handleSelectChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="TRY">TRY (₺)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="default-theme-label">Default Theme</InputLabel>
                  <Select
                    labelId="default-theme-label"
                    name="defaultTheme"
                    value={settings.defaultTheme}
                    label="Default Theme"
                    onChange={handleSelectChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleSwitchChange('maintenanceMode')}
                      disabled={isLoading}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.registrationEnabled}
                      onChange={handleSwitchChange('registrationEnabled')}
                      disabled={isLoading}
                    />
                  }
                  label="User Registration Enabled"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotificationsEnabled}
                      onChange={handleSwitchChange('emailNotificationsEnabled')}
                      disabled={isLoading}
                    />
                  }
                  label="Email Notifications Enabled"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography id="data-retention-slider" gutterBottom>
                  Data Retention Period (days): {settings.dataRetentionDays}
                </Typography>
                <Slider
                  value={settings.dataRetentionDays}
                  onChange={handleSliderChange('dataRetentionDays')}
                  aria-labelledby="data-retention-slider"
                  valueLabelDisplay="auto"
                  step={30}
                  marks
                  min={30}
                  max={730}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography id="api-rate-limit-slider" gutterBottom>
                  API Rate Limit (requests per minute): {settings.apiRateLimit}
                </Typography>
                <Slider
                  value={settings.apiRateLimit}
                  onChange={handleSliderChange('apiRateLimit')}
                  aria-labelledby="api-rate-limit-slider"
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={10}
                  max={500}
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* System Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={8}>
                <Typography variant="body2" color="text.secondary">
                  Save your changes or reset to default settings.
                  {isLoading && (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 0.5 }} />
                      Processing...
                    </Box>
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'right' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetSettings}
                  disabled={isLoading}
                  sx={{ mr: 1 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={!isFormDirty || isLoading}
                >
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="System Information"
              avatar={<SettingsIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    System Version
                  </Typography>
                  <Typography variant="body1">
                    0.2.2
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Update
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Server Status
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Online
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemSettings; 