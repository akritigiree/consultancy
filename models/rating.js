// models/rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    score: { type: Number, required: true, min: 1, max: 5 }, // 1-5 rating
    comment: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
