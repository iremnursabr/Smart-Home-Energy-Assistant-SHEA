const { User, Device, EnergyConsumption, HouseholdInfo, SurveyResponse } = require('../models');
const { detectMessageLanguage, getEnergyAssistantResponse } = require('../services/assistant.service');
const { getUserContextData } = require('../services/data-integration.service');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const assistantController = {
  /**
   * Chat with the energy assistant using Gemini API
   */
  chatWithAssistant: async (req, res) => {
    try {
      const userId = req.user.id;
      const { message, language = 'auto' } = req.body;

      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      // Get response from Gemini API with user context
      const assistantResponse = await getEnergyAssistantResponse(userId, message, language);

      return res.status(200).json({
        status: 'success',
        data: assistantResponse
      });
    } catch (error) {
      console.error('Assistant chat error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error getting assistant response',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Detect the language of a message
   */
  detectLanguage: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      const detectedLanguage = await detectMessageLanguage(message);

      return res.status(200).json({
        status: 'success',
        data: { language: detectedLanguage }
      });
    } catch (error) {
      console.error('Language detection error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error detecting language',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get user context data for the assistant
   */
  getUserContext: async (req, res) => {
    try {
      const userId = req.user.id;
      // Use the data integration service to get the user context
      const userData = await getUserContextData(userId);

      return res.status(200).json({
        status: 'success',
        data: userData
      });
    } catch (error) {
      console.error('Get user context error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error getting user context data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = assistantController; 