const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomaly.controller');
const { verifySession, isOwnerOrAdmin, isEnergyConsultant } = require('../middleware/auth.middleware');

// Anomaly routes
router.get('/', verifySession, anomalyController.getAllAnomalies);
router.get('/user/:userId', verifySession, isOwnerOrAdmin('userId'), anomalyController.getUserAnomalies);
router.get('/device/:deviceId', verifySession, anomalyController.getDeviceAnomalies);
router.get('/:id', verifySession, anomalyController.getAnomalyById);
router.post('/', verifySession, isEnergyConsultant, anomalyController.createAnomaly);
router.put('/:id', verifySession, isEnergyConsultant, anomalyController.updateAnomalyStatus);
router.delete('/:id', verifySession, isEnergyConsultant, anomalyController.deleteAnomaly);
router.put('/:id/resolve', verifySession, anomalyController.resolveAnomaly);
router.post('/detect', verifySession, anomalyController.detectAnomalies);

module.exports = router; 