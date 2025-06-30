const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/survey.controller');
const { verifySession, isOwnerOrAdmin } = require('../middleware/auth.middleware');

// Survey routes
router.get('/', verifySession, surveyController.getAllSurveyResponses);
router.get('/questions', verifySession, surveyController.getSurveyQuestions);
router.get('/user/:userId', verifySession, isOwnerOrAdmin('userId'), surveyController.getUserSurveyResponses);
router.get('/:id', verifySession, surveyController.getSurveyResponseById);
router.post('/', verifySession, surveyController.createSurveyResponse);
router.put('/:id', verifySession, surveyController.updateSurveyResponse);
router.delete('/:id', verifySession, surveyController.deleteSurveyResponse);

module.exports = router; 