const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestion.controller');
const { verifySession, isOwnerOrAdmin, isEnergyConsultant } = require('../middleware/auth.middleware');

// Suggestion routes
router.get('/', verifySession, suggestionController.getAllSuggestions);

// Özel endpoint'ler dinamik route'lardan ÖNCE tanımlanmalı 
// Yeni route: Kullanıcının cihazlarına göre öneri oluşturma
router.post('/generate', verifySession, suggestionController.generateSuggestionsForUser);

// Yeni route: AI öneri oluşturma
router.post('/generate-ai', verifySession, suggestionController.generateAiSuggestions);

// Yeni route: Kullanıcının önerilerini temizleme
router.delete('/clear', verifySession, suggestionController.clearAllSuggestions);

// Dinamik parametre içeren route'lar
router.get('/:id', verifySession, suggestionController.getSuggestionById);
router.post('/', verifySession, isEnergyConsultant, suggestionController.createSuggestion);
router.put('/:id', verifySession, isEnergyConsultant, suggestionController.updateSuggestion);
router.delete('/:id', verifySession, isEnergyConsultant, suggestionController.deleteSuggestion);
router.put('/:id/apply', verifySession, suggestionController.applySuggestion);
router.put('/:id/reject', verifySession, suggestionController.rejectSuggestion);

module.exports = router; 