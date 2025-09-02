const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const consultantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'consultant' },
    skills: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password before saving
consultantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Consultant', consultantSchema);
