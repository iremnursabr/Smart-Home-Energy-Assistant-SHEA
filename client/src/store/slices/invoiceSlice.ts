import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface Invoice {
  id: string;
  user_id: string;
  invoice_number?: string;
  total_amount: number;
  total_consumption_kwh: number;
  invoice_date: string;
  payment_due_date?: string;
  is_paid: boolean;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  file_path?: string;
  provider?: string;
  invoice_type?: string;
  period?: string;
  unit?: string;
}

export interface FetchInvoicesParams {
  status?: string;
  type?: string;
}

export interface CreateInvoiceRequest {
  invoice_number?: string;
  invoice_date: string;
  total_consumption_kwh: number;
  total_amount: number;
  payment_due_date?: string;
  is_paid?: boolean;
  notes?: string;
  provider?: string;
  invoice_type?: string;
  period?: string;
  unit?: string;
}

interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
}

// API base URL
const API_URL = 'http://localhost:5000/api';

// Configure axios for session-based auth
const axiosConfig = {
  withCredentials: true
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (params: FetchInvoicesParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      
      const url = `${API_URL}/invoices?${queryParams.toString()}`;
      
      console.log('Fetching invoices from:', url);
      
      const response = await axios.get(url, axiosConfig);
      
      console.log('Invoices API response:', response.data);
      
      if (!response.data || !response.data.data) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format');
      }
      
      // Ensure consistent data structure and handle potential null values
      const invoicesList = response.data.data.invoices || [];
      console.log('Parsed invoices list:', invoicesList);
      
      return invoicesList;
    } catch (error: any) {
      console.error('Fetch invoices error:', error);
      
      // Detaylı hata bilgisini loglayalım
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch invoices'
      );
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Fetching invoice with ID:', id);
      const response = await axios.get(`${API_URL}/invoices/${id}`, axiosConfig);
      
      console.log('Invoice API response:', response.data);
      
      if (!response.data || !response.data.data || !response.data.data.invoice) {
        console.error('Invalid response format for invoice details:', response.data);
        throw new Error('Invalid response format for invoice details');
      }
      
      // Return the invoice object from the response
      const invoiceData = response.data.data.invoice;
      console.log('Parsed invoice data:', invoiceData);
      return invoiceData;
    } catch (error: any) {
      console.error('Fetch invoice by ID error:', error);
      
      // Detaylı hata bilgisini loglayalım
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch invoice'
      );
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (invoiceData: CreateInvoiceRequest, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/invoices`, invoiceData, axiosConfig);
      return response.data.data.invoice;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }: { id: string; data: Partial<Invoice> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/invoices/${id}`, data, axiosConfig);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/invoices/${id}`, axiosConfig);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete invoice');
    }
  }
);

export const markInvoiceAsPaid = createAsyncThunk(
  'invoices/markAsPaid',
  async ({ id, paymentMethod, paymentDate }: { id: string; paymentMethod: string; paymentDate?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/invoices/${id}/pay`, 
        { payment_method: paymentMethod, payment_date: paymentDate || new Date().toISOString() },
        axiosConfig
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark invoice as paid');
    }
  }
);

export const uploadInvoiceFile = createAsyncThunk(
  'invoices/uploadFile',
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('invoice_file', file);
      
      const config = {
        ...axiosConfig,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(
        `${API_URL}/invoices/${id}/upload`, 
        formData,
        config
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload invoice file');
    }
  }
);

// Initial state
const initialState: InvoiceState = {
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null
};

// Slice
const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all invoices
    builder.addCase(fetchInvoices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchInvoices.fulfilled, (state, action) => {
      state.isLoading = false;
      state.invoices = action.payload;
      state.error = null;
    });
    builder.addCase(fetchInvoices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch invoice by ID
    builder.addCase(fetchInvoiceById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchInvoiceById.fulfilled, (state, action: PayloadAction<Invoice>) => {
      state.isLoading = false;
      state.selectedInvoice = action.payload;
    });
    builder.addCase(fetchInvoiceById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create invoice
    builder.addCase(createInvoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
      state.isLoading = false;
      state.invoices.push(action.payload);
    });
    builder.addCase(createInvoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update invoice
    builder.addCase(updateInvoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
      state.isLoading = false;
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
      if (state.selectedInvoice && state.selectedInvoice.id === action.payload.id) {
        state.selectedInvoice = action.payload;
      }
    });
    builder.addCase(updateInvoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete invoice
    builder.addCase(deleteInvoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteInvoice.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
      if (state.selectedInvoice && state.selectedInvoice.id === action.payload) {
        state.selectedInvoice = null;
      }
    });
    builder.addCase(deleteInvoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Mark invoice as paid
    builder.addCase(markInvoiceAsPaid.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(markInvoiceAsPaid.fulfilled, (state, action: PayloadAction<Invoice>) => {
      state.isLoading = false;
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
      if (state.selectedInvoice && state.selectedInvoice.id === action.payload.id) {
        state.selectedInvoice = action.payload;
      }
    });
    builder.addCase(markInvoiceAsPaid.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Upload invoice file
    builder.addCase(uploadInvoiceFile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(uploadInvoiceFile.fulfilled, (state, action: PayloadAction<Invoice>) => {
      state.isLoading = false;
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
      if (state.selectedInvoice && state.selectedInvoice.id === action.payload.id) {
        state.selectedInvoice = action.payload;
      }
    });
    builder.addCase(uploadInvoiceFile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearError, clearSelectedInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer; 