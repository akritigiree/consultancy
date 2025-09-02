const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/appointment');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ==========================
// Create Appointment (Client)
// ==========================
router.post(
  '/',
  authMiddleware,
  authorizeRoles('client'),
  body('consultant').notEmpty().withMessage('Consultant ID is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { consultant, date, time, notes } = req.body;

      const appointment = new Appointment({
        client: req.user.id,
        consultant,
        date,
        time,
        notes
      });

      await appointment.save();
      res.json({ msg: 'Appointment created successfully', appointment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==========================
// Get All Appointments (Admin)
// ==========================
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const appointments = await Appointment.find()
        .populate('client', 'name email')
        .populate('consultant', 'name email');
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==========================
// Get Own Appointments (Consultant/Client)
// ==========================
router.get(
  '/me',
  authMiddleware,
  authorizeRoles('consultant', 'client'),
  async (req, res) => {
    try {
      const filter = req.user.role === 'consultant'
        ? { consultant: req.user.id }
        : { client: req.user.id };

      const appointments = await Appointment.find(filter)
        .populate('client', 'name email')
        .populate('consultant', 'name email');
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==========================
// Update Appointment (Admin only)
// ==========================
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ msg: 'Appointment updated successfully', appointment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Delete Appointment (Admin only)
// ==========================
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ msg: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
