const { GoogleGenerativeAI } = require('@google/generative-ai');
const dataIntegrationService = require('./data-integration.service');
require('dotenv').config();

// Initialize Gemini API with API key from environment
// Using the hardcoded API key directly instead of environment variable
const genAI = new GoogleGenerativeAI("AIzaSyAiucoM-HBpx5dn18rHovQW34hZ0UNljDE");

/**
 * Detect the language of a message
 * @param {string} message - User message to detect language
 * @returns {string} - Detected language code (tr-TR, en-US, or auto)
 */
const detectMessageLanguage = async (message) => {
  try {
    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Basic language detection prompt
    const prompt = `
    Please analyze the following text and tell me if it is in Turkish (tr-TR) or English (en-US). 
    If you're not sure or it's another language, respond with 'auto'.
    Only respond with one of these exact labels: 'tr-TR', 'en-US', or 'auto'.
    Nothing else.

    Text: "${message}"
    `;
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Process the response and extract the language code
    const languageCode = text.includes('tr-TR') ? 'tr-TR' : 
                         text.includes('en-US') ? 'en-US' : 'auto';
    
    return languageCode;
  } catch (error) {
    console.error('Language detection error:', error);
    // Default to auto on error
    return 'auto';
  }
};

/**
 * Get energy assistant response using Gemini API
 * @param {number} userId - User ID for context gathering
 * @param {string} message - User message
 * @param {string} language - Language code
 * @returns {Object} - Response object with text and detected language
 */
const getEnergyAssistantResponse = async (userId, message, language) => {
  try {
    // Auto-detect language if not specified
    let detectedLanguage = language;
    if (language === 'auto') {
      detectedLanguage = await detectMessageLanguage(message);
    }
    
    // Collect user context data using the data integration service
    const userData = await dataIntegrationService.getUserContextData(userId);
    
    // Add language-specific instructions
    const languageInstructions = detectedLanguage === 'tr-TR' 
      ? "Lütfen yanıtınızı sadece Türkçe olarak verin. Kullanıcı Türkçe konuşuyor ve enerji tasarrufu konusunda yardım istiyor."
      : detectedLanguage === 'en-US'
      ? "Please provide your response only in English. The user speaks English and is asking for help with energy saving."
      : "Please detect the language of the user's message and respond in the same language (Turkish or English). If you can't determine the language, respond in English.";
    
    // Create a structured prompt for the assistant
    // Use data integration service with additional language instruction
    const promptBase = dataIntegrationService.createStructuredPrompt(userData, 'assistant', message);
    const prompt = `${languageInstructions}\n\n${promptBase}`;
    
    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      text,
      detectedLanguage
    };
  } catch (error) {
    console.error('Energy assistant response error:', error);
    
    // Return a user-friendly error message in the appropriate language
    const errorMessage = language === 'tr-TR'
      ? "Üzgünüm, yanıt oluştururken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      : "I'm sorry, there was a problem generating a response. Please try again later.";
      
    return {
      text: errorMessage,
      detectedLanguage: language
    };
  }
};

module.exports = {
  detectMessageLanguage,
  getEnergyAssistantResponse
}; 