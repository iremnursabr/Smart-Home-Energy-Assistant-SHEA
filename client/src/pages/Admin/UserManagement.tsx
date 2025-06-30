import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Button,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// User interface
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'standard' | 'energy_consultant';
  is_active: boolean;
  last_login: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users when search query or filters change
  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);
  
  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Error fetching users');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter users based on search query and filters
  const filterUsers = () => {
    let result = [...users];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(user => user.is_active === isActive);
    }
    
    setFilteredUsers(result);
  };
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUserId(null);
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/users/${selectedUserId}`);
      setUsers(users.filter(user => user.id !== selectedUserId));
      handleCloseDeleteDialog();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Error deleting user');
    }
  };
  
  // Format date to locale string
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };
  
  // Get user status label
  const getUserStatusLabel = (isActive: boolean) => {
    return isActive ? t('admin.userStatus.active') : t('admin.userStatus.inactive');
  };
  
  // Get user status color
  const getUserStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };
  
  // Get user role label
  const getUserRoleLabel = (role: string) => {
    return t(`admin.userRoles.${role}`);
  };
  
  // Get user role color
  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'energy_consultant':
        return 'warning';
      default:
        return 'info';
    }
  };
  
  // Loading state
  if (isLoading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            {t('admin.userManagement')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            {t('admin.createUser')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            {t('common.refresh')}
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('admin.searchUser')}
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="role-filter-label">{t('admin.filterByRole')}</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                label={t('admin.filterByRole')}
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="admin">{t('admin.userRoles.admin')}</MenuItem>
                <MenuItem value="standard">{t('admin.userRoles.standard')}</MenuItem>
                <MenuItem value="energy_consultant">{t('admin.userRoles.energyConsultant')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">{t('admin.filterByStatus')}</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label={t('admin.filterByStatus')}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="active">{t('admin.userStatus.active')}</MenuItem>
                <MenuItem value="inactive">{t('admin.userStatus.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.userTable.username')}</TableCell>
                <TableCell>{t('admin.userTable.email')}</TableCell>
                <TableCell>{t('admin.userTable.name')}</TableCell>
                <TableCell>{t('admin.userTable.role')}</TableCell>
                <TableCell>{t('admin.userTable.status')}</TableCell>
                <TableCell>{t('admin.userTable.lastLogin')}</TableCell>
                <TableCell>{t('admin.userTable.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getUserRoleLabel(user.role)} 
                          color={getUserRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getUserStatusLabel(user.is_active)} 
                          color={getUserStatusColor(user.is_active) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.last_login)}</TableCell>
                      <TableCell>
                        <Tooltip title={t('admin.userDetails')}>
                          <IconButton size="small" color="info" sx={{ mr: 1 }}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('admin.editUser')}>
                          <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('admin.deleteUser')}>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(user.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ m: 1 }} />
                    ) : (
                      'No users found'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{t('admin.deleteUser')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 