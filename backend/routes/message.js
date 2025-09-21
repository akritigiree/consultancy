const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Send a message (Client or Consultant)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiver, content } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    const message = new Message({
      sender: req.user.id,
      receiver,
      content
    });

    await message.save();
    res.json({ msg: 'Message sent successfully', message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all messages for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a message as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!message) return res.status(404).json({ error: 'Message not found' });

    res.json({ msg: 'Message marked as read', message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
