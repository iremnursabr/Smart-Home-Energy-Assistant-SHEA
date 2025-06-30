const { EnergyConsumption, Device, User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

/**
 * Get all energy consumption records for a user
 * @route GET /api/consumption
 */
const getAllConsumptions = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'month';
    const userId = req.user.id;
    
    // Get date range based on timeRange
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
    
    // Get all devices for the user
    const devices = await Device.findAll({ 
      where: { user_id: userId }
    });
    const deviceIds = devices.map(device => device.id);
    
    // Get consumption data for all user devices within the date range
    const consumptions = await EnergyConsumption.findAll({
      where: {
        device_id: { [Op.in]: deviceIds },
        reading_date: { [Op.gte]: startDate, [Op.lte]: endDate }
      },
      order: [['reading_date', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: consumptions
    });
  } catch (error) {
    console.error('Error fetching consumptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption data',
      error: error.message
    });
  }
};

/**
 * Get consumption record by ID
 * @route GET /api/consumption/:id
 */
const getConsumptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find consumption by ID
    const consumption = await EnergyConsumption.findByPk(id, {
      include: [{
        model: Device,
        as: 'device'
      }]
    });
    
    // Check if consumption exists and belongs to user
    if (!consumption || consumption.device.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found or not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error fetching consumption by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption data',
      error: error.message
    });
  }
};

/**
 * Create a new consumption record
 * @route POST /api/consumption
 */
const createConsumption = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { device_id, value, timestamp } = req.body;
    const userId = req.user.id;
    
    // Verify device belongs to user
    const device = await Device.findOne({ _id: device_id, user_id: userId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not authorized'
      });
    }
    
    // Create new consumption record
    const consumption = new EnergyConsumption({
      device_id,
      value,
      timestamp: timestamp || new Date()
    });
    
    // Save consumption record
    await consumption.save();
    
    // Update device's energy consumption
    device.energy_consumption += value;
    await device.save();
    
    res.status(201).json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error creating consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consumption record',
      error: error.message
    });
  }
};

/**
 * Update a consumption record
 * @route PUT /api/consumption/:id
 */
const updateConsumption = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { value, timestamp } = req.body;
    const userId = req.user.id;
    
    // Find consumption by ID and populate device
    const consumption = await EnergyConsumption.findById(id).populate('device_id');
    
    // Check if consumption exists and belongs to user
    if (!consumption || consumption.device_id.user_id.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found or not authorized'
      });
    }
    
    // Calculate difference in value for device update
    const valueDifference = value - consumption.value;
    
    // Update consumption record
    consumption.value = value;
    if (timestamp) consumption.timestamp = timestamp;
    
    // Save updated consumption
    await consumption.save();
    
    // Update device's energy consumption
    const device = consumption.device_id;
    device.energy_consumption += valueDifference;
    await device.save();
    
    res.status(200).json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error updating consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consumption record',
      error: error.message
    });
  }
};

/**
 * Delete a consumption record
 * @route DELETE /api/consumption/:id
 */
const deleteConsumption = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find consumption by ID and populate device
    const consumption = await EnergyConsumption.findById(id).populate('device_id');
    
    // Check if consumption exists and belongs to user
    if (!consumption || consumption.device_id.user_id.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found or not authorized'
      });
    }
    
    // Update device's energy consumption
    const device = consumption.device_id;
    device.energy_consumption -= consumption.value;
    await device.save();
    
    // Delete consumption record
    await EnergyConsumption.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Consumption record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete consumption record',
      error: error.message
    });
  }
};

/**
 * Get consumption records by device
 * @route GET /api/consumption/device/:deviceId
 */
const getConsumptionsByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const timeRange = req.query.timeRange || 'week';
    const userId = req.user.id;
    
    // Verify device belongs to user
    const device = await Device.findOne({ 
      where: { 
        id: deviceId, 
        user_id: userId 
      }
    });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not authorized'
      });
    }
    
    // Get date range based on timeRange
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
    
    // Get consumption data for the device within the date range
    const consumptions = await EnergyConsumption.findAll({
      where: {
        device_id: deviceId,
        reading_date: { 
          [Op.gte]: startDate, 
          [Op.lte]: endDate 
        }
      },
      order: [['reading_date', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: consumptions
    });
  } catch (error) {
    console.error('Error fetching device consumptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device consumption data',
      error: error.message
    });
  }
};

/**
 * Get consumption records by date range
 * @route GET /api/consumption/range/:startDate/:endDate
 */
const getConsumptionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;
    
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }
    
    // Get all devices for the user
    const devices = await Device.findAll({ 
      where: { user_id: userId } 
    });
    const deviceIds = devices.map(device => device.id);
    
    // Get consumption data for all user devices within the date range
    const consumptions = await EnergyConsumption.findAll({
      where: {
        device_id: { [Op.in]: deviceIds },
        reading_date: { [Op.gte]: start, [Op.lte]: end }
      },
      order: [['reading_date', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: consumptions
    });
  } catch (error) {
    console.error('Error fetching consumptions by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption data for date range',
      error: error.message
    });
  }
};

/**
 * Get consumption records by year and month
 * @route GET /api/consumption/by-period
 */
const getConsumptionsByPeriod = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.id;
    
    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month. Month must be between 1-12.'
      });
    }
    
    // Create date range for the specified month
    const startDate = new Date(yearNum, monthNum - 1, 1); // Month is 0-based in JS Date
    const endDate = new Date(yearNum, monthNum, 0); // Last day of the month
    
    // Get all devices for the user
    const devices = await Device.findAll({ 
      where: { user_id: userId } 
    });
    const deviceIds = devices.map(device => device.id);
    
    // Get consumption data for all user devices within the date range
    const consumptions = await EnergyConsumption.findAll({
      where: {
        user_id: userId,
        device_id: { [Op.in]: deviceIds },
        reading_date: { [Op.between]: [startDate, endDate] }
      },
      order: [['reading_date', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: consumptions
    });
  } catch (error) {
    console.error('Error fetching consumptions by period:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption data for period',
      error: error.message
    });
  }
};

// Helper function to get date range from time range
function getDateRangeFromTimeRange(timeRange) {
  const now = new Date();
  let startDate = new Date();
  const endDate = now;
  
  switch (timeRange) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }
  
  return { startDate, endDate };
}

module.exports = {
  getAllConsumptions,
  getConsumptionById,
  createConsumption,
  updateConsumption,
  deleteConsumption,
  getConsumptionsByDevice,
  getConsumptionsByDateRange,
  getConsumptionsByPeriod
}; 