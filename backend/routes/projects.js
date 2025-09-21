// routes/project.js
const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Project = require('../models/project');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ===============================
// Create Project (Admin Only)
// ===============================
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  body('title').notEmpty().withMessage('Title is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { title, description, client } = req.body;

      if (client && !mongoose.Types.ObjectId.isValid(client)) {
        return res.status(400).json({ error: 'Invalid client ID format' });
      }

      const project = new Project({ title, description, client });
      await project.save();

      res.json({ msg: 'Project created successfully', project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ===============================
// Get All Projects (Admin)
// ===============================
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const projects = await Project.find().populate('client', 'name email');
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===============================
// Get Own Projects (Client)
// ===============================
router.get('/me', authMiddleware, authorizeRoles('client'), async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===============================
// Update Project (Admin Only)
// ===============================
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ error: 'Project not found' });

    res.json({ msg: 'Project updated successfully', project: updatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===============================
// Delete Project (Admin Only)
// ===============================
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });

    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
