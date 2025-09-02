
const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/project');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create Project (Admin only)
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  body('title').notEmpty().withMessage('Title is required'),
  body('consultant').notEmpty().withMessage('Consultant ID is required'),
  body('client').notEmpty().withMessage('Client ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { title, description, consultant, client, status } = req.body;
      const project = new Project({ title, description, consultant, client, status });
      await project.save();

      res.json({ msg: 'Project created successfully', project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get All Projects (Admin & Consultant)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'consultant'),
  async (req, res) => {
    try {
      const projects = await Project.find()
        .populate('consultant', 'name email role')
        .populate('client', 'name email role');
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get Single Project
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'consultant'),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('consultant', 'name email role')
        .populate('client', 'name email role');

      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update Project (Admin only)
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

// Delete Project (Admin only)
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
