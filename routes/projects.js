const express = require('express');
const Project = require('../models/Project');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create Project (Admin only)
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json({ msg: 'Project created successfully', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Projects (Admin only)
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('consultant', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get My Projects (Consultant or Client)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'consultant') {
      projects = await Project.find({ consultant: req.user.id })
        .populate('client', 'name email')
        .populate('consultant', 'name email');
    } else if (req.user.role === 'client') {
      projects = await Project.find({ client: req.user.id })
        .populate('client', 'name email')
        .populate('consultant', 'name email');
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Project (Admin only)
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ msg: 'Project updated successfully', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Project (Admin only)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



