/**
 * authController.js
 * Handles user login and returning authenticated user profile.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findWhere } = require('../utils/db');

/**
 * POST /api/auth/login
 * Validates credentials and returns a signed JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Look up user by email in JSON database
    const users = findWhere('users', (u) => u.email === email.toLowerCase());
    const user = users[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled. Contact administrator.' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Sign JWT with user identity and role
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, getMe };
