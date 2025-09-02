// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// =====================
// Verify JWT token
// =====================
const authMiddleware = (req, res, next) => {
  // Get token from header (format: "Bearer <token>")
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded info to request
    next(); // continue to the next middleware / route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// =====================
// Role-based authorization
// =====================
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: insufficient rights.' });
    }

    next(); // user has permission, continue
  };
};

module.exports = { authMiddleware, authorizeRoles };
