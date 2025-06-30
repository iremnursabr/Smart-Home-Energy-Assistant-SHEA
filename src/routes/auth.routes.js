const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifySession } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', verifySession, authController.getProfile);
router.put('/profile', verifySession, authController.updateProfile);

module.exports = router; 