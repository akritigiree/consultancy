const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
  companyName: { type: String },
  companySize: { type: String },
  industry: { type: String },
  contactNumber: { type: String }
}, { timestamps: true });

// Hash password before saving
ClientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
ClientSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Client', ClientSchema);
