const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Consultant = require('../models/consultant');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create Consultant (Admin only)
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, skills, certifications } = req.body;
    const existing = await Consultant.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const consultant = new Consultant({ name, email, password: hashedPassword, skills, certifications });
    await consultant.save();

    const { password: pwd, ...consultantData } = consultant._doc;
    res.json({ msg: 'Consultant created successfully', consultant: consultantData });
  }
);

// Get All Consultants (Admin)
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  const consultants = await Consultant.find().select('-password');
  res.json(consultants);
});

// Get Single Consultant
router.get('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  const consultant = await Consultant.findById(req.params.id).select('-password');
  if (!consultant) return res.status(404).json({ error: 'Consultant not found' });
  res.json(consultant);
});

// Update Consultant
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  const updatedConsultant = await Consultant.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!updatedConsultant) return res.status(404).json({ error: 'Consultant not found' });
  res.json({ msg: 'Consultant updated successfully', consultant: updatedConsultant });
});

// Delete Consultant
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  const deleted = await Consultant.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Consultant not found' });
  res.json({ msg: 'Consultant deleted successfully' });
});

module.exports = router;
