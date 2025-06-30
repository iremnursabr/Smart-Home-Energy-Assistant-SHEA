// Survey controller implementation
const { SurveyResponse } = require('../models');

const surveyController = {
  getAllSurveyResponses: (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Get all survey responses endpoint - to be implemented',
      data: []
    });
  },
  getSurveyResponseById: (req, res) => {
    res.status(200).json({
      status: 'success',
      message: `Get survey response by ID endpoint - to be implemented for ID: ${req.params.id}`,
      data: {}
    });
  },
  createSurveyResponse: async (req, res) => {
    try {
      const { user_id, location, household_size, children, working_adults, home_hours } = req.body;
      
      // Gerekli alanları doğrula
      if (!user_id) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required',
          data: null
        });
      }
      
      if (household_size === undefined || isNaN(household_size)) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid household size is required',
          data: null
        });
      }
      
      console.log('Creating/updating survey response for user:', user_id, {
        location, household_size, children, working_adults, home_hours
      });
      
      // Check if user already has a survey response
      const existingResponse = await SurveyResponse.findOne({
        where: { user_id }
      });
      
      let surveyResponse;
      
      if (existingResponse) {
        // Update existing response
        surveyResponse = await existingResponse.update({
          location,
          household_size,
          children,
          working_adults,
          home_hours
        });
        
        console.log('Updated existing survey response:', JSON.stringify(surveyResponse));
      } else {
        // Create new response
        surveyResponse = await SurveyResponse.create({
          user_id,
          location,
          household_size,
          children,
          working_adults,
          home_hours
        });
        
        console.log('Created new survey response:', JSON.stringify(surveyResponse));
      }
      
      res.status(201).json({
        status: 'success',
        message: 'Survey response saved successfully',
        data: surveyResponse
      });
    } catch (error) {
      console.error('Error saving survey response:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to save survey response',
        error: error.message
      });
    }
  },
  updateSurveyResponse: (req, res) => {
    res.status(200).json({
      status: 'success',
      message: `Update survey response endpoint - to be implemented for ID: ${req.params.id}`,
      data: {}
    });
  },
  deleteSurveyResponse: (req, res) => {
    res.status(200).json({
      status: 'success',
      message: `Delete survey response endpoint - to be implemented for ID: ${req.params.id}`
    });
  },
  getSurveyQuestions: (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Get survey questions endpoint - to be implemented',
      data: []
    });
  },
  getUserSurveyResponses: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Kullanıcı kimliğinin doğruluğunu kontrol et
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required',
          data: null
        });
      }
      
      const surveyResponse = await SurveyResponse.findOne({
        where: { user_id: userId }
      });
      
      if (!surveyResponse) {
        return res.status(404).json({
          status: 'error',
          message: 'No survey response found for this user',
          data: null
        });
      }
      
      // Loglama ekleyelim
      console.log(`Survey data retrieved for user ${userId}:`, JSON.stringify(surveyResponse));
      
      res.status(200).json({
        status: 'success',
        message: 'Retrieved user survey response',
        data: surveyResponse
      });
    } catch (error) {
      console.error('Error retrieving user survey response:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user survey response',
        error: error.message
      });
    }
  }
};

module.exports = surveyController; 