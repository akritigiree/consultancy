const express = require('express');
const Client = require('../models/client');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ✅ Admin: Create client
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json({ msg: 'Client created successfully', client });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Get all clients
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Get single client by ID
router.get('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ msg: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Update client
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: 'Client updated', client });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Delete client
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
