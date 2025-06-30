import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DataManagement: React.FC = () => {
  const { t } = useTranslation();
  
  // State
  const [dataType, setDataType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  // Handle data type change
  const handleDataTypeChange = (event: SelectChangeEvent) => {
    setDataType(event.target.value);
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };
  
  // Handle user selection change
  const handleUserChange = (event: SelectChangeEvent) => {
    setSelectedUser(event.target.value);
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  // Handle import data
  const handleImportData = async () => {
    if (!dataType) {
      setErrorMessage('Please select a data type');
      return;
    }
    
    if (!file) {
      setErrorMessage('Please select a file to import');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post(`${API_BASE_URL}/admin/import/${dataType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccessMessage(t('admin.dataUpdated'));
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Error importing data:', error);
      setErrorMessage(error.response?.data?.message || 'Error importing data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle export data
  const handleExportData = async () => {
    if (!dataType) {
      setErrorMessage('Please select a data type');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/export/${dataType}`, {
        params: selectedUser ? { user_id: selectedUser } : {},
        responseType: 'blob',
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up and set success message
      link.parentNode?.removeChild(link);
      setSuccessMessage('Export completed successfully');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      setErrorMessage(error.response?.data?.message || 'Error exporting data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle update data
  const handleUpdateData = async () => {
    if (!dataType) {
      setErrorMessage('Please select a data type');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await axios.post(`${API_BASE_URL}/admin/update/${dataType}`);
      setSuccessMessage(t('admin.dataUpdated'));
    } catch (error: any) {
      console.error('Error updating data:', error);
      setErrorMessage(error.response?.data?.message || 'Error updating data');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('admin.dataManagement')}
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
        {/* Data Type Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Data Type
            </Typography>
            <FormControl fullWidth sx={{ mb: isLoading ? 3 : 0 }}>
              <InputLabel id="data-type-label">Data Type</InputLabel>
              <Select
                labelId="data-type-label"
                id="data-type"
                value={dataType}
                label="Data Type"
                onChange={handleDataTypeChange}
                disabled={isLoading}
              >
                <MenuItem value="users">{t('admin.users')}</MenuItem>
                <MenuItem value="devices">{t('admin.devices')}</MenuItem>
                <MenuItem value="consumption">{t('admin.consumptionData')}</MenuItem>
                <MenuItem value="invoices">{t('admin.invoices')}</MenuItem>
                <MenuItem value="suggestions">{t('admin.suggestions')}</MenuItem>
                <MenuItem value="surveys">{t('admin.surveys')}</MenuItem>
              </Select>
            </FormControl>
            
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Processing...</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Update Data */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title={t('admin.updateData')}
              avatar={<RefreshIcon color="primary" />}
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Update system data for the selected data type. This will refresh calculations and run maintenance tasks.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('admin.lastUpdated', { date: new Date().toLocaleString() })}
                </Typography>
              </Box>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<RefreshIcon />}
                onClick={handleUpdateData}
                disabled={!dataType || isLoading}
              >
                {t('admin.updateData')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Import Data */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title={t('admin.importData')} 
              avatar={<UploadIcon color="primary" />}
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Import data from CSV or Excel files. Select a file to upload for the chosen data type.
              </Typography>
              <TextField
                id="import-file"
                type="file"
                fullWidth
                inputProps={{ accept: '.csv,.xlsx,.xls' }}
                onChange={handleFileChange}
                disabled={!dataType || isLoading}
                sx={{ mt: 2 }}
              />
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleImportData}
                disabled={!dataType || !file || isLoading}
              >
                {t('admin.importData')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Export Data */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title={t('admin.exportData')} 
              avatar={<DownloadIcon color="primary" />}
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Export data to CSV format. You can filter by user for specific data exports.
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="user-select-label">{t('admin.selectUser')} (Optional)</InputLabel>
                <Select
                  labelId="user-select-label"
                  id="user-select"
                  value={selectedUser}
                  label={`${t('admin.selectUser')} (Optional)`}
                  onChange={handleUserChange}
                  disabled={!dataType || isLoading}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {/* Mock user list - would be replaced with actual users */}
                  <MenuItem value="user1">John Doe</MenuItem>
                  <MenuItem value="user2">Jane Smith</MenuItem>
                  <MenuItem value="user3">Bob Johnson</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
                disabled={!dataType || isLoading}
              >
                {t('admin.exportData')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* View User Records */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('admin.viewUserRecords')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="view-user-label">{t('admin.selectUser')}</InputLabel>
                  <Select
                    labelId="view-user-label"
                    id="view-user"
                    value={selectedUser}
                    label={t('admin.selectUser')}
                    onChange={handleUserChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select a user</MenuItem>
                    {/* Mock user list - would be replaced with actual users */}
                    <MenuItem value="user1">John Doe</MenuItem>
                    <MenuItem value="user2">Jane Smith</MenuItem>
                    <MenuItem value="user3">Bob Johnson</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  disabled={!selectedUser || isLoading}
                  startIcon={<SaveIcon />}
                >
                  {t('admin.viewUserRecords')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataManagement; 