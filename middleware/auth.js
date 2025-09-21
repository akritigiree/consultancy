// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * =====================
 * Authentication Middleware
 * =====================
 * Verifies JWT and attaches user info to req.user
 */
const authMiddleware = (req, res, next) => {
  // Extract token from header (Authorization: Bearer <token>)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload (e.g., { id, role }) to request
    req.user = decoded;

    next(); // continue
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * =====================
 * Role-based Authorization Middleware
 * =====================
 * Example: authorizeRoles("admin", "consultant")
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: insufficient rights.' });
    }

    next(); // user has permission
  };
};

module.exports = { authMiddleware, authorizeRoles };
