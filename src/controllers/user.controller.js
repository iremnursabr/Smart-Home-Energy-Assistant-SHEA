const { User, HouseholdInfo } = require('../models');

/**
 * Get all users (admin only)
 * @route GET /api/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: HouseholdInfo,
          as: 'householdInfo'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone_number, preferred_language, theme_preference } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user
    await user.update({
      first_name,
      last_name,
      phone_number,
      preferred_language,
      theme_preference
    });

    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          role: user.role,
          preferred_language: user.preferred_language,
          theme_preference: user.theme_preference
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update or create household info
 * @route PUT /api/users/:id/household
 */
const updateHouseholdInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      home_size_sqm,
      number_of_residents,
      number_of_working_adults,
      home_type,
      heating_type,
      postal_code,
      city
    } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Find or create household info
    const [householdInfo, created] = await HouseholdInfo.findOrCreate({
      where: { user_id: id },
      defaults: {
        user_id: id,
        home_size_sqm,
        number_of_residents,
        number_of_working_adults,
        home_type,
        heating_type,
        postal_code,
        city
      }
    });

    if (!created) {
      // Update existing household info
      await householdInfo.update({
        home_size_sqm,
        number_of_residents,
        number_of_working_adults,
        home_type,
        heating_type,
        postal_code,
        city
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Household info updated successfully',
      data: {
        householdInfo
      }
    });
  } catch (error) {
    console.error('Update household info error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error updating household info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Deactivate user (admin only)
 * @route PUT /api/users/:id/deactivate
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin') {
      const adminCount = await User.count({
        where: {
          role: 'admin',
          is_active: true
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot deactivate the last admin user'
        });
      }
    }

    // Deactivate user
    await user.update({ is_active: false });

    return res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error deactivating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Activate user (admin only)
 * @route PUT /api/users/:id/activate
 */
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Activate user
    await user.update({ is_active: true });

    return res.status(200).json({
      status: 'success',
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error activating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change user role (admin only)
 * @route PUT /api/users/:id/role
 */
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if role is valid
    const validRoles = ['admin', 'standard', 'energy_consultant'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    // Check if user exists
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent changing the role of the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({
        where: {
          role: 'admin',
          is_active: true
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot change the role of the last admin user'
        });
      }
    }

    // Change user role
    await user.update({ role });

    return res.status(200).json({
      status: 'success',
      message: 'User role changed successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error changing user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateHouseholdInfo,
  deactivateUser,
  activateUser,
  changeUserRole
}; 