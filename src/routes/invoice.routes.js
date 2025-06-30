const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifySession, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for OCR file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'ocr-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, JPG, JPEG, and PNG files
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// OCR file upload configuration
const ocrUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.get('/', verifySession, invoiceController.getAllInvoices);
router.get('/:id', verifySession, isOwnerOrAdmin('id'), invoiceController.getInvoiceById);
router.post('/', verifySession, invoiceController.createInvoice);
router.put('/:id', verifySession, isOwnerOrAdmin('id'), invoiceController.updateInvoice);
router.delete('/:id', verifySession, isOwnerOrAdmin('id'), invoiceController.deleteInvoice);

// OCR endpoints
router.post('/extract', verifySession, upload.single('invoice_file'), invoiceController.extractInvoiceDataFromImage);

// Add new OCR processing endpoint (no auth for testing)
router.post('/ocr', ocrUpload.single('invoice_file'), invoiceController.ocrProcessing);

// File upload endpoint
router.post('/upload', verifySession, upload.single('invoice_file'), invoiceController.uploadInvoiceFile);

// Mark as paid endpoint
router.put('/:id/pay', verifySession, isOwnerOrAdmin('id'), invoiceController.markInvoiceAsPaid);

module.exports = router; 