const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const { verifySession, isOwnerOrAdmin } = require('../middleware/auth.middleware');

// Device routes
router.get('/', verifySession, deviceController.getAllDevices);
router.get('/type/:type', verifySession, deviceController.getDevicesByType);
router.get('/:id', verifySession, deviceController.getDeviceById);
router.post('/', verifySession, deviceController.createDevice);
router.put('/:id', verifySession, deviceController.updateDevice);
router.delete('/:id', verifySession, deviceController.deleteDevice);
// Kullanım saati ve günü bilgilerini güncellemek için yeni endpoint
router.patch('/:id/usage', verifySession, deviceController.updateDeviceUsageHours);

module.exports = router; 