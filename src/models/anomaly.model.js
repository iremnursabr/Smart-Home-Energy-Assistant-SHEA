const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Anomaly = sequelize.define('Anomaly', {
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
  anomaly_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  detected_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'anomalies',
  timestamps: false
});

module.exports = Anomaly; 