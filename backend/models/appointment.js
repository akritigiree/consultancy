const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/appointment');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// helper: HH:mm (00-23:00-59)
const isHHMM = (s) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);

// Create an appointment (Client only)
router.post('/', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const { consultant, project, date, time, notes } = req.body;

    if (!consultant || !project || !date || !time) {
      return res.status(400).json({ error: 'consultant, project, date and time are required' });
    }
    if (!mongoose.isValidObjectId(consultant) || !mongoose.isValidObjectId(project)) {
      return res.status(400).json({ error: 'Invalid consultant or project id' });
    }
    if (!isHHMM(time)) {
      return res.status(400).json({ error: 'time must be in HH:mm (24h) format' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const appointment = await Appointment.create({
      client: req.user.id,
      consultant,
      project,
      date: parsedDate,   // your schema expects Date here
      time,               // and time as string
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
// - consultant: their own
// - client: their own
// - admin: all
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = {};
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

// Update appointment status (admin or assigned consultant)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const isAdmin = req.user.role === 'admin';
    const isAssignedConsultant =
      req.user.role === 'consultant' && appt.consultant?.toString() === req.user.id;

    if (!isAdmin && !isAssignedConsultant) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    appt.status = status;
    await appt.save();

    res.json({ msg: 'Appointment status updated', appointment: appt });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Optional: reschedule (client can edit own; admin can edit any)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { date, time, notes } = req.body;

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwnerClient = req.user.role === 'client' && appt.client?.toString() === req.user.id;

    if (!isAdmin && !isOwnerClient) {
      return res.status(403).json({ error: 'Not authorized to modify this appointment' });
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date' });
      }
      appt.date = parsedDate;
    }
    if (time !== undefined) {
      if (!isHHMM(time)) {
        return res.status(400).json({ error: 'time must be in HH:mm (24h) format' });
      }
      appt.time = time;
    }
    if (notes !== undefined) {
      appt.notes = notes;
    }

    await appt.save();
    res.json({ msg: 'Appointment updated', appointment: appt });
  } catch (err) {
    console.error('Reschedule error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete appointment (admin only)
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
