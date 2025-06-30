const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
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
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_consumption_kwh: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoice_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  period: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'kwh'
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Invoice; 