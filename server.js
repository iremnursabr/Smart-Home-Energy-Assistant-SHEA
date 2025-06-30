const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { testConnection } = require('./src/config/database');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create logs directory if it doesn't exist
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Frontend URLs
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logger middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body));
  }
  next();
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'smart_energy_secret',
  resave: false,
  saveUninitialized: false,
  name: 'smart_energy_sid', // Custom session ID name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS required in production
    httpOnly: true, // Cannot be accessed through client-side JS
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
    sameSite: 'lax' // Protection against CSRF
  }
}));

// Logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Console logging in development
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/devices', require('./src/routes/device.routes'));
app.use('/api/consumption', require('./src/routes/consumption.routes'));
app.use('/api/invoices', require('./src/routes/invoice.routes'));
app.use('/api/suggestions', require('./src/routes/suggestion.routes'));
app.use('/api/survey', require('./src/routes/survey.routes'));
app.use('/api/anomalies', require('./src/routes/anomaly.routes'));
app.use('/api/assistant', require('./src/routes/assistant.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve static assets in production and development
app.use(express.static(path.join(__dirname, 'client/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
      });
    } else {
      console.error('Server not started due to database connection failure');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 