const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// ----------------------
// Register User
// ----------------------
router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if(user) return res.status(400).json({ error: 'User already exists' });

      user = new User({ name, email, password, role });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.json({ msg: 'User registered', token, user: { id: user._id, name, email, role } });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ----------------------
// Login User
// ----------------------
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if(!user) return res.status(400).json({ error: 'Invalid credentials' });

      const isMatch = await user.matchPassword(password);
      if(!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.json({ msg: 'Logged in', token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;

