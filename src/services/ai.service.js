const { GoogleGenerativeAI } = require('@google/generative-ai');
const dataIntegrationService = require('./data-integration.service');
const { addPurchaseLinksToSuggestions } = require('../utils/device-links');
require('dotenv').config();

// Debug için API anahtarını yazdır
console.log('Using API key manually set in code');

// Initialize Gemini API with a hardcoded API key for testing
const genAI = new GoogleGenerativeAI("AIzaSyAiucoM-HBpx5dn18rHovQW34hZ0UNljDE");

/**
 * Generate AI-powered energy-saving suggestions based on user data
 * @param {number} userId - User ID to generate suggestions for
 * @returns {Array} - Array of suggestion objects
 */
const generateEnergySavingSuggestions = async (userId) => {
  try {
    // Use data integration service to collect all user context data
    const userData = await dataIntegrationService.getUserContextData(userId);
    
    // Model adını değiştiriyorum, kullanıcının istediği sürümü deniyoruz
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a structured prompt with user data
    const prompt = dataIntegrationService.createStructuredPrompt(userData, 'suggestions');
    
    // Log the prompt for debugging (remove in production)
    console.log('AI Prompt:', prompt);

    // Generate content from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Hata ayıklama için yanıtı yazdır
    console.log('AI Response:', text.substring(0, 200) + '...');

    // Parse the response into suggestions
    const suggestions = parseAiSuggestions(text);
    
    return suggestions;
  } catch (error) {
    console.error('AI suggestion generation error:', error);
    throw new Error('Failed to generate AI suggestions: ' + error.message);
  }
};

/**
 * Create a structured prompt for the AI based on user data
 * @param {Object} userData - User and household information
 * @param {Array} devices - User's devices
 * @param {Object} consumptionData - Energy consumption data
 * @returns {String} - Formatted prompt for the AI
 */
const createSuggestionPrompt = (userData, devices, consumptionData) => {
  // Extract relevant information
  const { household_size, home_type, home_size_sqm } = userData.householdInfo || {};
  
  // Format devices information
  const devicesInfo = devices.map(device => 
    `- ${device.name} (${device.device_type}): ${device.power_consumption_watts || 0} watts, ` +
    `${device.usage_frequency_hours_per_day || 0} hours/day, ` +
    `${device.usage_days_per_week || 7} days/week, ` +
    `Efficiency: ${device.energy_efficiency_class || 'Unknown'}`
  ).join('\n');
  
  // Format consumption data
  const avgConsumption = consumptionData.averageDaily || 'Unknown';
  const totalConsumption = consumptionData.totalMonthly || 'Unknown';
  
  // Build the prompt
  return `
Analyze this household's energy usage and provide 5 personalized energy-saving suggestions:

HOUSEHOLD INFORMATION:
- Home type: ${home_type || 'Unknown'}
- Home size: ${home_size_sqm || 'Unknown'} square meters
- Household size: ${household_size || 'Unknown'} people

DEVICES:
${devicesInfo}

ENERGY CONSUMPTION:
- Average daily consumption: ${avgConsumption} kWh
- Total monthly consumption: ${totalConsumption} kWh

Provide 5 practical energy-saving suggestions based on this data. For each suggestion:
1. Provide a clear, concise title (maximum 10 words)
2. Write a detailed explanation (2-3 sentences)
3. Estimate potential energy savings as a percentage
4. Assign a difficulty level (Easy, Medium, Hard)

Format each suggestion as follows:
TITLE: [suggestion title]
DESCRIPTION: [detailed explanation]
SAVINGS: [estimated percentage]
DIFFICULTY: [level]

Only provide the 5 suggestions in the exact format specified above. Do not include any introductory or concluding text.
`;
};

/**
 * Parse the AI response text into structured suggestion objects
 * @param {String} text - Raw text response from AI
 * @returns {Array} - Array of parsed suggestion objects
 */
