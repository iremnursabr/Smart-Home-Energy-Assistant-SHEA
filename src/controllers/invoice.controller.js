const { Invoice, User } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const { extractInvoiceData } = require('../services/ocr.service');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/invoices');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'invoice-' + uniqueSuffix + ext);
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

// Basitleştirilmiş görüntü ön işleme fonksiyonu
const preprocessImage = async (filePath) => {
  console.log('Görüntü ön işleme başlatılıyor:', filePath);
  
  // Dosyanın var olduğunu kontrol et
  if (!fs.existsSync(filePath)) {
    console.error('Dosya mevcut değil:', filePath);
    throw new Error('Dosya bulunamadı');
  }
  
  // Jimp işlemleri yerine doğrudan orijinal dosyayı kullan
  return { original: filePath };
};

/**
 * Get all invoices for a user
 * @route GET /api/invoices
 */
const getAllInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    let whereClause = {};
    
    // Regular users can only get their own invoices
    if (!isAdmin) {
      whereClause.user_id = userId;
    } else if (req.query.userId) {
      // Admin can get invoices for any user
      whereClause.user_id = req.query.userId;
    }

    // Add status filter if provided
    if (req.query.status === 'paid') {
      whereClause.is_paid = true;
    } else if (req.query.status === 'unpaid') {
      whereClause.is_paid = false;
    }

    // Add type filter if provided
    if (req.query.type) {
      whereClause.invoice_type = req.query.type;
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      order: [['invoice_date', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }]
    });

    return res.status(200).json({
      status: 'success',
      data: {
        invoices
      }
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get invoice by ID
 * @route GET /api/invoices/:id
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const invoice = await Invoice.findByPk(id);
    console.log('Bulunan fatura verisi:', JSON.stringify(invoice, null, 2));

    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found'
      });
    }

    // Check if user is authorized to access this invoice
    if (!isAdmin && invoice.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this invoice'
      });
    }

    // Boş string olan alanları null olarak dönüştürelim
    const processedInvoice = { ...invoice.get({ plain: true }) };
    
    // Boş string kontrolü
    if (processedInvoice.provider === '') processedInvoice.provider = null;
    if (processedInvoice.invoice_type === '') processedInvoice.invoice_type = null;
    if (processedInvoice.period === '') processedInvoice.period = null;
    if (processedInvoice.notes === '') processedInvoice.notes = null;

    // Fatura verilerini istemciye göndermeden önce logla
    console.log('İstemciye gönderilen fatura verisi:', JSON.stringify({
      status: 'success',
      data: {
        invoice: processedInvoice
      }
    }, null, 2));

    return res.status(200).json({
      status: 'success',
      data: {
        invoice: processedInvoice
      }
    });
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new invoice
 * @route POST /api/invoices
 */
const createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      invoice_number,
      invoice_date,
      total_consumption_kwh,
      total_amount,
      payment_due_date,
      is_paid,
      notes,
      provider,
      invoice_type,
      period,
      unit
    } = req.body;

    // Validate required fields
    if (!invoice_date || !total_consumption_kwh || !total_amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Invoice date, total consumption, and total amount are required'
      });
    }

    // Create invoice
    const invoice = await Invoice.create({
      user_id: userId,
      invoice_number,
      invoice_date,
      total_consumption_kwh,
      total_amount,
      payment_due_date,
      is_paid: is_paid !== undefined ? is_paid : false,
      notes,
      provider,
      invoice_type,
      period,
      unit
    });

    return res.status(201).json({
      status: 'success',
      message: 'Invoice created successfully',
      data: {
        invoice
      }
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error creating invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update an invoice
 * @route PUT /api/invoices/:id
 */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const {
      invoice_number,
      invoice_date,
      total_consumption_kwh,
      total_amount,
      payment_due_date,
      is_paid,
      notes,
      provider,
      invoice_type,
      period,
      unit
    } = req.body;

    // Find invoice
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found'
      });
    }

    // Check if user is authorized to update this invoice
    if (!isAdmin && invoice.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this invoice'
      });
    }

    // Update invoice
    await invoice.update({
      invoice_number,
      invoice_date,
      total_consumption_kwh,
      total_amount,
      payment_due_date,
      is_paid,
      notes,
      provider,
      invoice_type,
      period,
      unit
    });

    return res.status(200).json({
      status: 'success',
      message: 'Invoice updated successfully',
      data: {
        invoice
      }
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error updating invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete an invoice
 * @route DELETE /api/invoices/:id
 */
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Find invoice
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found'
      });
    }

    // Check if user is authorized to delete this invoice
    if (!isAdmin && invoice.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this invoice'
      });
    }

    // Delete invoice file if it exists
    if (invoice.file_path) {
      const filePath = path.join(__dirname, '../../', invoice.file_path);
      
      try {
        await unlinkAsync(filePath);
      } catch (err) {
        console.error('Error deleting invoice file:', err);
      }
    }

    // Delete invoice
    await invoice.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error deleting invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload invoice file
 * @route POST /api/invoices/:id/upload
 */
const uploadInvoiceFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Find invoice
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found'
      });
    }

    // Check if user is authorized to update this invoice
    if (!isAdmin && invoice.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this invoice'
      });
    }

    // Use multer to handle file upload
    const uploadMiddleware = upload.single('invoice_file');

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        });
      }

      // Delete old file if it exists
      if (invoice.file_path) {
        const oldFilePath = path.join(__dirname, '../../', invoice.file_path);
        
        try {
          await unlinkAsync(oldFilePath);
        } catch (err) {
          console.error('Error deleting old invoice file:', err);
        }
      }

      // Update invoice with new file path
      const relativePath = path.relative(path.join(__dirname, '../../'), req.file.path).replace(/\\/g, '/');
      
      await invoice.update({
        file_path: relativePath
      });

      return res.status(200).json({
        status: 'success',
        message: 'Invoice file uploaded successfully',
        data: {
          invoice
        }
      });
    });
  } catch (error) {
    console.error('Upload invoice file error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error uploading invoice file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark invoice as paid
 * @route PUT /api/invoices/:id/paid
 */
const markInvoiceAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Find invoice
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found'
      });
    }

    // Check if user is authorized to update this invoice
    if (!isAdmin && invoice.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this invoice'
      });
    }

    // Mark invoice as paid
    await invoice.update({
      is_paid: true
    });

    return res.status(200).json({
      status: 'success',
      message: 'Invoice marked as paid',
      data: {
        invoice
      }
    });
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error marking invoice as paid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * OCR ile fatura verisini çıkar
 * @route POST /api/invoices/extract
 */
const extractInvoiceDataFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    console.log('-------------------------------------------');
    console.log('OCR için dosya alındı:', req.file.path);
    console.log('Dosya bilgileri:', {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    // Dosyanın var olduğunu kontrol et
    if (!fs.existsSync(req.file.path)) {
      return res.status(404).json({
        status: 'error',
        message: 'Yüklenen dosya bulunamadı',
        error_details: `Dosya yolu: ${req.file.path}`
      });
    }
    
    // Dosya boyutunu kontrol et
    if (req.file.size === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Yüklenen dosya boş',
        error_details: `Dosya boyutu: ${req.file.size} bytes`
      });
    }
    
    try {
      // Doğrudan extractInvoiceData fonksiyonunu çağır
      // Preprocessed görüntüler yerine orijinal dosyayı kullan
      const extractedData = await extractInvoiceData(req.file.path);
      
      console.log('OCR işlemi tamamlandı, veri:', extractedData);
      
      // Çıkarılan veriler boşsa veya yeterli veri yoksa uyarı ekle
      let warning = null;
      const emptyFields = Object.entries(extractedData)
        .filter(([key, value]) => !value && ['invoiceNumber', 'invoiceDate', 'amount'].includes(key))
        .map(([key]) => key);
      
      if (emptyFields.length > 0) {
        warning = `Bazı önemli fatura bilgileri okunamadı. Lütfen eksik alanları manuel olarak doldurun.`;
      }
      
      // Başarı durumunda veriyi gönder
      return res.status(200).json({
        status: 'success',
        data: extractedData,
        warning
      });
    } catch (ocrError) {
      console.error('OCR veri çıkarma hatası:', ocrError);
      
      // OCR hatası oluştu, daha açıklayıcı bir hata mesajı dönelim
      return res.status(422).json({
        status: 'error',
        message: 'Fatura bilgileri görüntüden çıkarılamadı. Lütfen daha net bir görüntü ile tekrar deneyin veya manuel olarak bilgileri girin.',
        error_details: ocrError.message
      });
    }
  } catch (error) {
    console.error('OCR extraction error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Extract invoice data from uploaded file
const extractInvoiceDataHandler = async (req, res) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Fatura dosyası yüklenemedi.'
      });
    }

    console.log('OCR işlemi başlatılıyor:', req.file.path);
    
    // Extract data using OCR service
    const result = await extractInvoiceData(req.file.path);
    
    // Log the results for debugging
    console.log('OCR sonuçları:', JSON.stringify(result, null, 2));
    
    // Clean up temporary file
    await unlinkAsync(req.file.path);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Fatura verileri çıkarılırken hata oluştu:', error);
    
    // Try to clean up the file if it exists
    if (req.file && req.file.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error('Geçici dosya silinemedi:', unlinkError);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Fatura verileri çıkarılırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Ayrı bir OCR API endpoint'i ekleyelim (test ve debug için)
const ocrProcessing = async (req, res) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Fatura dosyası yüklenemedi.'
      });
    }

    console.log('OCR işlemi başlatılıyor:', req.file.path);
    
    // Extract data using OCR service from our services folder
    const result = await extractInvoiceData(req.file.path);
    
    // Log the results for debugging
    console.log('OCR sonuçları:', JSON.stringify(result, null, 2));
    
    // Clean up temporary file
    try {
      await unlinkAsync(req.file.path);
      console.log('Geçici dosya silindi:', req.file.path);
    } catch (unlinkError) {
      console.error('Geçici dosya silinemedi:', unlinkError);
    }
    
    // Ensure we're sending the correct format with consistent structure
    return res.status(200).json({
      status: 'success',
      data: {
        ...result.data
      },
      text: result.text || '',
      tables: result.tables || []
    });
  } catch (error) {
    console.error('OCR işlemi sırasında hata oluştu:', error);
    
    // Try to clean up the file if it exists
    if (req.file && req.file.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error('Geçici dosya silinemedi:', unlinkError);
      }
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'OCR işlemi sırasında bir hata oluştu.',
      error: error.message
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  uploadInvoiceFile,
  markInvoiceAsPaid,
  extractInvoiceDataFromImage,
  extractInvoiceDataHandler,
  ocrProcessing
}; 