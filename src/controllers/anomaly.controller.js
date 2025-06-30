const { Anomaly, Device } = require('../models');
const { detectEnergyAnomalies } = require('../services/ai.service');
const { getUserContextData } = require('../services/data-integration.service');
const { v4: uuidv4 } = require('uuid');

// Anomaly controller implementation
const anomalyController = {
  /**
   * Get all anomalies for the authenticated user
   */
  getAllAnomalies: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get anomalies from the database
      const anomalies = await Anomaly.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });
      
      return res.status(200).json({
        status: 'success',
        data: anomalies
      });
    } catch (error) {
      console.error('Get anomalies error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error retrieving anomalies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  /**
   * Detect new anomalies using AI
   */
  detectAnomalies: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Use AI service to detect anomalies in user's energy consumption
      const anomalyData = await detectEnergyAnomalies(userId);
      
      if (!anomalyData.anomalies || anomalyData.anomalies.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No anomalies detected in your energy consumption',
          data: []
        });
      }
      
      // Store detected anomalies in the database
      const savedAnomalies = [];
      
      for (let i = 0; i < anomalyData.anomalies.length; i++) {
        const anomalyTitle = anomalyData.anomalies[i];
        const anomalyCause = anomalyData.causes[i] || 'Unknown cause';
        const recommendation = anomalyData.recommendations[i] || 'No specific recommendation available';
        
        // Save to database
        const anomaly = await Anomaly.create({
          id: uuidv4(),
          user_id: userId,
          title: anomalyTitle,
          description: `Cause: ${anomalyCause}`,
          recommendation: recommendation,
          status: 'new',
          severity: 'medium', // Default severity
          created_at: new Date(),
          updated_at: new Date()
        });
        
        savedAnomalies.push(anomaly);
      }
      
      return res.status(200).json({
        status: 'success',
        message: `${savedAnomalies.length} anomalies detected`,
        data: savedAnomalies
      });
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error detecting anomalies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  /**
   * Update anomaly status
   */
  updateAnomalyStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { status } = req.body;
      
      if (!status || !['new', 'acknowledged', 'resolved', 'ignored'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status. Must be one of: new, acknowledged, resolved, ignored'
        });
      }
      
      // Find anomaly and verify ownership
      const anomaly = await Anomaly.findOne({
        where: { id, user_id: userId }
      });
      
      if (!anomaly) {
        return res.status(404).json({
          status: 'error',
          message: 'Anomaly not found or you do not have permission to update it'
        });
      }
      
      // Update status
      anomaly.status = status;
      anomaly.updated_at = new Date();
      await anomaly.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Anomaly status updated successfully',
        data: anomaly
      });
    } catch (error) {
      console.error('Update anomaly status error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error updating anomaly status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  /**
   * Delete an anomaly
   */
  deleteAnomaly: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Find anomaly and verify ownership
      const anomaly = await Anomaly.findOne({
        where: { id, user_id: userId }
      });
      
      if (!anomaly) {
        return res.status(404).json({
          status: 'error',
          message: 'Anomaly not found or you do not have permission to delete it'
        });
      }
      
      // Delete the anomaly
      await anomaly.destroy();
      
      return res.status(200).json({
        status: 'success',
        message: 'Anomaly deleted successfully'
      });
    } catch (error) {
      console.error('Delete anomaly error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error deleting anomaly',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get anomaly by ID
   */
  getAnomalyById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      // Find anomaly
      const anomaly = await Anomaly.findByPk(id);
      
      if (!anomaly) {
        return res.status(404).json({
          status: 'error',
          message: 'Anomaly not found'
        });
      }
      
      // Check if user is authorized to view this anomaly
      if (!isAdmin && anomaly.user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access to this anomaly'
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: anomaly
      });
    } catch (error) {
      console.error('Get anomaly by ID error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error retrieving anomaly',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Create a new anomaly manually
   */
  createAnomaly: async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, description, recommendation, severity = 'medium' } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({
          status: 'error',
          message: 'Title and description are required'
        });
      }
      
      // Create new anomaly
      const anomaly = await Anomaly.create({
        id: uuidv4(),
        user_id: userId,
        title,
        description,
        recommendation: recommendation || null,
        severity,
        status: 'new',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return res.status(201).json({
        status: 'success',
        message: 'Anomaly created successfully',
        data: anomaly
      });
    } catch (error) {
      console.error('Create anomaly error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error creating anomaly',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Resolve an anomaly
   */
  resolveAnomaly: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { resolution_note } = req.body;
      
      // Find anomaly and verify ownership
      const anomaly = await Anomaly.findOne({
        where: { id, user_id: userId }
      });
      
      if (!anomaly) {
        return res.status(404).json({
          status: 'error',
          message: 'Anomaly not found or you do not have permission to resolve it'
        });
      }
      
      // Update status to resolved
      anomaly.status = 'resolved';
      anomaly.resolution_note = resolution_note || 'Resolved by user';
      anomaly.resolved_at = new Date();
      anomaly.updated_at = new Date();
      await anomaly.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Anomaly resolved successfully',
        data: anomaly
      });
    } catch (error) {
      console.error('Resolve anomaly error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error resolving anomaly',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get anomalies for a specific user (admin function)
   */
  getUserAnomalies: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get anomalies for the specified user
      const anomalies = await Anomaly.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });
      
      return res.status(200).json({
        status: 'success',
        data: anomalies
      });
    } catch (error) {
      console.error('Get user anomalies error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error retrieving user anomalies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get anomalies related to a specific device
   */
  getDeviceAnomalies: async (req, res) => {
    try {
      const { deviceId } = req.params;
      const userId = req.user.id;
      
      // For now, return all user's anomalies
      // In a future enhancement, we could filter by device-specific anomalies
      const anomalies = await Anomaly.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });
      
      return res.status(200).json({
        status: 'success',
        message: `Anomalies that may be related to device ${deviceId}`,
        data: anomalies
      });
    } catch (error) {
      console.error('Get device anomalies error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error retrieving device anomalies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = anomalyController; 