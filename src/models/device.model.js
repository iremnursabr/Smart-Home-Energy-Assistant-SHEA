const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  device_type: {
    type: DataTypes.ENUM('refrigerator', 'washing_machine', 'dishwasher', 'oven', 'air_conditioner', 'television', 'computer', 'lighting', 'water_heater', 'other'),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  energy_efficiency_class: {
    type: DataTypes.ENUM('A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'),
    allowNull: true
  },
  power_consumption_watts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  usage_frequency_hours_per_day: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 24
    }
  },
  usage_days_per_week: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 7,
    validate: {
      min: 1,
      max: 7
    }
  },
  usage_hours_per_day: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('usage_frequency_hours_per_day');
    },
    set(value) {
      this.setDataValue('usage_frequency_hours_per_day', value);
    }
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'devices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Device; 