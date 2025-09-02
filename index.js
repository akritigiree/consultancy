// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();

// ==========================
// Middleware
// ==========================
app.use(express.json());
app.use(cors());

// ==========================
// Connect to MongoDB
// ==========================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// ==========================
// Routes
// ==========================
app.use('/api/auth', require('./routes/auth'));          // Auth routes
app.use('/api/consultants', require('./routes/consultants'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/payments', require('./routes/payment'));

// ==========================
// Test Route
// ==========================
app.get('/', (req, res) => {
  res.send('🚀 Consultancy Management System Backend Running');
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
