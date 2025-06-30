const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HouseholdInfo = sequelize.define('HouseholdInfo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    unique: true
  },
  home_size_sqm: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  number_of_residents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  number_of_working_adults: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  home_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  heating_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'household_info',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HouseholdInfo; 