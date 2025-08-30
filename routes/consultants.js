const express = require('express');
const Consultant = require('../models/consultant');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ✅ Admin: Create consultant
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const consultant = new Consultant(req.body);
      await consultant.save();
      res.json({ msg: 'Consultant created successfully', consultant });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Admin: Get all consultants
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const consultants = await Consultant.find();
      res.json(consultants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Admin: Get single consultant by ID
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const consultant = await Consultant.findById(req.params.id);
      if (!consultant) return res.status(404).json({ msg: 'Consultant not found' });
      res.json(consultant);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Admin: Update consultant
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const consultant = await Consultant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json({ msg: 'Consultant updated', consultant });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Admin: Delete consultant
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      await Consultant.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Consultant deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Consultant: Get own profile
router.get(
  '/me/profile',
  authMiddleware,
  authorizeRoles('consultant'),
  async (req, res) => {
    try {
      const consultant = await Consultant.findById(req.user.id); // ✅ fetch by user ID
      if (!consultant) return res.status(404).json({ error: 'Consultant not found' });
      res.json({ msg: 'Profile fetched successfully', consultant });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;


