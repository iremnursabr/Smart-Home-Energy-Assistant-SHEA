import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { fetchDevices, deleteDevice, clearDeviceError } from '../store/slices/deviceSlice';
import { Device } from '../store/slices/deviceSlice';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Grid,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import DashboardHeader from '../components/Dashboard/DashboardHeader';

// Status chip colors
const statusColors = {
  active: 'success',
  inactive: 'error',
  maintenance: 'warning'
};

const Devices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { devices, isLoading, error } = useSelector((state: RootState) => state.devices);
  
  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Device>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  // Fetch devices on component mount
  useEffect(() => {
    dispatch(fetchDevices());
    
    // Clear any previous errors
    return () => {
      dispatch(clearDeviceError());
    };
  }, [dispatch]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Handle sort
  const handleSort = (column: keyof Device) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (deviceId: string) => {
    setDeviceToDelete(deviceId);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeviceToDelete(null);
  };

  // Handle device deletion
  const handleDeleteDevice = () => {
    if (deviceToDelete) {
      dispatch(deleteDevice(deviceToDelete))
        .unwrap()
        .then(() => {
          handleCloseDeleteDialog();
        })
        .catch((error) => {
          console.error('Failed to delete device:', error);
          handleCloseDeleteDialog();
        });
    }
  };

  // Navigate to device detail page
  const handleViewDevice = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  // Navigate to add device page
  const handleAddDevice = () => {
    navigate('/devices/add');
  };

  // Navigate to edit device page
  const handleEditDevice = (deviceId: string) => {
    navigate(`/devices/${deviceId}/edit`);
  };

  // Filter and sort devices
  const filteredDevices = devices
    .filter(device => {
      const matchesSearch = 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.device_type && device.device_type.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterStatus === 'all' || (device.status === filterStatus);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Değerleri güvenli bir şekilde al, tanımlı değilse boş string kullan
      const aValue = a[sortBy] !== undefined ? String(a[sortBy]) : '';
      const bValue = b[sortBy] !== undefined ? String(b[sortBy]) : '';
      
      // String olarak karşılaştır
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    });

  // Paginate devices
  const paginatedDevices = filteredDevices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Loading state
  if (isLoading && devices.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader 
        title={t('devices.title')}
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddDevice}
          >
            {t('devices.addDevice')}
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label={t('devices.deviceStatus')}
              value={filterStatus}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="active">{t('devices.active')}</MenuItem>
              <MenuItem value="inactive">{t('devices.inactive')}</MenuItem>
              <MenuItem value="maintenance">{t('devices.maintenance')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort('name')}
                sx={{ cursor: 'pointer' }}
              >
                {t('devices.deviceName')}
                {sortBy === 'name' && (
                  <IconButton size="small">
                    <SortIcon />
                  </IconButton>
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('device_type')}
                sx={{ cursor: 'pointer' }}
              >
                {t('devices.deviceType')}
                {sortBy === 'device_type' && (
                  <IconButton size="small">
                    <SortIcon />
                  </IconButton>
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('brand')}
                sx={{ cursor: 'pointer' }}
              >
                {t('devices.brand')}
                {sortBy === 'brand' && (
                  <IconButton size="small">
                    <SortIcon />
                  </IconButton>
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('model')}
                sx={{ cursor: 'pointer' }}
              >
                {t('devices.model')}
                {sortBy === 'model' && (
                  <IconButton size="small">
                    <SortIcon />
                  </IconButton>
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('energy_efficiency_class')}
                sx={{ cursor: 'pointer' }}
              >
                {t('devices.energyEfficiency')}
                {sortBy === 'energy_efficiency_class' && (
                  <IconButton size="small">
                    <SortIcon />
                  </IconButton>
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('power_consumption_watts')}
                sx={{ cursor: 'pointer' }}
              >
                {t('devices.powerConsumption')}
                {sortBy === 'power_consumption_watts' && (
                  <IconButton size="small">
                    <SortIcon />
                  </IconButton>
                )}
              </TableCell>
              <TableCell>
                {t('common.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('devices.noDevices')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedDevices.map((device) => (
                <TableRow 
                  key={device.id}
                  hover
                  onClick={() => handleViewDevice(device.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{t(`deviceTypes.${device.device_type}`)}</TableCell>
                  <TableCell>{device.brand || '-'}</TableCell>
                  <TableCell>{device.model || '-'}</TableCell>
                  <TableCell>{device.energy_efficiency_class || '-'}</TableCell>
                  <TableCell>{device.power_consumption_watts || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteDialog(device.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDevices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{t('devices.deleteDevice')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('devices.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteDevice} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Devices; 