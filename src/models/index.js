const User = require('./user.model');
const Device = require('./device.model');
const EnergyConsumption = require('./energy-consumption.model');
const Invoice = require('./invoice.model');
const Suggestion = require('./suggestion.model');
const Anomaly = require('./anomaly.model');
const HouseholdInfo = require('./household-info.model');
const SurveyResponse = require('./survey.model');
const { sequelize } = require('../config/database');

// Define relationships
// User - Device (One-to-Many)
User.hasMany(Device, { foreignKey: 'user_id', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - EnergyConsumption (One-to-Many)
User.hasMany(EnergyConsumption, { foreignKey: 'user_id', as: 'energyConsumptions' });
EnergyConsumption.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Device - EnergyConsumption (One-to-Many)
Device.hasMany(EnergyConsumption, { foreignKey: 'device_id', as: 'energyConsumptions' });
EnergyConsumption.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

// User - Invoice (One-to-Many)
User.hasMany(Invoice, { foreignKey: 'user_id', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Suggestion (One-to-Many)
User.hasMany(Suggestion, { foreignKey: 'user_id', as: 'suggestions' });
Suggestion.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Device - Suggestion (One-to-Many)
Device.hasMany(Suggestion, { foreignKey: 'device_id', as: 'suggestions' });
Suggestion.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

// User - Anomaly (One-to-Many)
User.hasMany(Anomaly, { foreignKey: 'user_id', as: 'anomalies' });
Anomaly.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Device - Anomaly (One-to-Many)
Device.hasMany(Anomaly, { foreignKey: 'device_id', as: 'anomalies' });
Anomaly.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

// User - HouseholdInfo (One-to-One)
User.hasOne(HouseholdInfo, { foreignKey: 'user_id', as: 'householdInfo' });
HouseholdInfo.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - SurveyResponse (One-to-One)
User.hasOne(SurveyResponse, { foreignKey: 'user_id', as: 'surveyResponse' });
SurveyResponse.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Function to sync all models with the database
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    return false;
  }
};

module.exports = {
  User,
  Device,
  EnergyConsumption,
  Invoice,
  Suggestion,
  Anomaly,
  HouseholdInfo,
  SurveyResponse,
  syncModels
}; 