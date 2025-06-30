import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { fetchInvoices, deleteInvoice, markInvoiceAsPaid, Invoice } from '../store/slices/invoiceSlice';
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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tooltip,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import DashboardHeader from '../components/Dashboard/DashboardHeader';

// Status chip colors
const statusColors = {
  paid: 'success',
  unpaid: 'error',
  overdue: 'warning',
  processing: 'info'
};

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { invoices, isLoading, error } = useSelector((state: RootState) => state.invoices);
  
  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Invoice>('invoice_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });

  // Fetch invoices on component mount
  useEffect(() => {
    dispatch(fetchInvoices({}));
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
    setSearch(event.target.value);
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Handle date range change
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  // Handle sort
  const handleSort = (column: keyof Invoice) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  // Handle invoice deletion
  const handleDeleteInvoice = () => {
    if (invoiceToDelete) {
      dispatch(deleteInvoice(invoiceToDelete))
        .unwrap()
        .then(() => {
          handleCloseDeleteDialog();
        })
        .catch((error) => {
          console.error('Failed to delete invoice:', error);
          handleCloseDeleteDialog();
        });
    }
  };

  // Open payment confirmation dialog
  const handleOpenPaymentDialog = (invoiceId: string) => {
    setInvoiceToPay(invoiceId);
    setPaymentDialogOpen(true);
  };

  // Close payment confirmation dialog
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setInvoiceToPay(null);
  };

  // Handle marking invoice as paid
  const handleMarkAsPaid = () => {
    if (invoiceToPay) {
      dispatch(markInvoiceAsPaid({
        id: invoiceToPay,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date().toISOString()
      }))
        .unwrap()
        .then(() => {
          handleClosePaymentDialog();
          // Refresh invoice list
          dispatch(fetchInvoices({}));
        })
        .catch((error) => {
          console.error('Failed to mark invoice as paid:', error);
        });
    }
  };

  // Navigate to add invoice page
  const handleAddInvoice = () => {
    navigate('/invoices/add');
  };

  // Navigate to invoice detail page
  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  // Handle download invoice
  const handleDownloadInvoice = (fileUrl: string | undefined) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      let matchesSearch = true;
      let matchesStatus = true;
      let matchesDateRange = true;
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        matchesSearch = Boolean(
          (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchLower)) ||
          String(invoice.total_amount).includes(searchLower) ||
          String(invoice.total_consumption_kwh).includes(searchLower) ||
          (invoice.notes && invoice.notes.toLowerCase().includes(searchLower))
        );
      }
      
      // Status filter
      if (filterStatus !== 'all') {
        matchesStatus = filterStatus === 'paid' ? invoice.is_paid : !invoice.is_paid;
      }
      
      // Date range filter
      if (dateRange.start && dateRange.end) {
        const invoiceDate = new Date(invoice.invoice_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59); // End of the day
        
        matchesDateRange = invoiceDate >= startDate && invoiceDate <= endDate;
      } else if (dateRange.start) {
        const invoiceDate = new Date(invoice.invoice_date);
        const startDate = new Date(dateRange.start);
        matchesDateRange = invoiceDate >= startDate;
      } else if (dateRange.end) {
        const invoiceDate = new Date(invoice.invoice_date);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59); // End of the day
        matchesDateRange = invoiceDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      // Handle different sort columns
      if (sortBy === 'invoice_date' || sortBy === 'payment_due_date') {
        const dateA = a[sortBy] ? new Date(String(a[sortBy])).getTime() : 0;
        const dateB = b[sortBy] ? new Date(String(b[sortBy])).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Sort by string or number fields
      const valueA: any = a[sortBy] !== undefined ? a[sortBy] : '';
      const valueB: any = b[sortBy] !== undefined ? b[sortBy] : '';
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
  // Pagination
  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (isLoading && invoices.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <DashboardHeader title={t('invoices.title')} />
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {t('invoices.allInvoices')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddInvoice}
          >
            {t('invoices.addInvoice')}
          </Button>
        </Box>
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('common.search')}
              value={search}
              onChange={handleSearch}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">{t('invoices.status')}</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                label={t('invoices.status')}
                onChange={handleFilterChange}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="paid">{t('invoices.paid')}</MenuItem>
                <MenuItem value="unpaid">{t('invoices.unpaid')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setDateRange({ start: '', end: '' });
              }}
            >
              {t('common.clearFilters')}
            </Button>
          </Grid>
        </Grid>
        
        {/* Error message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => dispatch(fetchInvoices({}))}
              >
                {t('common.retry')}
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Empty state */}
        {!isLoading && !error && filteredInvoices.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {search || filterStatus !== 'all' || dateRange.start || dateRange.end
                ? t('invoices.noMatchingInvoices')
                : t('invoices.noInvoices')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddInvoice}
              sx={{ mt: 2 }}
            >
              {t('invoices.addFirstInvoice')}
            </Button>
          </Box>
        )}
        
        {/* Invoices table */}
        {!isLoading && !error && filteredInvoices.length > 0 && (
          <>
            <TableContainer>
              <Table aria-label="invoices table">
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('invoice_number')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {t('invoices.invoiceNumber')}
                        {sortBy === 'invoice_number' && (
                          <SortIcon
                            fontSize="small"
                            sx={{
                              ml: 0.5,
                              transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('invoice_date')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {t('invoices.date')}
                        {sortBy === 'invoice_date' && (
                          <SortIcon
                            fontSize="small"
                            sx={{
                              ml: 0.5,
                              transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('payment_due_date')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {t('invoices.dueDate')}
                        {sortBy === 'payment_due_date' && (
                          <SortIcon
                            fontSize="small"
                            sx={{
                              ml: 0.5,
                              transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('total_amount')}
                      sx={{ cursor: 'pointer' }}
                      align="right"
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {t('invoices.amount')}
                        {sortBy === 'total_amount' && (
                          <SortIcon
                            fontSize="small"
                            sx={{
                              ml: 0.5,
                              transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('total_consumption_kwh')}
                      sx={{ cursor: 'pointer' }}
                      align="right"
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {t('invoices.consumption')}
                        {sortBy === 'total_consumption_kwh' && (
                          <SortIcon
                            fontSize="small"
                            sx={{
                              ml: 0.5,
                              transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {t('invoices.status')}
                    </TableCell>
                    <TableCell>
                      {t('common.actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      hover
                      onClick={() => handleViewInvoice(invoice.id)}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{invoice.payment_due_date ? formatDate(invoice.payment_due_date) : '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell align="right">{invoice.total_consumption_kwh} kWh</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.is_paid ? t('invoices.paid') : t('invoices.unpaid')}
                          color={invoice.is_paid ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {!invoice.is_paid && (
                            <Tooltip title={t('invoices.markAsPaid')}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPaymentDialog(invoice.id);
                                }}
                                color="success"
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(invoice.id);
                              }}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {invoice.file_path && (
                            <Tooltip title={t('common.download')}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadInvoice(invoice.file_path);
                                }}
                                color="default"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredInvoices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          </>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{t('invoices.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('invoices.deleteWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteInvoice} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Confirmation Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
      >
        <DialogTitle>{t('invoices.confirmPayment')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('invoices.paymentConfirmation')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleMarkAsPaid} color="success">
            {t('invoices.markAsPaid')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Invoices; 