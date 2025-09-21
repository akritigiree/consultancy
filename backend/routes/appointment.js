const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Create an appointment (Client)
router.post('/', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const { consultant, project, date, time, notes } = req.body;

    if (!consultant || !project || !date || !time) {
      return res.status(400).json({ error: 'Consultant, project, date and time are required' });
    }

    const appointment = new Appointment({
      client: req.user.id,
      consultant,
      project,
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
});

// Get all appointments (Consultant sees own, Admin sees all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'consultant') {
      filter.consultant = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate('client', 'name email')
      .populate('consultant', 'name email')
      .populate('project', 'title')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment status (Admin or Consultant)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Only admin or assigned consultant can update
    if (req.user.role !== 'admin' && req.user.id !== appointment.consultant.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ msg: 'Appointment status updated', appointment });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