const parseAiSuggestions = (text) => {
  try {
    console.log('Parsing AI suggestions from text:', text.substring(0, 300) + '...');
    
    const suggestions = [];
    
    // Split the response into individual suggestions
    const suggestionBlocks = text.split(/TITLE:/i).filter(block => block.trim());
    console.log('Found suggestion blocks:', suggestionBlocks.length);
    
    for (const block of suggestionBlocks) {
      const titleMatch = block.match(/^(.+?)(?=DESCRIPTION:|$)/is);
      const descriptionMatch = block.match(/DESCRIPTION:(.+?)(?=SAVINGS:|$)/is);
      const savingsMatch = block.match(/SAVINGS:(.+?)(?=DIFFICULTY:|$)/is);
      const difficultyMatch = block.match(/DIFFICULTY:(.+?)(?=$|TITLE:)/is);
      
      console.log('Parsing block:', block.substring(0, 100) + '...');
      console.log('Title match:', titleMatch ? titleMatch[1].trim() : 'none');
      
      if (titleMatch && descriptionMatch) {
        const title = titleMatch[1].trim();
        const description = descriptionMatch[1].trim();
        const savings = savingsMatch ? savingsMatch[1].trim() : 'Unknown';
        const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'Medium';
        
        suggestions.push({
          title,
          description,
          estimated_savings: savings,
          difficulty: difficulty.toLowerCase(),
          source: 'ai'
        });
      }
    }
    
    console.log('Parsed suggestions:', suggestions.length);
    if (suggestions.length === 0) {
      // Alternatif parsing metodu deneyelim - format farklı olabilir
      console.log('Trying alternative parsing method...');
      
      // Basit bir rule-based parsing metodu
      const lines = text.split('\n');
      let currentSuggestion = {};
      let inDescription = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        if (trimmedLine.toUpperCase().startsWith('TITLE:')) {
          // Önceki öneriyi kaydet
          if (currentSuggestion.title) {
            suggestions.push({...currentSuggestion, source: 'ai'});
            currentSuggestion = {};
          }
          
          currentSuggestion.title = trimmedLine.substring(6).trim();
          inDescription = false;
        } else if (trimmedLine.toUpperCase().startsWith('DESCRIPTION:')) {
          currentSuggestion.description = trimmedLine.substring(12).trim();
          inDescription = true;
        } else if (trimmedLine.toUpperCase().startsWith('SAVINGS:')) {
          currentSuggestion.estimated_savings = trimmedLine.substring(8).trim();
          inDescription = false;
        } else if (trimmedLine.toUpperCase().startsWith('DIFFICULTY:')) {
          currentSuggestion.difficulty = trimmedLine.substring(11).trim().toLowerCase();
          inDescription = false;
        } else if (inDescription && currentSuggestion.description) {
          // Açıklama satırı devam ediyor
          currentSuggestion.description += ' ' + trimmedLine;
        }
      }
      
      // Son öneriyi ekle
      if (currentSuggestion.title) {
        suggestions.push({...currentSuggestion, source: 'ai'});
      }
      
      console.log('Parsed suggestions with alternative method:', suggestions.length);
    }
    
    // Eğer hala öneriler yoksa, yanıtı manuel olarak parse edelim
    if (suggestions.length === 0 && text.length > 20) {
      // Yanıt var, ancak parse edemedik - elle basit bir öneri ekleyelim
      console.log('Creating manual suggestion from response');
      const shortText = text.substring(0, 200);
      suggestions.push({
        title: "Öneriler oluşturuldu, ancak format sorunlu",
        description: "AI yanıt verdi ancak yanıt formatı beklendiği gibi değil. Yanıtın başlangıcı: " + shortText,
        estimated_savings: "Bilinmiyor",
        difficulty: "medium",
        source: 'ai'
      });
    }
    
    // Önerilere satın alma linklerini ekle
    console.log('Adding purchase links to suggestions...');
    const suggestionsWithLinks = addPurchaseLinksToSuggestions(suggestions);
    console.log('Purchase links added, suggestion count:', suggestionsWithLinks.length);
    
    return suggestionsWithLinks;
  } catch (error) {
    console.error('Error parsing AI suggestions:', error);
    // Hata durumunda bile bir öneri döndürelim
    return [{
      title: "Öneri oluşturma hatası",
      description: "Öneriler işlenirken bir hata oluştu. Lütfen tekrar deneyin.",
      estimated_savings: "Bilinmiyor",
      difficulty: "medium",
      source: 'ai'
    }];
  }
};

/**
 * Detect anomalies in user's energy consumption
 * @param {number} userId - User ID to analyze
 * @returns {Object} - Detected anomalies and recommendations
 */
const detectEnergyAnomalies = async (userId) => {
  try {
    // Use data integration service to collect all user context data
    const userData = await dataIntegrationService.getUserContextData(userId);
    
    // Check if we have enough consumption data to analyze
    if (!userData.consumptionData || 
        !userData.consumptionData.recentEntries || 
        userData.consumptionData.recentEntries.length < 3) {
      return {
        anomalies: [],
        message: "Not enough consumption data to analyze for anomalies"
      };
    }
    
    // Create a structured prompt for anomaly detection
    const prompt = dataIntegrationService.createStructuredPrompt(userData, 'anomaly');
    
    // Initialize the AI model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate content from the AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the anomaly detection results
    const anomalyData = parseAnomalyResponse(text);
    
    return anomalyData;
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return {
      anomalies: [],
      causes: [],
      recommendations: [],
      error: error.message
    };
  }
};

/**
 * Parse the anomaly detection response from the AI
 * @param {string} text - Raw AI response text
 * @returns {Object} - Structured anomaly data
 */
const parseAnomalyResponse = (text) => {
  try {
    // Extract anomalies, causes, and recommendations sections
    const anomaliesMatch = text.match(/ANOMALIES:(.*?)(?=CAUSES:|$)/is);
    const causesMatch = text.match(/CAUSES:(.*?)(?=RECOMMENDATIONS:|$)/is);
    const recommendationsMatch = text.match(/RECOMMENDATIONS:(.*?)$/is);
    
    // Parse anomalies
    const anomalies = anomaliesMatch 
      ? anomaliesMatch[1].trim().split(/\n-|\n\d+\./).filter(item => item.trim()).map(item => item.trim())
      : [];
      
    // Parse causes
    const causes = causesMatch
      ? causesMatch[1].trim().split(/\n-|\n\d+\./).filter(item => item.trim()).map(item => item.trim())
      : [];
      
    // Parse recommendations
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1].trim().split(/\n-|\n\d+\./).filter(item => item.trim()).map(item => item.trim())
      : [];
    
    return {
      anomalies,
      causes,
      recommendations
    };
  } catch (error) {
    console.error('Error parsing anomaly response:', error);
    return {
      anomalies: [],
      causes: [],
      recommendations: []
    };
  }
};

module.exports = {
  generateEnergySavingSuggestions,
  detectEnergyAnomalies
}; 