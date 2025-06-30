/**
 * Data Integration Service
 * Responsible for collecting and formatting user data for AI prompts
 */
const db = require('../models');
const { Op } = require('sequelize');

/**
 * Gather comprehensive user context data from multiple sources
 * @param {number} userId - User ID to collect data for
 * @returns {Object} - Formatted user context data
 */
const getUserContextData = async (userId) => {
  try {
    // Get user information
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get household information
    const householdInfo = await db.HouseholdInfo.findOne({
      where: { user_id: userId }
    });

    // Get user devices
    const devices = await db.Device.findAll({
      where: { user_id: userId }
    });

    // Get energy consumption history
    const consumptionData = await getEnergyConsumptionData(userId);
    
    // Get survey responses
    const surveyResponses = await db.SurveyResponse.findAll({
      where: { user_id: userId }
    });

    // Get invoice information
    const invoices = await db.Invoice.findAll({
      where: { user_id: userId },
      order: [['invoice_date', 'DESC']],
      limit: 3
    });

    // Combine all data into a structured context object
    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      },
      householdInfo: householdInfo ? {
        home_type: householdInfo.home_type,
        home_size_sqm: householdInfo.home_size_sqm,
        household_size: householdInfo.household_size,
        heating_type: householdInfo.heating_type,
        cooling_type: householdInfo.cooling_type
      } : null,
      devices: devices.map(device => ({
        id: device.id,
        name: device.name,
        device_type: device.device_type,
        power_consumption_watts: device.power_consumption_watts,
        usage_frequency_hours_per_day: device.usage_frequency_hours_per_day,
        usage_days_per_week: device.usage_days_per_week,
        energy_efficiency_class: device.energy_efficiency_class
      })),
      consumptionData,
      surveyResponses: surveyResponses.map(response => ({
        question: response.question,
        answer: response.answer
      })),
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoice_date: invoice.invoice_date,
        total_amount: invoice.total_amount,
        total_consumption_kwh: invoice.total_consumption_kwh
      }))
    };
  } catch (error) {
    console.error('Error collecting user context data:', error);
    throw new Error(`Failed to collect user context data: ${error.message}`);
  }
};

/**
 * Get energy consumption data for a user
 * @param {number} userId - User ID to get consumption data for
 * @returns {Object} - Processed consumption data with key metrics
 */
const getEnergyConsumptionData = async (userId) => {
  try {
    // Get the last 30 days of consumption data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const consumptionEntries = await db.EnergyConsumption.findAll({
      where: {
        user_id: userId,
        reading_date: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      order: [['reading_date', 'ASC']]
    });

    // Calculate average daily consumption
    const totalDays = consumptionEntries.length;
    const totalConsumption = consumptionEntries.reduce(
      (sum, entry) => sum + entry.consumption_kwh, 0
    );
    
    const averageDaily = totalDays > 0 ? 
      (totalConsumption / totalDays).toFixed(2) : null;
    
    // Calculate monthly total - ensure totalConsumption is a number before using toFixed
    const totalMonthly = totalConsumption ? Number(totalConsumption).toFixed(2) : "0.00";
    
    // Identify peak usage times
    const hourlyUsage = {};
    consumptionEntries.forEach(entry => {
      const hour = new Date(entry.reading_date).getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + entry.consumption_kwh;
    });
    
    const sortedHours = Object.entries(hourlyUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);
      
    // Process daily patterns
    const dailyConsumption = {};
    consumptionEntries.forEach(entry => {
      const day = new Date(entry.reading_date).toLocaleDateString();
      dailyConsumption[day] = (dailyConsumption[day] || 0) + entry.consumption_kwh;
    });
    
    return {
      averageDaily,
      totalMonthly,
      peakUsageHours: sortedHours,
      dailyData: Object.entries(dailyConsumption).map(([date, value]) => ({
        date,
        consumption: value.toFixed(2)
      })),
      recentEntries: consumptionEntries.slice(-7).map(entry => ({
        date: entry.reading_date,
        consumption_kwh: entry.consumption_kwh
      }))
    };
  } catch (error) {
    console.error('Error processing consumption data:', error);
    return {
      averageDaily: null,
      totalMonthly: null,
      peakUsageHours: [],
      dailyData: [],
      recentEntries: []
    };
  }
};

