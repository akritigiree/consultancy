const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['esewa', 'khalti', 'stripe', 'paypal'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
