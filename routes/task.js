// routes/task.js
const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Task = require('../models/task');
const Project = require('../models/project');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ===============================
// Create Task (Admin & Consultant)
// ===============================
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'consultant'),
  body('title').notEmpty().withMessage('Title is required'),
  body('project').notEmpty().withMessage('Project ID is required'),
  body('consultant').notEmpty().withMessage('Consultant ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { title, description, project, consultant, status } = req.body;

      // Validate project ID format
      if (!mongoose.Types.ObjectId.isValid(project)) return res.status(400).json({ error: 'Invalid project ID format' });

      // Validate consultant ID format
      if (!mongoose.Types.ObjectId.isValid(consultant)) return res.status(400).json({ error: 'Invalid consultant ID format' });

      // Check if project exists
      const existingProject = await Project.findById(project);
      if (!existingProject) return res.status(404).json({ error: 'Project not found' });

      const task = new Task({ title, description, project, consultant, status });
      await task.save();

      res.json({ msg: 'Task created successfully', task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ===============================
// Get All Tasks (Admin)
// ===============================
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'title')
      .populate('consultant', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===============================
// Get Own Tasks (Consultant)
// ===============================
router.get('/me', authMiddleware, authorizeRoles('consultant'), async (req, res) => {
  try {
    const tasks = await Task.find({ consultant: req.user.id })
      .populate('project', 'title')
      .populate('consultant', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===============================
// Update Task (Admin & Assigned Consultant)
// ===============================
router.put('/:id', authMiddleware, authorizeRoles('admin', 'consultant'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Only admin or assigned consultant can update
    if (req.user.role === 'consultant' && task.consultant.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: cannot update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===============================
// Delete Task (Admin Only)
// ===============================
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ msg: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
