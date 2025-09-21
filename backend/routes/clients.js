const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ==========================
// Admin: Create Client
// ==========================
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, companyName, companySize, industry, contactNumber } = req.body;

      // Check if client exists
      const existing = await Client.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const client = new Client({
        name,
        email,
        password: hashedPassword,
        companyName,
        companySize,
        industry,
        contactNumber,
        role: 'client'
      });

      await client.save();

      const { password: pwd, ...clientData } = client._doc;
      res.json({ msg: 'Client created successfully', client: clientData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==========================
// Admin: Get All Clients
// ==========================
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const clients = await Client.find().select('-password');
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Admin: Get Single Client
// ==========================
router.get('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Admin: Update Client
// ==========================
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ msg: 'Client updated successfully', client });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Admin: Delete Client
// ==========================
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ msg: 'Client deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Client: Get Own Profile
// ==========================
router.get('/me/profile', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select('-password');
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ msg: 'Profile fetched successfully', client });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
