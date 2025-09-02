const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// ==========================
// Create Payment (Client)
// ==========================
router.post('/', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const { project, amount, method, transactionId } = req.body;

    const payment = new Payment({
      client: req.user.id,
      project,
      amount,
      method,
      status: 'completed', // assume successful for now
      transactionId
    });

    await payment.save();
    res.json({ msg: 'Payment recorded successfully', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Get All Payments (Admin)
// ==========================
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('client', 'name email')
      .populate('project', 'title');
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// Get Own Payments (Client)
// ==========================
router.get('/me', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const payments = await Payment.find({ client: req.user.id })
      .populate('project', 'title');
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;




