import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createInvoice, CreateInvoiceRequest } from '../../store/slices/invoiceSlice';
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
  Divider,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';

// Define interface for OCR data
interface OcrData {
  invoiceNumber?: string;
  invoiceDate?: string;
  amount?: string;
  provider?: string;
  dueDate?: string;
  period?: string;
  consumption?: string;
  invoiceType?: string;
  unit?: string;
  tableData?: any;
  tableHeaders?: any;
  accountNumber?: string;
  installationNumber?: string;
  customerNumber?: string;
  averageConsumption?: string;
  fullName?: string;
  address?: string;
  consumerGroup?: string;
}

// Temporary API_BASE_URL until config is properly set up
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple format function to replace date-fns format
const formatDate = (date: Date, formatStr: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Only supporting yyyy-MM-dd format for now
  return `${year}-${month}-${day}`;
};

// Date format conversion helper
const formatDateIfNeeded = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  
  // DD.MM.YYYY formatını kontrol et
  const dotFormatMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotFormatMatch) {
    const day = dotFormatMatch[1].padStart(2, '0');
    const month = dotFormatMatch[2].padStart(2, '0');
    const year = dotFormatMatch[3];
    return `${year}-${month}-${day}`; // YYYY-MM-DD formatına dönüştür
  }
  
  // DD/MM/YYYY formatını kontrol et
  const slashFormatMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashFormatMatch) {
    const day = slashFormatMatch[1].padStart(2, '0');
    const month = slashFormatMatch[2].padStart(2, '0');
    const year = slashFormatMatch[3];
    return `${year}-${month}-${day}`; // YYYY-MM-DD formatına dönüştür
  }
  
  // DD-MM-YYYY formatını kontrol et
  const dashFormatMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashFormatMatch) {
    const day = dashFormatMatch[1].padStart(2, '0');
    const month = dashFormatMatch[2].padStart(2, '0');
    const year = dashFormatMatch[3];
    return `${year}-${month}-${day}`; // YYYY-MM-DD formatına dönüştür
  }
  
  // YYYY-MM-DD formatında ise olduğu gibi bırak
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  return dateStr; // Başka formatlarda olduğu gibi bırak
};

// File upload component
const FileUpload: React.FC<{
  onFileSelected: (file: File) => void;
}> = ({ onFileSelected }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };
  
  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 2, // Daha küçük padding
        textAlign: 'center',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.light'
        },
        height: '180px', // Daha küçük yükseklik
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <UploadFileIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
      <Typography variant="body1" gutterBottom>
        {t('invoices.dragAndDrop')}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
        {t('invoices.uploadInstructions')}
      </Typography>
      <input
        id="file-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </Box>
  );
};

