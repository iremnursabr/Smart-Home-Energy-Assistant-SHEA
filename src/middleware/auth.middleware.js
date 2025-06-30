const { User } = require('../models');
require('dotenv').config();

/**
 * Middleware to check if user is authenticated with session
 */
const verifySession = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session || !req.session.userId) {
      console.log('Session missing or userId not found in session', req.session);
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Find user by id
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
      
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'User account is deactivated'
      });
    }

    // Set user in request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Admin role required'
    });
  }
};

/**
 * Middleware to check if user has energy consultant role
 */
const isEnergyConsultant = (req, res, next) => {
  if (req.user && (req.user.role === 'energy_consultant' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Energy consultant role required'
    });
  }
};

/**
 * Middleware to check if user is the owner of the resource or an admin
 */
const isOwnerOrAdmin = (paramName) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;
      
      // Admin her zaman erişebilir
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Invoice modelini yükle
      const { Invoice } = require('../models');
      
      // Faturayı bul
      const invoice = await Invoice.findByPk(resourceId);
      
      if (!invoice) {
        return res.status(404).json({
          status: 'error',
          message: 'Invoice not found'
        });
      }
      
      // Kullanıcı faturanın sahibi mi kontrol et
      if (invoice.user_id === userId) {
        return next();
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this resource'
        });
      }
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error in authorization check',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = {
  verifySession,
  isAdmin,
  isEnergyConsultant,
  isOwnerOrAdmin
}; 