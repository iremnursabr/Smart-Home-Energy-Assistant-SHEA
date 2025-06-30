import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { fetchInvoiceById } from '../store/slices/invoiceSlice';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  MoneyOutlined as MoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  ElectricalServices as ElectricityIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { selectedInvoice, isLoading, error } = useSelector((state: RootState) => state.invoices);

  // Local state to ensure we have properly formatted data
  const [formattedInvoice, setFormattedInvoice] = useState<any>(null);
  
  // Helper function to check if a value is empty
  const isEmpty = (value: any): boolean => {
    return value === null || value === undefined || value === '';
  };
  
  // Fetch invoice data on component mount
  useEffect(() => {
    if (id) {
      // Her fetch işleminde formattedInvoice'i sıfırla
      setFormattedInvoice(null);
      dispatch(fetchInvoiceById(id));
    }
    
    // Temizleme fonksiyonu - component unmount olduğunda çalışır
    return () => {
      setFormattedInvoice(null);
    };
  }, [dispatch, id]);

  // Process and format invoice data when it changes
  useEffect(() => {
    if (selectedInvoice) {
      console.log('Detay sayfasında alınan fatura verisi:', selectedInvoice);
      
      try {
        // Create a formatted version of the invoice with properly formatted dates and values
        const formatted = {
          ...selectedInvoice,
          formattedInvoiceDate: formatDate(selectedInvoice.invoice_date),
          formattedDueDate: !isEmpty(selectedInvoice.payment_due_date) ? formatDate(selectedInvoice.payment_due_date) : null,
          formattedPaymentDate: !isEmpty(selectedInvoice.payment_date) ? formatDate(selectedInvoice.payment_date) : null,
          formattedAmount: formatCurrency(selectedInvoice.total_amount || 0),
          formattedConsumption: !isEmpty(selectedInvoice.total_consumption_kwh) ? 
            `${selectedInvoice.total_consumption_kwh} ${selectedInvoice.unit || 'kWh'}` : t('common.notAvailable'),
          // Eksik veri alanlarını da burada açık şekilde tanımlayalım
          provider: !isEmpty(selectedInvoice.provider) ? selectedInvoice.provider : null,
          invoice_type: !isEmpty(selectedInvoice.invoice_type) ? selectedInvoice.invoice_type : null,
          period: !isEmpty(selectedInvoice.period) ? selectedInvoice.period : null,
          notes: !isEmpty(selectedInvoice.notes) ? selectedInvoice.notes : null
        };
        
        console.log('Düzenlenmiş fatura verisi:', formatted);
        setFormattedInvoice(formatted);
      } catch (error) {
        console.error('Fatura verisi işlenirken hata oluştu:', error);
      }
    } else {
      console.log('Henüz fatura verisi yok veya alınamadı.');
    }
  }, [selectedInvoice, t]);

  // Navigate back to invoices list
  const handleBack = () => {
    navigate('/invoices');
  };

  // Navigate to edit invoice page
  const handleEdit = () => {
    navigate(`/invoices/${id}/edit`);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('common.notAvailable');
    
    try {
      // Parse date value safely
      let date;
      if (typeof dateString === 'string') {
        // Handle different date formats
        if (dateString.includes('T')) {
          // ISO format with time
          date = new Date(dateString);
        } else {
          // YYYY-MM-DD format
          const parts = dateString.split('-');
          if (parts.length === 3) {
            date = new Date(
              parseInt(parts[0]),     // year
              parseInt(parts[1]) - 1, // month (0-based)
              parseInt(parts[2])      // day
            );
          } else {
            return t('common.notAvailable');
          }
        }
      } else {
        return t('common.notAvailable');
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return t('common.notAvailable');
      }
      
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('common.notAvailable');
    }
  };

  // Get invoice type translation
  const getInvoiceTypeLabel = (type: string | undefined) => {
    if (!type) return t('common.notAvailable');
    
    const typeMap: Record<string, string> = {
      'electricity': t('invoices.invoiceTypes.electricity'),
      'water': t('invoices.invoiceTypes.water'),
      'gas': t('invoices.invoiceTypes.gas'),
      'internet': t('invoices.invoiceTypes.internet'),
      'phone': t('invoices.invoiceTypes.phone'),
      'other': t('invoices.invoiceTypes.other')
    };
    
    return typeMap[type] || type;
  };

  // Loading state
  if (isLoading && !formattedInvoice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !formattedInvoice) {
    return (
      <Box sx={{ mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!formattedInvoice && !isLoading && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('invoices.invoiceDataNotLoaded')}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">Debug Bilgisi:</Typography>
              <Typography variant="body2">Fatura ID: {id}</Typography>
              <Typography variant="body2">Yükleniyor: {isLoading ? 'Evet' : 'Hayır'}</Typography>
              <Typography variant="body2">Hata: {error ? error : 'Yok'}</Typography>
              <Typography variant="body2">Redux veri durumu: {selectedInvoice ? 'Veri mevcut' : 'Veri yok'}</Typography>
            </Box>
          </Alert>
        )}
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2, mr: 2 }}
        >
          {t('common.back')}
        </Button>
        
        {id && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => dispatch(fetchInvoiceById(id))}
            sx={{ mt: 2 }}
          >
            {t('common.retry')}
          </Button>
        )}
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
          {t('invoices.invoiceDetails')}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{ mr: 1 }}
        >
          {t('common.edit')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Invoice Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={t('invoices.invoiceInfo')}
              subheader={formattedInvoice.invoice_number || t('invoices.noNumber')}
              action={
                <Chip 
                  label={formattedInvoice.is_paid ? t('invoices.statuses.paid') : t('invoices.statuses.unpaid')} 
                  color={formattedInvoice.is_paid ? 'success' : 'error'} 
                />
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <List>
                    <ListItem>
                      <ReceiptIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.invoiceNumber')} 
                        secondary={formattedInvoice.invoice_number || t('invoices.noNumber')} 
                      />
                    </ListItem>
                    <ListItem>
                      <CalendarIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.invoiceDate')} 
                        secondary={formattedInvoice.formattedInvoiceDate} 
                      />
                    </ListItem>
                    <ListItem>
                      <CalendarIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.dueDate')} 
                        secondary={formattedInvoice.formattedDueDate || t('common.notAvailable')} 
                      />
                    </ListItem>
                    <ListItem>
                      <BusinessIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.provider')} 
                        secondary={!isEmpty(formattedInvoice.provider) ? formattedInvoice.provider : t('common.notAvailable')} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <List>
                    <ListItem>
                      <MoneyIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.amount')} 
                        secondary={formattedInvoice.formattedAmount} 
                      />
                    </ListItem>
                    <ListItem>
                      <ElectricityIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.totalConsumption')} 
                        secondary={formattedInvoice.formattedConsumption} 
                      />
                    </ListItem>
                    <ListItem>
                      <CategoryIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.invoiceType')} 
                        secondary={!isEmpty(formattedInvoice.invoice_type) ? getInvoiceTypeLabel(formattedInvoice.invoice_type) : t('common.notAvailable')} 
                      />
                    </ListItem>
                    <ListItem>
                      <DateRangeIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.period')} 
                        secondary={!isEmpty(formattedInvoice.period) ? formattedInvoice.period : t('common.notAvailable')} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <List>
                    {formattedInvoice.is_paid && (
                      <>
                        <ListItem>
                          <CalendarIcon sx={{ mr: 2 }} />
                          <ListItemText 
                            primary={t('invoices.paymentDate')} 
                            secondary={formattedInvoice.formattedPaymentDate || t('common.notAvailable')} 
                          />
                        </ListItem>
                        <ListItem>
                          <MoneyIcon sx={{ mr: 2 }} />
                          <ListItemText 
                            primary={t('invoices.paymentMethod')} 
                            secondary={formattedInvoice.payment_method || t('common.notAvailable')} 
                          />
                        </ListItem>
                      </>
                    )}
                    <ListItem>
                      <DescriptionIcon sx={{ mr: 2 }} />
                      <ListItemText 
                        primary={t('invoices.notes')} 
                        secondary={!isEmpty(formattedInvoice.notes) ? formattedInvoice.notes : t('common.notAvailable')} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceDetail; 