const InvoiceAdd: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  // Use a ref to force updates when needed
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // State for file upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  
  // State for form data
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    amount: '',
    status: 'unpaid',
    provider: '',
    invoiceType: '',
    consumption: '',
    unit: '',
    period: '',
    accountNumber: '',
    installationNumber: '',
    customerNumber: '',
    averageConsumption: '',
    fullName: '',
    address: '',
    consumerGroup: ''
  });

  // State for OCR data - add this new state
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  
  // State for form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });

  // Add this useEffect near the top of the component
  useEffect(() => {
    // Debug logging for form data changes
    console.log('Form verilerindeki değişiklik:', formData);
  }, [formData]);
  
  // Add this special effect to detect and fix OCR data loading issues
  useEffect(() => {
    // This only runs when ocrData changes from null to a value
    if (ocrData) {
      console.log('OCR data değişti, form verilerini güncelliyorum', ocrData);
      
      // Format dates properly
      const formattedInvoiceDate = formatDateIfNeeded(ocrData.invoiceDate) || '';
      const formattedDueDate = formatDateIfNeeded(ocrData.dueDate) || '';
      
      // Clean amount if needed
      let cleanAmount = ocrData.amount || '';
      if (cleanAmount) {
        // Replace comma with dot for decimal
        cleanAmount = cleanAmount.replace(/,/g, '.');
        // Remove any non-numeric chars except for the decimal point
        cleanAmount = cleanAmount.replace(/[^\d.]/g, '');
      }
      
      // Clean consumption if needed
      let cleanConsumption = ocrData.consumption || '';
      if (cleanConsumption) {
        // Remove any units or text, just keep numbers and decimal
        cleanConsumption = cleanConsumption.replace(/,/g, '.');
        cleanConsumption = cleanConsumption.replace(/[^\d.]/g, '');
      }
      
      // Update form data with OCR data (yeni alanlar dahil)
      setFormData(prev => ({
        ...prev,
        invoiceNumber: ocrData.invoiceNumber || prev.invoiceNumber,
        invoiceDate: formattedInvoiceDate || prev.invoiceDate,
        provider: ocrData.provider || prev.provider,
        amount: cleanAmount || prev.amount,
        invoiceType: ocrData.invoiceType || prev.invoiceType, 
        dueDate: formattedDueDate || prev.dueDate,
        consumption: cleanConsumption || prev.consumption,
        unit: ocrData.unit || prev.unit,
        period: ocrData.period || prev.period,
        accountNumber: (ocrData.accountNumber || prev.accountNumber || '').trim(),
        installationNumber: (ocrData.installationNumber || prev.installationNumber || '').trim(),
        customerNumber: (ocrData.customerNumber || prev.customerNumber || '').trim(),
        averageConsumption: (ocrData.averageConsumption || prev.averageConsumption || '').trim(),
        fullName: (ocrData.fullName || prev.fullName || '').trim(),
        address: (ocrData.address || prev.address || '').trim(),
        consumerGroup: (ocrData.consumerGroup || prev.consumerGroup || '').trim()
      }));
      
      setExtractionComplete(true);
      
      // Force a re-render to make sure the form reflects the OCR data
      setForceUpdate(prev => prev + 1);
    }
  }, [ocrData]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
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
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user selects
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle file selection and OCR
  const handleFileSelected = async (file: File) => {
    setUploadedFile(file);
    setIsExtracting(true);
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('invoice_file', file);
      
      // Make API call to extract data
      const response = await fetch(`${API_BASE_URL}/invoices/ocr`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        console.log('OCR extraction successful:', data.data);
        setOcrData(data.data);
      } else {
        console.error('OCR extraction failed:', data.message || 'Unknown error');
        setNotification({
          open: true,
          message: t('invoices.ocrFailed'),
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error during OCR:', error);
      setNotification({
        open: true,
        message: t('invoices.ocrError'),
        severity: 'error'
      });
    } finally {
      setIsExtracting(false);
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.invoiceNumber) {
      newErrors.invoiceNumber = t('validation.required');
    }
    
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = t('validation.required');
    }
    
    if (!formData.amount) {
      newErrors.amount = t('validation.required');
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = t('validation.numeric');
    }
    
    if (!formData.provider) {
      newErrors.provider = t('validation.required');
    }
    
    if (!formData.invoiceType) {
      newErrors.invoiceType = t('validation.required');
    }
    
    // Numeric validations
    if (formData.consumption && isNaN(parseFloat(formData.consumption))) {
      newErrors.consumption = t('validation.numeric');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setNotification({
        open: true,
        message: t('validation.checkErrors'),
        severity: 'error'
      });
      return;
    }
    
    try {
      const invoiceData: CreateInvoiceRequest = {
        invoice_number: formData.invoiceNumber,
        invoice_date: formData.invoiceDate,
        payment_due_date: formData.dueDate || undefined,
        total_amount: parseFloat(formData.amount),
        is_paid: formData.status === 'paid',
        provider: formData.provider,
        invoice_type: formData.invoiceType,
        total_consumption_kwh: formData.consumption ? parseFloat(formData.consumption) : 0,
        unit: formData.unit || undefined,
        period: formData.period || undefined
      };
      
      // Dispatch createInvoice action
      const resultAction = await dispatch(createInvoice(invoiceData));
      
      if (createInvoice.fulfilled.match(resultAction)) {
        setNotification({
          open: true,
          message: t('invoices.addSuccess'),
          severity: 'success'
        });
        
        // Redirect to invoices list after a short delay
        setTimeout(() => {
          navigate('/invoices');
        }, 1500);
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setNotification({
        open: true,
        message: t('invoices.addError'),
        severity: 'error'
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/invoices')}
          sx={{ mr: 2 }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h5" component="h1">
          <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('invoices.addNew')}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* OCR Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('invoices.uploadTitle')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FileUpload onFileSelected={handleFileSelected} />
                  {uploadedFile && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('invoices.fileSelected')}: {uploadedFile.name}
                      </Typography>
                    </Box>
                  )}
                  {isExtracting && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2">{t('invoices.extracting')}</Typography>
                    </Box>
                  )}
                  {extractionComplete && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      {t('invoices.extractionComplete')}
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('invoices.ocrDescription')}
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {t('invoices.ocrTip')}
                  </Alert>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Form Inputs - All in one section now */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {t('invoices.formTitle')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={t('invoices.invoiceNumber')}
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    error={Boolean(errors.invoiceNumber)}
                    helperText={errors.invoiceNumber}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={t('invoices.invoiceDate')}
                    name="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    error={Boolean(errors.invoiceDate)}
                    helperText={errors.invoiceDate}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={t('invoices.provider')}
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    error={Boolean(errors.provider)}
                    helperText={errors.provider}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" error={Boolean(errors.invoiceType)}>
                    <InputLabel id="invoiceType-label" required>
                      {t('invoices.invoiceType')}
                    </InputLabel>
                    <Select
                      labelId="invoiceType-label"
                      name="invoiceType"
                      value={formData.invoiceType}
                      label={t('invoices.invoiceType')}
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="electricity">{t('invoices.types.electricity')}</MenuItem>
                      <MenuItem value="water">{t('invoices.types.water')}</MenuItem>
                      <MenuItem value="natural_gas">{t('invoices.types.naturalGas')}</MenuItem>
                      <MenuItem value="internet">{t('invoices.types.internet')}</MenuItem>
                      <MenuItem value="other">{t('invoices.types.other')}</MenuItem>
                    </Select>
                    {errors.invoiceType && (
                      <FormHelperText>{errors.invoiceType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Payment Info */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={t('invoices.amount')}
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    error={Boolean(errors.amount)}
                    helperText={errors.amount}
                    InputProps={{ endAdornment: '₺' }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('invoices.dueDate')}
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">
                      {t('invoices.status')}
                    </InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={formData.status}
                      label={t('invoices.status')}
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="paid">{t('invoices.statuses.paid')}</MenuItem>
                      <MenuItem value="unpaid">{t('invoices.statuses.unpaid')}</MenuItem>
                      <MenuItem value="overdue">{t('invoices.statuses.overdue')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Consumption Details */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('invoices.consumption')}
                    name="consumption"
                    value={formData.consumption}
                    onChange={handleInputChange}
                    error={Boolean(errors.consumption)}
                    helperText={errors.consumption}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('invoices.unit')}
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('invoices.period')}
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Hesap No"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Tekil Kod / Tesisat No"
                    name="installationNumber"
                    value={formData.installationNumber}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Müşteri No"
                    name="customerNumber"
                    value={formData.customerNumber}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Fatura Ort. Tüketim (Günlük Ortalama)"
                    name="averageConsumption"
                    value={formData.averageConsumption}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Ad Soyad"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Adres"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Tüketici Grubu"
                    name="consumerGroup"
                    value={formData.consumerGroup}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/invoices')}
                sx={{ mr: 2 }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                {t('common.save')}
              </Button>
            </Grid>
          </Grid>
        </Box>
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

export default InvoiceAdd; 