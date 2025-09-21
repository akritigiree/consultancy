// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// ======================
// Routes
// ======================
const authRoutes = require('./routes/auth.js');
const clientRoutes = require('./routes/clients.js');       // Note: 'clients.js' not 'client.js'
const consultantRoutes = require('./routes/consultants.js');
const projectRoutes = require('./routes/projects.js');     // 'projects.js' not 'project.js'
const taskRoutes = require('./routes/task.js');
const paymentRoutes = require('./routes/payment.js');
const ratingRoutes = require('./routes/ratings.js');       // 'ratings.js' not 'rating.js'
const notificationRoutes = require('./routes/Notification.js'); // case-sensitive
const messageRoutes = require('./routes/message.js');
const appointmentRoutes = require('./routes/appointment.js');

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/consultants', require('./routes/consultants'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/notifications', require('./routes/Notification'));

// ======================
// MongoDB Connection
// ======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
