const express = require('express');
const Rating = require('../models/rating');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Client: Submit rating
router.post('/', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const rating = new Rating({ ...req.body, client: req.user.id });
    await rating.save();
    res.json({ msg: 'Rating submitted successfully', rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consultant: Get received ratings
router.get('/my', authMiddleware, authorizeRoles('consultant'), async (req, res) => {
  try {
    const ratings = await Rating.find({ consultant: req.user.id }).populate('client', 'name email');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all ratings
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const ratings = await Rating.find().populate('client consultant', 'name email');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