/**
 * Create structured AI prompt with user context data
 * @param {Object} userData - Collected user context data
 * @param {string} promptType - Type of prompt to generate (suggestion, assistant, etc.)
 * @param {string} userQuery - User's specific query (optional)
 * @returns {string} - Formatted prompt for AI services
 */
const createStructuredPrompt = (userData, promptType, userQuery = '') => {
  // Extract relevant information
  const { user, householdInfo, devices, consumptionData, surveyResponses, invoices } = userData;
  
  // Format devices information
  const devicesInfo = devices.map(device => 
    `- ${device.name} (${device.device_type}): ${device.power_consumption_watts || 0} watts, ` +
    `${device.usage_frequency_hours_per_day || 0} hours/day, ` +
    `${device.usage_days_per_week || 7} days/week, ` +
    `Efficiency: ${device.energy_efficiency_class || 'Unknown'}`
  ).join('\n');
  
  // Format household information
  const householdDetails = householdInfo ? `
    - Home type: ${householdInfo.home_type || 'Unknown'}
    - Home size: ${householdInfo.home_size_sqm || 'Unknown'} square meters
    - Household size: ${householdInfo.household_size || 'Unknown'} people
    - Heating type: ${householdInfo.heating_type || 'Unknown'}
    - Cooling type: ${householdInfo.cooling_type || 'Unknown'}
  ` : 'No household information available';
  
  // Format survey responses
  const surveyInfo = surveyResponses.length > 0 
    ? surveyResponses.map(r => `- ${r.question}: ${r.answer}`).join('\n')
    : 'No survey data available';
  
  // Format invoice information
  const invoiceInfo = invoices.length > 0
    ? invoices.map(inv => 
        `- Date: ${new Date(inv.invoice_date).toLocaleDateString()}, ` +
        `Amount: ${inv.total_amount}, ` +
        `Consumption: ${inv.total_consumption_kwh} kWh`
      ).join('\n')
    : 'No invoice data available';
  
  // Base prompt structure with common elements
  const basePrompt = `
USER INFORMATION:
Name: ${user.first_name || 'User'} ${user.last_name || ''}
Email: ${user.email || 'Unknown'}

HOUSEHOLD INFORMATION:
${householdDetails}

DEVICES:
${devicesInfo}

ENERGY CONSUMPTION:
- Average daily consumption: ${consumptionData.averageDaily || 'Unknown'} kWh
- Total monthly consumption: ${consumptionData.totalMonthly || 'Unknown'} kWh
- Peak usage hours: ${consumptionData.peakUsageHours.join(', ') || 'Unknown'}

SURVEY RESPONSES:
${surveyInfo}

RECENT INVOICES:
${invoiceInfo}
`;

  // Different prompt types based on the use case
  switch (promptType) {
    case 'suggestions':
      return `
Analyze this household's energy usage and provide 5 personalized energy-saving suggestions:
${basePrompt}

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
      
    case 'assistant':
      return `
You are an Energy Assistant for the Smart Energy system. Your job is to help users understand and reduce their energy consumption.
${basePrompt}

Based on this context, provide helpful, personalized energy-saving advice to the user. Be friendly, concise and informative. Focus on practical tips that relate to their specific devices and living situation. If they ask about something unrelated to energy efficiency, politely guide them back to topics you can help with.

USER QUERY: ${userQuery}
`;
      
    case 'anomaly':
      return `
Analyze this energy consumption data to identify potential anomalies or unusual patterns:
${basePrompt}

RECENT CONSUMPTION ENTRIES:
${consumptionData.recentEntries.map(entry => 
  `- Date: ${new Date(entry.date).toLocaleDateString()}, Consumption: ${entry.consumption_kwh} kWh`
).join('\n')}

Based on this data:
1. Identify any unusual consumption patterns
2. Explain potential causes for these anomalies
3. Recommend actions the user can take to address these issues

Format your response as follows:
ANOMALIES: [List of identified anomalies]
CAUSES: [Potential causes for each anomaly]
RECOMMENDATIONS: [Specific actions for the user]
`;
      
    default:
      return basePrompt;
  }
};

module.exports = {
  getUserContextData,
  getEnergyConsumptionData,
  createStructuredPrompt
}; 