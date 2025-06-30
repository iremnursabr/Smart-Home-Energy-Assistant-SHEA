const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone_number } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password_hash: password, // Will be hashed by the model hook
      first_name,
      last_name,
      phone_number,
      role: 'standard' // Default role
    });

    // Set user session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Update last login
    await user.update({ last_login: new Date() });

    // Return user data
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Get username or email from request body
    const { username, email, password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }
    
    // Verify at least one login identifier is provided
    if (!username && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or email is required'
      });
    }
    
    // Giriş için kullanılacak kullanıcı adı/e-posta
    const usernameOrEmail = username || email;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail } // Allow login with email as well
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Set user session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    // Save session before responding
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Session error during login'
        });
      }
      
      // Update last login
      user.update({ last_login: new Date() })
        .then(() => {
          // Return user data
          return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                preferred_language: user.preferred_language,
                theme_preference: user.theme_preference
              }
            }
          });
        })
        .catch(updateError => {
          console.error('Login last_login update error:', updateError);
          // Still return success even if updating last_login fails
          return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                preferred_language: user.preferred_language,
                theme_preference: user.theme_preference
              }
            }
          });
        });
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          phone_number: user.phone_number,
          preferred_language: user.preferred_language,
          theme_preference: user.theme_preference,
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error logging out',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.clearCookie('connect.sid');
    
    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { first_name, last_name, phone, address, city, postal_code, country } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user data
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      phone_number: phone || user.phone_number,
      // Add any other fields from request body that should be updated
    });

    // Return updated user data
    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          phone_number: user.phone_number,
          preferred_language: user.preferred_language,
          theme_preference: user.theme_preference,
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  updateProfile
}; 