const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EnergyConsumption = sequelize.define('EnergyConsumption', {
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
    onDelete: 'CASCADE'
  },
  device_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'devices',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  consumption_kwh: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  reading_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reading_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  is_manual_entry: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'energy_consumption',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = EnergyConsumption; 