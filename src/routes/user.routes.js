const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifySession, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');

// Admin routes
router.get('/', verifySession, isAdmin, userController.getAllUsers);
router.put('/:id/deactivate', verifySession, isAdmin, userController.deactivateUser);
router.put('/:id/activate', verifySession, isAdmin, userController.activateUser);
router.put('/:id/role', verifySession, isAdmin, userController.changeUserRole);

// User routes (protected)
router.get('/:id', verifySession, isOwnerOrAdmin('id'), userController.getUserById);
router.put('/:id', verifySession, isOwnerOrAdmin('id'), userController.updateUser);
router.put('/:id/household', verifySession, isOwnerOrAdmin('id'), userController.updateHouseholdInfo);

module.exports = router; 