const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SurveyResponse = sequelize.define('SurveyResponse', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  household_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  children: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  working_adults: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  home_hours: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'survey_responses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SurveyResponse; 