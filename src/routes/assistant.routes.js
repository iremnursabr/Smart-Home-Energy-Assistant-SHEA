const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');
const { verifySession } = require('../middleware/auth.middleware');

// Assistant routes
router.post('/chat', verifySession, assistantController.chatWithAssistant);
router.post('/detect-language', verifySession, assistantController.detectLanguage);
router.get('/user-data', verifySession, assistantController.getUserContext);

module.exports = router; 