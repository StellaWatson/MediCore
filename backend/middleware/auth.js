/**
 * auth.js - Authentication & Authorisation Middleware
 * Verifies JWT tokens and enforces role-based access control (RBAC).
 * Roles: administrator | clinician | receptionist
 */

const jwt = require('jsonwebtoken');

/**
 * protect - Verifies the JWT in the Authorization header.
 * Attaches the decoded user payload to req.user.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * authorise - Returns middleware that restricts access to specific roles.
 * Usage: router.get('/route', protect, authorise('administrator'), handler)
 * @param {...string} roles - allowed roles
 */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}.`
      });
    }
    next();
  };
};

module.exports = { protect, authorise };
