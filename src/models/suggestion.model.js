const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Suggestion = sequelize.define('Suggestion', {
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
  title: {
    type: DataTypes.STRING(100),
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
  potential_savings_kwh: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  potential_savings_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'applied', 'rejected'),
    defaultValue: 'pending'
  },
  source: {
    type: DataTypes.ENUM('system', 'ai'),
    defaultValue: 'system'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  purchase_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Cihaz satın alma linki (Cimri vb.)'
  },
  detected_device_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Algılanan cihaz türü'
  }
}, {
  tableName: 'suggestions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Suggestion; 