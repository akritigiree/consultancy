const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
