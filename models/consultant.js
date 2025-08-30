const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ConsultantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'consultant' },
  skills: { type: [String] },
  certifications: { type: [String] },
  contactNumber: { type: String }
}, { timestamps: true });

// Hash password
ConsultantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
ConsultantSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Consultant', ConsultantSchema);
