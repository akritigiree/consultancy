const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment'); // make sure this file exists
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Create an appointment (Client only)
router.post('/', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const { consultant, project, date, time, notes } = req.body;

    if (!consultant || !project || !date || !time) {
      return res.status(400).json({ error: 'Consultant, project, date and time are required' });
    }

    const appointment = await Appointment.create({
      client: req.user.id,
      consultant,
      project,
      date,
      time,
      notes,
      status: 'pending',
    });

    res.status(201).json({ msg: 'Appointment created successfully', appointment });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointments
// - Consultant: sees only their own
// - Admin: sees all
// - Client: sees their own (optional, included here)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'consultant') {
      filter.consultant = req.user.id;
    } else if (req.user.role === 'client') {
      filter.client = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate('client', 'name email')
      .populate('consultant', 'name email')
      .populate('project', 'title')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment status (Admin or assigned Consultant)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const isConsultant = req.user.role === 'consultant' && appointment.consultant?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isConsultant) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ msg: 'Appointment status updated', appointment });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete appointment (Admin only)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ msg: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
