// routes/task.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/task');
const Project = require('../models/project');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
// const Notification = require('../models/Notification'); // Optional for notifications

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

      // Check if project exists
      const existingProject = await Project.findById(project);
      if (!existingProject) return res.status(404).json({ error: 'Project not found' });

      const task = new Task({ title, description, project, consultant, status });
      await task.save();

      // Optional: create notification
      /*
      await Notification.create({
        user: consultant,
        type: 'task',
        message: `New task "${title}" has been assigned to you.`
      });
      */

      res.json({ msg: 'Task created successfully', task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ===============================
// Get All Tasks (Admin & Consultant)
// ===============================
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'consultant'),
  async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate('project', 'title status')
        .populate('consultant', 'name email role');
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ===============================
// Get Single Task
// ===============================
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'consultant'),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('project', 'title status')
        .populate('consultant', 'name email role');

      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ===============================
// Update Task
// ===============================
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'consultant'),
  async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
      res.json({ msg: 'Task updated successfully', task: updatedTask });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ===============================
// Delete Task (Admin only)
// ===============================
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const deleted = await Task.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Task not found' });
      res.json({ msg: 'Task deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
