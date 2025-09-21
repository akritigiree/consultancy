const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// ==========================
// Create a Notification (Admin only)
// ==========================
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { user, type, message } = req.body;

    const notification = new Notification({ user, type, message });
    await notification.save();

    res.json({ msg: 'Notification created', notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Get All Notifications for Logged-in User
// ==========================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Mark Notification as Read
// ==========================
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    res.json({ msg: 'Notification marked as read', notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
