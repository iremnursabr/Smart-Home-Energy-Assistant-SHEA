// Mock Invoice Service
// This service simulates API responses for invoice operations
// Used for development/testing when a real backend is not available

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Invoice interface
interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  period: string;
  provider: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Mock invoice data
const mockInvoices: Invoice[] = [];

// Mock fetch invoices
export const mockFetchInvoices = async (): Promise<Invoice[]> => {
  await delay(800);
  return [...mockInvoices];
};

// Mock fetch invoice by ID
export const mockFetchInvoiceById = async (id: string): Promise<Invoice> => {
  await delay(500);
  const invoice = mockInvoices.find(invoice => invoice.id === id);
  
  if (!invoice) {
    throw new Error('Invoice not found');
  }
  
  return { ...invoice };
};

// Mock add invoice
export const mockAddInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  await delay(1000);
  
  // Generate a new ID
  const newId = `invoice-${Date.now()}`;
  
  // Create new invoice
  const newInvoice: Invoice = {
    id: newId,
    date: invoiceData.date || new Date().toISOString(),
    dueDate: invoiceData.dueDate || new Date().toISOString(),
    amount: invoiceData.amount || 0,
    status: invoiceData.status || 'unpaid',
    period: invoiceData.period || '',
    provider: invoiceData.provider || '',
    invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
    ...invoiceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to mock data
  mockInvoices.push(newInvoice);
  
  return { ...newInvoice };
};

// Mock update invoice
export const mockUpdateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  await delay(1000);
  
  const invoiceIndex = mockInvoices.findIndex(invoice => invoice.id === id);
  
  if (invoiceIndex === -1) {
    throw new Error('Invoice not found');
  }
  
  // Update invoice
  const updatedInvoice: Invoice = {
    ...mockInvoices[invoiceIndex],
    ...invoiceData,
    updatedAt: new Date().toISOString()
  };
  
  // Update in mock data
  mockInvoices[invoiceIndex] = updatedInvoice;
  
  return { ...updatedInvoice };
};

// Mock delete invoice
export const mockDeleteInvoice = async (id: string): Promise<{ success: boolean }> => {
  await delay(800);
  
  const invoiceIndex = mockInvoices.findIndex(invoice => invoice.id === id);
  
  if (invoiceIndex === -1) {
    throw new Error('Invoice not found');
  }
  
  // Remove from mock data
  mockInvoices.splice(invoiceIndex, 1);
  
  return { success: true };
};

export default {
  fetchInvoices: mockFetchInvoices,
  fetchInvoiceById: mockFetchInvoiceById,
  addInvoice: mockAddInvoice,
  updateInvoice: mockUpdateInvoice,
  deleteInvoice: mockDeleteInvoice
}; 