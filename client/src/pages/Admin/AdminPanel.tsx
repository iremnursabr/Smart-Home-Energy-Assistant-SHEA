import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  DevicesOther as DevicesIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Tab a11y props
function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

// Admin panel stats
interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  totalInvoices: number;
  totalSuggestions: number;
}

// Temporary components until real ones are implemented
const UserManagement: React.FC = () => <div>User Management Component</div>;
const DataManagement: React.FC = () => <div>Data Management Component</div>;
const SystemSettings: React.FC = () => <div>System Settings Component</div>;

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" paragraph>
          You do not have permission to access this area.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          {t('navigation.backToHome')}
        </Button>
      </Container>
    );
  }
  
  // Mock stats
  const stats: AdminStats = {
    totalUsers: 234,
    activeUsers: 187,
    totalDevices: 892,
    totalInvoices: 1245,
    totalSuggestions: 456
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          {t('admin.title')}
        </Typography>
        
        {/* Admin Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.totalUsers')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.activeUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.activeUsers')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <DevicesIcon color="info" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.totalDevices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('devices.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReceiptIcon color="warning" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.totalInvoices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('invoices.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LightbulbIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats.totalSuggestions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('suggestions.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin tabs"
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<PeopleIcon />} 
              label={t('admin.userManagement')} 
              {...a11yProps(0)} 
              iconPosition="start"
            />
            <Tab 
              icon={<StorageIcon />} 
              label={t('admin.dataManagement')} 
              {...a11yProps(1)} 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label={t('admin.systemSettings')} 
              {...a11yProps(2)} 
              iconPosition="start"
            />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <UserManagement />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <DataManagement />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <SystemSettings />
          </TabPanel>
        </Paper>
        
        {/* Quick Access */}
        <Typography variant="h6" gutterBottom>
          Quick Access
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('admin.userManagement')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem component={RouterLink} to="/admin/users" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('admin.users')} />
                </ListItem>
                <ListItem component={RouterLink} to="/admin/users/create" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('admin.createUser')} />
                </ListItem>
                <ListItem component={RouterLink} to="/admin/user-records" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('admin.viewUserRecords')} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('admin.dataManagement')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem component={RouterLink} to="/admin/update-data" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('admin.updateData')} />
                </ListItem>
                <ListItem component={RouterLink} to="/admin/import-data" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('admin.importData')} />
                </ListItem>
                <ListItem component={RouterLink} to="/admin/export-data" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('admin.exportData')} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('admin.systemSettings')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem component={RouterLink} to="/admin/settings" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('settings.general')} />
                </ListItem>
                <ListItem component={RouterLink} to="/admin/backup" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Backup & Restore" />
                </ListItem>
                <ListItem component={RouterLink} to="/admin/logs" sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="System Logs" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminPanel; 