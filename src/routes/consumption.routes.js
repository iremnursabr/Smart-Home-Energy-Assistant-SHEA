const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumption.controller');
const { verifySession, isOwnerOrAdmin } = require('../middleware/auth.middleware');

// Consumption routes
router.get('/', verifySession, consumptionController.getAllConsumptions);
router.get('/device/:deviceId', verifySession, consumptionController.getConsumptionsByDevice);
router.get('/range/:startDate/:endDate', verifySession, consumptionController.getConsumptionsByDateRange);
router.get('/by-period', verifySession, consumptionController.getConsumptionsByPeriod);
router.get('/:id', verifySession, consumptionController.getConsumptionById);
router.post('/', verifySession, consumptionController.createConsumption);
router.put('/:id', verifySession, consumptionController.updateConsumption);
router.delete('/:id', verifySession, consumptionController.deleteConsumption);

module.exports = router; 